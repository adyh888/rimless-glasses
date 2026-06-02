<template>
  <site-layout>
    <view v-if="article" class="detail">
      <view class="crumb-wrap">
        <view class="crumb-inner">
          <text class="crumb" @tap="goHome">首页</text>
          <text class="sep">/</text>
          <text class="crumb" @tap="goList">新闻动态</text>
          <text class="sep">/</text>
          <text class="crumb current">{{ article.title }}</text>
        </view>
      </view>

      <view v-if="article.cover_image" class="cover-wrap">
        <view class="cover-inner">
          <image class="cover-img" :src="article.cover_image" mode="aspectFill" />
        </view>
      </view>

      <view class="content-wrap">
        <view class="content-inner">
          <text class="title">{{ article.title }}</text>
          <text class="date">{{ formatDate(article.created_at) }}</text>
          <view class="body">
            <rich-text :nodes="article.content || ''" />
          </view>
          <view class="back" @tap="goList">
            <text class="back-arrow">←</text>
            <text class="back-text">返回新闻列表</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else-if="loaded" class="empty">文章不存在</view>
  </site-layout>
</template>

<script>
import SiteLayout from '@/components/site-layout/site-layout.vue'
import { cloud } from '@/utils/cloud.js'
import { getBrandName } from '@/utils/site-settings.js'

export default {
  components: { SiteLayout },
  data () {
    return {
      article: null,
      loaded: false,
      brand: { primary: '清透', accent: '视界' },
    }
  },
  async onLoad (q) {
    const slug = q?.slug
    if (!slug) { this.loaded = true; return }
    const brand = await getBrandName()
    this.brand = brand
    try {
      this.article = await cloud.articles.list({ slug })
      uni.setNavigationBarTitle({ title: `${this.article.title} - ${brand.primary}${brand.accent}` })
    } catch (e) {
      this.article = null
    } finally {
      this.loaded = true
    }
  },
  methods: {
    formatDate (s) {
      if (!s) return ''
      const d = new Date(String(s).replace(/-/g, '/'))
      if (isNaN(d.getTime())) return ''
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    },
    goHome () { uni.reLaunch({ url: '/pages/index/index' }) },
    goList () { uni.navigateTo({ url: '/pages/news/index' }) },
  },
}
</script>

<style>
page { background: #fff; }
.detail { background: #fff; }

.crumb-wrap { padding: 112px 0 0; }
.crumb-inner { max-width: 768px; margin: 0 auto; padding: 0 24px; display: flex; gap: 8px; flex-wrap: wrap; font-size: 13px; color: #6b7280; }
.crumb { color: #6b7280; }
.crumb.current { color: #1f2937; }
.sep { color: #d1d5db; }

.cover-wrap { padding-top: 32px; }
.cover-inner { max-width: 1024px; margin: 0 auto; padding: 0 24px; }
.cover-img { width: 100%; max-height: 480px; border-radius: 16px; }

.content-wrap { padding: 48px 0 96px; }
.content-inner { max-width: 768px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; }
.title { font-size: 36px; font-weight: 300; letter-spacing: -0.5px; color: #1f2937; line-height: 1.3; }
.date { margin-top: 16px; font-size: 13px; color: #6b7280; }
.body { margin-top: 40px; font-size: 15px; line-height: 1.8; color: #374151; }
.back { margin-top: 64px; padding-top: 32px; border-top: 1px solid #f3f4f6; display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; }
.back-arrow { color: #6b7280; font-size: 14px; }
.back-text { color: #6b7280; font-size: 14px; }

.empty { text-align: center; padding: 200px 0; color: #6b7280; font-size: 14px; }

@media (max-width: 768px) {
  .title { font-size: 26px; }
  .crumb-wrap { padding-top: 96px; }
}
</style>
