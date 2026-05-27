<template>
  <div>
    <div
      v-if="!modelValue"
      class="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
      @click="triggerInput"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <p class="text-sm text-secondary">点击或拖拽上传图片/视频</p>
      <p class="text-xs text-gray-400 mt-1">支持 JPG/PNG/WebP/GIF/MP4/WebM/MOV</p>
      <button
        type="button"
        class="mt-3 text-xs text-accent hover:underline"
        @click.stop="showLibrary = true"
      >从素材库选择</button>
    </div>
    <div v-else class="relative inline-block">
      <video
        v-if="isVideoUrl(modelValue)"
        :src="modelValue"
        class="h-32 object-cover rounded-lg"
        muted
        autoplay
        loop
        playsinline
      />
      <img v-else :src="modelValue" class="h-32 object-cover rounded-lg" />
      <button
        type="button"
        @click="$emit('update:modelValue', '')"
        class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
      >
        &times;
      </button>
    </div>
    <input ref="fileInput" type="file" accept="image/*,video/mp4,video/webm,video/quicktime" class="hidden" @change="onFileSelect" />
    <p v-if="uploading" class="text-xs text-secondary mt-2">上传中...</p>

    <MediaLibrary v-model="showLibrary" @select="onLibrarySelect" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits(['update:modelValue'])
const { authHeaders } = useAuth()

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const showLibrary = ref(false)

function triggerInput() {
  fileInput.value?.click()
}

function onLibrarySelect(urls: string[]) {
  if (urls.length > 0) {
    emit('update:modelValue', urls[0])
  }
}

async function uploadFile(file: File) {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await $fetch<any>('/api/upload', {
      method: 'POST',
      body: formData,
      headers: authHeaders(),
    })
    emit('update:modelValue', res.url)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '上传失败')
  } finally {
    uploading.value = false
  }
}

function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) uploadFile(file)
}

function onDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) uploadFile(file)
}
</script>
