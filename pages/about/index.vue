<template>
  <site-layout>
    <view class="hero">
      <view class="hero-inner">
        <text class="hero-label">ABOUT US</text>
        <text class="hero-title">{{ pageTitle }}</text>
        <text class="hero-subtitle">{{ pageSubtitle }}</text>
      </view>
    </view>

    <view class="cover">
      <image class="cover-img" :src="aboutImage" mode="aspectFill" />
      <view class="cover-overlay" :style="overlayStyle" />
    </view>

    <view class="content-section">
      <view class="content-inner">
        <view class="body">
          <rich-text :nodes="content || ''" />
        </view>
      </view>
    </view>

    <view class="values-section">
      <view class="values-inner">
        <section-title title="品牌价值" />
        <view class="values-grid">
          <view v-for="(v, idx) in values" :key="idx" class="value-card">
            <view class="value-icon">
              <text class="value-icon-text">{{ v.icon }}</text>
            </view>
            <text class="value-title">{{ v.title }}</text>
            <text class="value-desc">{{ v.desc }}</text>
          </view>
        </view>
      </view>
    </view>
  </site-layout>
</template>

<script>
import SiteLayout from '@/components/site-layout/site-layout.vue'
import SectionTitle from '@/components/section-title/section-title.vue'
import { getAboutContent, getAboutImage, getAboutOverlay, getBrandName, getNavItems } from '@/utils/site-settings.js'

const VALUES = [
  { icon: '✦', title: '极简美学', desc: '摒弃一切多余的装饰，让设计回归本质。无框，即是最好的框。' },
  { icon: '◇', title: '匠心工艺', desc: '48道手工工序，每一副眼镜都是匠人心血的结晶。精益求精，不做妥协。' },
  { icon: '○', title: '科技创新', desc: '12项专利技术，航空级材料应用。以科技之力，实现极致轻盈。' },
]

export default {
  components: { SiteLayout, SectionTitle },
  data () {
    return {
      content: '',
      aboutImage: '',
      overlay: { color: '#000000', opacity: 0.2 },
      brand: { primary: '清透', accent: '视界' },
      navItems: [],
      values: VALUES,
    }
  },
  computed: {
    overlayStyle () {
      return { backgroundColor: this.overlay.color, opacity: this.overlay.opacity }
    },
    navItem () { return this.navItems.find(n => n.path === '/about') },
    pageTitle () { return this.navItem?.label || '关于我们' },
    pageSubtitle () { return this.navItem?.subtitle || '以极简设计重新定义视觉体验' },
    siteName () { return this.brand.primary + this.brand.accent },
  },
  async onLoad () {
    const [content, image, overlay, brand, nav] = await Promise.all([
      getAboutContent(),
      getAboutImage(),
      getAboutOverlay(),
      getBrandName(),
      getNavItems(),
    ])
    this.content = content
    this.aboutImage = image
    this.overlay = overlay
    this.brand = brand
    this.navItems = nav
    uni.setNavigationBarTitle({ title: `关于我们 - ${this.siteName}` })
  },
}
</script>

<style>
page { background: #fff; }

.hero { background: #f7f6f3; padding: 128px 0 64px; }
.hero-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; text-align: center; display: flex; flex-direction: column; gap: 16px; align-items: center; }
.hero-label { font-size: 12px; color: #c8a464; letter-spacing: 3px; text-transform: uppercase; }
.hero-title { font-size: 44px; font-weight: 300; letter-spacing: -0.5px; color: #1f2937; }
.hero-subtitle { font-size: 14px; color: #6b7280; }

.cover { position: relative; height: 50vh; overflow: hidden; }
.cover-img { width: 100%; height: 100%; }
.cover-overlay { position: absolute; inset: 0; }

.content-section { padding: 96px 0; background: #fff; }
.content-inner { max-width: 768px; margin: 0 auto; padding: 0 24px; }
.body { font-size: 15px; line-height: 1.8; color: #374151; }

.values-section { padding: 96px 0; background: #f7f6f3; }
.values-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.values-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 48px; }
.value-card { text-align: center; display: flex; flex-direction: column; align-items: center; }
.value-icon { width: 64px; height: 64px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.value-icon-text { font-size: 22px; color: #1f2937; }
.value-title { font-size: 17px; font-weight: 500; color: #1f2937; }
.value-desc { margin-top: 8px; font-size: 13px; color: #6b7280; line-height: 1.7; max-width: 320rpx; }

@media (max-width: 768px) {
  .hero-title { font-size: 28px; }
  .hero { padding: 96px 0 48px; }
  .values-grid { grid-template-columns: 1fr; gap: 32px; }
}
</style>
