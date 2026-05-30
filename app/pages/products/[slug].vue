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
            <div
              class="relative overflow-hidden rounded-2xl aspect-square cursor-pointer"
              :style="thumbBgStyle"
              @click="openPreview(currentImageIdx)"
            >
              <template v-if="isVideoUrl(currentImage)">
                <div
                  v-if="!productVideoReady[currentImageIdx]"
                  class="absolute inset-0 flex items-center justify-center bg-gray-100 z-[1]"
                >
                  <img
                    v-if="productPoster"
                    :src="productPoster"
                    class="w-full h-full object-contain"
                  />
                  <div v-else class="text-center">
                    <svg class="w-10 h-10 text-gray-300 animate-pulse mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    <p class="text-xs text-gray-400 mt-2">视频加载中...</p>
                  </div>
                </div>
                <video
                  :key="currentImage"
                  :src="currentImage"
                  class="w-full h-full object-contain"
                  autoplay
                  muted
                  loop
                  playsinline
                  preload="auto"
                  @playing="productVideoReady[currentImageIdx] = true"
                />
              </template>
              <img
                v-else
                :src="currentImage"
                :alt="product.name"
                class="w-full h-full object-contain"
              />
              <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div class="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                  </svg>
                </div>
              </div>
            </div>
            <div v-if="images.length > 1" class="mt-4 flex gap-3">
              <button
                v-for="(media, idx) in images"
                :key="idx"
                class="w-20 h-20 rounded-lg overflow-hidden border-2 transition-all"
                :class="currentImageIdx === idx ? 'border-accent' : 'border-transparent'"
                :style="thumbBgStyle"
                @click="currentImageIdx = idx"
              >
                <div v-if="isVideoUrl(media)" class="w-full h-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <img v-else :src="media" class="w-full h-full object-contain" />
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

    <!-- Lightbox preview -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showPreview"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
          @click.self="showPreview = false"
          @keydown.esc="showPreview = false"
          @keydown.left="previewPrev"
          @keydown.right="previewNext"
          tabindex="0"
          ref="previewOverlay"
        >
          <button
            type="button"
            @click="showPreview = false"
            class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white text-3xl z-10"
          >&times;</button>
          <!-- Prev -->
          <button
            v-if="images.length > 1"
            type="button"
            @click="previewPrev"
            class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl z-10"
          >&lsaquo;</button>
          <!-- Next -->
          <button
            v-if="images.length > 1"
            type="button"
            @click="previewNext"
            class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl z-10"
          >&rsaquo;</button>
          <!-- Content -->
          <video
            v-if="isVideoUrl(previewSrc)"
            :key="previewSrc"
            :src="previewSrc"
            class="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            autoplay
            controls
            playsinline
            @click.stop
          />
          <img
            v-else
            :src="previewSrc"
            class="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            @click.stop
          />
          <!-- Counter -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {{ previewIdx + 1 }} / {{ images.length }}
          </div>
        </div>
      </Transition>
    </Teleport>
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

const thumbBgRef = await useProductThumbBg()
const thumbBgStyle = computed(() => {
  const bg = thumbBgRef.value
  const r = parseInt(bg.color.slice(1, 3), 16)
  const g = parseInt(bg.color.slice(3, 5), 16)
  const b = parseInt(bg.color.slice(5, 7), 16)
  return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${bg.opacity / 100})` }
})

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
const productVideoReady = reactive<Record<number, boolean>>({})
const productPoster = computed(() => {
  const imgs: string[] = images.value
  return imgs.find((url: string) => !isVideoUrl(url)) || ''
})

const showPreview = ref(false)
const previewIdx = ref(0)
const previewSrc = computed(() => images.value[previewIdx.value] || '')
const previewOverlay = ref<HTMLElement>()

function openPreview(idx: number) {
  previewIdx.value = idx
  showPreview.value = true
  nextTick(() => previewOverlay.value?.focus())
}
function previewPrev() {
  const len = images.value.length
  previewIdx.value = (previewIdx.value - 1 + len) % len
}
function previewNext() {
  const len = images.value.length
  previewIdx.value = (previewIdx.value + 1) % len
}

watch(showPreview, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

const brandRef = await useBrandName()
const siteName = computed(() => brandRef.value.primary + brandRef.value.accent)

useHead({
  title: computed(() => product.value ? `${product.value.name} - ${siteName.value}` : `产品详情 - ${siteName.value}`),
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
