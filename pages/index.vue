<script setup lang="ts">
const { status } = useAuth();
const isAuthenticated = computed(() => status.value === "authenticated");

const modal = ref(false);
const toggleModal = () => {
    modal.value = !modal.value;
};

provide("modal", { modal, toggleModal });

const search = ref("");
const debouncedSearch = refDebounced(search, 500);

const { data: templates } = await useFetch("/api/templates", {
    query: { search: debouncedSearch },
    watch: [debouncedSearch, modal]
});
</script>

<template>
    <div class="content min-h-screen w-screen bg-zinc-900">
        <Header />

        <main class="flex flex-col justify-center space-y-10 px-6 py-10 sm:px-20">
            <h2 class="text-3xl font-semibold">Templates da comunidade</h2>

            <div class="mb- flex w-full flex-col gap-4 sm:flex-row">
                <UInput
                    v-model="search"
                    class="flex-1"
                    icon="i-heroicons-magnifying-glass-20-solid"
                    size="xl"
                    color="white"
                    placeholder="Pesquisar templates..."
                    :trailing="false"
                />

                <UTooltip :text="!isAuthenticated ? 'Faça login para criar um template' : ''">
                    <UButton
                        @click="modal = true"
                        class="flex w-full justify-center lg:w-auto"
                        icon="i-heroicons-pencil-square"
                        size="xl"
                        color="primary"
                        variant="solid"
                        label="Criar template"
                        :trailing="false"
                        :disabled="!isAuthenticated"
                    />
                </UTooltip>
            </div>

            <TemplatesList v-if="templates?.length" :templates="templates" />
            <div v-else class="h-[32rem] text-center">
                <span class="text-center text-2xl text-gray-500">
                    Nenhum template encontrado.
                </span>
            </div>

            <UModal v-model="modal">
                <TemplateForm method="POST" />
            </UModal>
        </main>

        <footer class="border-t border-zinc-700 p-2 text-center">
            Site inspirado no programa
            <a
                class="text-primary hover:underline"
                href="https://www.youtube.com/playlist?list=PL-e7oyEds7288nZ59AOXzPUbvIRbT5rAj"
                target="blank"
            >
                De Zero a Dez
            </a>

            e no site
            <a class="text-primary hover:underline" href="https://tiermaker.com" target="_blank">
                Tier Maker</a
            >
        </footer>
    </div>
</template>
