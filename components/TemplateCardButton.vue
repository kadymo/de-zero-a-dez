<script setup lang="ts">
const { action, templateId } = defineProps<{
    action: "edit" | "delete";
    templateId: string;
}>();

const toast = useToast();

const modal = ref(false);
const isDeleting = ref(false);

const deleteRanking = async () => {
    isDeleting.value = true;

    const { error } = await useFetch(`/api/user/rankings/${templateId}`, {
        method: "DELETE"
    });

    if (error.value) {
        toast.add({
            id: "error",
            title: "Não foi possível excluir o ranking.",
            description: "Tente novamente mais tarde.",
            color: "red"
        });

        isDeleting.value = false;
        return;
    }

    isDeleting.value = false;
    modal.value = false;
    refreshNuxtData();
    toast.add({
        id: "success",
        title: "Ranking excluído com sucesso!",
        color: "green"
    });
};

const handleClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    modal.value = true;
};
</script>

<template>
    <div v-if="action === 'delete'">
        <UButton
            @click="handleClick"
            icon="i-heroicons-trash-20-solid"
            variant="ghost"
            size="sm"
            color="red"
            class="absolute right-3 top-3 z-20 rounded-xl backdrop-blur-md bg-zinc-900/80 border border-zinc-700/60 hover:bg-zinc-800 hover:scale-105 transition-all duration-200 shadow-lg"
        />

        <UModal v-model="modal">
            <UCard class="bg-zinc-900 border-zinc-800">
                <template #header>
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                            <UIcon name="i-heroicons-exclamation-triangle-20-solid" class="w-6 h-6" />
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-zinc-100">Excluir ranking</h3>
                            <p class="text-xs text-zinc-400">Esta ação não pode ser desfeita.</p>
                        </div>
                    </div>
                </template>

                <p class="text-zinc-300 text-sm mb-4">
                    Tem certeza que deseja excluir este ranking da sua lista de salvos?
                </p>

                <div class="flex gap-3 justify-end">
                    <UButton @click="modal = false" label="Cancelar" variant="soft" color="gray" size="md" />
                    <UButton
                        @click="deleteRanking"
                        :loading="isDeleting"
                        label="Excluir Ranking"
                        size="md"
                        color="red"
                    />
                </div>
            </UCard>
        </UModal>
    </div>
</template>


