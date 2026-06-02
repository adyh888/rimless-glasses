<template>
  <view class="home-banner" v-if="banners.length">
    <swiper
      class="swiper"
      :current="currentBanner"
      :interval="intervalMs"
      :autoplay="banners.length > 1"
      circular
      @change="onChange"
    >
      <swiper-item v-for="(b, idx) in banners" :key="idx">
        <view class="slide">
          <template v-if="isVideoUrl(b.image_url)">
            <video
              class="bg-media"
              :src="b.image_url"
              :poster="b.video_poster || ''"
              autoplay
              muted
              loop
              :controls="false"
              :show-center-play-btn="false"
              object-fit="cover"
            />
          </template>
          <image v-else class="bg-media" :src="b.image_url" mode="aspectFill" />
          <view class="overlay" />
          <view class="content">
            <view class="content-inner">
              <text class="title">{{ b.title }}</text>
              <text v-if="b.subtitle" class="subtitle">{{ b.subtitle }}</text>
              <view v-if="b.button_text || b.button_link" class="cta" @tap="goButton(b)">
                <text class="cta-text">{{ b.button_text || '了解更多' }}</text>
                <text class="cta-arrow">→</text>
              </view>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <view v-if="banners.length > 1" class="dots">
      <view
        v-for="(_, i) in banners"
        :key="i"
        class="dot"
        :class="{ active: i === currentBanner }"
        @tap="currentBanner = i"
      />
    </view>
  </view>
</template>

<script>
import { cloud } from '@/utils/cloud.js'
import { getBannerInterval, isVideoUrl, navigateToPath } from '@/utils/site-settings.js'

export default {
  data () {
    return {
      banners: [],
      currentBanner: 0,
      intervalMs: 5000,
    }
  },
  async created () {
    try {
      const [data, interval] = await Promise.all([
        cloud.banners.list({ active_only: 'true' }).catch(() => ({ items: [] })),
        getBannerInterval(),
      ])
      this.banners = Array.isArray(data) ? data : (data?.items || [])
      this.intervalMs = interval
    } catch (e) {}
  },
  methods: {
    isVideoUrl,
    onChange (e) { this.currentBanner = e.detail.current },
    goButton (b) {
      navigateToPath(b.button_link || '/products')
    },
  },
}
</script>

<style>
.home-banner { position: relative; width: 100%; height: 100vh; overflow: hidden; }
.swiper { width: 100%; height: 100%; }
.slide { position: relative; width: 100%; height: 100%; }
.bg-media { position: absolute; inset: 0; width: 100%; height: 100%; }
.overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(255,255,255,0.8), rgba(255,255,255,0.5), transparent); }
.content { position: relative; z-index: 2; height: 100%; display: flex; align-items: center; }
.content-inner { max-width: 1280px; margin: 0 auto; width: 100%; padding: 0 24px; display: flex; flex-direction: column; align-items: flex-start; gap: 24px; }
.title { font-size: 56px; font-weight: 300; letter-spacing: -1px; line-height: 1.15; color: #1f2937; max-width: 600px; }
.subtitle { font-size: 18px; color: #6b7280; font-weight: 300; line-height: 1.7; max-width: 600px; }
.cta { background: #1f2937; padding: 14px 32px; display: inline-flex; align-items: center; gap: 8px; }
.cta-text { color: #fff; font-size: 13px; letter-spacing: 1.5px; }
.cta-arrow { color: #fff; font-size: 14px; }
.dots { position: absolute; bottom: 48px; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; gap: 12px; }
.dot { width: 32px; height: 2px; background: rgba(31,41,55,0.3); transition: all 0.5s; }
.dot.active { background: #1f2937; width: 48px; }

@media (max-width: 768px) {
  .title { font-size: 36px; }
  .subtitle { font-size: 14px; }
}
</style>
