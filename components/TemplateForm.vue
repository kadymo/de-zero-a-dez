<script setup lang="ts">
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
const templateItems = ref<FileList | null>(null);
const existingItems = ref<string[]>([]);

const { modal, toggleModal } = inject<Modal>("modal") || { modal: ref(false), toggleModal: () => {} };

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

const handleFileSelected = (e: InputEvent) => {
    const files = (e.target as HTMLInputElement).files!;

    if ((e.target as HTMLInputElement).name === "cover") {
        templateCover.value = files[0];
    } else {
        templateItems.value = files;
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
    emit("close");
    toggleModal();
    if (route.path.includes("/profile/template/")) {
        router.push("/profile");
    }
};

const createTemplate = async () => {
    if (!templateItems.value || templateItems.value.length < 10) {
        toast.add({
            id: "error",
            title: "Selecione pelo menos 10 itens.",
            color: "red"
        });
        return;
    }

    const hasLargeItem = Array.from(templateItems.value).some((i) => i.size > 1000000);

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
    for (let i = 0; i < templateItems.value.length; i++) {
        formData.append("file", templateItems.value[i]);

        const { data: fileUpload } = await useFetch<Upload>(
            "https://api.cloudinary.com/v1_1/dcxlgeobi/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        filesUrls.push(fileUpload.value?.secure_url);
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

        toggleModal();
        emit("close");
        return;
    }

    toast.add({
        id: "success",
        title: "Template criado com sucesso!",
        color: "green"
    });

    refreshNuxtData();
    emit("close");
    toggleModal();
};

const updateTemplate = async () => {
    if (!targetTemplateId.value) return;

    const totalItemsCount = existingItems.value.length + (templateItems.value?.length || 0);
    if (totalItemsCount < 10) {
        toast.add({
            id: "error",
            title: "O template precisa de no mínimo 10 itens.",
            description: `O template atualmente possui ${totalItemsCount} foto(s). Adicione mais fotos.`,
            color: "red"
        });
        return;
    }

    const formData = new FormData();
    formData.append("upload_preset", "ml_default");
    formData.append("folder", "De Zero a Dez");

    let coverUrl;
    let filesUrls;

    if (templateCover.value) {
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

    if (templateItems.value) {
        const hasLargeItem = Array.from(templateItems.value).some((i) => i.size > 1000000);

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

        filesUrls = [];
        for (let i = 0; i < templateItems.value.length; i++) {
            formData.append("file", templateItems.value[i]);

            const { data: fileUpload } = await useFetch<Upload>(
                "https://api.cloudinary.com/v1_1/dcxlgeobi/image/upload",
                {
                    method: "POST",
                    body: formData
                }
            );

            filesUrls.push(fileUpload.value?.secure_url);
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
    emit("close");
    toggleModal();
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
                    @click="emit('close'); toggleModal();"
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

            <!-- Gallery of Existing Items (with Delete Option) -->
            <div v-if="isUpdate" class="space-y-2 pt-1 pb-1">
                <div class="flex items-center justify-between">
                    <label class="block text-xs font-bold text-zinc-200">
                        Itens Atuais do Template ({{ existingItems.length }})
                    </label>
                    <span class="text-[11px] text-zinc-400">Passe o mouse sobre a imagem para remover</span>
                </div>

                <div v-if="existingItems.length" class="grid grid-cols-4 sm:grid-cols-5 gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 max-h-48 overflow-y-auto">
                    <div
                        v-for="(itemUrl, index) in existingItems"
                        :key="itemUrl + index"
                        class="group relative aspect-square rounded-lg overflow-hidden border border-zinc-800/80 bg-zinc-900"
                    >
                        <NuxtImg :src="itemUrl" class="w-full h-full object-cover" quality="70" loading="lazy" />
                        <button
                            type="button"
                            @click="removeExistingItem(index)"
                            class="absolute inset-0 bg-red-950/85 text-red-200 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-all duration-200 text-xs font-bold"
                            title="Remover este item"
                        >
                            <UIcon name="i-heroicons-trash-20-solid" class="w-5 h-5 text-red-400" />
                            <span>Remover</span>
                        </button>
                    </div>
                </div>
                <div v-else class="p-3 rounded-xl bg-zinc-950/80 border border-dashed border-red-500/40 text-center text-xs text-red-400">
                    Nenhum item restante. Adicione novas fotos abaixo.
                </div>
            </div>

            <UFormGroup
                :label="isUpdate ? 'Adicionar novas imagens de itens' : 'Imagens dos Itens (no mínimo 10 fotos)'"
                required
            >
                <UInput
                    @change="handleFileSelected"
                    type="file"
                    name="items"
                    accept="image/*"
                    size="md"
                    color="gray"
                    multiple
                    :required="!isUpdate"
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



