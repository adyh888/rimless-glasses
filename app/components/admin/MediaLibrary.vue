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
              <div class="flex gap-1 text-xs">
                <button
                  v-for="f in filters"
                  :key="f.value"
                  class="px-2.5 py-1 rounded-full transition-colors"
                  :class="filter === f.value ? 'bg-primary text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'"
                  @click="filter = f.value; currentPage = 1; loadMedia()"
                >{{ f.label }}</button>
              </div>
              <button @click="close" class="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary text-lg">&times;</button>
            </div>
          </div>

          <!-- Breadcrumb -->
          <div class="flex items-center gap-1 text-xs px-6 pt-3">
            <button
              @click="navigateToFolder('')"
              class="hover:text-accent transition-colors"
              :class="currentFolder ? 'text-secondary' : 'text-primary font-medium'"
            >
              <svg class="w-3.5 h-3.5 inline -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"/>
              </svg>
              根目录
            </button>
            <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.path">
              <svg class="w-2.5 h-2.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <button
                @click="navigateToFolder(crumb.path)"
                class="hover:text-accent transition-colors"
                :class="idx === breadcrumbs.length - 1 ? 'text-primary font-medium' : 'text-secondary'"
              >{{ crumb.name }}</button>
            </template>
          </div>

          <!-- Upload area -->
          <div class="px-6 pt-3">
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
            <div v-if="folders.length || items.length" class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              <!-- Folders -->
              <div
                v-for="folder in folders"
                :key="'folder-' + folder.path"
                class="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-amber-300 transition-all group bg-amber-50/50 flex flex-col items-center justify-center"
                @click="navigateToFolder(folder.path)"
              >
                <svg class="w-10 h-10 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z"/>
                </svg>
                <p class="text-[10px] text-primary mt-1.5 truncate px-1 max-w-full text-center">{{ folder.name }}</p>
              </div>

              <!-- Files -->
              <div
                v-for="item in items"
                :key="item.url"
                class="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all group"
                :class="selectedUrls.has(item.url) ? 'border-accent ring-2 ring-accent/30' : 'border-transparent hover:border-gray-300'"
                @click="toggleSelect(item)"
                @dblclick.stop="openPreview(item)"
              >
                <img
                  v-if="item.type === 'image'"
                  :src="item.url"
                  class="w-full h-full object-contain bg-gray-50"
                  loading="lazy"
                />
                <VideoThumbnail
                  v-else
                  :src="item.url"
                  container-class="w-full h-full bg-gray-50"
                  canvas-class="object-contain"
                />
                <div
                  v-if="selectedUrls.has(item.url)"
                  class="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
                >
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div
                  v-else
                  class="absolute top-1.5 left-1.5 w-5 h-5 rounded-full border-2 border-white/70 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <button
                  type="button"
                  class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-xs items-center justify-center hover:bg-red-500 transition-colors hidden group-hover:flex"
                  @click.stop="singleDelete(item)"
                >&times;</button>
                <div class="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1 rounded">
                  {{ formatSize(item.size) }}
                </div>
              </div>
            </div>
            <div v-else class="text-center py-12 text-secondary text-sm">暂无素材</div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 px-6 py-2 border-t border-gray-50">
            <button
              :disabled="currentPage <= 1"
              @click="currentPage--; loadMedia()"
              class="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-30"
            >上一页</button>
            <span class="text-xs text-secondary">{{ currentPage }} / {{ totalPages }}</span>
            <button
              :disabled="currentPage >= totalPages"
              @click="currentPage++; loadMedia()"
              class="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-30"
            >下一页</button>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <div class="flex items-center gap-2 text-xs text-secondary">
              <span>已选 {{ selectedUrls.size }} / {{ total }} 项</span>
              <template v-if="items.length">
                <span class="mx-0.5">·</span>
                <button
                  v-if="selectedUrls.size < items.length"
                  type="button"
                  class="text-accent hover:underline"
                  @click="selectAll"
                >全选本页</button>
                <button
                  v-else
                  type="button"
                  class="text-accent hover:underline"
                  @click="clearSelection"
                >取消全选</button>
              </template>
            </div>
            <div class="flex gap-3">
              <button
                v-if="selectedUrls.size > 0"
                @click="batchDelete"
                :disabled="deleting"
                class="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >{{ deleting ? '删除中...' : `删除选中 (${selectedUrls.size})` }}</button>
              <button
                @click="close"
                class="px-4 py-2 text-sm text-secondary border border-gray-200 rounded-lg hover:bg-gray-50"
              >取消</button>
              <button
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

  <!-- Preview lightbox -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="preview.show"
        class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90"
        @click.self="preview.show = false"
        @keydown.left.prevent="previewPrev"
        @keydown.right.prevent="previewNext"
        @keydown.esc.prevent="preview.show = false"
        tabindex="0"
        ref="previewOverlayRef"
      >
        <button
          type="button"
          @click="preview.show = false"
          class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white text-3xl z-10"
        >&times;</button>
        <!-- Prev -->
        <button
          v-if="preview.index > 0"
          type="button"
          @click.stop="previewPrev"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors z-10"
        >
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <!-- Next -->
        <button
          v-if="preview.index < items.length - 1"
          type="button"
          @click.stop="previewNext"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors z-10"
        >
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
        <div class="text-center" @click.stop>
          <video
            v-if="preview.type === 'video'"
            :key="preview.url"
            :src="preview.url"
            controls
            autoplay
            class="max-w-[90vw] max-h-[80vh] rounded-lg"
          />
          <img
            v-else
            :key="preview.url"
            :src="preview.url"
            :alt="preview.name"
            class="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
          />
          <p class="mt-3 text-white/70 text-sm">{{ preview.name }} ({{ preview.index + 1 }}/{{ items.length }})</p>
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

