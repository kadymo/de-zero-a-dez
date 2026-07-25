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

const { modal, toggleModal } = inject<Modal>("modal") || { modal: ref(false), toggleModal: () => {} };

const isUpdate = computed(() => props.method === "PUT");
const targetTemplateId = computed(() => props.template?.id || props.templateId || (route.params.id as string));

if (isUpdate.value) {
    if (props.template) {
        templateName.value = props.template.name || "";
        templateDescription.value = props.template.description || "";
        templateVisibility.value = !!props.template.isPublic;
    } else if (targetTemplateId.value) {
        const { data: templateData } = await useFetch(`/api/templates/${targetTemplateId.value}`);

        if (templateData.value) {
            templateName.value = templateData.value.name;
            templateDescription.value = templateData.value.description;
            templateVisibility.value = !!templateData.value.isPublic;
        }
    }
}

watch(() => props.template, (newVal) => {
    if (newVal) {
        templateName.value = newVal.name || "";
        templateDescription.value = newVal.description || "";
        templateVisibility.value = !!newVal.isPublic;
    }
}, { immediate: true });

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
            filesUrls
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
                    v-if="isUpdate"
                    :to="`/ranking/${route.params.id}`"
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


