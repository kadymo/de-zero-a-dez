<template>
    <div class="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-yellow-500 selection:text-zinc-950 relative">
        <!-- Lightweight hardware-accelerated background layer -->
        <div class="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/5 via-zinc-950 to-zinc-950" />
        <div class="relative z-10">
            <NuxtLoadingIndicator color="#EAB308" :height="3" />
            <NuxtPage />
            <UNotifications />
        </div>
    </div>
</template>

<style>
html {
    scroll-behavior: smooth;
    background-color: #09090b;
}

body {
    overflow-x: hidden;
}

.content {
    background-color: transparent;
    background-image: url("/background.svg");
}
</style>


