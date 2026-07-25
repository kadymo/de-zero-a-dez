<script setup lang="ts">
import type { Upload } from "@/types";
import { useStorage } from "@vueuse/core";
import draggable from "vuedraggable";
import { toPng } from "html-to-image";

const { status } = useAuth();
const route = useRoute();
const toast = useToast();

const isAuthenticated = computed(() => status.value === "authenticated");

const aspectRatio = ref("square");
const aspectRatioOptions = [
    {
        name: "square",
        value: "square",
        label: "1:1 Quadrado",
        icon: "i-heroicons-square-2-stack-20-solid"
    },
    {
        name: "poster",
        value: "poster",
        label: "3:4 Retrato",
        icon: "i-heroicons-rectangle-stack-20-solid"
    },
    {
        name: "widescreen",
        value: "widescreen",
        label: "16:9 Paisagem",
        icon: "i-heroicons-computer-desktop-20-solid"
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

const displayedItems = computed({
    get() {
        const allItems = [...(template.value?.items || []), ...storedUploads.value];
        return allItems.filter((i) => !JSON.stringify(columns.value).includes(i));
    },
    set(val) {
        // vuedraggable setter
    }
});

const { data: userRankings } = await useFetch("/api/user/rankings");
const savedRanking = userRankings.value?.find((r: any) => r.templateId === route.params.id);
if (savedRanking) columns.value = savedRanking.columns;

const modal = ref(false);
const shareModal = ref(false);
const items = ref<FileList | null>(null);
const isUploading = ref(false);
const isSaving = ref(false);
const isExporting = ref(false);
const exportedImage = ref<string | null>(null);
const exportCardRef = ref<HTMLElement | null>(null);

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
        toast.add({
            id: "upload_success",
            title: "Itens adicionados com sucesso!",
            color: "green"
        });
    }
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
        title: "Ranking salvo com sucesso!",
        description: "Confira todos os seus rankings salvos no seu perfil.",
        color: "green"
    });

    isSaving.value = false;
};

const handleShare = async () => {
    if (!exportCardRef.value) return;
    isExporting.value = true;

    try {
        const dataUrl = await toPng(exportCardRef.value, {
            quality: 0.95,
            pixelRatio: 2,
            cacheBust: true
        });
        exportedImage.value = dataUrl;
        shareModal.value = true;
    } catch (err) {
        console.error("Export image failed", err);
        toast.add({
            id: "export_error",
            title: "Não foi possível gerar a imagem do ranking.",
            description: "Tente novamente mais tarde.",
            color: "red"
        });
    } finally {
        isExporting.value = false;
    }
};

const downloadImage = () => {
    if (!exportedImage.value) return;
    const link = document.createElement("a");
    const name = template.value?.name ? template.value.name.toLowerCase().replace(/\s+/g, "-") : "de-zero-a-dez";
    link.download = `ranking-${name}.png`;
    link.href = exportedImage.value;
    link.click();
    toast.add({
        id: "downloaded",
        title: "Imagem do ranking salva!",
        color: "green"
    });
};

const copyImageToClipboard = async () => {
    if (!exportedImage.value) return;
    try {
        const response = await fetch(exportedImage.value);
        const blob = await response.blob();
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
        ]);
        toast.add({
            id: "copied",
            title: "Imagem copiada para a área de transferência!",
            color: "green"
        });
    } catch (e) {
        downloadImage();
    }
};

const resetRanking = () => {
    columns.value = [
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
    ];
    toast.add({
        id: "reset",
        title: "Ranking reiniciado.",
        color: "gray"
    });
};

const getScoreColorClass = (score: number) => {
    if (score === 10) return "bg-amber-500 text-zinc-950";
    if (score >= 8) return "bg-yellow-500 text-zinc-950";
    if (score >= 6) return "bg-emerald-500 text-zinc-950";
    if (score >= 4) return "bg-sky-500 text-zinc-950";
    if (score >= 2) return "bg-purple-500 text-zinc-950";
    return "bg-rose-600 text-white";
};

const getItemKey = (item: any) => item;
</script>

