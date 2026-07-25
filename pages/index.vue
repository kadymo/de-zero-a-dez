<script setup lang="ts">
const { status } = useAuth();
const isAuthenticated = computed(() => status.value === "authenticated");

const modal = ref(false);
const toggleModal = () => {
    modal.value = !modal.value;
};

provide("modal", { modal, toggleModal });

const page = ref(1);
const search = ref("");
const debouncedSearch = refDebounced(search, 400);

const { data: response, pending } = await useFetch("/api/templates", {
    query: { search: debouncedSearch, page, limit: 15 },
    watch: [debouncedSearch, page, modal]
});

const templates = computed(() => response.value?.templates || []);
const totalTemplates = computed(() => response.value?.total || 0);
const totalPages = computed(() => response.value?.totalPages || 1);

watch(debouncedSearch, () => {
    page.value = 1;
});

const handlePageChange = (newPage: number) => {
    page.value = newPage;
    window.scrollTo({ top: 0, behavior: "smooth" });
};
</script>

<template>
    <div class="content min-h-screen flex flex-col justify-between">
        <div>
            <Header />

            <main class="max-w-7xl mx-auto px-6 py-10 sm:px-10">
                <!-- Hero Section -->
                <div class="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-8 sm:p-12 mb-10 backdrop-blur-xl shadow-2xl">
                    <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />
                    <div class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                    <div class="relative z-10 max-w-3xl space-y-4">
                        <div class="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3.5 py-1 text-xs font-semibold text-yellow-400">
                            <UIcon name="i-heroicons-sparkles-20-solid" class="h-4 w-4" />
                            <span>DE ZERO A DEZ • TIER LIST MAKER</span>
                        </div>

                        <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                            Monte e compartilhe seu ranking <span class="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">De Zero a Dez</span>
                        </h1>

                        <p class="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                            Site inspirado nos programas
                            <a
                                class="text-yellow-400 hover:underline font-semibold"
                                href="https://www.youtube.com/show/VLPL-e7oyEds7288nZ59AOXzPUbvIRbT5rAj?sbp=Kgt2SHdfMlJzamFzZ0AB"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                De Zero a Dez
                            </a>
                            e
                            <a
                                class="text-yellow-400 hover:underline font-semibold"
                                href="https://www.youtube.com/playlist?list=PLoivxUjiVMgpsVDyx3ufgUDMV4-4Rahtt"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                De Sola a Dez
                            </a>.
                        </p>
                    </div>
                </div>

                <!-- Search & Actions Bar -->
                <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                    <div class="relative flex-1 max-w-xl">
                        <UInput
                            v-model="search"
                            icon="i-heroicons-magnifying-glass-20-solid"
                            size="lg"
                            color="gray"
                            variant="outline"
                            placeholder="Pesquisar por nome do template..."
                            class="w-full"
                            :ui="{
                                icon: { leading: { wrapper: 'text-zinc-400' } },
                                color: {
                                    gray: {
                                        outline: 'bg-zinc-900/80 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-yellow-500 focus:ring-yellow-500/20'
                                    }
                                }
                            }"
                        >
                            <template #trailing v-if="search">
                                <UButton
                                    color="gray"
                                    variant="link"
                                    icon="i-heroicons-x-mark-20-solid"
                                    :padded="false"
                                    @click="search = ''"
                                />
                            </template>
                        </UInput>
                    </div>

                    <UTooltip :text="!isAuthenticated ? 'Faça login para criar um template' : ''">
                        <UButton
                            @click="modal = true"
                            class="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all duration-300"
                            icon="i-heroicons-plus-circle-20-solid"
                            size="lg"
                            color="primary"
                            variant="solid"
                            label="Criar Novo Template"
                            :disabled="!isAuthenticated"
                        />
                    </UTooltip>
                </div>

                <!-- Templates Header Counter -->
                <div class="flex items-center justify-between mb-6 pb-3 border-b border-zinc-800/60">
                    <h2 class="text-xl font-bold text-zinc-100 flex items-center gap-2">
                        <UIcon name="i-heroicons-squares-2x2-20-solid" class="text-yellow-500" />
                        Templates da Comunidade
                    </h2>
                    <span v-if="totalTemplates > 0" class="text-xs font-medium text-zinc-400">
                        Exibindo <span class="text-zinc-200 font-semibold">{{ templates.length }}</span> de <span class="text-zinc-200 font-semibold">{{ totalTemplates }}</span> templates
                    </span>
                </div>

                <!-- Loading / Templates List / Empty State -->
                <div v-if="pending" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 min-h-[30rem]">
                    <div v-for="n in 6" :key="n" class="h-72 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse p-4 flex flex-col justify-between">
                        <div class="w-full h-40 bg-zinc-800/60 rounded-xl" />
                        <div class="space-y-2 mt-4">
                            <div class="w-3/4 h-5 bg-zinc-800/60 rounded" />
                            <div class="w-1/2 h-4 bg-zinc-800/40 rounded" />
                        </div>
                    </div>
                </div>

                <div v-else-if="templates.length > 0">
                    <TemplatesList :templates="templates" />

                    <!-- Pagination Controls -->
                    <div v-if="totalPages > 1" class="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-800/60">
                        <p class="text-xs text-zinc-400">
                            Página <span class="text-zinc-200 font-semibold">{{ page }}</span> de <span class="text-zinc-200 font-semibold">{{ totalPages }}</span>
                        </p>
                        
                        <UPagination
                            :model-value="page"
                            @update:model-value="handlePageChange"
                            :page-count="15"
                            :total="totalTemplates"
                            :prev-button="{ icon: 'i-heroicons-arrow-left-20-solid', label: 'Anterior', color: 'gray' }"
                            :next-button="{ icon: 'i-heroicons-arrow-right-20-solid', label: 'Próxima', color: 'gray' }"
                            :ui="{
                                wrapper: 'flex items-center gap-1',
                                base: 'rounded-xl font-medium min-w-[36px] h-[36px] flex items-center justify-center transition-colors',
                                color: {
                                    white: {
                                        solid: 'bg-yellow-500 text-zinc-950 hover:bg-yellow-400 font-bold'
                                    },
                                    gray: {
                                        ghost: 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                                    }
                                }
                            }"
                        />
                    </div>
                </div>

                <div v-else class="flex flex-col items-center justify-center min-h-[25rem] text-center p-8 rounded-3xl border border-zinc-800/60 bg-zinc-900/30">
                    <div class="p-4 rounded-full bg-zinc-800/50 mb-4 text-zinc-400">
                        <UIcon name="i-heroicons-magnifying-glass-20-solid" class="w-10 h-10" />
                    </div>
                    <h3 class="text-lg font-semibold text-zinc-200 mb-1">Nenhum template encontrado</h3>
                    <p class="text-sm text-zinc-400 max-w-sm mb-6">
                        Não encontramos resultados para "{{ search }}". Tente buscar por outros termos ou crie o seu próprio template!
                    </p>
                    <UButton
                        v-if="search"
                        @click="search = ''"
                        label="Limpar pesquisa"
                        variant="soft"
                        color="gray"
                        size="md"
                    />
                </div>

                <!-- Create Template Modal -->
                <UModal v-model="modal" :ui="{ width: 'sm:max-w-xl', rounded: 'rounded-2xl' }">
                    <TemplateForm method="POST" />
                </UModal>
            </main>
        </div>

        <footer class="mt-16 border-t border-zinc-800/70 bg-zinc-950/60 py-6 px-6 text-center text-xs text-zinc-400">
            <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <p>
                    Inspirado nos programas 
                    <a
                        class="text-yellow-500 hover:underline font-semibold"
                        href="https://www.youtube.com/show/VLPL-e7oyEds7288nZ59AOXzPUbvIRbT5rAj?sbp=Kgt2SHdfMlJzamFzZ0AB"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        De Zero a Dez
                    </a>,
                    <a
                        class="text-yellow-500 hover:underline font-semibold"
                        href="https://www.youtube.com/playlist?list=PLoivxUjiVMgpsVDyx3ufgUDMV4-4Rahtt"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        De Sola a Dez
                    </a>
                    e no site
                    <a class="text-yellow-500 hover:underline font-semibold" href="https://tiermaker.com" target="_blank" rel="noopener noreferrer">
                        Tier Maker
                    </a>
                </p>
                <p class="text-zinc-400">De Zero a Dez &copy; {{ new Date().getFullYear() }}</p>
            </div>
        </footer>
    </div>
</template>

