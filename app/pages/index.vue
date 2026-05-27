<template>
  <div>
    <!-- Hero Banner -->
    <section ref="carouselRef" class="relative h-screen overflow-hidden" style="touch-action: pan-y;">
      <Transition name="fade" mode="out-in">
        <div :key="currentBanner" class="absolute inset-0">
          <video
            v-if="isVideoUrl(banners[currentBanner]?.image_url)"
            :key="'video-' + currentBanner"
            :src="banners[currentBanner]?.image_url"
            class="absolute inset-0 w-full h-full object-cover"
            autoplay
            muted
            loop
            playsinline
          />
          <div
            v-else
            class="absolute inset-0 bg-cover bg-center"
            :style="{ backgroundImage: `url(${banners[currentBanner]?.image_url})` }"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-white/80 via-white/50 to-transparent" />
        </div>
      </Transition>

      <div class="relative z-10 h-full flex items-center">
        <div class="max-w-7xl mx-auto px-6 w-full">
          <Transition name="slide-up" mode="out-in">
            <div :key="currentBanner" class="max-w-xl">
              <h1 class="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-tight text-primary">
                {{ banners[currentBanner]?.title }}
              </h1>
              <p class="mt-6 text-lg md:text-xl text-secondary font-light leading-relaxed">
                {{ banners[currentBanner]?.subtitle }}
              </p>
              <NuxtLink
                :to="banners[currentBanner]?.button_link || '/products'"
                class="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-primary text-white text-sm tracking-wider hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02]"
              >
                {{ banners[currentBanner]?.button_text || '了解更多' }}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </NuxtLink>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Arrow Navigation -->
      <template v-if="banners.length > 1">
        <button
          @click="goPrev"
          class="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/15 text-white/70 hover:bg-black/30 hover:text-white backdrop-blur-sm transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          @click="goNext"
          class="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/15 text-white/70 hover:bg-black/30 hover:text-white backdrop-blur-sm transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </template>

      <!-- Indicators -->
      <div v-if="banners.length > 1" class="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        <button
          v-for="(_, idx) in banners"
          :key="idx"
          class="w-8 h-0.5 transition-all duration-500"
          :class="idx === currentBanner ? 'bg-primary w-12' : 'bg-primary/30'"
          @click="goTo(idx)"
        />
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-24 md:py-32 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <SectionTitle title="甄选系列" subtitle="每一副，都是对极简美学的致敬" />
        </ScrollReveal>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ScrollReveal
            v-for="(product, idx) in featuredProducts"
            :key="product.id"
            :delay="idx * 100"
          >
            <ProductCard :product="product" />
          </ScrollReveal>
        </div>

        <ScrollReveal :delay="400" class="text-center mt-12">
          <NuxtLink
            to="/products"
            class="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary link-underline transition-colors"
          >
            查看全部产品
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </ScrollReveal>
      </div>
    </section>

    <!-- Brand Story Teaser -->
    <section class="py-24 md:py-32 bg-surface">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <div class="relative overflow-hidden rounded-2xl aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80"
                alt="品牌故事"
                class="w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal :delay="200">
            <p class="text-accent text-sm tracking-widest uppercase mb-4">BRAND STORY</p>
            <h2 class="text-3xl md:text-4xl font-light tracking-tight text-primary leading-snug">
              让框架消失<br />让世界更清晰
            </h2>
            <p class="mt-6 text-secondary leading-relaxed">
              {{ siteName }}创立于2018年，专注于无框眼镜的设计与制造。我们相信，好的设计应该是无形的。
              每一副{{ siteName }}眼镜都经过48道手工工序精心打磨，从选材到成品，对每一个环节都保持着近乎苛刻的品质要求。
            </p>
            <NuxtLink
              to="/about"
              class="mt-8 inline-flex items-center gap-2 text-sm text-primary hover:text-accent link-underline transition-colors"
            >
              了解品牌故事
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </ScrollReveal>
        </div>
      </div>
    </section>

    <!-- Latest News -->
    <section class="py-24 md:py-32 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <SectionTitle :title="navLabel('/news', '新闻动态')" :subtitle="navSubtitle('/news', `了解${siteName}的最新资讯`)" />
        </ScrollReveal>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal
            v-for="(article, idx) in latestArticles"
            :key="article.id"
            :delay="idx * 100"
          >
            <NuxtLink :to="`/news/${article.slug}`" class="group block">
              <div class="overflow-hidden rounded-xl aspect-[16/10]">
                <img
                  :src="article.cover_image || 'https://via.placeholder.com/600x375'"
                  :alt="article.title"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div class="mt-4">
                <p class="text-xs text-secondary">{{ formatDate(article.created_at) }}</p>
                <h3 class="mt-1 text-base font-medium text-primary group-hover:text-accent transition-colors line-clamp-2">
                  {{ article.title }}
                </h3>
                <p class="mt-2 text-sm text-secondary line-clamp-2">{{ article.summary }}</p>
              </div>
            </NuxtLink>
          </ScrollReveal>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 md:py-32 bg-surface">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <ScrollReveal>
          <h2 class="text-3xl md:text-5xl font-light tracking-tight text-primary">
            探索无框视界
          </h2>
          <p class="mt-4 text-secondary">发现属于你的极简美学</p>
          <NuxtLink
            to="/products"
            class="mt-8 inline-flex items-center gap-2 px-10 py-4 bg-primary text-white text-sm tracking-wider hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02]"
          >
            浏览全部产品
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </NuxtLink>
        </ScrollReveal>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { data: bannerData } = await useFetch('/api/banners', { query: { active_only: 'true' } })
