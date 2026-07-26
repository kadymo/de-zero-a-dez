<script setup lang="ts">
import draggable from "vuedraggable";
import type { Modal, Upload } from "@/types";

const props = defineProps<{
    method: "POST" | "PUT";
    template?: any;
    templateId?: string;
}>();

const emit = defineEmits(["close"]);

const router = useRouter();
const route = useRoute();
const toast = useToast();

const templateName = ref("");
const templateDescription = ref("");
const templateVisibility = ref(false);
const templateCover = ref<File | null>(null);
const existingItems = ref<string[]>([]);
const newItemsList = ref<{ id: string; file: File; url: string }[]>([]);

const { modal } = inject<Modal>("modal") || { modal: ref(false) };

const handleClose = () => {
    emit("close");
    if (modal && modal.value) {
        modal.value = false;
    }
};

const isUpdate = computed(() => props.method === "PUT");
const targetTemplateId = computed(() => props.template?.id || props.templateId || (route.params.id as string));

if (isUpdate.value) {
    if (props.template) {
        templateName.value = props.template.name || "";
        templateDescription.value = props.template.description || "";
        templateVisibility.value = !!props.template.isPublic;
        existingItems.value = [...(props.template.items || [])];
    } else if (targetTemplateId.value) {
        const { data: templateData } = await useFetch(`/api/templates/${targetTemplateId.value}`);

        if (templateData.value) {
            templateName.value = templateData.value.name;
            templateDescription.value = templateData.value.description;
            templateVisibility.value = !!templateData.value.isPublic;
            existingItems.value = [...(templateData.value.items || [])];
        }
    }
}

watch(() => props.template, (newVal) => {
    if (newVal) {
        templateName.value = newVal.name || "";
        templateDescription.value = newVal.description || "";
        templateVisibility.value = !!newVal.isPublic;
        existingItems.value = [...(newVal.items || [])];
    }
}, { immediate: true });

const removeExistingItem = (index: number) => {
    existingItems.value.splice(index, 1);
    toast.add({
        id: "item_removed",
        title: "Foto removida.",
        description: "Clique em 'Salvar Alterações' para confirmar.",
        color: "yellow",
        timeout: 3000
    });
};

const removeNewItem = (index: number) => {
    URL.revokeObjectURL(newItemsList.value[index].url);
    newItemsList.value.splice(index, 1);
};

const handleFileSelected = (e: InputEvent) => {
    const files = (e.target as HTMLInputElement).files!;

    if ((e.target as HTMLInputElement).name === "cover") {
        templateCover.value = files[0];
    } else {
        const fileArr = Array.from(files);
        newItemsList.value = [
            ...newItemsList.value,
            ...fileArr.map((file, i) => ({
                id: `${file.name}-${Date.now()}-${i}-${Math.random()}`,
                file,
                url: URL.createObjectURL(file)
            }))
        ];
    }
};

const isSaving = ref(false);
const isDeleting = ref(false);

const deleteTemplate = async () => {
    if (!targetTemplateId.value) return;
    isDeleting.value = true;

    const { error } = await useFetch(`/api/templates/${targetTemplateId.value}`, {
        method: "DELETE"
    });

    if (error.value) {
        toast.add({
            id: "error",
            title: "Não foi possível excluir o template.",
            description: "Tente novamente mais tarde.",
            color: "red"
        });
        isDeleting.value = false;
        return;
    }

    toast.add({
        id: "success",
        title: "Template excluído com sucesso!",
        color: "green"
    });

    isDeleting.value = false;
    refreshNuxtData();
    handleClose();
    if (route.path.includes("/profile/template/")) {
        router.push("/profile");
    }
};

