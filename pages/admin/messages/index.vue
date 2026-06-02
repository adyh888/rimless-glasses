<template>
  <admin-layout title="留言管理">
    <view class="page">
      <view class="toolbar">
        <view class="toolbar-left">
          <text class="total">共 {{ total }} 条</text>
          <picker mode="selector" :range="pageSizeOptions" :value="pageSizeIndex" @change="onPageSize">
            <view class="picker-box">每页 {{ pageSize }} 条</view>
          </picker>
        </view>
        <view class="toolbar-right">
          <button class="btn-ghost" :disabled="batchProcessing" @tap="markAllRead">一键全部已读</button>
        </view>
      </view>

      <view class="batch-bar" v-if="selectedIds.size > 0">
        <text class="batch-count">已选 {{ selectedIds.size }} 项</text>
        <button class="batch-btn blue" :disabled="batchProcessing" @tap="batchMarkRead">标记已读</button>
        <button class="batch-btn red" :disabled="batchProcessing" @tap="batchDelete">批量删除</button>
      </view>

      <view class="card">
        <view class="row head">
          <view class="col-check"><checkbox :checked="isAllSelected" @tap="toggleSelectAll" /></view>
          <view class="col-flag">状态</view>
          <view class="col-name">姓名</view>
          <view class="col-contact">联系方式</view>
          <view class="col-msg">留言内容</view>
          <view class="col-date">时间</view>
          <view class="col-actions">操作</view>
        </view>
        <view v-if="!messages.length" class="empty">暂无留言</view>
        <view
          v-for="m in messages"
          :key="m._id"
          class="row body"
          :class="{ unread: !m.is_read }"
          @tap="viewMessage(m)"
        >
          <view class="col-check" @tap.stop="toggleSelect(m._id)">
            <checkbox :checked="selectedIds.has(m._id)" />
          </view>
          <view class="col-flag">
            <view class="pill" :class="m.is_read ? 'pill-gray' : 'pill-blue'">
              {{ m.is_read ? '已读' : '未读' }}
            </view>
          </view>
          <view class="col-name">{{ m.name }}</view>
          <view class="col-contact">
            <text class="contact-line">{{ m.email || '-' }}</text>
            <text class="contact-line muted" v-if="m.phone">{{ m.phone }}</text>
          </view>
          <view class="col-msg">{{ m.message }}</view>
          <view class="col-date">{{ formatTime(m.created_at) }}</view>
          <view class="col-actions" @tap.stop>
            <text v-if="!m.is_read" class="link" @tap="markRead(m)">标记已读</text>
            <text class="link danger" @tap="deleteMessage(m)">删除</text>
          </view>
        </view>
      </view>

      <view v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage <= 1" @tap="prevPage">上一页</button>
        <text class="page-info">{{ currentPage }} / {{ totalPages }}</text>
        <button class="page-btn" :disabled="currentPage >= totalPages" @tap="nextPage">下一页</button>
      </view>
    </view>

    <view v-if="showDetail" class="modal-mask" @tap="showDetail = false">
      <view class="modal-box" @tap.stop>
        <view class="modal-head">
          <text class="modal-title">留言详情</text>
          <text class="modal-close" @tap="showDetail = false">×</text>
        </view>
        <view v-if="currentMsg" class="modal-body">
          <view class="kv"><text class="k">姓名</text><text class="v">{{ currentMsg.name }}</text></view>
          <view class="kv"><text class="k">邮箱</text><text class="v">{{ currentMsg.email || '-' }}</text></view>
          <view class="kv" v-if="currentMsg.phone"><text class="k">电话</text><text class="v">{{ currentMsg.phone }}</text></view>
          <view class="kv"><text class="k">时间</text><text class="v">{{ formatTime(currentMsg.created_at) }}</text></view>
          <view class="msg-block">
            <text class="k">留言内容</text>
            <view class="msg-content">{{ currentMsg.message }}</view>
          </view>
        </view>
      </view>
    </view>
  </admin-layout>
</template>

