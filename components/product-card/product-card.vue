<template>
  <view class="product-card" :data-slug="product.slug" @tap="goDetail">
    <view class="thumb" :style="thumbStyle">
      <image class="thumb-img" :src="firstImage" mode="aspectFit" />
    </view>
    <view class="info">
      <text class="cat">
        {{ product.category }}<text v-if="product.sub_category"> · {{ product.sub_category }}</text>
      </text>
      <text class="name">{{ product.name }}</text>
      <text v-if="showPrice" class="price">¥{{ formattedPrice }}</text>
    </view>
  </view>
</template>

<script>
import { isVideoUrl, thumbBgStyle } from '@/utils/site-settings.js'

export default {
  props: {
    product: { type: Object, required: true },
    showPrice: { type: Boolean, default: true },
    thumbBg: { type: Object, default: () => ({ color: '#ffffff', opacity: 100 }) },
  },
  computed: {
    thumbStyle () { return thumbBgStyle(this.thumbBg) },
    firstImage () {
      try {
        const list = JSON.parse(this.product.images_json || '[]')
        return list.find(u => !isVideoUrl(u)) || list[0] || 'https://via.placeholder.com/600x450?text=No+Image'
      } catch (e) {
        return 'https://via.placeholder.com/600x450?text=No+Image'
      }
    },
    formattedPrice () {
      const n = Number(this.product.price)
      return isFinite(n) ? n.toLocaleString() : this.product.price
    },
  },
  methods: {
    goDetail () {
      const slug = this.product.slug
      if (!slug) return
      uni.navigateTo({ url: `/pages/products/detail?slug=${encodeURIComponent(slug)}` })
    },
  },
}
</script>

<style>
.product-card { display: block; }
.thumb { position: relative; aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; background: #fafafa; }
.thumb-img { width: 100%; height: 100%; }
.info { margin-top: 16px; display: flex; flex-direction: column; gap: 4px; }
.cat { font-size: 11px; color: #c8a464; letter-spacing: 1px; text-transform: uppercase; }
.name { font-size: 15px; font-weight: 500; color: #1f2937; }
.price { font-size: 13px; color: #6b7280; }
</style>
