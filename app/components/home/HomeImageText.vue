<template>
  <section class="py-24 md:py-32" :class="bgColor === 'surface' ? 'bg-surface' : 'bg-white'">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <ScrollReveal :class="imagePosition === 'right' ? 'lg:order-last' : ''">
          <div class="relative overflow-hidden rounded-2xl aspect-[4/3]">
            <img
              :src="image || 'https://via.placeholder.com/800x600'"
              :alt="heading"
              loading="lazy"
              decoding="async"
              class="w-full h-full object-cover"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal :delay="200">
          <p v-if="label" class="text-accent text-sm tracking-widest uppercase mb-4">{{ label }}</p>
          <h2 class="text-3xl md:text-4xl font-light tracking-tight text-primary leading-snug" v-html="formattedHeading" />
          <p v-if="description" class="mt-6 text-secondary leading-relaxed">{{ description }}</p>
          <NuxtLink
            v-if="linkUrl"
            :to="linkUrl"
            class="mt-8 inline-flex items-center gap-2 text-sm text-primary hover:text-accent link-underline transition-colors"
          >
            {{ linkText || '了解更多' }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </ScrollReveal>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  heading: string
  description: string
  image: string
  linkText: string
  linkUrl: string
  imagePosition: 'left' | 'right'
  bgColor: 'white' | 'surface'
}>()

const formattedHeading = computed(() => {
  return (props.heading || '').replace(/\n/g, '<br />')
})
</script>
