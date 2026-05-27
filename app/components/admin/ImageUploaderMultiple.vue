<template>
  <div>
    <div
      class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors"
      @click="triggerInput"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <p class="text-sm text-secondary">点击或拖拽上传图片/视频（支持多选）</p>
      <p class="text-xs text-gray-400 mt-1">支持 JPG/PNG/WebP/GIF/MP4/WebM/MOV</p>
      <button
        type="button"
        class="mt-3 text-xs text-accent hover:underline"
        @click.stop="showLibrary = true"
      >从素材库选择</button>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/*,video/mp4,video/webm,video/quicktime"
      multiple
      class="hidden"
      @change="onFileSelect"
    />

    <div v-if="uploading" class="mt-3 text-sm text-secondary">上传中... {{ uploadedCount }} / {{ totalCount }}</div>

    <MediaLibrary v-model="showLibrary" multiple @select="onLibrarySelect" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits(['update:modelValue'])
const { authHeaders } = useAuth()

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const uploadedCount = ref(0)
const totalCount = ref(0)
const showLibrary = ref(false)

function triggerInput() {
  fileInput.value?.click()
}

function onLibrarySelect(urls: string[]) {
  if (urls.length > 0) {
    emit('update:modelValue', [...(props.modelValue || []), ...urls])
  }
}

async function uploadFile(file: File): Promise<string | null> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await $fetch<any>('/api/upload', {
      method: 'POST',
      body: formData,
      headers: authHeaders(),
    })
    return res.url
  } catch (e: any) {
    alert(e?.data?.statusMessage || '上传失败')
    return null
  }
}

async function handleFiles(files: FileList | null) {
  if (!files?.length) return
  const fileArray = Array.from(files)

  uploading.value = true
  totalCount.value = fileArray.length
  uploadedCount.value = 0

  const newUrls: string[] = []

  for (const file of fileArray) {
    const url = await uploadFile(file)
    if (url) {
      newUrls.push(url)
    }
    uploadedCount.value++
  }

  emit('update:modelValue', [...(props.modelValue || []), ...newUrls])

  uploading.value = false
  totalCount.value = 0
  uploadedCount.value = 0
}

function onFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  handleFiles(files)
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function onDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  handleFiles(files ?? null)
}
</script>