const createTemplate = async () => {
    if (newItemsList.value.length < 10) {
        toast.add({
            id: "error",
            title: "Selecione pelo menos 10 itens.",
            description: `Você selecionou ${newItemsList.value.length} item(ns).`,
            color: "red"
        });
        return;
    }

    const hasLargeItem = newItemsList.value.some((item) => item.file.size > 1000000);

    if (hasLargeItem) {
        toast.add({
            id: "error",
            title: "As imagens devem ter um tamanho máximo de 1MB.",
            description: "Você pode optar por usar um compressor de arquivos online para não perder a qualidade das imagens.",
            color: "red",
            timeout: 8000
        });
        return;
    }

    const formData = new FormData();
    formData.append("upload_preset", "ml_default");
    formData.append("folder", "De Zero a Dez");

    formData.append("file", templateCover.value!);
    const { data: coverUpload } = await useFetch<Upload>(
        "https://api.cloudinary.com/v1_1/dcxlgeobi/image/upload",
        {
            method: "POST",
            body: formData
        }
    );

    const filesUrls = [];
    for (let i = 0; i < newItemsList.value.length; i++) {
        const itemFormData = new FormData();
        itemFormData.append("upload_preset", "ml_default");
        itemFormData.append("folder", "De Zero a Dez");
        itemFormData.append("file", newItemsList.value[i].file);

        const { data: fileUpload } = await useFetch<Upload>(
            "https://api.cloudinary.com/v1_1/dcxlgeobi/image/upload",
            {
                method: "POST",
                body: itemFormData
            }
        );

        if (fileUpload.value?.secure_url) {
            filesUrls.push(fileUpload.value.secure_url);
        }
    }

    const { error } = await useFetch(`/api/templates`, {
        method: "POST",
        body: {
            name: templateName.value,
            description: templateDescription.value,
            isPublic: templateVisibility.value ? 1 : 0,
            coverUrl: coverUpload.value?.secure_url,
            filesUrls
        }
    });

    if (error.value) {
        toast.add({
            id: "error",
            title: "Não foi possível criar o template.",
            description: "Tente novamente mais tarde.",
            color: "red"
        });

        handleClose();
        return;
    }

    toast.add({
        id: "success",
        title: "Template criado com sucesso!",
        color: "green"
    });

    refreshNuxtData();
    handleClose();
};

