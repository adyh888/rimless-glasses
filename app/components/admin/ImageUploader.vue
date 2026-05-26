<template>
  <div>
    <div
      v-if="!modelValue"
      class="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
      @click="triggerInput"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <p class="text-sm text-secondary">点击或拖拽上传图片</p>
      <p class="text-xs text-gray-400 mt-1">支持 JPG/PNG/WebP/GIF，最大 5MB</p>
    </div>
    <div v-else class="relative inline-block">
      <img :src="modelValue" class="h-32 object-cover rounded-lg" />
      <button
        type="button"
        @click="$emit('update:modelValue', '')"
        class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
      >
        &times;
      </button>
    </div>
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelect" />
    <p v-if="uploading" class="text-xs text-secondary mt-2">上传中...</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits(['update:modelValue'])
const { authHeaders } = useAuth()

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)

function triggerInput() {
  fileInput.value?.click()
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
