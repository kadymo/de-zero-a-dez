<script setup lang="ts">
import type { Upload } from "@/types";

import { useStorage } from "@vueuse/core";
import draggable from "vuedraggable";

const { status } = useAuth();
const route = useRoute();
const toast = useToast();

const isAuthenticated = computed(() => {
    return status.value === "authenticated" ? true : false;
});

const aspectRatio = ref("square");
const aspectRatioOptions = [
    {
        name: "square",
        value: "square",
        label: "1:1"
    },
    {
        name: "poster",
        value: "poster",
        label: "3:4"
    }
];

const columns = useStorage(`columns_${route.params.id}`, [
    { index: 0, items: ["/transparent.png"] },
    { index: 1, items: ["/transparent.png"] },
    { index: 2, items: ["/transparent.png"] },
    { index: 3, items: ["/transparent.png"] },
    { index: 4, items: ["/transparent.png"] },
    { index: 5, items: ["/transparent.png"] },
    { index: 6, items: ["/transparent.png"] },
    { index: 7, items: ["/transparent.png"] },
    { index: 8, items: ["/transparent.png"] },
    { index: 9, items: ["/transparent.png"] },
    { index: 10, items: ["/transparent.png"] }
]);

const { data: template } = await useFetch(`/api/templates/${route.params.id}`);

const storedUploads = useStorage(`uploads_${route.params.id}`, []);

const displayedItems = computed(() => {
    const allItems = [...template.value?.items!, ...storedUploads.value];

    return allItems.filter((i) => !JSON.stringify(columns.value).includes(i));
});

const { data: userRankings } = await useFetch("/api/user/rankings");
const savedRanking = userRankings.value?.find((r) => r.templateId === route.params.id);
if (savedRanking) columns.value = savedRanking.columns;

const modal = ref(false);

const items = ref<FileList | null>(null);

const isUploading = ref(false);
const isSaving = ref(false);

const handleFileSelected = (e: InputEvent) => {
    const files = (e.target as HTMLInputElement).files;
    items.value = files;
};

const handleUploadSubmit = async () => {
    if (items.value) {
        isUploading.value = true;

        const formData = new FormData();
        formData.append("upload_preset", "ml_default");
        formData.append("folder", "De Zero a Dez");

        const filesUrls = [];
        for (let i = 0; i < items.value.length; i++) {
            formData.append("file", items.value[i]);

            const { data: fileUpload } = await useFetch<Upload>(
                "https://api.cloudinary.com/v1_1/dcxlgeobi/image/upload",
                {
                    method: "POST",
                    body: formData
                }
            );

            filesUrls.push(fileUpload.value?.secure_url);
        }

        const validItems = filesUrls.filter((i) => i !== undefined);
        if (validItems) storedUploads.value.push(...validItems);

        isUploading.value = false;
        modal.value = false;
    }

    return;
};

const saveRanking = async () => {
    isSaving.value = true;

    const { error } = await useFetch("/api/rankings", {
        method: "POST",
        body: {
            templateId: route.params.id,
            columns: columns.value
        }
    });

    if (error.value) {
        toast.add({
            id: "error",
            title: "Não foi possível salvar o ranking.",
            description: "Tente novamente mais tarde.",
            color: "red"
        });

        isSaving.value = false;
        return;
    }

    toast.add({
        id: "success",
        title: "Ranking salvo com sucesso!.",
        description: "Confira todos os seus rankings na página de perfil.",
        color: "green"
    });

    isSaving.value = false;
};
</script>

<template>
    <ClientOnly>
        <div v-if="template" class="content min-h-screen w-screen p-6 lg:p-20">
            <h1 class="mb-8 border-b border-zinc-700 pb-4 text-3xl font-bold lg:text-5xl">
                <span class="text-primary text-xl lg:text-2xl">TEMA:</span>
                {{ template.name }}
            </h1>

            <div class="flex flex-col gap-6">
                <draggable
                    v-model="columns"
                    :animation="200"
                    item-key="index"
                    tag="ul"
                    class="flex min-h-[340px] flex-col justify-between lg:flex-row"
                >
                    <template #item="{ element, index }">
                        <div
                            class="flex items-center gap-4 border-b border-zinc-700 lg:flex-col lg:border-none"
                        >
                            <span
                                class="w-20 min-w-[5rem] border-r border-zinc-700 text-center text-5xl font-bold text-yellow-500 lg:border-b lg:border-r-0 lg:pb-4 lg:text-6xl"
                            >
                                {{ index }}
                            </span>
                            <draggable
                                :list="element.items"
                                :item-key="Math.random().toString()"
                                :animation="200"
                                tag="ul"
                                group="items"
                                class="flex min-w-max gap-2 overflow-x-auto lg:flex-col lg:gap-4"
                            >
                                <template #item="{ element }">
                                    <li class="py-2 lg:py-0">
                                        <NuxtImg
                                            v-if="element"
                                            :src="element"
                                            :class="{
                                                'h-20': aspectRatio === 'square',
                                                'aspect-[3/4] h-28': aspectRatio === 'poster'
                                            }"
                                            class="w-20 overflow-hidden rounded-lg object-cover"
                                            quality="80"
                                        />
                                    </li>
                                </template>
                            </draggable>
                        </div>
                    </template>
                </draggable>

                <div class="flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <div class="flex gap-4">
                            <URadio
                                v-for="option in aspectRatioOptions"
                                v-model="aspectRatio"
                                v-bind="option"
                                :key="option.name"
                            />
                        </div>

                        <UButton
                            @click="modal = true"
                            label="Adicionar itens"
                            variant="solid"
                            size="lg"
                            color="white"
                            icon="i-heroicons-plus"
                        />
                    </div>

                    <draggable
                        v-model="displayedItems"
                        :animation="200"
                        tag="ul"
                        group="items"
                        class="flex min-h-[210px] flex-wrap gap-4 overflow-hidden rounded-xl border border-zinc-700 p-4"
                    >
                        <template #item="{ element }">
                            <NuxtImg
                                :src="element"
                                :class="{
                                    'h-20': aspectRatio === 'square',
                                    'aspect-[3/4] h-28': aspectRatio === 'poster'
                                }"
                                class="w-20 overflow-hidden rounded-lg object-cover"
                                quality="80"
                            />
                        </template>
                    </draggable>
                </div>

                <div class="flex justify-between">
                    <UButton
                        to="/"
                        label="Voltar para a home"
                        variant="solid"
                        size="lg"
                        color="white"
                        icon="i-heroicons-arrow-left"
                    />

                    <UTooltip :text="!isAuthenticated ? 'Faça login para salvar um ranking' : ''">
                        <UButton
                            @click="saveRanking"
                            label="Salvar"
                            variant="solid"
                            size="lg"
                            color="primary"
                            icon="i-heroicons-bookmark"
                            :loading="isSaving"
                            :disabled="!isAuthenticated"
                        />
                    </UTooltip>
                </div>
            </div>

            <UModal v-model="modal">
                <UCard>
                    <template #header>
                        <h1 class="text-2xl font-semibold">Adicionar itens</h1>
                        <p class="text-sm text-gray-500">
                            Novos itens não são adicionados ao template original
                        </p>
                    </template>
                    <form @submit.prevent="handleUploadSubmit" class="flex flex-col gap-4">
                        <UInput @change="handleFileSelected" type="file" multiple />
                        <UButton
                            :loading="isUploading"
                            type="submit"
                            label="Adicionar"
                            size="lg"
                            block
                        />
                    </form>
                </UCard>
            </UModal>
        </div>
    </ClientOnly>
</template>