const updateTemplate = async () => {
    if (!targetTemplateId.value) return;

    const totalItemsCount = existingItems.value.length + newItemsList.value.length;
    if (totalItemsCount < 10) {
        toast.add({
            id: "error",
            title: "O template precisa de no mínimo 10 itens.",
            description: `O template atualmente possui ${totalItemsCount} foto(s). Adicione mais fotos.`,
            color: "red"
        });
        return;
    }

    let coverUrl;
    if (templateCover.value) {
        const formData = new FormData();
        formData.append("upload_preset", "ml_default");
        formData.append("folder", "De Zero a Dez");
        formData.append("file", templateCover.value);

        const { data: coverUpload } = await useFetch<Upload>(
            "https://api.cloudinary.com/v1_1/dcxlgeobi/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        coverUrl = coverUpload.value?.secure_url;
    }

    let filesUrls: string[] = [];
    if (newItemsList.value.length) {
        const hasLargeItem = newItemsList.value.some((i) => i.file.size > 1000000);

        if (hasLargeItem) {
            toast.add({
                id: "error",
                title: "As imagens devem ter um tamanho máximo de 1MB.",
                description: "Você pode optar por usar um compressor de arquivos online.",
                color: "red",
                timeout: 8000
            });
            return;
        }

        for (let i = 0; i < newItemsList.value.length; i++) {
            const itemFormData = new FormData();
            itemFormData.append("upload_preset", "ml_default");
            itemFormData.append("folder", "De Zero a Dez");
            itemFormData.append("file", newItemsList.value[i].file);

            const { data: fileUpload } = await useFetch<Upload>(
                "https://api.cloudinary.com/v1_1/dcxlgeobi/image/upload",
                {
                    method: "POST",
                    body: itemFormData
                }
            );

            if (fileUpload.value?.secure_url) {
                filesUrls.push(fileUpload.value.secure_url);
            }
        }
    }

    const { error } = await useFetch(`/api/templates/${targetTemplateId.value}`, {
        method: "PUT",
        body: {
            name: templateName.value,
            description: templateDescription.value,
            isPublic: templateVisibility.value ? 1 : 0,
            coverUrl,
            filesUrls,
            items: existingItems.value
        }
    });

    if (error.value) {
        toast.add({
            id: "error",
            title: "Não foi possível atualizar o template.",
            description: "Tente novamente mais tarde.",
            color: "red"
        });
        isSaving.value = false;
        return;
    }

    toast.add({
        id: "success",
        title: "Template atualizado com sucesso!",
        color: "green"
    });

    refreshNuxtData();
    handleClose();
    if (route.path.includes("/profile/template/")) {
        router.back();
    }
};

const handleSubmit = async () => {
    isSaving.value = true;
    if (props.method === "POST") await createTemplate();
    else if (props.method === "PUT") await updateTemplate();
    isSaving.value = false;
};
</script>

<template>
    <UCard class="bg-zinc-900 border-zinc-800 shadow-2xl">
        <template #header>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="p-2.5 rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        <UIcon name="i-heroicons-pencil-square-20-solid" class="w-6 h-6" />
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-zinc-100">
                            {{ isUpdate ? "Atualizar Template" : "Novo Template" }}
                        </h2>
                        <p class="text-xs text-zinc-400">
                            {{ isUpdate ? "Altere as informações do seu template" : "Crie um novo tema de 0 a 10 para a comunidade" }}
                        </p>
                    </div>
                </div>
                <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-x-mark-20-solid"
                    class="rounded-xl hover:bg-zinc-800"
                    @click="handleClose"
                />
            </div>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-4">
            <UFormGroup label="Nome do template" required>
                <UInput
                    v-model="templateName"
                    size="md"
                    placeholder="Ex: Melhores Filmes de 2024"
                    icon="i-heroicons-squares-2x2-20-solid"
                    color="gray"
                    required
                />
            </UFormGroup>

            <UFormGroup label="Descrição" required>
                <UInput
                    v-model="templateDescription"
                    size="md"
                    placeholder="Resumo do que consiste este ranking..."
                    icon="i-heroicons-document-text-20-solid"
                    color="gray"
                    required
                />
            </UFormGroup>

            <div class="flex items-center justify-between p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                <div class="space-y-0.5">
                    <span class="text-sm font-semibold text-zinc-200 block">Deixar público na comunidade?</span>
                    <span class="text-xs text-zinc-400 block">Outros usuários poderão encontrar e classificar seu template</span>
                </div>
                <UToggle
                    v-model="templateVisibility"
                    on-icon="i-heroicons-eye-20-solid"
                    off-icon="i-heroicons-eye-slash-20-solid"
                />
            </div>

            <UFormGroup :label="isUpdate ? 'Nova imagem de capa (opcional)' : 'Imagem de Capa (Obrigatório)'" required>
                <UInput
                    @change="handleFileSelected"
                    type="file"
                    name="cover"
                    accept="image/*"
                    size="md"
                    color="gray"
                    :required="!isUpdate"
                />
            </UFormGroup>

            <!-- Existing Items (Draggable for Reordering & Deletion) -->
            <div v-if="isUpdate && existingItems.length" class="space-y-2 pt-1 pb-1">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                        <UIcon name="i-heroicons-bars-3-20-solid" class="text-yellow-500" />
                        Itens Cadastrados ({{ existingItems.length }})
                    </label>
                    <span class="text-[11px] text-zinc-400">Arraste para reorganizar a ordem</span>
                </div>

                <draggable
                    v-model="existingItems"
                    item-key="url"
                    :animation="150"
                    tag="div"
                    class="grid grid-cols-4 sm:grid-cols-5 gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 max-h-52 overflow-y-auto"
                >
                    <template #item="{ element: itemUrl, index }">
                        <div class="group relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 cursor-grab active:cursor-grabbing shadow-sm transition-transform hover:scale-[1.02]">
                            <NuxtImg :src="itemUrl" class="w-full h-full object-cover pointer-events-none" quality="70" loading="lazy" />
                            <div class="absolute top-1 left-1 bg-zinc-950/85 text-yellow-400 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold border border-zinc-800 pointer-events-none">
                                #{{ index + 1 }}
                            </div>
                            <button
                                type="button"
                                @click.stop="removeExistingItem(index)"
                                class="absolute top-1 right-1 bg-red-950/90 hover:bg-red-900 text-red-300 p-1 rounded-md transition-opacity border border-red-500/30 shadow-md"
                                title="Remover este item"
                            >
                                <UIcon name="i-heroicons-trash-20-solid" class="w-3.5 h-3.5 text-red-400" />
                            </button>
                        </div>
                    </template>
                </draggable>
            </div>

            <!-- New Items Preview (Draggable for Reordering & Deletion) -->
            <div v-if="newItemsList.length" class="space-y-2 pt-1 pb-1">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                        <UIcon name="i-heroicons-bars-3-20-solid" class="text-yellow-500" />
                        Novas Imagens Selecionadas ({{ newItemsList.length }})
                    </label>
                    <span class="text-[11px] text-zinc-400">Arraste para reorganizar antes de salvar</span>
                </div>

                <draggable
                    v-model="newItemsList"
                    item-key="id"
                    :animation="150"
                    tag="div"
                    class="grid grid-cols-4 sm:grid-cols-5 gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 max-h-52 overflow-y-auto"
                >
                    <template #item="{ element: item, index }">
                        <div class="group relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 cursor-grab active:cursor-grabbing shadow-sm transition-transform hover:scale-[1.02]">
                            <img :src="item.url" class="w-full h-full object-cover pointer-events-none" />
                            <div class="absolute top-1 left-1 bg-zinc-950/85 text-yellow-400 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold border border-zinc-800 pointer-events-none">
                                #{{ (isUpdate ? existingItems.length : 0) + index + 1 }}
                            </div>
                            <button
                                type="button"
                                @click.stop="removeNewItem(index)"
                                class="absolute top-1 right-1 bg-red-950/90 hover:bg-red-900 text-red-300 p-1 rounded-md transition-opacity border border-red-500/30 shadow-md"
                                title="Remover esta foto"
                            >
                                <UIcon name="i-heroicons-trash-20-solid" class="w-3.5 h-3.5 text-red-400" />
                            </button>
                        </div>
                    </template>
                </draggable>
            </div>

            <UFormGroup
                :label="isUpdate ? 'Adicionar novas imagens de itens' : 'Imagens dos Itens (no mínimo 10 fotos)'"
                :required="!isUpdate && !newItemsList.length"
            >
                <UInput
                    @change="handleFileSelected"
                    type="file"
                    name="items"
                    accept="image/*"
                    size="md"
                    color="gray"
                    multiple
                    :required="!isUpdate && !newItemsList.length"
                />
                <p class="mt-1 text-xs text-zinc-500">Formato aceito: PNG, JPG (máximo 1MB por imagem).</p>
            </UFormGroup>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
                <UButton
                    v-if="isUpdate"
                    @click="deleteTemplate"
                    type="button"
                    size="md"
                    color="red"
                    variant="soft"
                    :loading="isDeleting"
                    :disabled="isSaving"
                    icon="i-heroicons-trash-20-solid"
                >
                    Excluir
                </UButton>

                <UButton
                    v-if="isUpdate && targetTemplateId"
                    :to="`/ranking/${targetTemplateId}`"
                    type="button"
                    size="md"
                    color="gray"
                    variant="soft"
                    icon="i-heroicons-arrow-top-right-on-square-20-solid"
                >
                    Classificar
                </UButton>

                <UButton
                    type="submit"
                    size="md"
                    color="primary"
                    class="font-bold px-6 rounded-xl"
                    :loading="isSaving"
                    :disabled="isDeleting"
                >
                    {{ isUpdate ? "Salvar Alterações" : "Criar Template" }}
                </UButton>
            </div>
        </form>
    </UCard>
</template>



