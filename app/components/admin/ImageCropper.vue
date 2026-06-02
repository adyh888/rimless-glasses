<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
        @click.self="cancel"
      >
        <div class="bg-white rounded-xl shadow-2xl w-[90vw] max-w-4xl max-h-[90vh] flex flex-col" @click.stop>
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-sm font-medium text-primary">裁剪图片</h3>
            <button type="button" @click="cancel" class="text-secondary hover:text-primary text-xl">&times;</button>
          </div>

          <div class="flex-1 overflow-hidden p-4 bg-gray-50">
            <div class="w-full h-[60vh] flex items-center justify-center">
              <img
                ref="imgRef"
                :src="imageSrc"
                class="max-w-full max-h-full"
                @load="initCropper"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <span v-if="cropping" class="text-xs text-secondary">裁剪上传中...</span>
            <button
              type="button"
              @click="cancel"
              class="px-5 py-2 text-sm text-secondary border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >取消</button>
            <button
              type="button"
              @click="confirmCrop"
              :disabled="cropping"
              class="px-5 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >确认裁剪</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

const props = withDefaults(defineProps<{
  show: boolean
  imageSrc: string
  aspectRatio?: number
  folder?: string
}>(), {
  aspectRatio: 3.2,
  folder: '',
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  'cropped': [url: string]
}>()

const { authHeaders } = useAuth()

const imgRef = ref<HTMLImageElement>()
let cropper: Cropper | null = null
const cropping = ref(false)

function initCropper() {
  destroyCropper()
  if (!imgRef.value) return
  cropper = new Cropper(imgRef.value, {
    aspectRatio: props.aspectRatio || NaN,
    viewMode: 1,
    autoCropArea: 1,
    responsive: true,
  })
}

function destroyCropper() {
  if (cropper) {
    cropper.destroy()
    cropper = null
  }
}

function cancel() {
  emit('update:show', false)
}

async function confirmCrop() {
  if (!cropper) return
  cropping.value = true
  try {
    const canvas = cropper.getCroppedCanvas({ maxWidth: 1920, imageSmoothingQuality: 'high' })
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    if (!blob) throw new Error('裁剪失败')

    const formData = new FormData()
    formData.append('file', blob, 'cropped.jpg')
    const uploadUrl = props.folder
      ? `/api/upload?folder=${encodeURIComponent(props.folder)}`
      : '/api/upload'
    const res = await $fetch<any>(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: authHeaders(),
    })
    emit('cropped', res.url)
    emit('update:show', false)
  } catch (e: any) {
    alert(e?.data?.statusMessage || e?.message || '裁剪上传失败')
  } finally {
    cropping.value = false
  }
}

watch(() => props.show, (val) => {
  if (!val) {
    destroyCropper()
  }
  document.body.style.overflow = val ? 'hidden' : ''
})

onBeforeUnmount(() => {
  destroyCropper()
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
