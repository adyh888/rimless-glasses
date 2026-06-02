<template>
  <view class="home-cta" :class="bgColor === 'surface' ? 'bg-surface' : 'bg-white'">
    <view class="container">
      <text class="heading">{{ heading }}</text>
      <text v-if="subtitle" class="subtitle">{{ subtitle }}</text>
      <view v-if="linkUrl" class="cta" @tap="goLink">
        <text class="cta-text">{{ linkText || '了解更多' }}</text>
        <text class="cta-arrow">→</text>
      </view>
    </view>
  </view>
</template>

<script>
import { navigateToPath } from '@/utils/site-settings.js'

export default {
  props: {
    heading: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    linkText: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    bgColor: { type: String, default: 'surface' },
  },
  methods: {
    goLink () { navigateToPath(this.linkUrl) },
  },
}
</script>

<style>
.home-cta { padding: 96px 0; }
.bg-white { background: #fff; }
.bg-surface { background: #f7f6f3; }
.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; text-align: center; display: flex; flex-direction: column; align-items: center; }
.heading { font-size: 40px; font-weight: 300; letter-spacing: -0.5px; color: #1f2937; line-height: 1.3; }
.subtitle { font-size: 14px; color: #6b7280; margin-top: 16px; }
.cta { margin-top: 32px; background: #1f2937; padding: 16px 40px; display: inline-flex; align-items: center; gap: 8px; }
.cta-text { color: #fff; font-size: 13px; letter-spacing: 1.5px; }
.cta-arrow { color: #fff; font-size: 14px; }

@media (max-width: 768px) {
  .heading { font-size: 28px; }
}
</style>
