<script setup lang="ts">
import type { Modal, Upload } from "@/types";

const { method } = defineProps<{
    method: "POST" | "PUT";
}>();

const router = useRouter();
const route = useRoute();
const toast = useToast();

const templateName = ref("");
const templateDescription = ref("");
const templateVisibility = ref(false);
const templateCover = ref<File | null>(null);
const templateItems = ref<FileList | null>(null);

const { modal, toggleModal } = inject<Modal>("modal");

const isUpdate = computed(() => method === "PUT");
if (isUpdate.value) {
    const { data: template } = await useFetch(`/api/templates/${route.params.id}`);

    if (template.value) {
        templateName.value = template.value.name;
        templateDescription.value = template.value.description;
        templateVisibility.value = template.value.isPublic;
    }
}

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
    isDeleting.value = true;

    const { error } = await useFetch(`/api/templates/${route.params.id}`, {
        method: "DELETE"
    });

    if (error.value) {
        toast.add({
            id: "error",
            title: "Não foi possível excluir o template.",
            description: "Tente novamente mais tarde.",
            color: "red"
        });
    }

    isDeleting.value = false;
};

const createTemplate = async () => {
    if (templateItems.value!.length < 10) {
        toast.add({
            id: "error",
            title: "Selecione pelo menos 10 itens.",
            color: "red"
        });

        return;
    }

    const hasLargeItem = Array.from(templateItems.value!).some((i) => i.size > 1000000);

    if (hasLargeItem) {
        toast.add({
            id: "error",
            title: "As imagens devem ter um tamanho máximo de 1MB.",
            description:
                "Você pode optar por usar um compressor de arquivos online para não perder a qualidade das imagens.",
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
    for (let i = 0; i < templateItems.value!.length; i++) {
        formData.append("file", templateItems.value![i]);

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
        return;
    }

    toast.add({
        id: "success",
        title: "Template criado com sucesso!",
        color: "green"
    });

    toggleModal();
};

const updateTemplate = async () => {
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
                description:
                    "Você pode optar por usar um compressor de arquivos online para não perder a qualidade das imagens.",
                color: "red",
                timeout: 8000
            });

            return;
        }

        filesUrls = [];
        for (let i = 0; i < templateItems.value!.length; i++) {
            formData.append("file", templateItems.value![i]);

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

    const { error } = await useFetch(`/api/templates/${route.params.id}`, {
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

    router.back();
};

const handleSubmit = async () => {
    isSaving.value = true;

    if (method === "POST") await createTemplate();
    else if (method === "PUT") await updateTemplate();

    isSaving.value = false;
};
</script>

<template>
    <UCard>
        <template #header>
            <h1 class="text-2xl font-semibold">
                {{ isUpdate ? "Atualizar template" : "Novo template" }}
            </h1>
        </template>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 bg-zinc-900">
            <UFormGroup label="Nome do template">
                <UInput
                    v-model="templateName"
                    size="lg"
                    placeholder="Nome..."
                    icon="i-heroicons-clipboard"
                    required
                />
            </UFormGroup>

            <UFormGroup label="Descrição">
                <UInput
                    v-model="templateDescription"
                    size="lg"
                    placeholder="Descrição..."
                    icon="i-heroicons-document-text"
                    required
                />
            </UFormGroup>

            <UFormGroup label="Deixar público?" class="flex gap-2">
                <UToggle
                    v-model="templateVisibility"
                    on-icon="i-heroicons-eye"
                    off-icon="i-heroicons-eye-slash"
                    class="order-0"
                />
            </UFormGroup>

            <UFormGroup :label="isUpdate ? 'Nova imagem de capa' : 'Selecione a imagem de capa'">
                <UInput
                    @change="handleFileSelected"
                    type="file"
                    name="cover"
                    accept="image/*"
                    size="lg"
                    :required="!isUpdate"
                />
            </UFormGroup>

            <UFormGroup
                :label="
                    isUpdate ? 'Adicione novos imagens de itens' : 'Selecione as imagens dos itens'
                "
            >
                <UInput
                    @change="handleFileSelected"
                    type="file"
                    name="items"
                    accept="image/*"
                    size="lg"
                    multiple
                    :required="!isUpdate"
                />
            </UFormGroup>

            <div class="flex gap-2">
                <UButton
                    @click="deleteTemplate"
                    v-if="isUpdate"
                    type="submit"
                    size="lg"
                    color="red"
                    :loading="isDeleting"
                    :disabled="isLoading"
                >
                    Excluir
                </UButton>

                <UButton
                    type="submit"
                    size="lg"
                    class="flex-1"
                    block
                    :loading="isSaving"
                    :disabled="isDeleting"
                >
                    {{ isUpdate ? "Salvar" : "Criar template" }}
                </UButton>
            </div>
        </form>
    </UCard>
</template>

<style>
form div:nth-child(3) div:first-child {
    order: 1;
}
</style>
