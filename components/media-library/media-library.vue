<template>
  <view v-if="modelValue" class="modal-mask" @tap="close">
    <view class="modal-box" @tap.stop>
      <view class="modal-head">
        <text class="modal-title">素材库</text>
        <view class="head-right">
          <view class="filter-row">
            <text
              v-for="f in filters"
              :key="f.value"
              class="filter-chip"
              :class="{ active: filter === f.value }"
              @tap="onFilter(f.value)"
            >{{ f.label }}</text>
          </view>
          <text class="modal-close" @tap="close">×</text>
        </view>
      </view>

      <view class="breadcrumb">
        <text class="crumb" :class="{ active: !currentFolder }" @tap="navigateToFolder('')">根目录</text>
        <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.path">
          <text class="crumb-sep">›</text>
          <text class="crumb" :class="{ active: idx === breadcrumbs.length - 1 }" @tap="navigateToFolder(crumb.path)">{{ crumb.name }}</text>
        </template>
      </view>

      <view class="upload-area" @tap="chooseAndUpload">
        <text class="upload-tip">点击上传新素材</text>
        <text class="upload-hint">支持图片 / 视频</text>
        <text v-if="uploading" class="upload-hint">上传中...</text>
      </view>

      <scroll-view scroll-y class="grid-wrap">
        <view v-if="folders.length || items.length" class="grid">
          <view
            v-for="folder in folders"
            :key="'folder-' + folder.path"
            class="cell folder"
            @tap="navigateToFolder(folder.path)"
          >
            <text class="folder-icon">📁</text>
            <text class="folder-name">{{ folder.name }}</text>
          </view>

          <view
            v-for="item in items"
            :key="item._id || item.url"
            class="cell file"
            :class="{ selected: selectedUrls.has(item.url) }"
            @tap="toggleSelect(item)"
          >
            <image
              v-if="item.type === 'image'"
              :src="item.url"
              class="thumb"
              mode="aspectFit"
            />
            <view v-else class="thumb video">
              <text>视频</text>
            </view>
            <view v-if="selectedUrls.has(item.url)" class="check">✓</view>
            <text class="size">{{ formatSize(item.size) }}</text>
          </view>
        </view>
        <view v-else class="empty">暂无素材</view>
      </scroll-view>

      <view v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage <= 1" @tap="prevPage">上一页</button>
        <text class="page-info">{{ currentPage }} / {{ totalPages }}</text>
        <button class="page-btn" :disabled="currentPage >= totalPages" @tap="nextPage">下一页</button>
      </view>

      <view class="modal-foot">
        <view class="foot-info">
          <text class="info-text">已选 {{ selectedUrls.size }} / {{ total }} 项</text>
          <text v-if="items.length && selectedUrls.size < items.length" class="info-link" @tap="selectAll">全选本页</text>
          <text v-else-if="items.length" class="info-link" @tap="clearSelection">取消全选</text>
        </view>
        <view class="foot-actions">
          <button
            v-if="selectedUrls.size > 0"
            class="btn-danger"
            :disabled="deleting"
            @tap="batchDelete"
          >{{ deleting ? '删除中...' : `删除选中 (${selectedUrls.size})` }}</button>
          <button class="btn-ghost" @tap="close">取消</button>
          <button
            class="btn-primary"
            :disabled="selectedUrls.size === 0"
            @tap="confirmSelect"
          >使用选中素材</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { cloud, showErr } from '@/utils/cloud.js'

const PAGE_SIZE = 24

