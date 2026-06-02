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
      <p v-if="crop" class="text-xs text-accent mt-1">图片将按 {{ aspectRatioLabel }} 比例裁剪</p>
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
        v-if="crop && !isVideoUrl(modelValue)"
        type="button"
        @click="openCropper(modelValue)"
        class="absolute -top-2 -left-2 px-2 h-6 bg-accent text-white rounded-full text-xs flex items-center justify-center hover:bg-accent/90"
        title="重新裁剪"
      >裁剪</button>
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
    <ImageCropper
      v-if="crop"
      v-model:show="cropperShow"
      :image-src="cropperSrc"
      :aspect-ratio="aspectRatio"
      :folder="folder"
      @cropped="onCropped"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  crop?: boolean
  aspectRatio?: number
  folder?: string
}>(), {
  crop: false,
  aspectRatio: 0,
  folder: '',
})
const emit = defineEmits(['update:modelValue'])
const { authHeaders } = useAuth()

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const showLibrary = ref(false)
const cropperShow = ref(false)
const cropperSrc = ref('')

const aspectRatioLabel = computed(() => {
  const r = props.aspectRatio
  if (!r || !isFinite(r)) return '自由'
  // 常见比例显示为 W:H 格式
  const tries: [number, string][] = [
    [16 / 9, '16:9'], [16 / 10, '16:10'], [4 / 3, '4:3'], [3 / 2, '3:2'],
    [1, '1:1'], [21 / 9, '21:9'], [3.2, '16:5'],
  ]
  for (const [v, label] of tries) {
    if (Math.abs(r - v) < 0.01) return label
  }
  return r.toFixed(2)
})

function triggerInput() {
  fileInput.value?.click()
}

function isImageMime(file: File) {
  return /^image\//.test(file.type)
}

function openCropper(src: string) {
  cropperSrc.value = src
  cropperShow.value = true
}

function onCropped(url: string) {
  emit('update:modelValue', url)
}

function onLibrarySelect(urls: string[]) {
  const url = urls[0]
  if (!url) return
  if (props.crop && !isVideoUrl(url)) {
    openCropper(url)
  } else {
    emit('update:modelValue', url)
  }
}

async function uploadFile(file: File) {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const uploadUrl = props.folder
      ? `/api/upload?folder=${encodeURIComponent(props.folder)}`
      : '/api/upload'
    const res = await $fetch<any>(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: authHeaders(),
    })
    emit('update:modelValue', res.url)
    return res.url as string
  } catch (e: any) {
    alert(e?.data?.statusMessage || '上传失败')
    return null
  } finally {
    uploading.value = false
  }
}

async function handleFile(file: File) {
  if (props.crop && isImageMime(file)) {
    // 先转为 dataURL 供裁剪预览，避免占用一次空跑上传
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result || '')
      if (dataUrl) openCropper(dataUrl)
    }
    reader.readAsDataURL(file)
  } else {
    await uploadFile(file)
  }
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleFile(file)
  input.value = ''
}

function onDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}
</script>
