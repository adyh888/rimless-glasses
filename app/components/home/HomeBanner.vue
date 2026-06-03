<template>
  <section ref="carouselRef" class="relative h-screen overflow-hidden" style="touch-action: pan-y;">
    <Transition name="banner-fade" mode="out-in">
      <div :key="currentBanner" class="absolute inset-0">
        <template v-if="isVideoUrl(banners[currentBanner]?.image_url)">
          <div
            v-if="banners[currentBanner]?.video_poster && !videoReady[currentBanner]"
            class="absolute inset-0 bg-cover bg-center z-[1]"
            :style="{ backgroundImage: `url(${banners[currentBanner].video_poster})` }"
          />
          <video
            :key="'video-' + currentBanner"
            :src="banners[currentBanner]?.image_url"
            :poster="banners[currentBanner]?.video_poster || undefined"
            class="absolute inset-0 w-full h-full object-cover"
            autoplay
            muted
            loop
            playsinline
            :preload="currentBanner === 0 ? 'auto' : (preloaded.has(currentBanner) ? 'auto' : 'metadata')"
            @playing="videoReady[currentBanner] = true"
          />
        </template>
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
        <Transition name="banner-slide-up" mode="out-in">
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
</template>

<script setup lang="ts">
const { data: bannerData } = await useFetch('/api/banners', { query: { active_only: 'true' }, lazy: true })
const banners = computed(() => (bannerData.value as any[]) || [])

const bannerIntervalRef = useBannerInterval()
const bannerIntervalMs = computed(() => bannerIntervalRef.value * 1000)

const currentBanner = ref(0)
const carouselRef = ref<HTMLElement>()
const preloaded = reactive(new Set<number>())
const videoReady = reactive<Record<number, boolean>>({})
let bannerTimer: ReturnType<typeof setInterval>

function preloadBannerResources() {
  if (banners.value.length <= 1) return
  let idx = 1
  function preloadNext() {
    if (idx >= banners.value.length) return
    const banner = banners.value[idx]
    const url = banner?.image_url
    if (!url) { idx++; scheduleNext(); return }
    if (isVideoUrl(url)) {
      const video = document.createElement('video')
      video.preload = 'auto'
      video.src = url
      video.oncanplaythrough = () => { preloaded.add(idx); idx++; scheduleNext() }
      video.onerror = () => { idx++; scheduleNext() }
    } else {
      const img = new Image()
      img.src = url
      img.onload = () => { preloaded.add(idx); idx++; scheduleNext() }
      img.onerror = () => { idx++; scheduleNext() }
    }
  }
  function scheduleNext() {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => preloadNext(), { timeout: 3000 })
    } else {
      setTimeout(preloadNext, 200)
    }
  }
  scheduleNext()
}

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
  preloadBannerResources()
})
onUnmounted(() => clearInterval(bannerTimer))
</script>

<style scoped>
.banner-fade-enter-active,
.banner-fade-leave-active {
  transition: opacity 1s ease;
}
.banner-fade-enter-from,
.banner-fade-leave-to {
  opacity: 0;
}
.banner-slide-up-enter-active,
.banner-slide-up-leave-active {
  transition: all 0.6s ease;
}
.banner-slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.banner-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
