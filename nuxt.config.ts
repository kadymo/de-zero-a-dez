// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
            htmlAttrs: { lang: "pt-BR" },
            title: "De Zero a Dez",
            meta: [
                {
                    property: "og:title",
                    content: "De Zero a Dez"
                },
                {
                    name: "description",
                    property: "og:description",
                    content: "Site inspirado no programa De Zero a Dez e no site Tier Maker."
                },
                {
                    name: "keywords",
                    content: "Tier Maker, De Zero a Dez"
                },
                {
                    name: "twitter:title",
                    content: "De Zero a dez"
                },
                {
                    name: "twitter:description",
                    content: "Site inspirado no programa De Zero a Dez e no site Tier Maker."
                }
            ]
        }
    },

    devtools: { enabled: true },
    modules: [
        "@nuxt/ui",
        "@nuxt/image",
        "@nuxtjs/google-fonts",
        "@vueuse/nuxt",
        "@sidebase/nuxt-auth"
    ],

    ui: {
        icons: ["simple-icons"]
    },

    googleFonts: {
        prefetch: true,
        preconnect: true,
        preload: true,
        families: {
            "Poppins": [400, 500, 600, 700, 800, 900]
        },

    }
});
