<template>
  <admin-layout title="仪表盘">
    <view class="dashboard">
      <view class="stat-grid">
        <view v-for="s in stats" :key="s.label" class="stat-card">
          <text class="stat-label">{{ s.label }}</text>
          <text class="stat-value">{{ s.value }}</text>
        </view>
      </view>

      <view class="card">
        <text class="card-title">快捷操作</text>
        <view class="actions">
          <view
            v-for="a in quickActions"
            :key="a.path"
            class="action-item"
            @tap="navigate(a.path)"
          >
            {{ a.label }}
          </view>
        </view>
      </view>
    </view>
  </admin-layout>
</template>

<script>
import AdminLayout from '@/components/admin-layout/admin-layout.vue'
import { cloud, ensureLogin, showErr } from '@/utils/cloud.js'

export default {
  components: { AdminLayout },
  data () {
    return {
      summary: { products: 0, articles: 0, banners: 0, messages: 0 },
      quickActions: [
        { label: '+ 添加新产品',  path: '/pages/admin/products/edit?id=' },
        { label: '+ 发布新文章',  path: '/pages/admin/articles/edit?id=' },
        { label: '+ 添加轮播图',  path: '/pages/admin/banners/edit?id=' },
        { label: '查看客户留言',  path: '/pages/admin/messages/index' },
        { label: '编辑品牌内容',  path: '/pages/admin/content/index' },
      ],
    }
  },
  computed: {
    stats () {
      return [
        { label: '产品总数', value: this.summary.products },
        { label: '文章总数', value: this.summary.articles },
        { label: '轮播图数', value: this.summary.banners },
        { label: '未读留言', value: this.summary.messages },
      ]
    },
  },
  onShow () {
    if (!ensureLogin()) return
    this.loadSummary()
  },
  methods: {
    async loadSummary () {
      try {
        this.summary = await cloud.stats.summary()
      } catch (e) {
        if (e?.errCode === 'AUTH_REQUIRED' || e?.errCode === 'uni-id-token-expired') {
          uni.reLaunch({ url: '/pages/admin/login/index' })
          return
        }
        showErr(e, '加载统计失败')
      }
    },
    navigate (path) {
      uni.navigateTo({ url: path })
    },
  },
}
</script>

<style>
.dashboard { width: 100%; }
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24rpx;
  margin-bottom: 32rpx;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.stat-label { color: #6b7280; font-size: 13px; }
.stat-value { color: #1f2937; font-size: 32px; font-weight: 300; }

.card {
  background: #fff;
  border-radius: 12px;
  padding: 32rpx;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.card-title { display: block; color: #1f2937; font-size: 14px; font-weight: 500; margin-bottom: 16rpx; }
.actions { display: flex; flex-direction: column; gap: 12rpx; }
.action-item {
  background: #f7f6f3;
  border-radius: 8px;
  padding: 20rpx 24rpx;
  font-size: 13px;
  color: #6b7280;
}
</style>
