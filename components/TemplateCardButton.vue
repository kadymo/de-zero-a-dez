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
            title: "Não foi possível excluir o template.",
            description: "Tente novamente mais tarde.",
            color: "red"
        });

        isDeleting.value = false;
        return;
    }

    isDeleting.value = false;
    toast.add({
        id: "success",
        title: "Template excluído com sucesso!",
        color: "green"
    });
};

const handleClick = (e: Event) => {
    if (action === "delete") {
        e.preventDefault();
        modal.value = true;
    }
};
</script>

<template>
    <UButton
        @click="handleClick"
        :to="action === 'edit' ? `/profile/template/${templateId}` : null"
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
                <UButton
                    @click="deleteRanking"
                    :loading="isDeleting"
                    label="Excluir"
                    size="lg"
                    color="red"
                    class="flex-1"
                    block
                />
            </div>
        </UCard>
    </UModal>
</template>
