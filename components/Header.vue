<script setup lang="ts">
const { status, data, signIn, signOut } = useAuth();
const isAuthenticated = computed(() => status.value === "authenticated");

const router = useRouter();

const accountItems = ref([
    [
        {
            label: "Meu perfil",
            icon: "i-heroicons-user",
            click() {
                router.push("/profile");
            }
        },
        {
            label: "Sair",
            icon: "i-heroicons-arrow-left-on-rectangle",
            click() {
                signOut({ callbackUrl: "/" });
            }
        }
    ]
]);
</script>

<template>
    <header
        :class="{ 'flex-col': isAuthenticated, 'flex-row': !isAuthenticated }"
        class="flex w-full items-center justify-between gap-6 border-b border-zinc-700 px-6 py-6 sm:flex-row sm:px-20"
    >
        <NuxtImg src="/logo.png" quality="100" height="64" class="h-16" preload />

        <UButton
            v-if="!isAuthenticated"
            @click="signIn('google')"
            class="flex justify-center sm:w-auto"
            label="Fazer login"
            size="xl"
            variant="solid"
            color="white"
            icon="i-simple-icons-google"
        />

        <UDropdown
            v-else
            :items="accountItems"
            :popper="{ placement: 'bottom-start' }"
            mode="hover"
            class="w-full sm:w-auto"
        >
            <UButton
                :label="data?.user?.name!"
                variant="solid"
                color="white"
                class="flex w-full justify-center"
            >
                <template #leading>
                    <UAvatar :src="data?.user?.image!" />
                </template>

                <template #item="{ item }">
                    <span class="truncate">{{ item.label }}</span>
                    <UIcon
                        :name="item.icon"
                        class="ms-auto h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500"
                    />
                </template>
            </UButton>
        </UDropdown>
    </header>
</template>
