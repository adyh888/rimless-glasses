<template>
  <view class="site-footer">
    <view class="footer-inner">
      <view class="grid">
        <view class="col">
          <view class="brand-row">
            <text class="brand-primary">{{ brand.primary }}</text>
            <text class="brand-accent">{{ brand.accent }}</text>
          </view>
          <text class="tagline">{{ tagline.line1 }}</text>
          <text class="tagline">{{ tagline.line2 }}</text>
        </view>

        <view class="col">
          <text class="col-title">产品系列</text>
          <text v-for="cat in productCategories" :key="cat" class="col-link" @tap="goCategory(cat)">{{ cat }}</text>
        </view>

        <view class="col">
          <text class="col-title">关于品牌</text>
          <text class="col-link" @tap="goPath('/about')">{{ navLabel('/about', '品牌故事') }}</text>
          <text class="col-link" @tap="goPath('/news')">{{ navLabel('/news', '新闻动态') }}</text>
          <text class="col-link" @tap="goPath('/contact')">{{ navLabel('/contact', '联系我们') }}</text>
        </view>

        <view class="col">
          <text class="col-title">联系方式</text>
          <text v-for="item in contactInfo.items.slice(0, 3)" :key="item.label" class="col-text">{{ item.label }}：{{ item.value }}</text>
        </view>
      </view>

      <view class="copyright">
        <text class="copy-text">© {{ year }} {{ brand.primary }}{{ brand.accent }}. All rights reserved.</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getBrandName, getFooterTagline, getContactInfo, getNavItems, getProductCategoryOrder, navigateToPath } from '@/utils/site-settings.js'
import { cloud } from '@/utils/cloud.js'

export default {
  data () {
    return {
      brand: { primary: '清透', accent: '视界' },
      tagline: { line1: '', line2: '' },
      contactInfo: { items: [], hours: [] },
      navItems: [],
      productCategories: [],
      year: new Date().getFullYear(),
    }
  },
  async created () {
    try {
      const [brand, tagline, contactInfo, navItems, catOrder, products] = await Promise.all([
        getBrandName(),
        getFooterTagline(),
        getContactInfo(),
        getNavItems(),
        getProductCategoryOrder(),
        cloud.products.list({ active_only: 'true', limit: 9999 }).catch(() => ({ items: [] })),
      ])
      this.brand = brand
      this.tagline = tagline
      this.contactInfo = contactInfo
      this.navItems = navItems
      const items = products?.items || []
      const rawCats = [...new Set(items.map(p => p.category).filter(Boolean))]
      const sorted = (catOrder || []).filter(c => rawCats.includes(c))
      const rest = rawCats.filter(c => !sorted.includes(c))
      this.productCategories = [...sorted, ...rest]
    } catch (e) {}
  },
  methods: {
    navLabel (path, fallback) {
      return this.navItems.find(n => n.path === path)?.label || fallback
    },
    goCategory (cat) {
      uni.navigateTo({ url: `/pages/products/index?category=${encodeURIComponent(cat)}` })
    },
    goPath (path) { navigateToPath(path) },
  },
}
</script>

<style>
.site-footer { background: #1f2937; color: rgba(255,255,255,0.7); }
.footer-inner { max-width: 1280px; margin: 0 auto; padding: 64px 24px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 48px; }
.col { display: flex; flex-direction: column; gap: 8px; }
.brand-row { font-size: 24px; font-weight: 300; letter-spacing: 2px; color: #fff; margin-bottom: 12px; display: flex; gap: 2px; }
.brand-primary { color: #fff; }
.brand-accent { color: #c8a464; }
.tagline { font-size: 13px; line-height: 1.7; }
.col-title { color: #fff; font-size: 13px; font-weight: 500; margin-bottom: 12px; letter-spacing: 0.5px; }
.col-link { font-size: 13px; color: rgba(255,255,255,0.7); padding: 4px 0; }
.col-text { font-size: 13px; color: rgba(255,255,255,0.7); padding: 4px 0; }
.copyright { margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: center; }
.copy-text { font-size: 11px; color: rgba(255,255,255,0.4); }

@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr; gap: 32px; }
}
</style>