interface FolderItem {
  name: string
  path: string
}

const props = defineProps<{
  modelValue: boolean
  multiple?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'select'])
const { authHeaders } = useAuth()

const PAGE_SIZE = 24
const overlayRef = ref<HTMLElement>()
const uploadInput = ref<HTMLInputElement>()
const uploading = ref(false)
const deleting = ref(false)
const folders = ref<FolderItem[]>([])
const items = ref<MediaItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const currentFolder = ref('')
const selectedUrls = ref(new Set<string>())
const filter = ref('all')
const preview = reactive({ show: false, url: '', name: '', type: '', index: 0 })
const previewOverlayRef = ref<HTMLElement>()

const filters = [
  { label: '全部', value: 'all' },
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
]

const breadcrumbs = computed(() => {
  if (!currentFolder.value) return []
  const parts = currentFolder.value.split('/')
  return parts.map((name, i) => ({
    name,
    path: parts.slice(0, i + 1).join('/'),
  }))
})

const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))

watch(() => props.modelValue, async (val) => {
  if (val) {
    selectedUrls.value = new Set()
    currentPage.value = 1
    currentFolder.value = ''
    filter.value = 'all'
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

function navigateToFolder(path: string) {
  currentFolder.value = path
  currentPage.value = 1
  selectedUrls.value = new Set()
  loadMedia()
}

async function loadMedia() {
  try {
    const res = await $fetch<{ folders: FolderItem[]; items: MediaItem[]; total: number }>('/api/media', {
      params: {
        folder: currentFolder.value,
        page: currentPage.value,
        limit: PAGE_SIZE,
        type: filter.value,
      },
    })
    folders.value = res.folders
    items.value = res.items
    total.value = res.total
  } catch {
    folders.value = []
    items.value = []
    total.value = 0
  }
}

function toggleSelect(item: MediaItem) {
  const s = new Set(selectedUrls.value)
  if (s.has(item.url)) {
    s.delete(item.url)
  } else {
    if (!props.multiple) s.clear()
    s.add(item.url)
  }
  selectedUrls.value = s
}

function openPreview(item: MediaItem) {
  const idx = items.value.findIndex(i => i.url === item.url)
  preview.url = item.url
  preview.name = item.name
  preview.type = item.type
  preview.index = idx >= 0 ? idx : 0
  preview.show = true
  nextTick(() => previewOverlayRef.value?.focus())
}

function previewPrev() {
  if (preview.index <= 0) return
  const item = items.value[preview.index - 1]
  if (!item) return
  preview.index--
  preview.url = item.url
  preview.name = item.name
  preview.type = item.type
}

function previewNext() {
  if (preview.index >= items.value.length - 1) return
  const item = items.value[preview.index + 1]
  if (!item) return
  preview.index++
  preview.url = item.url
  preview.name = item.name
  preview.type = item.type
}

function selectAll() {
  const s = new Set(selectedUrls.value)
  for (const item of items.value) {
    s.add(item.url)
  }
  selectedUrls.value = s
}

function clearSelection() {
  selectedUrls.value = new Set()
}

function confirmSelect() {
  const urls = Array.from(selectedUrls.value)
  emit('select', urls)
  close()
}

async function singleDelete(item: MediaItem) {
  if (!window.confirm(`确定删除「${item.name}」？删除后不可恢复。`)) return
  deleting.value = true
  try {
    const path = item.url.replace('/uploads/', '')
    await $fetch(`/uploads/${path}`, { method: 'DELETE', headers: authHeaders() })
    const s = new Set(selectedUrls.value)
    s.delete(item.url)
    selectedUrls.value = s
    await loadMedia()
  } catch {
    alert('删除失败')
  }
  deleting.value = false
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
    } catch {}
  }
  deleting.value = false
  selectedUrls.value = new Set()
  await loadMedia()
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
      params: currentFolder.value ? { folder: currentFolder.value } : undefined,
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
  for (const file of fileArray) {
    await uploadFile(file)
  }
  uploading.value = false
  currentPage.value = 1
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
