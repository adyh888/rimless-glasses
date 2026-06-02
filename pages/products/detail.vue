<template>
  <site-layout>
    <view v-if="product" class="detail">
      <view class="detail-inner">
        <view class="breadcrumb">
          <text class="crumb" @tap="goHome">首页</text>
          <text class="sep">/</text>
          <text class="crumb" @tap="goList">产品中心</text>
          <text class="sep">/</text>
          <text class="crumb current">{{ product.name }}</text>
        </view>

        <view class="grid">
          <view class="media-col">
            <view class="main-media" :style="thumbStyle" @tap="openPreview(currentImageIdx)">
              <template v-if="isVideoUrl(currentImage)">
                <video
                  class="media"
                  :src="currentImage"
                  :poster="productPoster || ''"
                  autoplay
                  muted
                  loop
                  :controls="false"
                  object-fit="contain"
                />
              </template>
              <image v-else class="media" :src="currentImage" mode="aspectFit" />
            </view>
            <view v-if="images.length > 1" class="thumbs">
              <view
                v-for="(media, idx) in images"
                :key="idx"
                class="thumb"
                :class="{ active: currentImageIdx === idx }"
                :style="thumbStyle"
                @tap="currentImageIdx = idx"
              >
                <view v-if="isVideoUrl(media)" class="thumb-video">▶</view>
                <image v-else class="thumb-img" :src="media" mode="aspectFit" />
              </view>
            </view>
          </view>

          <view class="info-col">
            <text class="cat">
              {{ product.category }}<text v-if="product.sub_category"> · {{ product.sub_category }}</text>
            </text>
            <text class="name">{{ product.name }}</text>
            <text v-if="showPrice" class="price">¥{{ formattedPrice }}</text>

            <view class="description">
              <rich-text :nodes="product.description || ''" />
            </view>

            <view v-if="specKeys.length" class="specs">
              <text class="specs-title">产品参数</text>
              <view class="specs-list">
                <view v-for="k in specKeys" :key="k" class="spec-row">
                  <text class="spec-key">{{ k }}</text>
                  <text class="spec-val">{{ specs[k] }}</text>
                </view>
              </view>
            </view>

            <view class="cta" @tap="goContact">
              <text class="cta-text">咨询购买</text>
              <text class="cta-arrow">→</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-else-if="loaded" class="empty">产品不存在</view>

    <!-- Lightbox preview -->
    <view v-if="showPreview" class="lightbox" @tap="showPreview = false">
      <text class="lb-close" @tap.stop="showPreview = false">×</text>
      <template v-if="images.length > 1">
        <text class="lb-prev" @tap.stop="previewPrev">‹</text>
        <text class="lb-next" @tap.stop="previewNext">›</text>
      </template>
      <video
        v-if="isVideoUrl(previewSrc)"
        class="lb-media"
        :src="previewSrc"
        autoplay
        controls
        @tap.stop
      />
      <image
        v-else
        class="lb-media"
        :src="previewSrc"
        mode="aspectFit"
        @tap.stop
      />
      <text class="lb-counter">{{ previewIdx + 1 }} / {{ images.length }}</text>
    </view>
  </site-layout>
</template>

<script>
import SiteLayout from '@/components/site-layout/site-layout.vue'
import { cloud } from '@/utils/cloud.js'
import { getShowPrice, getProductThumbBg, getBrandName, isVideoUrl, thumbBgStyle } from '@/utils/site-settings.js'

