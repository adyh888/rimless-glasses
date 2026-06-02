<template>
  <admin-layout title="文章管理">
    <view class="page">
      <view class="toolbar">
        <view class="toolbar-left">
          <text class="total">共 {{ articles.length }} 篇</text>
        </view>
        <button class="btn-primary" @tap="goNew">+ 新增文章</button>
      </view>

      <view class="batch-bar" v-if="selectedIds.size > 0">
        <text class="batch-count">已选 {{ selectedIds.size }} 项</text>
        <button class="batch-btn green" :disabled="batchProcessing" @tap="batchAction('publish')">批量发布</button>
        <button class="batch-btn orange" :disabled="batchProcessing" @tap="batchAction('unpublish')">放入草稿箱</button>
        <button class="batch-btn red" :disabled="batchProcessing" @tap="batchAction('delete')">批量删除</button>
      </view>

      <view class="card">
        <view class="row head">
          <view class="col-check"><checkbox :checked="isAllSelected" @tap="toggleSelectAll" /></view>
          <view class="col-title">标题</view>
          <view class="col-date">发布时间</view>
          <view class="col-flag">状态</view>
          <view class="col-actions">操作</view>
        </view>
        <view v-if="!articles.length" class="empty">暂无数据</view>
        <view v-for="a in articles" :key="a._id" class="row body">
          <view class="col-check" @tap.stop="toggleSelect(a._id)">
            <checkbox :checked="selectedIds.has(a._id)" />
          </view>
          <view class="col-title">{{ a.title }}</view>
          <view class="col-date">{{ formatDate(a.created_at) }}</view>
          <view class="col-flag">
            <view class="pill" :class="a.is_published ? 'pill-green' : 'pill-yellow'" @tap.stop="togglePublish(a)">
              {{ a.is_published ? '已发布' : '草稿' }}
            </view>
          </view>
          <view class="col-actions">
            <text class="link" @tap.stop="goEdit(a)">编辑</text>
            <text class="link danger" @tap.stop="del(a)">删除</text>
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
  data () { return { articles: [], selectedIds: new Set(), batchProcessing: false } },
  computed: {
    isAllSelected () {
      return this.articles.length > 0 && this.articles.every(a => this.selectedIds.has(a._id))
    },
  },
  onShow () {
    if (!ensureLogin()) return
    this.load()
  },
  methods: {
    formatDate (s) {
      if (!s) return ''
      const d = new Date(typeof s === 'number' ? s : String(s).replace(/-/g, '/'))
      if (isNaN(d.getTime())) return ''
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    },
    toggleSelect (id) {
      const s = new Set(this.selectedIds)
      if (s.has(id)) s.delete(id); else s.add(id)
      this.selectedIds = s
    },
    toggleSelectAll () {
      this.selectedIds = this.isAllSelected ? new Set() : new Set(this.articles.map(a => a._id))
    },
    async load () {
      try {
        const data = await cloud.articles.list({ limit: 100 })
        this.articles = data.items || []
        this.selectedIds = new Set()
      } catch (e) {
        if (e?.errCode === 'AUTH_REQUIRED') { uni.reLaunch({ url: '/pages/admin/login/index' }); return }
        showErr(e, '加载失败')
      }
    },
    async togglePublish (a) {
      try {
        const action = a.is_published ? 'unpublish' : 'publish'
        await cloud.articles.batch({ ids: [a._id], action })
        a.is_published = a.is_published ? 0 : 1
      } catch (e) { showErr(e, '切换状态失败') }
    },
    async batchAction (action) {
      if (this.selectedIds.size === 0) return
      const names = { delete: '删除', publish: '发布', unpublish: '放入草稿箱' }
      const ok = await new Promise(r => uni.showModal({ title: '确认', content: `确定要${names[action]}选中的 ${this.selectedIds.size} 篇文章吗？`, success: res => r(!!res.confirm) }))
      if (!ok) return
      this.batchProcessing = true
      try {
        await cloud.articles.batch({ ids: [...this.selectedIds], action })
        await this.load()
      } catch (e) { showErr(e, '操作失败') } finally { this.batchProcessing = false }
    },
    async del (a) {
      const ok = await new Promise(r => uni.showModal({ title: '确认', content: '确定删除？', success: res => r(!!res.confirm) }))
      if (!ok) return
      try {
        await cloud.articles.remove(a._id)
        await this.load()
      } catch (e) { showErr(e, '删除失败') }
    },
    goNew () { uni.navigateTo({ url: '/pages/admin/articles/edit' }) },
    goEdit (a) { uni.navigateTo({ url: `/pages/admin/articles/edit?id=${a._id}` }) },
  },
}
</script>

<style>
.page { width: 100%; }
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.toolbar-left { display: flex; gap: 12rpx; align-items: center; }
.total { font-size: 12px; color: #6b7280; }
.btn-primary { background: #1f2937; color: #fff; font-size: 13px; padding: 0 28rpx; height: 36px; line-height: 36px; border-radius: 8px; }
.batch-bar { display: flex; gap: 12rpx; align-items: center; margin-bottom: 16rpx; flex-wrap: wrap; }
.batch-count { font-size: 13px; color: #6b7280; }
.batch-btn { font-size: 12px; border-radius: 8px; height: 32px; line-height: 32px; padding: 0 20rpx; background: #fff; border: 1px solid #e5e7eb; }
.batch-btn.green { color: #16a34a; border-color: #bbf7d0; background: #f0fdf4; }
.batch-btn.orange { color: #ea580c; border-color: #fed7aa; background: #fff7ed; }
.batch-btn.red { color: #dc2626; border-color: #fecaca; background: #fef2f2; }
.card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.row { display: flex; align-items: center; padding: 16rpx 24rpx; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
.row.head { background: #f9fafb; color: #6b7280; font-size: 12px; }
.row.body:last-child { border-bottom: none; }
.col-check { width: 56rpx; }
.col-title { flex: 3; }
.col-date { width: 200rpx; color: #6b7280; }
.col-flag { width: 120rpx; }
.col-actions { flex: 1; text-align: right; }
.pill { display: inline-block; padding: 2rpx 16rpx; font-size: 11px; border-radius: 999px; }
.pill-green { background: #ecfdf5; color: #16a34a; }
.pill-yellow { background: #fefce8; color: #ca8a04; }
.link { color: #c8a464; font-size: 12px; margin-left: 16rpx; }
.link.danger { color: #dc2626; }
.empty { padding: 60rpx 0; text-align: center; color: #9ca3af; font-size: 13px; }
</style>
