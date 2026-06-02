<template>
  <view class="rt-editor">
    <view class="toolbar">
      <text class="tb-btn" @tap="format('bold')"><text class="b">B</text></text>
      <text class="tb-btn" @tap="format('italic')"><text class="i">I</text></text>
      <text class="tb-btn" @tap="format('header', 'H2')">H2</text>
      <text class="tb-btn" @tap="format('header', 'H3')">H3</text>
      <text class="tb-btn" @tap="format('list', 'unordered')">•</text>
      <text class="tb-btn" @tap="format('list', 'ordered')">1.</text>
      <text class="tb-btn" @tap="insertBlockquote">"</text>
      <text class="tb-btn" @tap="insertLink">🔗</text>
      <view class="divider" />
      <text class="tb-btn" @tap="chooseImageUpload">🖼️</text>
      <text class="tb-btn" @tap="chooseVideoUpload">▶️</text>
      <text class="tb-btn" @tap="openLibrary">📚</text>
      <text v-if="uploading" class="status">上传中...</text>
    </view>

    <!-- #ifdef H5 || MP-WEIXIN -->
    <editor
      ref="editor"
      class="editor"
      :placeholder="placeholder || '请输入内容...'"
      show-img-size
      show-img-toolbar
      show-img-resize
      @ready="onReady"
      @input="onInput"
      @statuschange="onStatusChange"
    />
    <!-- #endif -->

    <!-- #ifndef H5 || MP-WEIXIN -->
    <textarea
      class="fallback"
      :value="modelValue"
      :placeholder="placeholder || '请输入内容...'"
      auto-height
      @input="onFallbackInput"
    />
    <!-- #endif -->

    <media-library v-model="showLibrary" multiple folder="content" @select="onLibrarySelect" />
  </view>
</template>

<script>
import MediaLibrary from '@/components/media-library/media-library.vue'
import { cloud, showErr } from '@/utils/cloud.js'

export default {
  components: { MediaLibrary },
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  data () {
    return {
      editorCtx: null,
      uploading: false,
      showLibrary: false,
    }
  },
  watch: {
    modelValue (val) {
      if (this.editorCtx && val !== this._lastEmitted) {
        this.editorCtx.setContents({ html: val || '' })
      }
    },
  },
  methods: {
    isVideoUrl (url) { return /\.(mp4|mov|webm|m3u8)(\?|$)/i.test(url || '') },
    onReady () {
      // #ifdef H5 || MP-WEIXIN
      const query = uni.createSelectorQuery().in(this)
      query.select('.editor').context(res => {
        this.editorCtx = res.context
        if (this.modelValue) this.editorCtx.setContents({ html: this.modelValue })
      }).exec()
      // #endif
    },
    onInput (e) {
      const html = e.detail.html || ''
      this._lastEmitted = html
      this.$emit('update:modelValue', html)
    },
    onFallbackInput (e) {
      this.$emit('update:modelValue', e.detail.value || '')
    },
    onStatusChange () {},
    format (name, value) {
      if (this.editorCtx) this.editorCtx.format(name, value)
    },
    insertBlockquote () {
      if (this.editorCtx) this.editorCtx.insertText({ text: '\n' })
      this.format('header', 'blockquote')
    },
    insertLink () {
      uni.showModal({
        title: '插入链接',
        editable: true,
        placeholderText: 'https://...',
        success: ({ confirm, content }) => {
          if (confirm && content && this.editorCtx) {
            this.editorCtx.insertText({ text: content })
            // 简化：插入纯文本链接。富文本超链格式跨端实现差异较大。
          }
        },
      })
    },
    openLibrary () { this.showLibrary = true },
    chooseImageUpload () {
      uni.chooseImage({ count: 1, success: res => this.doUpload(res.tempFilePaths[0], 'image') })
    },
    chooseVideoUpload () {
      uni.chooseVideo({ success: res => this.doUpload(res.tempFilePath, 'video', res.size) })
    },
    async doUpload (filePath, type, size = 0) {
      this.uploading = true
      try {
        const baseName = (filePath.split('/').pop() || `${type}-${Date.now()}`).replace(/[^\w.\-]/g, '_')
        const cloudPath = `content/${Date.now()}-${baseName}`
        const res = await uniCloud.uploadFile({ cloudPath, filePath })
        const fileID = res.fileID
        try { await cloud.media.register({ fileID, name: baseName, type, size, folderPath: 'content' }) } catch (e) {}
        let url = fileID
        try {
          const tmp = await uniCloud.getTempFileURL({ fileList: [fileID] })
          url = tmp.fileList[0]?.tempFileURL || fileID
        } catch (e) {}
        this.insertMedia(url, type)
      } catch (e) { showErr(e, '上传失败') } finally { this.uploading = false }
    },
    insertMedia (url, type) {
      if (this.editorCtx && type === 'image') {
        this.editorCtx.insertImage({ src: url })
      } else if (this.editorCtx && type === 'video') {
        // editor 组件不直接支持视频；通过 HTML 插入
        this.appendHtml(`<video src="${url}" controls playsinline style="max-width:100%;border-radius:8px;margin:16px 0;"></video>`)
      } else {
        // 降级 textarea：追加 HTML 字符串
        const prefix = this.modelValue ? this.modelValue + '\n' : ''
        const html = type === 'image'
          ? `<img src="${url}" style="max-width:100%;border-radius:8px;" />`
          : `<video src="${url}" controls playsinline style="max-width:100%;border-radius:8px;"></video>`
        this.$emit('update:modelValue', prefix + html)
      }
    },
    appendHtml (html) {
      const current = this.modelValue || ''
      const next = current + html
      this._lastEmitted = next
      this.$emit('update:modelValue', next)
      if (this.editorCtx) this.editorCtx.setContents({ html: next })
    },
    onLibrarySelect (urls) {
      for (const url of urls) {
        this.insertMedia(url, this.isVideoUrl(url) ? 'video' : 'image')
      }
    },
  },
}
</script>

<style>
.rt-editor { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #fff; }
.toolbar { display: flex; align-items: center; gap: 4rpx; padding: 8rpx 12rpx; border-bottom: 1px solid #f3f4f6; background: #fafafa; flex-wrap: wrap; }
.tb-btn { padding: 6rpx 14rpx; border-radius: 6px; font-size: 13px; color: #6b7280; }
.tb-btn .b { font-weight: 700; }
.tb-btn .i { font-style: italic; }
.divider { width: 1px; height: 18px; background: #e5e7eb; margin: 0 6rpx; }
.status { font-size: 11px; color: #9ca3af; margin-left: 8rpx; }
.editor { min-height: 320rpx; max-height: 800rpx; padding: 16rpx 20rpx; font-size: 14px; line-height: 1.6; box-sizing: border-box; width: 100%; }
.fallback { min-height: 320rpx; padding: 16rpx 20rpx; font-size: 14px; width: 100%; box-sizing: border-box; }
</style>
