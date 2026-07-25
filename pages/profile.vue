<script setup lang="ts">
const { data, signOut } = useAuth();

definePageMeta({
    middleware: "auth"
});

const router = useRouter();
const toast = useToast();

const items = computed(() => [
    { key: "templates", label: "Meus templates", icon: "i-heroicons-squares-2x2-20-solid", count: templates.value?.length || 0 },
    { key: "rankings", label: "Meus rankings", icon: "i-heroicons-bookmark-20-solid", count: rankings.value?.length || 0 }
]);

const { data: templates, error: templatesError } = await useFetch("/api/user/templates", {
    watch: [router.currentRoute]
});

const { data: rankings, error: rankingsError } = await useFetch("/api/user/rankings/templates");

if (templatesError.value) {
    toast.add({
        id: "error",
        title: "Não foi possível recuperar os seus templates.",
        description: "Tente novamente mais tarde.",
        color: "red"
    });
}

if (rankingsError.value) {
    toast.add({
        id: "error",
        title: "Não foi possível recuperar os seus rankings.",
        description: "Tente novamente mais tarde.",
        color: "red"
    });
}

const modal = ref(false);
const toggleModal = () => { modal.value = !modal.value; };
provide("modal", { modal, toggleModal });
</script>

<template>
    <div class="content min-h-screen flex flex-col justify-between">
        <div>
            <Header />

            <main class="max-w-7xl mx-auto px-6 py-10 sm:px-10 space-y-8">
                <!-- Navigation Back & Title -->
                <div class="flex items-center justify-between">
                    <UButton
                        to="/"
                        label="Voltar para a home"
                        variant="soft"
                        color="gray"
                        size="md"
                        icon="i-heroicons-arrow-left-20-solid"
                        class="rounded-xl"
                    />

                    <UButton
                        @click="modal = true"
                        label="Novo Template"
                        variant="solid"
                        color="primary"
                        size="md"
                        icon="i-heroicons-plus-20-solid"
                        class="rounded-xl font-bold shadow-md shadow-yellow-500/10"
                    />
                </div>

                <!-- User Profile Header Card -->
                <div class="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/50 p-6 sm:p-10 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center gap-8">
                    <div class="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />

                    <div class="relative">
                        <NuxtImg
                            :src="data?.user?.image || undefined"
                            alt="Foto de perfil"
                            quality="80"
                            class="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-yellow-500/30 shadow-xl"
                        />
                    </div>

                    <div class="text-center md:text-start flex-1 space-y-3">
                        <div class="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-0.5 text-xs font-semibold text-yellow-400">
                            <UIcon name="i-heroicons-user-20-solid" class="h-3.5 w-3.5" />
                            <span>Perfil Criador</span>
                        </div>

                        <h1 class="text-3xl sm:text-4xl font-black text-zinc-100 tracking-tight">
                            {{ data?.user?.name }}
                        </h1>

                        <p class="text-sm text-zinc-400 font-medium">
                            {{ data?.user?.email }}
                        </p>

                        <!-- Stats Row -->
                        <div class="flex items-center justify-center md:justify-start gap-6 pt-2">
                            <div class="flex items-center gap-2 text-xs text-zinc-300">
                                <span class="font-extrabold text-base text-yellow-400">{{ templates?.length || 0 }}</span>
                                <span>templates criados</span>
                            </div>
                            <div class="w-1 h-1 rounded-full bg-zinc-700" />
                            <div class="flex items-center gap-2 text-xs text-zinc-300">
                                <span class="font-extrabold text-base text-yellow-400">{{ rankings?.length || 0 }}</span>
                                <span>rankings salvos</span>
                            </div>
                        </div>
                    </div>

                    <div class="self-center md:self-start">
                        <UButton
                            @click="signOut({ callbackUrl: '/' })"
                            label="Sair da Conta"
                            size="sm"
                            variant="soft"
                            color="red"
                            icon="i-heroicons-arrow-left-on-rectangle-20-solid"
                            class="rounded-xl"
                        />
                    </div>
                </div>

                <!-- Tabs Content Section -->
                <div class="space-y-6">
                    <UTabs
                        :items="items"
                        :ui="{
                            list: {
                                base: 'flex gap-2 p-1.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 w-full sm:w-auto',
                                marker: { wrapper: 'rounded-xl bg-yellow-500 text-zinc-950 font-bold' }
                            }
                        }"
                    >
                        <template #default="{ item }">
                            <div class="flex items-center gap-2.5 px-3 py-1.5">
                                <UIcon :name="item.icon" class="h-4 w-4" />
                                <span class="font-semibold text-sm">{{ item.label }}</span>
                                <span class="ml-1 text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60 font-mono">
                                    {{ item.count }}
                                </span>
                            </div>
                        </template>

                        <template #item="{ item }">
                            <div class="mt-6">
                                <div v-if="item.key === 'templates'">
                                    <TemplatesList
                                        v-if="templates?.length"
                                        :templates="templates"
                                        action="edit"
                                    />
                                    <div
                                        v-else
                                        class="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-zinc-800/60 bg-zinc-900/30"
                                    >
                                        <UIcon name="i-heroicons-document-plus-20-solid" class="w-12 h-12 text-zinc-600 mb-3" />
                                        <h3 class="text-base font-bold text-zinc-200">Você ainda não criou nenhum template</h3>
                                        <p class="text-xs text-zinc-400 max-w-sm mt-1 mb-4">
                                            Crie um novo tema para a comunidade ranquear seus itens favoritos!
                                        </p>
                                        <UButton
                                            @click="modal = true"
                                            label="Criar Meu Primeiro Template"
                                            color="primary"
                                            size="sm"
                                            class="rounded-xl font-bold"
                                        />
                                    </div>
                                </div>

                                <div v-if="item.key === 'rankings'">
                                    <TemplatesList
                                        v-if="rankings?.length"
                                        :templates="rankings"
                                        action="delete"
                                    />
                                    <div
                                        v-else
                                        class="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-zinc-800/60 bg-zinc-900/30"
                                    >
                                        <UIcon name="i-heroicons-bookmark-slash-20-solid" class="w-12 h-12 text-zinc-600 mb-3" />
                                        <h3 class="text-base font-bold text-zinc-200">Você ainda não salvou nenhum ranking</h3>
                                        <p class="text-xs text-zinc-400 max-w-sm mt-1 mb-4">
                                            Explore os templates na home e salve seus rankings personalizados.
                                        </p>
                                        <UButton
                                            to="/"
                                            label="Explorar Templates"
                                            color="gray"
                                            variant="soft"
                                            size="sm"
                                            class="rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </template>
                    </UTabs>
                </div>

                <!-- Create Template Modal -->
                <UModal v-model="modal" :ui="{ width: 'sm:max-w-xl', rounded: 'rounded-2xl' }">
                    <TemplateForm method="POST" />
                </UModal>
            </main>
        </div>
    </div>
</template>

