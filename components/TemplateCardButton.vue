<script setup lang="ts">
const { action, templateId } = defineProps<{
    action: "edit" | "delete";
    templateId: string;
}>();

const toast = useToast();

const modal = ref(false);

const deleteRanking = async () => {
    const { error } = await useFetch(`/api/user/rankings/${templateId}`, {
        method: "DELETE"
    });

    if (error) {
        toast.add({
            id: "error",
            title: "Não foi possível excluir o template.",
            description: "Tente novamente mais tarde.",
            color: "red"
        });

        return;
    }

    toast.add({
        id: "success",
        title: "Template excluído com sucesso!",
        color: "green"
    });
};
</script>

<template>
    <UButton
        @click.stop="action === 'delete' ? (modal = true) : null"
        :to="action === 'edit' ? '/profile/template/8598d935-1f2f-4c89-bd03-f0841863e7db' : null"
        :icon="action === 'edit' ? 'i-heroicons-pencil' : 'i-heroicons-trash'"
        variant="solid"
        size="md"
        color="white"
        class="absolute right-0 top-0 rounded-none rounded-bl-xl"
    />

    <UModal v-model="modal">
        <UCard>
            <template #header>
                <p>Tem certeza que deseja excluir este ranking?</p>
            </template>

            <div class="flex gap-2">
                <UButton @click="modal = false" label="Voltar" size="lg" />
                <UButton type="submit" label="Excluir" size="lg" color="red" class="flex-1" block />
            </div>
        </UCard>
    </UModal>
</template>
