<template>
  <view class="uploader">
    <view v-if="!modelValue" class="dropzone" @tap="showChoose">
      <text class="dz-tip">点击上传图片 / 视频</text>
      <text class="dz-hint">支持 JPG/PNG/WebP/GIF/MP4/WebM/MOV</text>
      <text class="dz-action" @tap.stop="openLibrary">从素材库选择</text>
    </view>
    <view v-else class="preview-wrap">
      <video
        v-if="isVideoUrl(modelValue)"
        :src="modelValue"
        class="preview"
        muted
        loop
        autoplay
        :show-center-play-btn="false"
      />
      <image v-else :src="modelValue" class="preview" mode="aspectFill" />
      <text class="btn-remove" @tap="clear">×</text>
    </view>
    <text v-if="uploading" class="status">上传中...</text>

    <media-library v-model="showLibrary" :folder="folder" @select="onLibrarySelect" />
  </view>
</template>

<script>
import MediaLibrary from '@/components/media-library/media-library.vue'
import { cloud, showErr } from '@/utils/cloud.js'

export default {
  components: { MediaLibrary },
  props: {
    modelValue: { type: String, default: '' },
    folder: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  data () { return { uploading: false, showLibrary: false } },
  methods: {
    isVideoUrl (url) {
      return /\.(mp4|mov|webm|m3u8)(\?|$)/i.test(url || '')
    },
    clear () { this.$emit('update:modelValue', '') },
    openLibrary () { this.showLibrary = true },
    onLibrarySelect (urls) {
      const url = urls[0]
      if (url) this.$emit('update:modelValue', url)
    },
    showChoose () {
      uni.showActionSheet({
        itemList: ['选择图片', '选择视频', '从素材库选择'],
        success: ({ tapIndex }) => {
          if (tapIndex === 0) {
            uni.chooseImage({ count: 1, success: res => this.doUpload(res.tempFilePaths[0], 'image') })
          } else if (tapIndex === 1) {
            uni.chooseVideo({ success: res => this.doUpload(res.tempFilePath, 'video', res.size) })
          } else if (tapIndex === 2) {
            this.openLibrary()
          }
        },
      })
    },
    async doUpload (filePath, type, size = 0) {
      this.uploading = true
      try {
        const baseName = (filePath.split('/').pop() || `${type}-${Date.now()}`).replace(/[^\w.\-]/g, '_')
        const folder = this.folder || 'misc'
        const cloudPath = `${folder}/${Date.now()}-${baseName}`
        const res = await uniCloud.uploadFile({ cloudPath, filePath })
        const fileID = res.fileID
        try { await cloud.media.register({ fileID, name: baseName, type, size, folderPath: this.folder }) } catch (e) {}
        let url = fileID
        try {
          const tmp = await uniCloud.getTempFileURL({ fileList: [fileID] })
          url = tmp.fileList[0]?.tempFileURL || fileID
        } catch (e) {}
        this.$emit('update:modelValue', url)
      } catch (e) { showErr(e, '上传失败') } finally { this.uploading = false }
    },
  },
}
</script>

<style>
.uploader { display: flex; flex-direction: column; gap: 8rpx; }
.dropzone { border: 2px dashed #e5e7eb; border-radius: 8px; padding: 32rpx; display: flex; flex-direction: column; align-items: center; gap: 4rpx; background: #fafafa; }
.dz-tip { font-size: 13px; color: #6b7280; }
.dz-hint { font-size: 11px; color: #9ca3af; }
.dz-action { font-size: 12px; color: #c8a464; margin-top: 8rpx; }
.preview-wrap { position: relative; display: inline-block; }
.preview { width: 200rpx; height: 200rpx; border-radius: 8px; background: #f9fafb; }
.btn-remove { position: absolute; top: -12rpx; right: -12rpx; width: 36rpx; height: 36rpx; line-height: 32rpx; text-align: center; font-size: 16px; background: #ef4444; color: #fff; border-radius: 50%; }
.status { font-size: 12px; color: #6b7280; }
</style>