<template>
    <ClientOnly>
        <div class="content min-h-screen flex flex-col justify-between">
            <div>
                <Header />

                <main class="max-w-[1400px] mx-auto px-4 sm:px-6 py-6" v-if="template">
                    <!-- Top Navigation & Theme Title -->
                    <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
                        <div class="flex items-center gap-4">
                            <UButton
                                to="/"
                                icon="i-heroicons-arrow-left-20-solid"
                                variant="ghost"
                                size="md"
                                class="rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80"
                            />
                            <NuxtImg
                                v-if="template.cover"
                                :src="template.cover"
                                class="w-12 h-12 rounded-xl object-cover border border-zinc-700/60"
                            />
                            <div>
                                <span class="text-xs font-semibold uppercase tracking-wider text-yellow-500 flex items-center gap-1">
                                    <UIcon name="i-heroicons-chart-bar-20-solid" /> Tema De Zero a Dez
                                </span>
                                <h1 class="text-xl sm:text-2xl font-extrabold text-zinc-100 leading-tight">
                                    {{ template.name }}
                                </h1>
                            </div>
                        </div>

                        <!-- Reset Button -->
                        <div class="flex items-center gap-3 self-end md:self-auto">
                            <UButton
                                @click="resetRanking"
                                icon="i-heroicons-arrow-path-20-solid"
                                label="Reiniciar"
                                variant="ghost"
                                size="sm"
                                class="rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 font-medium"
                            />
                        </div>
                    </div>

                    <!-- Ranking Grid Section: Horizontal Columns 0 to 10 -->
                    <div class="space-y-6">
                        <!-- Score Columns (0 to 10 Side by Side Horizontally) -->
                        <div class="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-lg">
                            <draggable
                                v-model="columns"
                                :animation="150"
                                item-key="index"
                                tag="div"
                                class="flex flex-row justify-between gap-2 sm:gap-3 overflow-x-auto min-h-[380px] pb-2"
                            >
                                <template #item="{ element }">
                                    <div class="flex flex-col flex-1 min-w-[76px] sm:min-w-[90px] items-center gap-2 rounded-xl bg-zinc-950 p-2 border border-zinc-800/80">
                                        <!-- Score Header Badge (0-10) -->
                                        <div
                                            :class="getScoreColorClass(element.index)"
                                            class="w-full py-2 rounded-lg text-center font-black text-xl sm:text-2xl shadow-sm flex-shrink-0"
                                        >
                                            {{ element.index }}
                                        </div>

                                        <!-- Vertical Droppable Item Stack inside Column -->
                                        <draggable
                                            :list="element.items"
                                            :item-key="getItemKey"
                                            :animation="150"
                                            tag="ul"
                                            group="items"
                                            class="w-full flex-1 flex flex-col items-center gap-2 min-h-[300px] p-1 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 overflow-y-auto"
                                        >
                                            <template #item="{ element: item }">
                                                <li v-if="item !== '/transparent.png'" class="relative group cursor-grab active:cursor-grabbing flex-shrink-0">
                                                    <NuxtImg
                                                        :src="item"
                                                        :class="{
                                                            'h-16 w-16': aspectRatio === 'square',
                                                            'aspect-[3/4] h-20 w-15': aspectRatio === 'poster',
                                                            'aspect-video h-12 w-20': aspectRatio === 'widescreen'
                                                        }"
                                                        class="rounded-lg object-cover border border-zinc-700/80 shadow-sm transition-transform group-hover:scale-105"
                                                        quality="75"
                                                        loading="lazy"
                                                    />
                                                </li>
                                            </template>
                                        </draggable>
                                    </div>
                                </template>
                            </draggable>
                        </div>

                        <!-- Unranked Items Pool & Aspect Controls Header -->
                        <div class="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg space-y-4">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800">
                                <div>
                                    <h3 class="text-base font-bold text-zinc-100 flex items-center gap-2">
                                        <UIcon name="i-heroicons-photo-20-solid" class="text-yellow-500" />
                                        Itens Disponíveis
                                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                                            {{ displayedItems.length }}
                                        </span>
                                    </h3>
                                    <p class="text-xs text-zinc-400 mt-0.5">
                                        Arraste os itens para as colunas de 0 a 10 acima.
                                    </p>
                                </div>

                                <div class="flex items-center gap-3">
                                    <!-- Aspect Ratio Controls -->
                                    <div class="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
                                        <button
                                            v-for="option in aspectRatioOptions"
                                            :key="option.name"
                                            @click="aspectRatio = option.value"
                                            :class="[
                                                aspectRatio === option.value
                                                    ? 'bg-yellow-500 text-zinc-950 font-bold shadow-sm'
                                                    : 'text-zinc-400 hover:text-zinc-200'
                                            ]"
                                            class="px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 transition-all"
                                        >
                                            <UIcon :name="option.icon" class="h-3.5 w-3.5" />
                                            <span>{{ option.label.split(' ')[0] }}</span>
                                        </button>
                                    </div>

                                    <UButton
                                        @click="modal = true"
                                        label="Adicionar fotos"
                                        variant="ghost"
                                        size="sm"
                                        icon="i-heroicons-plus-20-solid"
                                        class="rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 font-medium"
                                    />
                                </div>
                            </div>

                            <!-- Unranked Draggable Container -->
                            <draggable
                                v-model="displayedItems"
                                :item-key="getItemKey"
                                :animation="150"
                                tag="ul"
                                group="items"
                                class="flex min-h-[110px] flex-wrap items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800"
                            >
                                <template #item="{ element: item }">
                                    <li class="relative group cursor-grab active:cursor-grabbing flex-shrink-0">
                                        <NuxtImg
                                            :src="item"
                                            :class="{
                                                'h-16 w-16': aspectRatio === 'square',
                                                'aspect-[3/4] h-20 w-15': aspectRatio === 'poster',
                                                'aspect-video h-12 w-20': aspectRatio === 'widescreen'
                                            }"
                                            class="rounded-lg object-cover border border-zinc-700/80 shadow-sm transition-transform group-hover:scale-105"
                                            quality="75"
                                            loading="lazy"
                                        />
                                    </li>
                                </template>
                            </draggable>
                        </div>

                        <!-- Bottom Action Bar -->
                        <div class="sticky bottom-4 z-40 flex items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl">
                            <UButton
                                to="/"
                                label="Voltar à Home"
                                variant="ghost"
                                size="md"
                                icon="i-heroicons-arrow-left-20-solid"
                                class="rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 font-medium"
                            />

                            <div class="flex items-center gap-3">
                                <UButton
                                    @click="handleShare"
                                    label="Compartilhar"
                                    variant="ghost"
                                    size="md"
                                    icon="i-heroicons-share-20-solid"
                                    :loading="isExporting"
                                    class="rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 font-bold"
                                />

                                <UTooltip :text="!isAuthenticated ? 'Faça login para salvar um ranking' : ''">
                                    <UButton
                                        @click="saveRanking"
                                        label="Salvar Ranking"
                                        variant="solid"
                                        size="md"
                                        color="primary"
                                        icon="i-heroicons-bookmark-20-solid"
                                        :loading="isSaving"
                                        :disabled="!isAuthenticated"
                                        class="rounded-xl px-6 font-bold"
                                    />
                                </UTooltip>
                            </div>
                        </div>
                    </div>

                    <!-- Add Items Modal -->
                    <UModal v-model="modal" :ui="{ width: 'sm:max-w-md', rounded: 'rounded-2xl' }">
                        <UCard class="bg-zinc-900 border-zinc-800">
                            <template #header>
                                <div class="flex items-center gap-3">
                                    <div class="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                        <UIcon name="i-heroicons-photo-20-solid" class="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-bold text-zinc-100">Adicionar novos itens</h3>
                                        <p class="text-xs text-zinc-400">Estes itens ficarão visíveis apenas na sua sessão.</p>
                                    </div>
                                </div>
                            </template>

                            <form @submit.prevent="handleUploadSubmit" class="space-y-4">
                                <UInput
                                    @change="handleFileSelected"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    size="md"
                                    color="gray"
                                />
                                <div class="flex justify-end gap-2 pt-2">
                                    <UButton @click="modal = false" label="Cancelar" variant="ghost" color="gray" />
                                    <UButton
                                        :loading="isUploading"
                                        type="submit"
                                        label="Upload e Adicionar"
                                        color="primary"
                                    />
                                </div>
                            </form>
                        </UCard>
                    </UModal>

                    <!-- Share / Image Export Modal -->
                    <UModal v-model="shareModal" :ui="{ width: 'sm:max-w-2xl', rounded: 'rounded-2xl' }">
                        <UCard class="bg-zinc-900 border-zinc-800">
                            <template #header>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                            <UIcon name="i-heroicons-sparkles-20-solid" class="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 class="text-lg font-bold text-zinc-100">Compartilhar Ranking</h3>
                                            <p class="text-xs text-zinc-400">Sua imagem HD do ranking foi gerada!</p>
                                        </div>
                                    </div>
                                </div>
                            </template>

                            <div class="space-y-4">
                                <div v-if="exportedImage" class="overflow-hidden rounded-xl border border-zinc-800 max-h-[420px] overflow-y-auto bg-zinc-950 p-2">
                                    <img :src="exportedImage" class="w-full h-auto rounded-lg object-contain" alt="Preview do Ranking" />
                                </div>

                                <div class="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                                    <UButton
                                        @click="copyImageToClipboard"
                                        label="Copiar Imagem"
                                        variant="soft"
                                        color="gray"
                                        size="md"
                                        icon="i-heroicons-document-duplicate-20-solid"
                                        class="w-full sm:w-auto rounded-xl"
                                    />
                                    <UButton
                                        @click="downloadImage"
                                        label="Baixar Imagem (PNG HD)"
                                        variant="solid"
                                        color="primary"
                                        size="md"
                                        icon="i-heroicons-arrow-down-tray-20-solid"
                                        class="w-full sm:w-auto rounded-xl font-bold"
                                    />
                                </div>
                            </div>
                        </UCard>
                    </UModal>

                    <!-- Hidden Off-Screen HD Poster Render Element -->
                    <div class="fixed -left-[9999px] top-0 pointer-events-none z-[-100]">
                        <div
                            ref="exportCardRef"
                            class="w-[1200px] bg-zinc-950 p-8 text-zinc-100 font-sans border border-zinc-800 rounded-3xl space-y-6 shadow-2xl"
                        >
                            <!-- Poster Header -->
                            <div class="border-b border-zinc-800/80 pb-6">
                                <div>
                                    <span class="text-xs font-bold uppercase tracking-wider text-yellow-400 block">
                                        RANKING DE ZERO A DEZ
                                    </span>
                                    <h2 class="text-3xl font-extrabold text-white leading-tight">
                                        {{ template?.name }}
                                    </h2>
                                </div>
                            </div>

                            <!-- 11 Horizontal Score Columns (0 to 10) HD Poster Layout -->
                            <div class="flex flex-row justify-between gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                                <div
                                    v-for="col in columns"
                                    :key="col.index"
                                    class="flex flex-col flex-1 min-w-[90px] items-center gap-2 rounded-xl bg-zinc-950 p-2 border border-zinc-800/80"
                                >
                                    <!-- Score Badge Header -->
                                    <div
                                        :class="getScoreColorClass(col.index)"
                                        class="w-full py-2.5 rounded-lg text-center font-black text-2xl shadow-sm"
                                    >
                                        {{ col.index }}
                                    </div>

                                    <!-- Items inside column -->
                                    <div class="w-full flex-1 flex flex-col items-center gap-2 min-h-[300px] p-1.5 rounded-lg border border-dashed border-zinc-800/60 bg-zinc-900/40">
                                        <template v-for="item in col.items">
                                            <img
                                                v-if="item && item !== '/transparent.png'"
                                                :key="item"
                                                :src="item"
                                                :class="{
                                                    'h-16 w-16': aspectRatio === 'square',
                                                    'aspect-[3/4] h-20 w-15': aspectRatio === 'poster',
                                                    'aspect-video h-12 w-20': aspectRatio === 'widescreen'
                                                }"
                                                class="rounded-lg object-cover border border-zinc-700/80 shadow-md"
                                            />
                                        </template>
                                    </div>
                                </div>
                            </div>

                            <!-- Poster Footer Branding -->
                            <div class="flex items-center justify-between pt-4 border-t border-zinc-800/80 text-xs text-zinc-400">
                                <span>Classificado em de-zero-a-dez.vercel.app • Monte seu ranking de 0 a 10</span>
                                <span class="font-semibold text-yellow-500">De Zero a Dez</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </ClientOnly>
</template>



