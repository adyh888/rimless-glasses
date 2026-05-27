<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
        @click.self="close"
        @keydown.esc="close"
        tabindex="0"
        ref="overlayRef"
      >
        <div class="bg-white rounded-xl shadow-2xl w-[90vw] max-w-4xl max-h-[80vh] flex flex-col" @click.stop>
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-base font-medium text-primary">素材库</h2>
            <div class="flex items-center gap-3">
              <!-- Mode toggle -->
              <button
                type="button"
                class="px-2.5 py-1 rounded-full text-xs transition-colors"
                :class="deleteMode ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-secondary hover:bg-gray-200'"
                @click="toggleDeleteMode"
              >{{ deleteMode ? '退出管理' : '管理素材' }}</button>
              <!-- Filter -->
              <div class="flex gap-1 text-xs">
                <button
                  v-for="f in filters"
                  :key="f.value"
                  class="px-2.5 py-1 rounded-full transition-colors"
                  :class="filter === f.value ? 'bg-primary text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'"
                  @click="filter = f.value"
                >{{ f.label }}</button>
              </div>
              <button @click="close" class="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary text-lg">&times;</button>
            </div>
          </div>

          <!-- Upload area -->
          <div class="px-6 pt-4">
            <div
              class="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-accent transition-colors"
              @click="uploadInput?.click()"
              @dragover.prevent
              @drop.prevent="onDrop"
            >
              <p class="text-sm text-secondary">点击或拖拽上传新素材</p>
              <p class="text-xs text-gray-400 mt-1">支持 JPG/PNG/WebP/GIF/MP4/WebM/MOV</p>
            </div>
            <input
              ref="uploadInput"
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              :multiple="multiple"
              class="hidden"
              @change="onFileSelect"
            />
            <p v-if="uploading" class="text-xs text-secondary mt-2">上传中...</p>
          </div>

          <!-- Media grid -->
          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="filteredItems.length" class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              <div
                v-for="item in filteredItems"
                :key="item.url"
                class="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all group"
                :class="selectedUrls.has(item.url) ? 'border-accent ring-2 ring-accent/30' : 'border-transparent hover:border-gray-300'"
                @click="toggleSelect(item)"
              >
                <!-- Image thumbnail -->
                <img
                  v-if="item.type === 'image'"
                  :src="item.url"
                  class="w-full h-full object-cover"
                />
                <!-- Video thumbnail -->
                <VideoThumbnail
                  v-else
                  :src="item.url"
                  container-class="w-full h-full"
                  canvas-class="object-cover"
                />
                <!-- Selected check -->
                <div
                  v-if="selectedUrls.has(item.url)"
                  class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  :class="deleteMode ? 'bg-red-500' : 'bg-accent'"
                >
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <!-- File size -->
                <div class="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1 rounded">
                  {{ formatSize(item.size) }}
                </div>
              </div>
            </div>
            <div v-else class="text-center py-12 text-secondary text-sm">暂无素材</div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p class="text-xs text-secondary">
              已选 {{ selectedUrls.size }} 项
              <template v-if="deleteMode && filteredItems.length">
                <span class="mx-1">·</span>
                <button type="button" class="text-accent hover:underline" @click="selectAll">全选</button>
              </template>
            </p>
            <div class="flex gap-3">
              <button
                @click="close"
                class="px-4 py-2 text-sm text-secondary border border-gray-200 rounded-lg hover:bg-gray-50"
              >取消</button>
              <!-- Delete mode: batch delete -->
              <button
                v-if="deleteMode"
                @click="batchDelete"
                :disabled="selectedUrls.size === 0 || deleting"
                class="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >{{ deleting ? '删除中...' : `删除选中 (${selectedUrls.size})` }}</button>
              <!-- Normal mode: use selected -->
              <button
                v-else
                @click="confirmSelect"
                :disabled="selectedUrls.size === 0"
                class="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >使用选中素材</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface MediaItem {
  url: string
  name: string
  type: string
  size: number
  mtime: number
}

const props = defineProps<{
  modelValue: boolean
  multiple?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'select'])
const { authHeaders } = useAuth()

const overlayRef = ref<HTMLElement>()
const uploadInput = ref<HTMLInputElement>()
const uploading = ref(false)
const deleting = ref(false)
const items = ref<MediaItem[]>([])
const selectedUrls = ref(new Set<string>())
const filter = ref('all')
const deleteMode = ref(false)

const filters = [
  { label: '全部', value: 'all' },
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
]

const filteredItems = computed(() => {
  if (filter.value === 'all') return items.value
  return items.value.filter(i => i.type === filter.value)
})

watch(() => props.modelValue, async (val) => {
  if (val) {
    selectedUrls.value = new Set()
    deleteMode.value = false
    document.body.style.overflow = 'hidden'
    await loadMedia()
    nextTick(() => overlayRef.value?.focus())
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

async function loadMedia() {
  try {
    items.value = await $fetch<MediaItem[]>('/api/media')
  } catch {
    items.value = []
  }
}

function toggleDeleteMode() {
  deleteMode.value = !deleteMode.value
  selectedUrls.value = new Set()
}

function toggleSelect(item: MediaItem) {
  const s = new Set(selectedUrls.value)
  if (s.has(item.url)) {
    s.delete(item.url)
  } else {
    if (!deleteMode.value && !props.multiple) s.clear()
    s.add(item.url)
  }
  selectedUrls.value = s
}

function selectAll() {
  const s = new Set<string>()
  for (const item of filteredItems.value) {
    s.add(item.url)
  }
  selectedUrls.value = s
}

function confirmSelect() {
  const urls = Array.from(selectedUrls.value)
  emit('select', urls)
  close()
}

async function batchDelete() {
  const count = selectedUrls.value.size
  if (!count) return
  if (!window.confirm(`确定删除选中的 ${count} 个素材？删除后不可恢复。`)) return

  deleting.value = true
  const urls = Array.from(selectedUrls.value)
  for (const url of urls) {
    try {
      const path = url.replace('/uploads/', '')
      await $fetch(`/uploads/${path}`, { method: 'DELETE', headers: authHeaders() })
      items.value = items.value.filter(i => i.url !== url)
      selectedUrls.value.delete(url)
    } catch { /* skip failed items */ }
  }
  deleting.value = false
  selectedUrls.value = new Set()
}

function close() {
  emit('update:modelValue', false)
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + 'KB'
  return (bytes / 1024 / 1024).toFixed(1) + 'MB'
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
  uploading.value = true
  for (let i = 0; i < files.length; i++) {
    await uploadFile(files[i]!)
  }
  uploading.value = false
  await loadMedia()
}

function onFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  handleFiles(files)
  if (uploadInput.value) uploadInput.value.value = ''
}

function onDrop(e: DragEvent) {
  handleFiles(e.dataTransfer?.files ?? null)
}
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
