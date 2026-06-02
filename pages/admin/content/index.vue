<template>
  <admin-layout title="内容管理">
    <view class="page">
      <view class="form">
        <view class="head">
          <text class="title">关于我们 / 品牌故事</text>
          <text class="hint">前台「关于」页面的内容来源。</text>
        </view>

        <view class="field">
          <text class="label">正文内容</text>
          <rich-text-editor v-model="content" placeholder="支持图文混排，按需插入图片/视频" />
        </view>

        <view class="actions">
          <button class="btn-primary" :disabled="saving" @tap="saveContent">{{ saving ? '保存中...' : '保存内容' }}</button>
          <text v-if="saved" class="saved-tip">已保存</text>
        </view>
      </view>
    </view>
  </admin-layout>
</template>

<script>
import AdminLayout from '@/components/admin-layout/admin-layout.vue'
import RichTextEditor from '@/components/rich-text-editor/rich-text-editor.vue'
import { cloud, ensureLogin, showErr } from '@/utils/cloud.js'

export default {
  components: { AdminLayout, RichTextEditor },
  data () {
    return {
      content: '',
      saving: false,
      saved: false,
    }
  },
  onLoad () {
    if (!ensureLogin()) return
    this.load()
  },
  methods: {
    async load () {
      try {
        const data = await cloud.content.get('about_us')
        this.content = data?.content || ''
      } catch (e) {
        if (e?.errCode === 'AUTH_REQUIRED') { uni.reLaunch({ url: '/pages/admin/login/index' }); return }
        showErr(e, '加载失败')
      }
    },
    async saveContent () {
      this.saving = true
      this.saved = false
      try {
        await cloud.content.set('about_us', { content: this.content })
        this.saved = true
        setTimeout(() => { this.saved = false }, 3000)
        uni.showToast({ icon: 'success', title: '已保存' })
      } catch (e) { showErr(e, '保存失败') } finally { this.saving = false }
    },
  },
}
</script>

<style>
.page { width: 100%; }
.form { background: #fff; border-radius: 12px; padding: 32rpx; box-shadow: 0 1px 2px rgba(0,0,0,0.03); max-width: 960rpx; }
.head { margin-bottom: 24rpx; }
.title { display: block; font-size: 14px; color: #1f2937; font-weight: 500; margin-bottom: 8rpx; }
.hint { display: block; font-size: 12px; color: #9ca3af; }
.field { margin-bottom: 24rpx; }
.label { display: block; font-size: 13px; color: #6b7280; margin-bottom: 8rpx; }
.textarea { width: 100%; min-height: 200rpx; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12rpx 20rpx; font-size: 14px; background: #fff; box-sizing: border-box; }
.textarea.tall { min-height: 600rpx; }
.actions { display: flex; align-items: center; gap: 16rpx; margin-top: 32rpx; }
.btn-primary { background: #1f2937; color: #fff; font-size: 14px; padding: 0 32rpx; height: 40px; line-height: 40px; border-radius: 8px; }
.saved-tip { font-size: 12px; color: #16a34a; }
</style>
