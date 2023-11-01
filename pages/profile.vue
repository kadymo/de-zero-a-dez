<script setup lang="ts">
const { data, signOut } = useAuth();

definePageMeta({
    middleware: "auth"
});

const router = useRouter();

const items = [
    { key: "templates", label: "Meus templates", icon: "i-heroicons-clipboard" },
    { key: "rankings", label: "Meus rankings", icon: "i-heroicons-list-bullet" }
];

const templates = await useFetch("/api/user/templates", {
    watch: [router.currentRoute]
});

const rankings = await useFetch("/api/user/rankings");

// const user = {
//     name: "Kádymo Santana",
//     email: "santanakadymo@gmail.com",
//     image: "https://lh3.googleusercontent.com/a/ACg8ocJ8pGWDYMaFcwg39gRa0tNkdOqZCOAp-mqk95hhemaMaI0=s96-c"
// };

// const templates = [
//     {
//         name: "Rações",
//         description: "Ranqueie as rações de zero a dez.",
//         cover: "https://cdn.awsli.com.br/600x450/203/203612/produto/7272131/695db023d4.jpg"
//     },
//     {
//         name: "Personagens de The Office",
//         description: "Ranqueie os personagens de The Office de zero a dez.",
//         cover: "https://s2-techtudo.glbimg.com/7K-SuDghukKZOsJQadz-thEshyA=/0x0:1200x700/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_08fbf48bc0524877943fe86e43087e7a/internal_photos/bs/2023/X/s/DtXUAyRLCB6hx8Xy5TRg/the-office-2.jpg"
//     },
//     {
//         name: "Linguagens de programação",
//         description: "Ranqueie as linguagens de programação de zero a dez.",
//         cover: "https://miro.medium.com/v2/resize:fit:1024/1*jkOCjQlkGZjbhWdvh7LfRA.png"
//     },
//     {
//         name: "Rações",
//         description: "Ranqueie as rações de zero a dez.",
//         cover: "https://cdn.awsli.com.br/600x450/203/203612/produto/7272131/695db023d4.jpg"
//     },
//     {
//         name: "Personagens de The Office",
//         description: "Ranqueie os personagens de The Office de zero a dez.",
//         cover: "https://s2-techtudo.glbimg.com/7K-SuDghukKZOsJQadz-thEshyA=/0x0:1200x700/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_08fbf48bc0524877943fe86e43087e7a/internal_photos/bs/2023/X/s/DtXUAyRLCB6hx8Xy5TRg/the-office-2.jpg"
//     },
//     {
//         name: "Linguagens de programação",
//         description: "Ranqueie as linguagens de programação de zero a dez.",
//         cover: "https://miro.medium.com/v2/resize:fit:1024/1*jkOCjQlkGZjbhWdvh7LfRA.png"
//     }
// ];

// const rankings = [
//     {
//         name: "Personagens de The Office",
//         description: "Ranqueie os personagens de The Office de zero a dez.",
//         cover: "https://s2-techtudo.glbimg.com/7K-SuDghukKZOsJQadz-thEshyA=/0x0:1200x700/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_08fbf48bc0524877943fe86e43087e7a/internal_photos/bs/2023/X/s/DtXUAyRLCB6hx8Xy5TRg/the-office-2.jpg"
//     },

//     {
//         name: "Linguagens de programação",
//         description: "Ranqueie as linguagens de programação de zero a dez.",
//         cover: "https://miro.medium.com/v2/resize:fit:1024/1*jkOCjQlkGZjbhWdvh7LfRA.png"
//     }
// ];
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
                        v-if="item.key === 'templates' && templates.length"
                        :templates="templates"
                        action="edit"
                        class="mt-10"
                    />

                    <p
                        v-if="item.key === 'templates' && !templates.length"
                        class="mt-10 text-center text-xl text-gray-500"
                    >
                        Você ainda não criou nenhum template.
                    </p>

                    <TemplatesList
                        v-if="item.key === 'rankings' && rankings.length"
                        :templates="rankings"
                        action="delete"
                        class="mt-10"
                    />

                    <p
                        v-if="item.key === 'rankings' && !rankings.length"
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
