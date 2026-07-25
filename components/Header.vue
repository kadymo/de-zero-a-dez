<script setup lang="ts">
const { status, data, signIn, signOut } = useAuth();
const isAuthenticated = computed(() => status.value === "authenticated");

const router = useRouter();

const accountItems = computed(() => [
    [
        {
            label: data.value?.user?.name || "Minha Conta",
            slot: "account",
            disabled: true
        }
    ],
    [
        {
            label: "Meu perfil",
            icon: "i-heroicons-user-circle-20-solid",
            click() {
                router.push("/profile");
            }
        }
    ],
    [
        {
            label: "Sair da conta",
            icon: "i-heroicons-arrow-left-on-rectangle-20-solid",
            click() {
                signOut({ callbackUrl: "/" });
            }
        }
    ]
]);
</script>

<template>
    <header class="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/85 border-b border-zinc-800/70 transition-all">
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-4 px-6 py-4 sm:px-10">
            <NuxtLink to="/" class="group flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]">
                <NuxtImg src="/logo.png" quality="100" height="56" class="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_4px_12px_rgba(234,179,8,0.25)]" preload alt="De Zero a Dez Logo" />
            </NuxtLink>

            <div class="flex items-center gap-3">
                <UButton
                    v-if="!isAuthenticated"
                    @click="signIn('google')"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-md shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all duration-300"
                    size="md"
                    variant="solid"
                    color="white"
                    icon="i-simple-icons-google"
                    label="Entrar com Google"
                />

                <UDropdown
                    v-else
                    :items="accountItems"
                    :popper="{ placement: 'bottom-end' }"
                    class="relative"
                >
                    <UButton
                        variant="ghost"
                        color="gray"
                        class="flex items-center gap-3 py-1.5 px-3 rounded-xl border border-zinc-800/80 bg-zinc-900/80 hover:bg-zinc-800 hover:border-zinc-700 transition-all shadow-sm"
                    >
                        <UAvatar
                            :src="data?.user?.image || undefined"
                            :alt="data?.user?.name || 'User'"
                            size="sm"
                            class="ring-2 ring-yellow-500/30"
                        />
                        <span class="max-w-[130px] sm:max-w-[180px] truncate font-semibold text-sm text-zinc-200">
                            {{ data?.user?.name }}
                        </span>
                        <UIcon name="i-heroicons-chevron-down-20-solid" class="h-4 w-4 text-zinc-400" />
                    </UButton>

                    <template #account="{ item }">
                        <div class="px-3 py-2 text-xs border-b border-zinc-800 text-zinc-400">
                            Conectado como <br>
                            <span class="font-semibold text-zinc-200 text-sm truncate block">
                                {{ item.label }}
                            </span>
                        </div>
                    </template>
                </UDropdown>
            </div>
        </div>
    </header>
</template>