export default {
  props: {
    modelValue: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    folder: { type: String, default: '' },
  },
  data () {
    return {
      filter: 'all',
      folders: [],
      items: [],
      total: 0,
      currentPage: 1,
      currentFolder: '',
      selectedUrls: new Set(),
      uploading: false,
      deleting: false,
      filters: [
        { label: '全部', value: 'all' },
        { label: '图片', value: 'image' },
        { label: '视频', value: 'video' },
      ],
    }
  },
  computed: {
    breadcrumbs () {
      if (!this.currentFolder) return []
      const parts = this.currentFolder.split('/')
      return parts.map((name, i) => ({ name, path: parts.slice(0, i + 1).join('/') }))
    },
    totalPages () { return Math.max(1, Math.ceil(this.total / PAGE_SIZE)) },
  },
  watch: {
    modelValue (val) {
      if (val) {
        this.selectedUrls = new Set()
        this.currentPage = 1
        this.currentFolder = this.folder || ''
        this.filter = 'all'
        this.loadMedia()
      }
    },
  },
  methods: {
    close () { this.$emit('update:modelValue', false) },
    onFilter (val) {
      this.filter = val
      this.currentPage = 1
      this.loadMedia()
    },
    navigateToFolder (path) {
      this.currentFolder = path
      this.currentPage = 1
      this.selectedUrls = new Set()
      this.loadMedia()
    },
    prevPage () { if (this.currentPage > 1) { this.currentPage--; this.loadMedia() } },
    nextPage () { if (this.currentPage < this.totalPages) { this.currentPage++; this.loadMedia() } },
    async loadMedia () {
      try {
        const res = await cloud.media.list({
          folder: this.currentFolder,
          page: this.currentPage,
          limit: PAGE_SIZE,
          type: this.filter,
        })
        this.folders = res.folders || []
        this.items = res.items || []
        this.total = res.total || 0
      } catch (e) {
        this.folders = []
        this.items = []
        this.total = 0
        showErr(e, '加载失败')
      }
    },
    toggleSelect (item) {
      const s = new Set(this.selectedUrls)
      if (s.has(item.url)) {
        s.delete(item.url)
      } else {
        if (!this.multiple) s.clear()
        s.add(item.url)
      }
      this.selectedUrls = s
    },
    selectAll () {
      const s = new Set(this.selectedUrls)
      for (const item of this.items) s.add(item.url)
      this.selectedUrls = s
    },
    clearSelection () { this.selectedUrls = new Set() },
    confirmSelect () {
      const urls = [...this.selectedUrls]
      const picks = this.items.filter(i => this.selectedUrls.has(i.url))
      this.$emit('select', urls, picks)
      this.close()
    },
    formatSize (bytes) {
      if (!bytes) return ''
      if (bytes < 1024) return bytes + 'B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + 'KB'
      return (bytes / 1024 / 1024).toFixed(1) + 'MB'
    },
    chooseAndUpload () {
      uni.showActionSheet({
        itemList: ['上传图片', '上传视频'],
        success: ({ tapIndex }) => {
          if (tapIndex === 0) {
            uni.chooseImage({ count: 1, success: res => this.doUpload(res.tempFilePaths[0], 'image') })
          } else if (tapIndex === 1) {
            uni.chooseVideo({ success: res => this.doUpload(res.tempFilePath, 'video', res.size) })
          }
        },
      })
    },
    async doUpload (filePath, type, size = 0) {
      this.uploading = true
      try {
        const baseName = (filePath.split('/').pop() || `${type}-${Date.now()}`).replace(/[^\w.\-]/g, '_')
        const folder = this.currentFolder || 'misc'
        const cloudPath = `${folder}/${Date.now()}-${baseName}`
        const res = await uniCloud.uploadFile({ cloudPath, filePath })
        await cloud.media.register({
          fileID: res.fileID,
          name: baseName,
          type,
          size,
          folderPath: this.currentFolder,
        })
        await this.loadMedia()
      } catch (e) { showErr(e, '上传失败') } finally { this.uploading = false }
    },
    async batchDelete () {
      const count = this.selectedUrls.size
      if (!count) return
      const ok = await new Promise(r => uni.showModal({ title: '确认', content: `确定删除选中的 ${count} 个素材？`, success: res => r(!!res.confirm) }))
      if (!ok) return
      this.deleting = true
      try {
        const picks = this.items.filter(i => this.selectedUrls.has(i.url))
        for (const item of picks) {
          if (item._id) {
            try { await cloud.media.remove(item._id) } catch (e) {}
          }
        }
        this.selectedUrls = new Set()
        await this.loadMedia()
      } catch (e) { showErr(e, '删除失败') } finally { this.deleting = false }
    },
  },
}
</script>