const banners = computed(() => (bannerData.value as any[]) || [])

const { data: intervalData } = await useFetch('/api/content/banner_interval')
const bannerIntervalMs = computed(() => {
  const sec = parseInt((intervalData.value as any)?.content, 10)
  return (sec > 0 ? sec : 5) * 1000
})

const currentBanner = ref(0)
const carouselRef = ref<HTMLElement>()
let bannerTimer: ReturnType<typeof setInterval>

function startTimer() {
  bannerTimer = setInterval(() => {
    if (banners.value.length > 1) {
      currentBanner.value = (currentBanner.value + 1) % banners.value.length
    }
  }, bannerIntervalMs.value)
}

function resetTimer() {
  clearInterval(bannerTimer)
  startTimer()
}

function goNext() {
  if (banners.value.length <= 1) return
  currentBanner.value = (currentBanner.value + 1) % banners.value.length
  resetTimer()
}

function goPrev() {
  if (banners.value.length <= 1) return
  currentBanner.value = (currentBanner.value - 1 + banners.value.length) % banners.value.length
  resetTimer()
}

function goTo(idx: number) {
  currentBanner.value = idx
  resetTimer()
}

useSwipe(carouselRef, {
  onSwipeLeft: goNext,
  onSwipeRight: goPrev,
})

onMounted(() => {
  startTimer()
})

onUnmounted(() => clearInterval(bannerTimer))

const { data: productsData } = await useFetch('/api/products', {
  query: { featured: 'true', active_only: 'true', limit: 4 },
})
const featuredProducts = computed(() => (productsData.value as any)?.items || [])

const { data: articlesData } = await useFetch('/api/articles', {
  query: { published_only: 'true', limit: 3 },
})
const latestArticles = computed(() => (articlesData.value as any)?.items || [])

const brandRef = await useBrandName()
const siteName = computed(() => brandRef.value.primary + brandRef.value.accent)

const navRef = await useNavItems()
function navLabel(path: string, fallback: string) {
  return navRef.value.find(n => n.path === path)?.label || fallback
}
function navSubtitle(path: string, fallback: string) {
  return navRef.value.find(n => n.path === path)?.subtitle || fallback
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.6s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
