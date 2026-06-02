<template>
  <site-layout>
    <view class="hero">
      <view class="hero-inner">
        <text class="page-title">{{ pageTitle }}</text>
        <text class="page-subtitle">{{ pageSubtitle }}</text>
      </view>
    </view>

    <view class="list">
      <view class="list-inner">
        <view v-if="articles.length" class="grid">
          <view
            v-for="article in articles"
            :key="article._id || article.id"
            class="card"
            :data-slug="article.slug"
            @tap="goDetail(article)"
          >
            <view class="cover">
              <image class="img" :src="article.cover_image || 'https://via.placeholder.com/600x375'" mode="aspectFill" />
            </view>
            <view class="info">
              <text class="date">{{ formatDate(article.created_at) }}</text>
              <text class="title">{{ article.title }}</text>
              <text class="summary">{{ article.summary }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty">暂无文章</view>
      </view>
    </view>
  </site-layout>
</template>

<script>
import SiteLayout from '@/components/site-layout/site-layout.vue'
import { cloud } from '@/utils/cloud.js'
import { getNavItems, getBrandName } from '@/utils/site-settings.js'

export default {
  components: { SiteLayout },
  data () {
    return {
      articles: [],
      navItems: [],
      brand: { primary: '清透', accent: '视界' },
    }
  },
  computed: {
    navItem () { return this.navItems.find(n => n.path === '/news') },
    siteName () { return this.brand.primary + this.brand.accent },
    pageTitle () { return this.navItem?.label || '新闻动态' },
    pageSubtitle () { return this.navItem?.subtitle || `了解${this.siteName}的最新资讯与行业洞察` },
  },
  async onLoad () {
    const [data, navItems, brand] = await Promise.all([
      cloud.articles.list({ published_only: 'true', limit: 100 }).catch(() => ({ items: [] })),
      getNavItems(),
      getBrandName(),
    ])
    this.articles = data?.items || []
    this.navItems = navItems
    this.brand = brand
    uni.setNavigationBarTitle({ title: `${this.pageTitle} - ${this.siteName}` })
  },
  methods: {
    formatDate (s) {
      if (!s) return ''
      const d = new Date(String(s).replace(/-/g, '/'))
      if (isNaN(d.getTime())) return ''
      return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`
    },
    goDetail (article) {
      if (!article?.slug) return
      uni.navigateTo({ url: `/pages/news/detail?slug=${encodeURIComponent(article.slug)}` })
    },
  },
}
</script>

<style>
page { background: #fff; }
.hero { background: #f7f6f3; padding: 128px 0 64px; }
.hero-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; text-align: center; display: flex; flex-direction: column; gap: 16px; align-items: center; }
.page-title { font-size: 44px; font-weight: 300; letter-spacing: -0.5px; color: #1f2937; }
.page-subtitle { font-size: 14px; color: #6b7280; }

.list { background: #fff; padding: 64px 0; }
.list-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; }
.card { display: block; }
.cover { overflow: hidden; border-radius: 12px; aspect-ratio: 16 / 10; background: #f7f6f3; }
.img { width: 100%; height: 100%; }
.info { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
.date { font-size: 12px; color: #6b7280; }
.title { font-size: 17px; font-weight: 500; color: #1f2937; line-height: 1.4; }
.summary { font-size: 13px; color: #6b7280; line-height: 1.6; }

.empty { text-align: center; padding: 80px 0; color: #6b7280; font-size: 14px; }

@media (max-width: 1024px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr; }
  .page-title { font-size: 28px; }
  .hero { padding: 96px 0 48px; }
}
</style>