export default {
  components: { SiteLayout },
  data () {
    return {
      product: null,
      loaded: false,
      showPrice: true,
      thumbBg: { color: '#ffffff', opacity: 100 },
      currentImageIdx: 0,
      showPreview: false,
      previewIdx: 0,
      brand: { primary: '清透', accent: '视界' },
    }
  },
  computed: {
    thumbStyle () { return thumbBgStyle(this.thumbBg) },
    images () {
      try { return JSON.parse(this.product?.images_json || '[]') } catch (e) { return [] }
    },
    specs () {
      try { return JSON.parse(this.product?.specs_json || '{}') } catch (e) { return {} }
    },
    specKeys () { return Object.keys(this.specs || {}) },
    currentImage () { return this.images[this.currentImageIdx] || 'https://via.placeholder.com/800' },
    previewSrc () { return this.images[this.previewIdx] || '' },
    productPoster () { return (this.images || []).find(u => !isVideoUrl(u)) || '' },
    formattedPrice () {
      const n = Number(this.product?.price)
      return isFinite(n) ? n.toLocaleString() : this.product?.price
    },
  },
  async onLoad (q) {
    const slug = q?.slug
    if (!slug) { this.loaded = true; return }
    const [showPrice, thumbBg, brand] = await Promise.all([
      getShowPrice(), getProductThumbBg(), getBrandName(),
    ])
    this.showPrice = showPrice
    this.thumbBg = thumbBg
    this.brand = brand
    try {
      const data = await cloud.products.list({ slug })
      this.product = data
      uni.setNavigationBarTitle({ title: `${data.name} - ${brand.primary}${brand.accent}` })
    } catch (e) {
      this.product = null
    } finally {
      this.loaded = true
    }
  },
  methods: {
    isVideoUrl,
    goHome () { uni.reLaunch({ url: '/pages/index/index' }) },
    goList () { uni.navigateTo({ url: '/pages/products/index' }) },
    goContact () { uni.navigateTo({ url: '/pages/contact/index' }) },
    openPreview (idx) { this.previewIdx = idx; this.showPreview = true },
    previewPrev () {
      const len = this.images.length
      this.previewIdx = (this.previewIdx - 1 + len) % len
    },
    previewNext () {
      const len = this.images.length
      this.previewIdx = (this.previewIdx + 1) % len
    },
  },
}
</script>

<style>
page { background: #fff; }
.detail { padding: 64px 0; background: #fff; }
.detail-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #6b7280; margin-bottom: 32px; flex-wrap: wrap; }
.crumb { color: #6b7280; }
.crumb.current { color: #1f2937; }
.sep { color: #d1d5db; }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
.media-col, .info-col { width: 100%; }
.main-media { position: relative; aspect-ratio: 1 / 1; border-radius: 16px; overflow: hidden; background: #fafafa; }
.media { width: 100%; height: 100%; }
.thumbs { margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap; }
.thumb { width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 2px solid transparent; background: #fafafa; }
.thumb.active { border-color: #c8a464; }
.thumb-img { width: 100%; height: 100%; }
.thumb-video { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 24px; }

.info-col { display: flex; flex-direction: column; }
.cat { font-size: 12px; color: #c8a464; letter-spacing: 3px; text-transform: uppercase; }
.name { margin-top: 8px; font-size: 36px; font-weight: 300; letter-spacing: -0.5px; color: #1f2937; line-height: 1.2; }
.price { margin-top: 16px; font-size: 22px; font-weight: 300; color: #1f2937; }
.description { margin-top: 32px; font-size: 14px; line-height: 1.7; color: #374151; }

.specs { margin-top: 40px; }
.specs-title { display: block; font-size: 13px; font-weight: 500; color: #1f2937; margin-bottom: 16px; letter-spacing: 0.5px; }
.specs-list { border-top: 1px solid #f3f4f6; }
.spec-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
.spec-key { color: #6b7280; }
.spec-val { color: #1f2937; }

.cta { margin-top: 40px; background: #1f2937; padding: 16px 40px; display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; }
.cta-text { color: #fff; font-size: 13px; letter-spacing: 1.5px; }
.cta-arrow { color: #fff; font-size: 14px; }

.empty { text-align: center; padding: 200px 0; color: #6b7280; font-size: 14px; }

.lightbox { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; }
.lb-close { position: absolute; top: 16px; right: 16px; color: rgba(255,255,255,0.7); font-size: 32px; padding: 8px 16px; }
.lb-prev, .lb-next { position: absolute; top: 50%; transform: translateY(-50%); width: 48px; height: 48px; border-radius: 50%; background: rgba(0,0,0,0.3); color: #fff; font-size: 28px; display: flex; align-items: center; justify-content: center; }
.lb-prev { left: 16px; }
.lb-next { right: 16px; }
.lb-media { max-width: 90vw; max-height: 85vh; }
.lb-counter { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.6); font-size: 13px; }

@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr; gap: 32px; }
  .name { font-size: 28px; }
}
</style>
