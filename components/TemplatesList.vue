<script setup lang="ts">
import type { Template } from "@prisma/client";

export interface ExtendedTemplate extends Template {
    user?: {
        name?: string | null;
        image?: string | null;
    };
    _count?: {
        rankings?: number;
    };
}

defineProps<{
    templates: ExtendedTemplate[];
    action?: "edit" | "delete";
}>();

const emit = defineEmits(["edit"]);
</script>

<template>
    <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="template in templates" :key="template.id">
            <div
                class="group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:border-yellow-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/5 hover:-translate-y-0.5"
            >
                <TemplateCardButton v-if="action === 'delete'" :action="action" :templateId="template.id" />

                <!-- Compact Image cover container -->
                <NuxtLink :to="`/ranking/${template.id}`" class="relative h-44 w-full overflow-hidden bg-zinc-950 block">
                    <NuxtImg
                        :src="template.cover"
                        :alt="template.name"
                        quality="75"
                        loading="lazy"
                        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                    
                    <!-- Visibility Badge (Public/Private) -->
                    <div v-if="action === 'edit'" class="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-zinc-950/90 px-2 py-0.5 text-xs font-semibold border border-zinc-800" :class="template.isPublic ? 'text-emerald-400' : 'text-amber-400'">
                        <UIcon :name="template.isPublic ? 'i-heroicons-globe-alt-20-solid' : 'i-heroicons-lock-closed-20-solid'" class="h-3 w-3" />
                        <span>{{ template.isPublic ? 'Público' : 'Privado' }}</span>
                    </div>

                    <!-- Item Count Badge -->
                    <div class="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-md bg-zinc-950/80 px-2 py-0.5 text-xs font-medium text-zinc-300 border border-zinc-800">
                        <UIcon name="i-heroicons-photo-20-solid" class="h-3 w-3 text-yellow-500" />
                        <span>{{ template.items?.length || 0 }} itens</span>
                    </div>

                    <!-- Rankings Count Badge -->
                    <div v-if="template._count?.rankings" class="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-md bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400 border border-yellow-500/30">
                        <UIcon name="i-heroicons-sparkles-20-solid" class="h-3 w-3" />
                        <span>{{ template._count.rankings }} rankings</span>
                    </div>
                </NuxtLink>

                <!-- Compact Content -->
                <div class="flex flex-col justify-between p-4">
                    <NuxtLink :to="`/ranking/${template.id}`">
                        <h3 class="text-base font-bold text-zinc-100 group-hover:text-yellow-400 transition-colors line-clamp-1">
                            {{ template.name }}
                        </h3>
                        <p v-if="template.description" class="mt-1 text-xs text-zinc-400 line-clamp-2 leading-snug">
                            {{ template.description }}
                        </p>
                    </NuxtLink>

                    <div class="mt-3 flex items-center justify-between border-t border-zinc-800/80 pt-2.5 text-xs text-zinc-400">
                        <div class="flex items-center gap-1.5">
                            <UAvatar
                                v-if="template.user?.image"
                                :src="template.user.image"
                                :alt="template.user.name || ''"
                                size="3xs"
                                class="ring-1 ring-zinc-700"
                            />
                            <UIcon v-else name="i-heroicons-user-circle-20-solid" class="h-3.5 w-3.5 text-zinc-500" />
                            <span class="truncate max-w-[110px]">{{ template.user?.name || "Comunidade" }}</span>
                        </div>

                        <div class="flex items-center gap-2">
                            <UButton
                                v-if="action === 'edit'"
                                @click.prevent.stop="emit('edit', template)"
                                label="Editar"
                                variant="ghost"
                                size="xs"
                                icon="i-heroicons-pencil-square-20-solid"
                                class="rounded-lg text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 font-semibold"
                            />
                            <NuxtLink
                                :to="`/ranking/${template.id}`"
                                class="inline-flex items-center gap-1 font-semibold text-yellow-500 hover:text-yellow-400 transition-colors text-xs"
                            >
                                Classificar
                                <UIcon name="i-heroicons-arrow-right-20-solid" class="h-3.5 w-3.5" />
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    </ul>
</template>



