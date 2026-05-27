<template>
  <div v-if="product">
    <section class="pt-28 pb-16 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <!-- Breadcrumb -->
        <nav class="text-sm text-secondary mb-8">
          <NuxtLink to="/" class="hover:text-primary">首页</NuxtLink>
          <span class="mx-2">/</span>
          <NuxtLink to="/products" class="hover:text-primary">产品中心</NuxtLink>
          <span class="mx-2">/</span>
          <span class="text-primary">{{ product.name }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <!-- Images -->
          <div>
            <div class="overflow-hidden rounded-2xl bg-surface aspect-square">
              <video
                v-if="isVideoUrl(currentImage)"
                :key="currentImage"
                :src="currentImage"
                class="w-full h-full object-cover"
                autoplay
                muted
                loop
                playsinline
              />
              <img
                v-else
                :src="currentImage"
                :alt="product.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div v-if="images.length > 1" class="mt-4 flex gap-3">
              <button
                v-for="(media, idx) in images"
                :key="idx"
                class="w-20 h-20 rounded-lg overflow-hidden border-2 transition-all"
                :class="currentImageIdx === idx ? 'border-accent' : 'border-transparent'"
                @click="currentImageIdx = idx"
              >
                <div v-if="isVideoUrl(media)" class="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <img v-else :src="media" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Info -->
          <div>
            <p class="text-accent text-sm tracking-widest uppercase">{{ product.category }}<span v-if="product.sub_category"> · {{ product.sub_category }}</span></p>
            <h1 class="mt-2 text-3xl md:text-4xl font-light tracking-tight text-primary">
              {{ product.name }}
            </h1>
            <p v-if="showPrice" class="mt-4 text-2xl text-primary font-light">
              &yen;{{ Number(product.price).toLocaleString() }}
            </p>

            <div class="mt-8 prose-content" v-html="product.description" />

            <!-- Specs -->
            <div v-if="specs && Object.keys(specs).length" class="mt-10">
              <h3 class="text-sm font-medium text-primary tracking-wide mb-4">产品参数</h3>
              <div class="border-t border-gray-100">
                <div
                  v-for="(value, key) in specs"
                  :key="key"
                  class="flex justify-between py-3 border-b border-gray-100 text-sm"
                >
                  <span class="text-secondary">{{ key }}</span>
                  <span class="text-primary">{{ value }}</span>
                </div>
              </div>
            </div>

            <NuxtLink
              to="/contact"
              class="mt-10 inline-flex items-center gap-2 px-10 py-4 bg-primary text-white text-sm tracking-wider hover:bg-primary/90 transition-all duration-300"
            >
              咨询购买
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data } = await useFetch('/api/products', {
  query: { slug: route.params.slug },
})

const product = computed(() => data.value as any)

const showPriceRef = await useShowPrice()
const showPrice = computed(() => showPriceRef.value)

const images = computed(() => {
  try {
    return JSON.parse(product.value?.images_json || '[]')
  } catch {
    return []
  }
})

const specs = computed(() => {
  try {
    return JSON.parse(product.value?.specs_json || '{}')
  } catch {
    return {}
  }
})

const currentImageIdx = ref(0)
const currentImage = computed(() => images.value[currentImageIdx.value] || 'https://via.placeholder.com/800')

const brandRef = await useBrandName()
const siteName = computed(() => brandRef.value.primary + brandRef.value.accent)

useHead({
  title: computed(() => product.value ? `${product.value.name} - ${siteName.value}` : `产品详情 - ${siteName.value}`),
})
</script>
