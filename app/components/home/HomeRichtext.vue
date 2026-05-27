<template>
  <section class="py-24 md:py-32" :class="bgColor === 'surface' ? 'bg-surface' : 'bg-white'">
    <div class="max-w-7xl mx-auto px-6">
      <ScrollReveal>
        <SectionTitle v-if="title" :title="title" />
        <div class="prose-content max-w-4xl mx-auto" v-html="content" />
      </ScrollReveal>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  content: string
  bgColor: 'white' | 'surface'
}>()
</script>
