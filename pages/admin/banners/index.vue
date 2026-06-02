<template>
  <admin-layout title="轮播管理">
    <view class="page">
      <view class="toolbar">
        <text class="hint">点上下箭头可调整排序</text>
        <button class="btn-primary" @tap="goNew">+ 新增轮播</button>
      </view>

      <view class="card">
        <view class="row head">
          <view class="col-order">序号</view>
          <view class="col-media">媒体</view>
          <view class="col-title">标题</view>
          <view class="col-sort">排序</view>
          <view class="col-flag">状态</view>
          <view class="col-actions">操作</view>
        </view>
        <view v-if="!banners.length" class="empty">暂无数据</view>
        <view v-for="(b, idx) in banners" :key="b._id" class="row body">
          <view class="col-order">
            <text class="arrow" :class="{ disabled: idx === 0 }" @tap="move(idx, -1)">↑</text>
            <text class="arrow" :class="{ disabled: idx === banners.length - 1 }" @tap="move(idx, 1)">↓</text>
          </view>
          <view class="col-media">
            <image class="thumb" v-if="b.image_url && !isVideoUrl(b.image_url)" :src="b.image_url" mode="aspectFill" />
            <view v-else-if="isVideoUrl(b.image_url)" class="thumb video">视频</view>
            <view v-else class="thumb placeholder">无</view>
          </view>
          <view class="col-title">{{ b.title }}</view>
          <view class="col-sort">{{ b.sort_order || 0 }}</view>
          <view class="col-flag">
            <view class="pill" :class="b.is_active ? 'pill-green' : 'pill-gray'">{{ b.is_active ? '启用' : '禁用' }}</view>
          </view>
          <view class="col-actions">
            <text class="link" @tap="goEdit(b)">编辑</text>
            <text class="link danger" @tap="del(b)">删除</text>
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
  data () { return { banners: [] } },
  onShow () {
    if (!ensureLogin()) return
    this.load()
  },
  methods: {
    isVideoUrl (url) {
      return /\.(mp4|mov|webm|m3u8)(\?|$)/i.test(url || '')
    },
    async load () {
      try {
        this.banners = await cloud.banners.list({})
      } catch (e) {
        if (e?.errCode === 'AUTH_REQUIRED') {
          uni.reLaunch({ url: '/pages/admin/login/index' })
          return
        }
        showErr(e, '加载失败')
      }
    },
    async move (idx, dir) {
      const target = idx + dir
      if (target < 0 || target >= this.banners.length) return
      const items = [...this.banners]
      const [moved] = items.splice(idx, 1)
      items.splice(target, 0, moved)
      this.banners = items.map((b, i) => ({ ...b, sort_order: i + 1 }))
      try {
        await Promise.all(this.banners.map(b => cloud.banners.update(b._id, b)))
      } catch (e) {
        showErr(e, '排序保存失败')
        this.load()
      }
    },
    async del (b) {
      const ok = await new Promise(r => uni.showModal({ title: '确认', content: '确定删除？', success: res => r(!!res.confirm) }))
      if (!ok) return
      try {
        await cloud.banners.remove(b._id)
        await this.load()
      } catch (e) { showErr(e, '删除失败') }
    },
    goNew () { uni.navigateTo({ url: '/pages/admin/banners/edit' }) },
    goEdit (b) { uni.navigateTo({ url: `/pages/admin/banners/edit?id=${b._id}` }) },
  },
}
</script>

<style>
.page { width: 100%; }
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.hint { font-size: 12px; color: #9ca3af; }
.btn-primary { background: #1f2937; color: #fff; font-size: 13px; padding: 0 28rpx; height: 36px; line-height: 36px; border-radius: 8px; }
.card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.row { display: flex; align-items: center; padding: 16rpx 24rpx; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
.row.head { background: #f9fafb; color: #6b7280; font-size: 12px; }
.row.body:last-child { border-bottom: none; }
.col-order { width: 80rpx; display: flex; flex-direction: column; gap: 4rpx; }
.col-media { width: 140rpx; }
.col-title { flex: 2; padding-right: 16rpx; }
.col-sort { width: 80rpx; }
.col-flag { width: 100rpx; }
.col-actions { flex: 1; text-align: right; }
.thumb { width: 96rpx; height: 72rpx; background: #f3f4f6; border-radius: 6px; }
.thumb.video, .thumb.placeholder { display: flex; align-items: center; justify-content: center; font-size: 11px; color: #6b7280; }
.arrow { color: #6b7280; font-size: 14px; padding: 2rpx 6rpx; }
.arrow.disabled { color: #d1d5db; }
.pill { display: inline-block; padding: 2rpx 16rpx; font-size: 11px; border-radius: 999px; }
.pill-green { background: #ecfdf5; color: #16a34a; }
.pill-gray { background: #f3f4f6; color: #6b7280; }
.link { color: #c8a464; font-size: 12px; margin-left: 16rpx; }
.link.danger { color: #dc2626; }
.empty { padding: 60rpx 0; text-align: center; color: #9ca3af; font-size: 13px; }
</style>
