<template>
  <admin-layout :title="isNew ? '新增文章' : '编辑文章'">
    <view class="page">
      <view class="form import-block" v-if="isNew">
        <view class="import-row">
          <input class="input" v-model="importUrl" placeholder="输入文章链接，从外部网页导入内容..." />
          <button class="btn-accent" :disabled="importing || !importUrl.trim()" @tap="importFromUrl">{{ importing ? '导入中...' : '从链接导入' }}</button>
        </view>
        <text class="hint" v-if="importing">正在抓取页面内容并下载图片/视频到素材库，请稍候...</text>
        <text class="error" v-if="importError">{{ importError }}</text>
      </view>

      <view class="form">
        <view class="field">
          <text class="label">文章标题 *</text>
          <input class="input" v-model="form.title" />
        </view>
        <view class="grid-2">
          <view class="field">
            <text class="label">Slug</text>
            <input class="input" v-model="form.slug" placeholder="留空自动生成" />
          </view>
          <view class="field">
            <text class="label">发布状态</text>
            <picker mode="selector" :range="statusOptions" :value="form.is_published ? 0 : 1" @change="onStatus">
              <view class="picker-box">{{ form.is_published ? '已发布' : '草稿' }}</view>
            </picker>
          </view>
        </view>
        <view class="field">
          <text class="label">摘要</text>
          <textarea class="textarea" v-model="form.summary" placeholder="文章摘要，用于列表展示" />
        </view>
        <view class="field">
          <text class="label">封面图片</text>
          <image-uploader v-model="form.cover_image" folder="articles" />
        </view>
        <view class="field">
          <text class="label">文章内容</text>
          <rich-text-editor v-model="form.content" placeholder="支持图文混排" />
        </view>

        <view class="actions">
          <button class="btn-primary" :disabled="saving" @tap="save">{{ saving ? '保存中...' : '保存' }}</button>
          <button @tap="cancel">取消</button>
        </view>
      </view>
    </view>
  </admin-layout>
</template>

<script>
import AdminLayout from '@/components/admin-layout/admin-layout.vue'
import ImageUploader from '@/components/image-uploader/image-uploader.vue'
import RichTextEditor from '@/components/rich-text-editor/rich-text-editor.vue'
import { cloud, ensureLogin, showErr } from '@/utils/cloud.js'

export default {
  components: { AdminLayout, ImageUploader, RichTextEditor },
  data () {
    return {
      isNew: true,
      id: '',
      saving: false,
      importUrl: '',
      importing: false,
      importError: '',
      statusOptions: ['已发布', '草稿'],
      form: {
        title: '', slug: '', summary: '', cover_image: '', content: '', is_published: 0,
      },
    }
  },
  onLoad (q) {
    if (!ensureLogin()) return
    this.id = q?.id || ''
    this.isNew = !this.id
    if (!this.isNew) this.load()
  },
  methods: {
    onStatus (e) {
      this.form.is_published = e.detail.value === '0' || e.detail.value === 0 ? 1 : 0
    },
    async load () {
      try {
        const data = await cloud.articles.getById(this.id)
        Object.assign(this.form, {
          title: data.title || '',
          slug: data.slug || '',
          summary: data.summary || '',
          cover_image: data.cover_image || '',
          content: data.content || '',
          is_published: data.is_published || 0,
        })
      } catch (e) { showErr(e, '加载失败') }
    },
    async importFromUrl () {
      const url = this.importUrl.trim()
      if (!url) return
      if (this.form.title || this.form.content) {
        const ok = await new Promise(r => uni.showModal({ title: '确认', content: '导入将覆盖当前标题和内容，确定继续？', success: res => r(!!res.confirm) }))
        if (!ok) return
      }
      this.importing = true
      this.importError = ''
      try {
        const res = await cloud.articles.import({ url })
        this.form.title = res.title || this.form.title
        this.form.content = res.content || this.form.content
      } catch (e) {
        this.importError = e?.errMsg || e?.message || '导入失败，请检查链接是否可访问'
      } finally { this.importing = false }
    },
    async save () {
      if (!this.form.title.trim()) return uni.showToast({ icon: 'none', title: '请填写标题' })
      this.saving = true
      try {
        const body = { ...this.form }
        if (!body.slug) body.slug = `article-${Date.now()}`
        if (this.isNew) await cloud.articles.create(body)
        else await cloud.articles.update(this.id, body)
        uni.showToast({ icon: 'success', title: '已保存' })
        setTimeout(() => uni.navigateBack(), 600)
      } catch (e) { showErr(e, '保存失败') } finally { this.saving = false }
    },
    cancel () { uni.navigateBack() },
  },
}
</script>

<style>
.page { width: 100%; }
.form { background: #fff; border-radius: 12px; padding: 32rpx; box-shadow: 0 1px 2px rgba(0,0,0,0.03); margin-bottom: 16rpx; }
.import-block { background: #fff; }
.import-row { display: flex; gap: 12rpx; align-items: center; }
.field { margin-bottom: 24rpx; }
.label { display: block; font-size: 13px; color: #6b7280; margin-bottom: 8rpx; }
.hint { display: block; font-size: 11px; color: #9ca3af; margin-top: 8rpx; }
.error { display: block; font-size: 12px; color: #dc2626; margin-top: 8rpx; }
.input { width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12rpx 20rpx; font-size: 14px; background: #fff; box-sizing: border-box; flex: 1; }
.input.small { font-size: 12px; padding: 8rpx 16rpx; }
.picker-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12rpx 20rpx; font-size: 14px; background: #fff; }
.textarea { width: 100%; min-height: 200rpx; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12rpx 20rpx; font-size: 14px; background: #fff; box-sizing: border-box; }
.textarea.tall { min-height: 600rpx; }
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280rpx, 1fr)); gap: 24rpx; }
.media-block { border: 1px solid #f3f4f6; border-radius: 8px; padding: 16rpx; background: #f9fafb; }
.preview { width: 100%; max-width: 480rpx; border-radius: 6px; background: #fff; }
.preview.placeholder { padding: 24rpx; text-align: center; color: #6b7280; font-size: 12px; }
.media-actions { display: flex; gap: 12rpx; align-items: center; margin-top: 12rpx; flex-wrap: wrap; }
.btn-mini { height: 32px; line-height: 32px; font-size: 12px; padding: 0 24rpx; background: #1f2937; color: #fff; border-radius: 8px; }
.btn-accent { height: 36px; line-height: 36px; font-size: 13px; padding: 0 24rpx; background: #c8a464; color: #fff; border-radius: 8px; }
.btn-primary { background: #1f2937; color: #fff; font-size: 14px; padding: 0 32rpx; height: 40px; line-height: 40px; border-radius: 8px; }
.actions { display: flex; gap: 16rpx; margin-top: 32rpx; }
</style>
