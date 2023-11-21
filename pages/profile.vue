<script setup lang="ts">
const { data, signOut } = useAuth();

definePageMeta({
    middleware: "auth"
});

const router = useRouter();
const toast = useToast();

const items = [
    { key: "templates", label: "Meus templates", icon: "i-heroicons-clipboard" },
    { key: "rankings", label: "Meus rankings", icon: "i-heroicons-list-bullet" }
];

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
</script>

<template>
    <div class="content min-h-screen w-screen space-y-4 bg-zinc-900 p-6 sm:p-20">
        <UButton
            to="/"
            label="Voltar para a home"
            variant="solid"
            size="lg"
            color="white"
            icon="i-heroicons-arrow-left"
        />

        <div
            class="flex flex-col items-center gap-8 rounded-2xl border border-zinc-700 p-6 md:flex-row md:p-10"
        >
            <NuxtImg
                :src="data.user?.image!"
                alt="Foto de perfil"
                quality="80"
                class="w-28 rounded-full md:w-44"
            />

            <div class="text-center md:text-start">
                <h1 class="text-3xl font-bold md:mb-2 md:text-5xl">{{ data.user?.name }}</h1>

                <p class="mb-4 text-base md:text-xl">{{ data.user?.email }}</p>

                <UButton
                    @click="signOut({ callbackUrl: '/' })"
                    label="Sair"
                    size="lg"
                    variant="soft"
                    color="red"
                    icon="i-heroicons-arrow-left-on-rectangle"
                />
            </div>
        </div>

        <main>
            <UTabs :items="items">
                <template #default="{ item }">
                    <div class="flex items-center gap-2">
                        <UIcon :name="item.icon" class="h-5 w-5 flex-shrink-0" />
                        <span class="truncate text-lg">{{ item.label }}</span>
                    </div>
                </template>

                <template #item="{ item }">
                    <TemplatesList
                        v-if="item.key === 'templates' && templates?.length"
                        :templates="templates"
                        action="edit"
                        class="mt-10"
                    />

                    <p
                        v-if="item.key === 'templates' && !templates?.length"
                        class="mt-10 text-center text-xl text-gray-500"
                    >
                        Você ainda não criou nenhum template.
                    </p>

                    <TemplatesList
                        v-if="item.key === 'rankings' && rankings?.length"
                        :templates="rankings"
                        action="delete"
                        class="mt-10"
                    />

                    <p
                        v-if="item.key === 'rankings' && !rankings?.length"
                        class="mt-10 text-center text-xl text-gray-500"
                    >
                        Você ainda não salvou nenhum ranking.
                    </p>
                </template>
            </UTabs>
        </main>
        <NuxtPage />
    </div>
</template>
