<template>
  <view class="home-news">
    <view class="container">
      <section-title :title="displayTitle" :subtitle="displaySubtitle" />

      <view class="grid">
        <view
          v-for="article in articles"
          :key="article._id || article.id"
          class="card"
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
    </view>
  </view>
</template>

<script>
import { cloud } from '@/utils/cloud.js'
import { getNavItems, getBrandName } from '@/utils/site-settings.js'
import SectionTitle from '@/components/section-title/section-title.vue'

export default {
  components: { SectionTitle },
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    limit: { type: Number, default: 3 },
  },
  data () {
    return {
      articles: [],
      navItems: [],
      brand: { primary: '清透', accent: '视界' },
    }
  },
  computed: {
    siteName () { return this.brand.primary + this.brand.accent },
    displayTitle () {
      if (this.title) return this.title
      return this.navItems.find(n => n.path === '/news')?.label || '新闻动态'
    },
    displaySubtitle () {
      if (this.subtitle) return this.subtitle
      return this.navItems.find(n => n.path === '/news')?.subtitle || `了解${this.siteName}的最新资讯`
    },
  },
  async created () {
    const [data, navItems, brand] = await Promise.all([
      cloud.articles.list({ published_only: 'true', limit: this.limit }).catch(() => ({ items: [] })),
      getNavItems(),
      getBrandName(),
    ])
    this.articles = data?.items || []
    this.navItems = navItems
    this.brand = brand
  },
  methods: {
    formatDate (s) {
      if (!s) return ''
      const d = new Date(String(s).replace(/-/g, '/'))
      if (isNaN(d.getTime())) return ''
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
    },
    goDetail (article) {
      if (!article?.slug) return
      uni.navigateTo({ url: `/pages/news/detail?slug=${encodeURIComponent(article.slug)}` })
    },
  },
}
</script>

<style>
.home-news { padding: 96px 0; background: #fff; }
.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px; }
.card { display: block; }
.cover { overflow: hidden; border-radius: 12px; aspect-ratio: 16 / 10; background: #f3f4f6; }
.img { width: 100%; height: 100%; }
.info { margin-top: 16px; display: flex; flex-direction: column; gap: 4px; }
.date { font-size: 12px; color: #6b7280; }
.title { font-size: 15px; font-weight: 500; color: #1f2937; line-height: 1.4; }
.summary { font-size: 13px; color: #6b7280; line-height: 1.6; }

@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