<style>
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal-box { background: #fff; border-radius: 12px; width: 90vw; max-width: 920px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 32rpx; border-bottom: 1px solid #f3f4f6; }
.modal-title { font-size: 15px; font-weight: 500; color: #1f2937; }
.head-right { display: flex; align-items: center; gap: 16rpx; }
.filter-row { display: flex; gap: 6rpx; }
.filter-chip { font-size: 11px; padding: 4rpx 16rpx; border-radius: 999px; background: #f3f4f6; color: #6b7280; }
.filter-chip.active { background: #1f2937; color: #fff; }
.modal-close { font-size: 22px; color: #9ca3af; padding: 0 8rpx; }
.breadcrumb { display: flex; align-items: center; gap: 6rpx; padding: 12rpx 32rpx 0; font-size: 12px; }
.crumb { color: #6b7280; padding: 2rpx 4rpx; }
.crumb.active { color: #1f2937; font-weight: 500; }
.crumb-sep { color: #d1d5db; font-size: 10px; }
.upload-area { margin: 16rpx 32rpx; padding: 24rpx; border: 2px dashed #e5e7eb; border-radius: 8px; text-align: center; display: flex; flex-direction: column; gap: 4rpx; }
.upload-tip { font-size: 13px; color: #6b7280; }
.upload-hint { font-size: 11px; color: #9ca3af; }
.grid-wrap { flex: 1; padding: 16rpx 32rpx; overflow-y: auto; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140rpx, 1fr)); gap: 12rpx; }
.cell { position: relative; aspect-ratio: 1 / 1; border-radius: 8px; border: 2px solid transparent; overflow: hidden; background: #f9fafb; display: flex; align-items: center; justify-content: center; }
.cell.selected { border-color: #c8a464; }
.cell.folder { background: #fef3c7; flex-direction: column; gap: 4rpx; }
.folder-icon { font-size: 24px; }
.folder-name { font-size: 11px; color: #1f2937; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 4rpx; }
.thumb { width: 100%; height: 100%; }
.thumb.video { display: flex; align-items: center; justify-content: center; font-size: 12px; color: #6b7280; background: #f3f4f6; }
.check { position: absolute; top: 6rpx; left: 6rpx; width: 32rpx; height: 32rpx; border-radius: 50%; background: #c8a464; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.size { position: absolute; bottom: 4rpx; left: 4rpx; font-size: 10px; color: #fff; background: rgba(0,0,0,0.5); padding: 1px 6rpx; border-radius: 4px; }
.empty { padding: 60rpx 0; text-align: center; color: #9ca3af; font-size: 13px; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 12rpx; padding: 8rpx 32rpx; border-top: 1px solid #f9fafb; }
.page-btn { background: #fff; border: 1px solid #e5e7eb; color: #1f2937; font-size: 11px; padding: 0 16rpx; height: 28px; line-height: 28px; border-radius: 6px; }
.page-info { font-size: 12px; color: #6b7280; }
.modal-foot { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 32rpx; border-top: 1px solid #f3f4f6; flex-wrap: wrap; gap: 12rpx; }
.foot-info { display: flex; align-items: center; gap: 8rpx; }
.info-text { font-size: 12px; color: #6b7280; }
.info-link { font-size: 12px; color: #c8a464; }
.foot-actions { display: flex; gap: 12rpx; }
.btn-primary { background: #1f2937; color: #fff; font-size: 13px; padding: 0 24rpx; height: 36px; line-height: 36px; border-radius: 8px; }
.btn-ghost { background: #fff; color: #6b7280; font-size: 13px; padding: 0 24rpx; height: 36px; line-height: 36px; border-radius: 8px; border: 1px solid #e5e7eb; }
.btn-danger { background: #ef4444; color: #fff; font-size: 13px; padding: 0 24rpx; height: 36px; line-height: 36px; border-radius: 8px; }
</style>