<script>
import AdminLayout from '@/components/admin-layout/admin-layout.vue'
import { cloud, ensureLogin, showErr } from '@/utils/cloud.js'

const PAGESIZE_KEY = 'admin-messages-pagesize'

export default {
  components: { AdminLayout },
  data () {
    return {
      messages: [],
      total: 0,
      currentPage: 1,
      pageSize: 20,
      pageSizeOptions: ['10', '20', '50', '100'],
      selectedIds: new Set(),
      batchProcessing: false,
      showDetail: false,
      currentMsg: null,
    }
  },
  computed: {
    pageSizeIndex () { return this.pageSizeOptions.indexOf(String(this.pageSize)) },
    totalPages () { return Math.max(1, Math.ceil(this.total / this.pageSize)) },
    isAllSelected () {
      return this.messages.length > 0 && this.messages.every(m => this.selectedIds.has(m._id))
    },
  },
  onShow () {
    if (!ensureLogin()) return
    try {
      const saved = uni.getStorageSync(PAGESIZE_KEY)
      if (saved) this.pageSize = Number(saved) || 20
    } catch (e) {}
    this.load()
  },
  methods: {
    formatTime (s) {
      if (!s) return ''
      const d = new Date(typeof s === 'number' ? s : String(s).replace(/-/g, '/'))
      if (isNaN(d.getTime())) return ''
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },
    onPageSize (e) {
      this.pageSize = Number(this.pageSizeOptions[e.detail.value]) || 20
      try { uni.setStorageSync(PAGESIZE_KEY, String(this.pageSize)) } catch (err) {}
      this.currentPage = 1
      this.load()
    },
    toggleSelect (id) {
      const s = new Set(this.selectedIds)
      if (s.has(id)) s.delete(id); else s.add(id)
      this.selectedIds = s
    },
    toggleSelectAll () {
      this.selectedIds = this.isAllSelected ? new Set() : new Set(this.messages.map(m => m._id))
    },
    async load () {
      try {
        const data = await cloud.messages.list({ page: this.currentPage, limit: this.pageSize })
        this.messages = data.items || []
        this.total = data.total || 0
        this.selectedIds = new Set()
      } catch (e) {
        if (e?.errCode === 'AUTH_REQUIRED') { uni.reLaunch({ url: '/pages/admin/login/index' }); return }
        showErr(e, '加载失败')
      }
    },
    prevPage () { if (this.currentPage > 1) { this.currentPage--; this.load() } },
    nextPage () { if (this.currentPage < this.totalPages) { this.currentPage++; this.load() } },
    async viewMessage (m) {
      this.currentMsg = m
      this.showDetail = true
      if (!m.is_read) await this.markRead(m)
    },
    async markRead (m) {
      try {
        await cloud.messages.markRead(m._id, { is_read: 1 })
        m.is_read = 1
      } catch (e) { showErr(e, '操作失败') }
    },
    async markAllRead () {
      const ok = await new Promise(r => uni.showModal({ title: '确认', content: '确定将所有未读留言标记为已读？', success: res => r(!!res.confirm) }))
      if (!ok) return
      this.batchProcessing = true
      try {
        await cloud.messages.batchMarkRead({ action: 'mark_all_read' })
        await this.load()
      } catch (e) { showErr(e, '操作失败') } finally { this.batchProcessing = false }
    },
    async batchMarkRead () {
      if (this.selectedIds.size === 0) return
      this.batchProcessing = true
      try {
        await cloud.messages.batchMarkRead({ ids: [...this.selectedIds], action: 'mark_read' })
        await this.load()
      } catch (e) { showErr(e, '操作失败') } finally { this.batchProcessing = false }
    },
    async batchDelete () {
      if (this.selectedIds.size === 0) return
      const ok = await new Promise(r => uni.showModal({ title: '确认', content: `确定删除选中的 ${this.selectedIds.size} 条留言？`, success: res => r(!!res.confirm) }))
      if (!ok) return
      this.batchProcessing = true
      try {
        await cloud.messages.batchDelete({ ids: [...this.selectedIds] })
        await this.load()
      } catch (e) { showErr(e, '删除失败') } finally { this.batchProcessing = false }
    },
    async deleteMessage (m) {
      const ok = await new Promise(r => uni.showModal({ title: '确认', content: '确定删除这条留言？', success: res => r(!!res.confirm) }))
      if (!ok) return
      try {
        await cloud.messages.remove(m._id)
        await this.load()
      } catch (e) { showErr(e, '删除失败') }
    },
  },
}
</script>

