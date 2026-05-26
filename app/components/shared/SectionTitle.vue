<template>
  <div class="text-center mb-12">
    <h2 class="text-3xl md:text-4xl font-light tracking-tight text-primary">{{ title }}</h2>
    <p v-if="subtitle" class="mt-3 text-secondary text-sm md:text-base">{{ subtitle }}</p>
    <div class="mt-4 w-12 h-px bg-accent mx-auto"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>
