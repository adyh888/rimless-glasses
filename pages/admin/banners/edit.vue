<template>
  <admin-layout :title="isNew ? '新增轮播' : '编辑轮播'">
    <view class="page">
      <view class="form">
        <view class="field">
          <text class="label">标题 *</text>
          <input class="input" v-model="form.title" />
        </view>
        <view class="field">
          <text class="label">副标题</text>
          <input class="input" v-model="form.subtitle" />
        </view>
        <view class="grid-2">
          <view class="field">
            <text class="label">按钮文案</text>
            <input class="input" v-model="form.button_text" />
          </view>
          <view class="field">
            <text class="label">按钮链接</text>
            <input class="input" v-model="form.button_link" />
          </view>
        </view>

        <view class="field">
          <text class="label">背景媒体（图片/视频）</text>
          <image-uploader v-model="form.image_url" folder="banners" />
        </view>

        <view class="field" v-if="isVideoUrl(form.image_url)">
          <text class="label">视频封面图</text>
          <text class="hint">视频加载前显示的默认图片</text>
          <image-uploader v-model="form.video_poster" folder="banners" />
        </view>

        <view class="grid-2">
          <view class="field">
            <text class="label">排序</text>
            <input class="input" type="number" v-model.number="form.sort_order" />
          </view>
          <view class="field">
            <text class="label">状态</text>
            <picker mode="selector" :range="statusOptions" :value="form.is_active ? 0 : 1" @change="onStatus">
              <view class="picker-box">{{ form.is_active ? '启用' : '禁用' }}</view>
            </picker>
          </view>
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
import { cloud, ensureLogin, showErr } from '@/utils/cloud.js'

export default {
  components: { AdminLayout, ImageUploader },
  data () {
    return {
      isNew: true,
      id: '',
      saving: false,
      form: {
        title: '',
        subtitle: '',
        button_text: '',
        button_link: '',
        image_url: '',
        video_poster: '',
        sort_order: 0,
        is_active: 1,
      },
      statusOptions: ['启用', '禁用'],
    }
  },
  onLoad (q) {
    if (!ensureLogin()) return
    this.id = q?.id || ''
    this.isNew = !this.id
    if (!this.isNew) this.load()
  },
  methods: {
    isVideoUrl (url) {
      return /\.(mp4|mov|webm|m3u8)(\?|$)/i.test(url || '')
    },
    onStatus (e) {
      this.form.is_active = e.detail.value === '0' || e.detail.value === 0 ? 1 : 0
    },
    async load () {
      try {
        const data = await cloud.banners.getById(this.id)
        Object.assign(this.form, {
          title: data.title || '',
          subtitle: data.subtitle || '',
          button_text: data.button_text || '',
          button_link: data.button_link || '',
          image_url: data.image_url || '',
          video_poster: data.video_poster || '',
          sort_order: data.sort_order || 0,
          is_active: data.is_active,
        })
      } catch (e) {
        showErr(e, '加载失败')
      }
    },
    async save () {
      if (!this.form.title.trim()) return uni.showToast({ icon: 'none', title: '请填写标题' })
      this.saving = true
      try {
        if (this.isNew) await cloud.banners.create(this.form)
        else await cloud.banners.update(this.id, this.form)
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
.form { background: #fff; border-radius: 12px; padding: 32rpx; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.field { margin-bottom: 24rpx; }
.label { display: block; font-size: 13px; color: #6b7280; margin-bottom: 8rpx; }
.hint { display: block; font-size: 11px; color: #9ca3af; margin-bottom: 8rpx; }
.input { width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12rpx 20rpx; font-size: 14px; background: #fff; box-sizing: border-box; }
.input.small { font-size: 12px; padding: 8rpx 16rpx; }
.picker-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12rpx 20rpx; font-size: 14px; background: #fff; }
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280rpx, 1fr)); gap: 24rpx; }
.media-block { border: 1px solid #f3f4f6; border-radius: 8px; padding: 16rpx; background: #f9fafb; }
.preview { width: 100%; max-width: 480rpx; height: auto; border-radius: 6px; background: #fff; }
.preview.video, .preview.placeholder { padding: 24rpx; text-align: center; color: #6b7280; font-size: 12px; }
.media-actions { display: flex; gap: 12rpx; align-items: center; margin-top: 12rpx; flex-wrap: wrap; }
.btn-mini { height: 32px; line-height: 32px; font-size: 12px; padding: 0 24rpx; background: #1f2937; color: #fff; border-radius: 8px; }
.actions { display: flex; gap: 16rpx; margin-top: 32rpx; }
.btn-primary { background: #1f2937; color: #fff; font-size: 14px; padding: 0 32rpx; height: 40px; line-height: 40px; border-radius: 8px; }
</style>