<style>
.page { width: 100%; }
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; flex-wrap: wrap; gap: 12rpx; }
.toolbar-left { display: flex; gap: 16rpx; align-items: center; }
.total { font-size: 12px; color: #6b7280; }
.picker-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 8rpx 16rpx; font-size: 12px; background: #fff; }
.btn-ghost { background: #fff; color: #1f2937; border: 1px solid #e5e7eb; font-size: 12px; padding: 0 20rpx; height: 32px; line-height: 32px; border-radius: 8px; }
.batch-bar { display: flex; gap: 12rpx; align-items: center; margin-bottom: 16rpx; flex-wrap: wrap; }
.batch-count { font-size: 13px; color: #6b7280; }
.batch-btn { font-size: 12px; border-radius: 8px; height: 32px; line-height: 32px; padding: 0 20rpx; background: #fff; border: 1px solid #e5e7eb; }
.batch-btn.blue { color: #2563eb; border-color: #bfdbfe; background: #eff6ff; }
.batch-btn.red { color: #dc2626; border-color: #fecaca; background: #fef2f2; }
.card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.row { display: flex; align-items: center; padding: 16rpx 24rpx; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
.row.head { background: #f9fafb; color: #6b7280; font-size: 12px; }
.row.body.unread { background: rgba(239, 246, 255, 0.4); }
.row.body:last-child { border-bottom: none; }
.col-check { width: 56rpx; }
.col-flag { width: 100rpx; }
.col-name { width: 160rpx; color: #1f2937; }
.col-contact { width: 240rpx; display: flex; flex-direction: column; gap: 2rpx; color: #6b7280; }
.contact-line { font-size: 12px; }
.contact-line.muted { color: #9ca3af; }
.col-msg { flex: 1; color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 16rpx; }
.col-date { width: 240rpx; color: #6b7280; font-size: 12px; }
.col-actions { width: 200rpx; text-align: right; }
.pill { display: inline-block; padding: 2rpx 16rpx; font-size: 11px; border-radius: 999px; }
.pill-blue { background: #eff6ff; color: #2563eb; }
.pill-gray { background: #f3f4f6; color: #6b7280; }
.link { color: #c8a464; font-size: 12px; margin-left: 16rpx; }
.link.danger { color: #dc2626; }
.empty { padding: 60rpx 0; text-align: center; color: #9ca3af; font-size: 13px; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 16rpx; margin-top: 24rpx; }
.page-btn { background: #fff; border: 1px solid #e5e7eb; color: #1f2937; font-size: 12px; padding: 0 20rpx; height: 32px; line-height: 32px; border-radius: 8px; }
.page-info { font-size: 12px; color: #6b7280; }
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal-box { background: #fff; border-radius: 12px; width: 80vw; max-width: 520px; padding: 32rpx; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
.modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24rpx; }
.modal-title { font-size: 16px; font-weight: 500; color: #1f2937; }
.modal-close { font-size: 22px; color: #9ca3af; padding: 0 8rpx; }
.modal-body { display: flex; flex-direction: column; gap: 16rpx; }
.kv { display: flex; gap: 12rpx; font-size: 13px; }
.k { color: #6b7280; width: 96rpx; flex-shrink: 0; }
.v { color: #1f2937; flex: 1; }
.msg-block { display: flex; flex-direction: column; gap: 8rpx; }
.msg-content { background: #f9fafb; border-radius: 8px; padding: 16rpx; font-size: 13px; color: #1f2937; white-space: pre-wrap; }
</style>
