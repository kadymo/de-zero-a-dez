<script setup lang="ts">
definePageMeta({
    name: "template"
});

const router = useRouter();

const modal = ref(true);
const toggleModal = () => {
    modal.value = !modal.value;
};

provide("modal", { modal, toggleModal });
</script>

<template>
    <UModal @close="router.back()" v-model="modal">
        <TemplateForm method="PUT" />
    </UModal>
</template>
