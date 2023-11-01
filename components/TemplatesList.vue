<script setup lang="ts">
import type { Template } from "@prisma/client";

defineProps<{
    templates: Template[];
    action?: "edit" | "delete";
}>();
</script>

<template>
    <ul class="grid min-h-full gap-6 sm:gap-10 md:grid-cols-2 xl:grid-cols-3">
        <li v-for="template in templates">
            <NuxtLink
                :to="template.id ? `/ranking/${template.id}` : ''"
                class="relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-700 shadow-sm hover:border-yellow-500"
            >
                <TemplateCardButton v-if="action" :action="action" :templateId="template.id" />

                <NuxtImg
                    :src="template.cover"
                    :alt="template.name"
                    quality="80"
                    class="aspect-video h-48 object-cover"
                />

                <div class="flex-1 p-3">
                    <h3 class="mb-1 text-lg font-semibold leading-tight">
                        {{ template.name }}
                    </h3>
                    <p class="text-sm text-gray-300">{{ template.description }}</p>
                </div>
            </NuxtLink>
        </li>
    </ul>
</template>
