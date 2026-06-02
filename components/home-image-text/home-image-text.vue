<template>
  <view class="home-image-text" :class="bgColor === 'surface' ? 'bg-surface' : 'bg-white'">
    <view class="container">
      <view class="grid" :class="{ 'reverse': imagePosition === 'right' }">
        <view class="image-col">
          <view class="image-wrap">
            <image class="img" :src="image || 'https://via.placeholder.com/800x600'" mode="aspectFill" />
          </view>
        </view>
        <view class="text-col">
          <text v-if="label" class="label">{{ label }}</text>
          <view class="heading">
            <text v-for="(line, i) in headingLines" :key="i" class="heading-line">{{ line }}</text>
          </view>
          <text v-if="description" class="description">{{ description }}</text>
          <view v-if="linkUrl" class="link" @tap="goLink">
            <text class="link-text">{{ linkText || '了解更多' }}</text>
            <text class="link-arrow">→</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { navigateToPath } from '@/utils/site-settings.js'

export default {
  props: {
    label: { type: String, default: '' },
    heading: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    linkText: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    imagePosition: { type: String, default: 'left' },
    bgColor: { type: String, default: 'white' },
  },
  computed: {
    headingLines () { return (this.heading || '').split('\n') },
  },
  methods: {
    goLink () { navigateToPath(this.linkUrl) },
  },
}
</script>

<style>
.home-image-text { padding: 96px 0; }
.bg-white { background: #fff; }
.bg-surface { background: #f7f6f3; }
.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.grid.reverse .image-col { order: 2; }
.image-col, .text-col { width: 100%; }
.image-wrap { overflow: hidden; border-radius: 16px; aspect-ratio: 4 / 3; background: #f3f4f6; }
.img { width: 100%; height: 100%; }
.label { font-size: 12px; color: #c8a464; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; display: block; }
.heading { display: flex; flex-direction: column; gap: 4px; }
.heading-line { font-size: 36px; font-weight: 300; line-height: 1.3; color: #1f2937; letter-spacing: -0.5px; }
.description { display: block; margin-top: 24px; color: #6b7280; font-size: 14px; line-height: 1.7; }
.link { margin-top: 32px; display: inline-flex; align-items: center; gap: 8px; }
.link-text { color: #1f2937; font-size: 14px; }
.link-arrow { color: #1f2937; font-size: 14px; }

@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr; gap: 32px; }
  .grid.reverse .image-col { order: 0; }
  .heading-line { font-size: 28px; }
}
</style>
