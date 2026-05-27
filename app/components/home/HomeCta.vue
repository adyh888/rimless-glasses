<template>
  <section class="py-24 md:py-32" :class="bgColor === 'surface' ? 'bg-surface' : 'bg-white'">
    <div class="max-w-7xl mx-auto px-6 text-center">
      <ScrollReveal>
        <h2 class="text-3xl md:text-5xl font-light tracking-tight text-primary">
          {{ heading }}
        </h2>
        <p v-if="subtitle" class="mt-4 text-secondary">{{ subtitle }}</p>
        <NuxtLink
          v-if="linkUrl"
          :to="linkUrl"
          class="mt-8 inline-flex items-center gap-2 px-10 py-4 bg-primary text-white text-sm tracking-wider hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02]"
        >
          {{ linkText || '了解更多' }}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
      </ScrollReveal>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  heading: string
  subtitle: string
  linkText: string
  linkUrl: string
  bgColor: 'white' | 'surface'
}>()
</script>
