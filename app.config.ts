export default defineAppConfig({
    ui: {
        primary: "yellow",
        gray: "zinc",

        input: {
            rounded: "rounded-lg"
        },

        button: {
            rounded: "rounded-lg",
            color: {
                red: {
                    solid: "bg-red-800 hover:bg-red-900"
                }
            },
        },

        modal: {
            rounded: "rounded-2xl"
        },

        tabs: {
            list: {
                rounded: "rounded-xl",
                marker: {
                    rounded: "rounded-xl"
                }
            }
        }
    }
});
