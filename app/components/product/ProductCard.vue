<template>
  <NuxtLink :to="`/products/${product.slug}`" class="group block">
    <div class="relative overflow-hidden rounded-xl bg-surface aspect-[4/3]">
      <img
        :src="firstImage"
        :alt="product.name"
        loading="lazy"
        decoding="async"
        class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-500" />
    </div>
    <div class="mt-4 space-y-1">
      <p class="text-xs text-accent tracking-wider uppercase">{{ product.category }}<span v-if="product.sub_category"> · {{ product.sub_category }}</span></p>
      <h3 class="text-base font-medium text-primary group-hover:text-accent transition-colors duration-300">
        {{ product.name }}
      </h3>
      <p v-if="showPrice" class="text-sm text-secondary">&yen;{{ Number(product.price).toLocaleString() }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ product: any }>()

const showPriceRef = await useShowPrice()
const showPrice = computed(() => showPriceRef.value)

const firstImage = computed(() => {
  try {
    const images = JSON.parse(props.product.images_json || '[]')
    return images.find((url: string) => !isVideoUrl(url)) || images[0] || 'https://via.placeholder.com/600x450?text=No+Image'
  } catch {
    return 'https://via.placeholder.com/600x450?text=No+Image'
  }
})
</script>
