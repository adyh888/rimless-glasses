<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-light text-primary">素材库</h1>
        <p class="text-xs text-secondary mt-1">管理站点所有上传的图片和视频素材</p>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          @click="showNewFolderModal = true"
          class="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-all text-secondary"
        >+ 新建文件夹</button>
        <button
          type="button"
          @click="folderUploadInput?.click()"
          class="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-all text-secondary"
        >上传文件夹</button>
        <button
          type="button"
          @click="uploadInput?.click()"
          class="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all"
        >+ 上传素材</button>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="flex items-center gap-1 text-sm">
      <button
        @click="navigateToFolder('')"
        class="hover:text-accent transition-colors"
        :class="currentFolder ? 'text-secondary' : 'text-primary font-medium'"
      >
        <svg class="w-4 h-4 inline -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"/>
        </svg>
        根目录
      </button>
      <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.path">
        <svg class="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
        <button
          @click="navigateToFolder(crumb.path)"
          class="hover:text-accent transition-colors"
          :class="idx === breadcrumbs.length - 1 ? 'text-primary font-medium' : 'text-secondary'"
        >{{ crumb.name }}</button>
      </template>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center gap-4 flex-wrap">
      <div class="flex gap-1 text-xs">
        <button
          v-for="f in filters"
          :key="f.value"
          class="px-3 py-1.5 rounded-full transition-colors"
          :class="filterType === f.value ? 'bg-primary text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'"
          @click="filterType = f.value; currentPage = 1"
        >{{ f.label }}</button>
      </div>
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="全局搜索文件/文件夹..."
          class="px-3 py-1.5 pr-7 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none w-56"
          @input="onSearchInput"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''; currentPage = 1; clearMediaCache(); loadMedia()"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
        >&times;</button>
      </div>
      <div class="flex-1" />
      <button
        v-if="selectedUrls.size > 0"
        @click="clipboardCopy"
        class="px-3 py-1.5 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
      >复制 ({{ selectedUrls.size }})</button>
      <button
        v-if="selectedUrls.size > 0"
        @click="clipboardCut"
        class="px-3 py-1.5 text-sm text-white bg-amber-500 rounded-lg hover:bg-amber-600"
      >剪切 ({{ selectedUrls.size }})</button>
      <button
        v-if="clipboard.items.length > 0"
        @click="clipboardPaste"
        :disabled="pasting"
        class="px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >{{ pasting ? '粘贴中...' : `粘贴 (${clipboard.items.length})` }}</button>
      <button
        v-if="selectedUrls.size > 0"
        @click="batchDelete"
        :disabled="deleting"
        class="px-3 py-1.5 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
      >{{ deleting ? '删除中...' : `删除选中 (${selectedUrls.size})` }}</button>
      <div class="flex items-center gap-2">
        <label class="text-xs text-secondary">每页</label>
        <select
          v-model.number="pageSize"
          class="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:border-accent focus:outline-none bg-white"
          @change="currentPage = 1; loadMedia()"
        >
          <option :value="12">12</option>
          <option :value="24">24</option>
          <option :value="48">48</option>
          <option :value="96">96</option>
        </select>
      </div>
      <span class="text-xs text-secondary">共 {{ total }} 项</span>
    </div>

    <!-- Clipboard status -->
    <div
      v-if="clipboard.items.length > 0"
      class="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm"
    >
      <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
      <span class="text-blue-700">
        {{ clipboard.mode === 'copy' ? '已复制' : '已剪切' }} {{ clipboard.items.length }} 个文件
      </span>
      <span class="text-blue-400 text-xs">导航到目标文件夹后点击粘贴</span>
      <button
        @click="clipboardClear"
        class="text-blue-500 hover:text-blue-700 underline text-xs ml-auto"
      >取消</button>
    </div>

    <!-- Upload area (drag-drop) -->
    <div
      class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors"
      :class="{ 'border-accent bg-accent/5': dragging }"
      @click="uploadInput?.click()"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <p class="text-sm text-secondary">点击或拖拽文件/文件夹到此处上传</p>
      <p class="text-xs text-gray-400 mt-1">支持批量上传 · JPG/PNG/WebP/GIF/SVG/MP4/WebM/MOV · 支持拖入文件夹</p>
    </div>
    <input
      ref="uploadInput"
      type="file"
      accept="image/*,video/mp4,video/webm,video/quicktime"
      multiple
      class="hidden"
      @change="onFileSelect"
    />
    <input
      ref="folderUploadInput"
      type="file"
      webkitdirectory
      class="hidden"
      @change="onFolderSelect"
    />
    <div v-if="uploading" class="text-sm text-secondary">上传中... ({{ uploadProgress.done }}/{{ uploadProgress.total }})</div>

    <!-- Global search hint -->
    <div
      v-if="globalSearch"
      class="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm"
    >
      <svg class="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <span class="text-amber-700">全局搜索 "<span class="font-medium">{{ searchQuery }}</span>"，共 {{ total }} 个文件、{{ folders.length }} 个文件夹</span>
      <button
        @click="searchQuery = ''; currentPage = 1; clearMediaCache(); loadMedia()"
        class="text-amber-500 hover:text-amber-700 underline text-xs ml-auto"
      >退出搜索</button>
    </div>

    <!-- Media grid -->
    <div v-if="folders.length || items.length" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      <!-- Folders -->
      <div
        v-for="folder in folders"
        :key="'folder-' + folder.path"
        class="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-amber-300 transition-all group bg-amber-50/50 flex flex-col items-center justify-center"
        @click="navigateToFolder(folder.path)"
      >
        <svg class="w-14 h-14 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z"/>
        </svg>
        <p class="text-xs text-primary mt-2 truncate px-2 max-w-full text-center">{{ folder.name }}</p>
        <p v-if="globalSearch && folderParent(folder.path)" class="text-[10px] text-amber-600/70 truncate px-2 max-w-full text-center" :title="folderParent(folder.path)">
          {{ folderParent(folder.path) }}
        </p>
        <div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-blue-500"
            title="重命名"
            @click.stop="startRenameFolder(folder)"
          >✎</button>
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-red-500"
            title="删除"
            @click.stop="confirmDeleteFolder(folder)"
          >&times;</button>
        </div>
      </div>

      <!-- Files -->
      <div
        v-for="item in items"
        :key="item.url"
        class="relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all group bg-gray-50"
        :class="[
          selectedUrls.has(item.url) ? 'border-accent ring-2 ring-accent/30' : 'border-transparent hover:border-gray-300',
          cutUrls.has(item.url) ? 'opacity-50' : ''
        ]"
        @click="toggleSelect(item)"
        @dblclick.stop="openPreview(item)"
      >
        <img
          v-if="item.type === 'image'"
          :src="item.url"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <VideoThumbnail
          v-else
          :src="item.url"
          container-class="w-full h-full"
          canvas-class="object-cover"
        />

        <!-- Checkbox -->
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

        <!-- Actions -->
        <div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-blue-500"
            title="重命名"
            @click.stop="startRename(item)"
          >✎</button>
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-red-500"
            title="删除"
            @click.stop="singleDelete(item)"
          >&times;</button>
        </div>

        <!-- Info -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
          <p class="text-[10px] text-white truncate">{{ item.name }}</p>
          <p v-if="globalSearch && item.folderPath" class="text-[10px] text-white/80 truncate" :title="item.folderPath">
            📁 {{ item.folderPath }}
          </p>
          <p class="text-[10px] text-white/70">{{ formatSize(item.size) }}</p>
        </div>
      </div>
    </div>
    <div v-else-if="!uploading" class="text-center py-20 text-secondary text-sm">
      暂无素材，点击上方按钮上传
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-4">
      <button
        :disabled="currentPage <= 1"
        @click="currentPage--"
        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"
      >上一页</button>
      <template v-for="p in paginationRange" :key="p">
        <button
          v-if="p !== '...'"
          @click="currentPage = p as number"
          class="w-8 h-8 text-sm rounded-lg transition-colors"
          :class="currentPage === p ? 'bg-primary text-white' : 'hover:bg-gray-50 text-secondary'"
        >{{ p }}</button>
        <span v-else class="text-secondary text-sm px-1">...</span>
      </template>
      <button
        :disabled="currentPage >= totalPages"
        @click="currentPage++"
        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"
      >下一页</button>
    </div>

    <!-- New Folder modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showNewFolderModal"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          @click.self="showNewFolderModal = false"
        >
          <div class="bg-white rounded-xl shadow-xl w-96 p-6" @click.stop>
            <h3 class="text-sm font-medium text-primary mb-4">新建文件夹</h3>
            <input
              ref="newFolderInput"
              v-model="newFolderName"
              type="text"
              placeholder="请输入文件夹名称"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
              @keydown.enter="confirmCreateFolder"
            />
            <div class="mt-4 flex justify-end gap-3">
              <button
                @click="showNewFolderModal = false"
                class="px-4 py-2 text-sm text-secondary border border-gray-200 rounded-lg hover:bg-gray-50"
              >取消</button>
              <button
                @click="confirmCreateFolder"
                :disabled="creatingFolder"
                class="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >{{ creatingFolder ? '创建中...' : '确定' }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Rename modal (for files) -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="renameModal.show"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          @click.self="renameModal.show = false"
        >
          <div class="bg-white rounded-xl shadow-xl w-96 p-6" @click.stop>
            <h3 class="text-sm font-medium text-primary mb-4">重命名文件</h3>
            <input
              v-model="renameModal.newName"
              type="text"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
              @keydown.enter="confirmRename"
            />
            <div class="mt-4 flex justify-end gap-3">
              <button
                @click="renameModal.show = false"
                class="px-4 py-2 text-sm text-secondary border border-gray-200 rounded-lg hover:bg-gray-50"
              >取消</button>
              <button
                @click="confirmRename"
                :disabled="renaming"
                class="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >{{ renaming ? '保存中...' : '确定' }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Rename folder modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="renameFolderModal.show"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          @click.self="renameFolderModal.show = false"
        >
          <div class="bg-white rounded-xl shadow-xl w-96 p-6" @click.stop>
            <h3 class="text-sm font-medium text-primary mb-4">重命名文件夹</h3>
            <input
              v-model="renameFolderModal.newName"
              type="text"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
              @keydown.enter="confirmRenameFolder"
            />
            <div class="mt-4 flex justify-end gap-3">
              <button
                @click="renameFolderModal.show = false"
                class="px-4 py-2 text-sm text-secondary border border-gray-200 rounded-lg hover:bg-gray-50"
              >取消</button>
              <button
                @click="confirmRenameFolder"
                :disabled="renamingFolder"
                class="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >{{ renamingFolder ? '保存中...' : '确定' }}</button>
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
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { authFetch, authHeaders } = useAuth()

interface MediaItem {
  url: string
  name: string
  type: string
  size: number
  mtime: number
  folderPath?: string
}

interface FolderItem {
  name: string
  path: string
}

function folderParent(path: string): string {
  const i = path.lastIndexOf('/')
  return i > 0 ? path.slice(0, i) : ''
}

const folders = ref<FolderItem[]>([])
const items = ref<MediaItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const currentFolder = ref('')
const globalSearch = ref(false)

const mediaCache = new Map<string, { folders: FolderItem[]; items: MediaItem[]; total: number; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

function getMediaCacheKey() {
  return `${currentFolder.value}|${currentPage.value}|${pageSize.value}|${filterType.value}|${searchQuery.value}`
}

function clearMediaCache() {
  mediaCache.clear()
}

const PAGESIZE_KEY = 'admin-media-pagesize'
const pageSize = ref(24)
if (import.meta.client) {
  const saved = localStorage.getItem(PAGESIZE_KEY)
  if (saved) pageSize.value = Number(saved) || 24
}
watch(pageSize, (v) => {
  if (import.meta.client) localStorage.setItem(PAGESIZE_KEY, String(v))
  clearMediaCache()
})

const filterType = ref('all')
const searchQuery = ref('')
const selectedUrls = ref(new Set<string>())
const uploading = ref(false)
const uploadProgress = reactive({ done: 0, total: 0 })
const deleting = ref(false)
const renaming = ref(false)
const renamingFolder = ref(false)
const creatingFolder = ref(false)
const dragging = ref(false)
const uploadInput = ref<HTMLInputElement>()
const folderUploadInput = ref<HTMLInputElement>()
const newFolderInput = ref<HTMLInputElement>()
const previewOverlayRef = ref<HTMLElement>()
const showNewFolderModal = ref(false)
const newFolderName = ref('')

const renameModal = reactive({ show: false, oldName: '', newName: '', filePath: '' })
const renameFolderModal = reactive({ show: false, folderPath: '', newName: '' })
const preview = reactive({ show: false, url: '', name: '', type: '', index: 0 })

const clipboard = reactive({
  items: [] as { url: string; name: string; sourcePath: string }[],
  mode: '' as '' | 'copy' | 'cut',
  sourceFolder: '',
})
const pasting = ref(false)

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

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const paginationRange = computed(() => {
  const pages: (number | string)[] = []
  const tp = totalPages.value
  const cp = currentPage.value
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 3) pages.push('...')
    for (let i = Math.max(2, cp - 1); i <= Math.min(tp - 1, cp + 1); i++) pages.push(i)
    if (cp < tp - 2) pages.push('...')
    pages.push(tp)
  }
  return pages
})

watch(showNewFolderModal, (val) => {
  if (val) {
    newFolderName.value = ''
    nextTick(() => newFolderInput.value?.focus())
  }
})

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    clearMediaCache()
    loadMedia()
  }, 300)
}

watch([currentPage, filterType], () => {
  loadMedia()
})

function navigateToFolder(path: string) {
  currentFolder.value = path
  currentPage.value = 1
  selectedUrls.value = new Set()
  clearMediaCache()
  loadMedia()
}

async function loadMedia() {
  const cacheKey = getMediaCacheKey()
  const cached = mediaCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    folders.value = cached.folders
    items.value = cached.items
    total.value = cached.total
    return
  }

  try {
    const res = await $fetch<{ folders: FolderItem[]; items: MediaItem[]; total: number; globalSearch?: boolean }>('/api/media', {
      params: {
        folder: currentFolder.value,
        page: currentPage.value,
        limit: pageSize.value,
        type: filterType.value,
        search: searchQuery.value,
      },
    })
    folders.value = res.folders
    items.value = res.items
    total.value = res.total
    globalSearch.value = !!res.globalSearch

    mediaCache.set(cacheKey, {
      folders: res.folders,
      items: res.items,
      total: res.total,
      timestamp: Date.now(),
    })
  } catch {
    folders.value = []
    items.value = []
    total.value = 0
    globalSearch.value = false
  }
  selectedUrls.value = new Set()
}

function toggleSelect(item: MediaItem) {
  const s = new Set(selectedUrls.value)
  if (s.has(item.url)) s.delete(item.url)
  else s.add(item.url)
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

watch(() => preview.show, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

async function singleDelete(item: MediaItem) {
  if (!window.confirm(`确定删除「${item.name}」？`)) return
  deleting.value = true
  try {
    const path = item.url.replace('/uploads/', '')
    await $fetch(`/uploads/${path}`, { method: 'DELETE', headers: authHeaders() })
    clearMediaCache()
    await loadMedia()
  } catch {
    alert('删除失败')
  }
  deleting.value = false
}

async function batchDelete() {
  const count = selectedUrls.value.size
  if (!count) return
  if (!window.confirm(`确定删除选中的 ${count} 个素材？`)) return
  deleting.value = true
  for (const url of selectedUrls.value) {
    try {
      const path = url.replace('/uploads/', '')
      await $fetch(`/uploads/${path}`, { method: 'DELETE', headers: authHeaders() })
    } catch {}
  }
  deleting.value = false
  clearMediaCache()
  await loadMedia()
}

function clipboardCopy() {
  if (selectedUrls.value.size === 0) return
  clipboard.items = items.value
    .filter(i => selectedUrls.value.has(i.url))
    .map(i => ({ url: i.url, name: i.name, sourcePath: i.url.replace('/uploads/', '') }))
  clipboard.mode = 'copy'
  clipboard.sourceFolder = currentFolder.value
}

function clipboardCut() {
  if (selectedUrls.value.size === 0) return
  clipboard.items = items.value
    .filter(i => selectedUrls.value.has(i.url))
    .map(i => ({ url: i.url, name: i.name, sourcePath: i.url.replace('/uploads/', '') }))
  clipboard.mode = 'cut'
  clipboard.sourceFolder = currentFolder.value
}

function clipboardClear() {
  clipboard.items = []
  clipboard.mode = ''
  clipboard.sourceFolder = ''
}

async function clipboardPaste() {
  if (!clipboard.items.length || pasting.value) return

  if (clipboard.mode === 'cut' && clipboard.sourceFolder === currentFolder.value) {
    alert('请先导航到目标文件夹再粘贴')
    return
  }

  pasting.value = true
  const errors: string[] = []

  if (clipboard.mode === 'copy') {
    try {
      const res = await authFetch<{ results: Array<{ source: string; error?: string }> }>('/api/media/copy', {
        method: 'POST',
        body: {
          files: clipboard.items.map(i => i.sourcePath),
          targetFolder: currentFolder.value,
        },
      })
      for (const r of res.results) {
        if (r.error) errors.push(`${r.source}: ${r.error}`)
      }
    } catch (e: any) {
      errors.push(e?.data?.statusMessage || '复制失败')
    }
  } else {
    for (const item of clipboard.items) {
      try {
        await authFetch(`/api/media/${item.sourcePath}`, {
          method: 'PUT',
          body: { folder: currentFolder.value },
        })
      } catch (e: any) {
        errors.push(`${item.name}: ${e?.data?.statusMessage || '移动失败'}`)
      }
    }
  }

  pasting.value = false
  clipboardClear()
  clearMediaCache()
  await loadMedia()

  if (errors.length) {
    alert('部分操作失败：\n' + errors.join('\n'))
  }
}

const cutUrls = computed(() => {
  if (clipboard.mode !== 'cut' || clipboard.sourceFolder !== currentFolder.value) return new Set<string>()
  return new Set(clipboard.items.map(i => i.url))
})

function startRename(item: MediaItem) {
  const urlPath = item.url.replace('/uploads/', '')
  renameModal.oldName = item.name
  renameModal.newName = item.name
  renameModal.filePath = urlPath
  renameModal.show = true
}

async function confirmRename() {
  if (!renameModal.newName.trim()) return
  renaming.value = true
  try {
    await authFetch(`/api/media/${renameModal.filePath}`, {
      method: 'PUT',
      body: { newName: renameModal.newName.trim() },
    })
    renameModal.show = false
    clearMediaCache()
    await loadMedia()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '重命名失败')
  } finally {
    renaming.value = false
  }
}

function startRenameFolder(folder: FolderItem) {
  renameFolderModal.folderPath = folder.path
  renameFolderModal.newName = folder.name
  renameFolderModal.show = true
}

async function confirmRenameFolder() {
  if (!renameFolderModal.newName.trim()) return
  renamingFolder.value = true
  try {
    await authFetch(`/api/folders/${renameFolderModal.folderPath}`, {
      method: 'PUT',
      body: { newName: renameFolderModal.newName.trim() },
    })
    renameFolderModal.show = false
    clearMediaCache()
    await loadMedia()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '重命名失败')
  } finally {
    renamingFolder.value = false
  }
}

async function confirmDeleteFolder(folder: FolderItem) {
  const msg = `确定删除文件夹「${folder.name}」？\n\n如果文件夹不为空，将删除其中所有内容！`
  if (!window.confirm(msg)) return
  try {
    await authFetch(`/api/folders/${folder.path}?force=true`, { method: 'DELETE' })
    clearMediaCache()
    await loadMedia()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '删除失败')
  }
}

async function confirmCreateFolder() {
  const name = newFolderName.value.trim()
  if (!name) return
  creatingFolder.value = true
  try {
    const path = currentFolder.value ? `${currentFolder.value}/${name}` : name
    await authFetch('/api/folders', { method: 'POST', body: { path } })
    showNewFolderModal.value = false
    clearMediaCache()
    await loadMedia()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '创建失败')
  } finally {
    creatingFolder.value = false
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + 'KB'
  return (bytes / 1024 / 1024).toFixed(1) + 'MB'
}

async function uploadSingleFile(file: File, folder: string) {
  const formData = new FormData()
  formData.append('file', file)
  await $fetch('/api/upload', {
    method: 'POST',
    body: formData,
    headers: authHeaders(),
    params: folder ? { folder } : undefined,
  })
}

async function handleFiles(files: FileList | null) {
  if (!files?.length) return
  const fileArray = Array.from(files)
  uploading.value = true
  uploadProgress.done = 0
  uploadProgress.total = fileArray.length
  for (const file of fileArray) {
    try {
      await uploadSingleFile(file, currentFolder.value)
    } catch (e: any) {
      alert(e?.data?.statusMessage || `上传 ${file.name} 失败`)
    }
    uploadProgress.done++
  }
  uploading.value = false
  dragging.value = false
  clearMediaCache()
  await loadMedia()
}

function onFileSelect(e: Event) {
  handleFiles((e.target as HTMLInputElement).files)
  if (uploadInput.value) uploadInput.value.value = ''
}

async function onFolderSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files?.length) return
  const fileArray = Array.from(files).filter(f => f.type !== '')
  uploading.value = true
  uploadProgress.done = 0
  uploadProgress.total = fileArray.length
  for (const file of fileArray) {
    const relativePath = (file as any).webkitRelativePath || file.name
    const parts = relativePath.split('/')
    parts.pop()
    const subFolder = parts.join('/')
    const targetFolder = currentFolder.value
      ? (subFolder ? `${currentFolder.value}/${subFolder}` : currentFolder.value)
      : subFolder
    try {
      await uploadSingleFile(file, targetFolder)
    } catch (e: any) {
      alert(e?.data?.statusMessage || `上传 ${file.name} 失败`)
    }
    uploadProgress.done++
  }
  uploading.value = false
  if (folderUploadInput.value) folderUploadInput.value.value = ''
  clearMediaCache()
  await loadMedia()
}

interface FileSystemEntryExt extends FileSystemEntry {
  createReader(): FileSystemDirectoryReader
  file(cb: (f: File) => void, errCb?: (e: any) => void): void
}

function readAllEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve) => {
    const all: FileSystemEntry[] = []
    function readBatch() {
      reader.readEntries((entries) => {
        if (entries.length === 0) { resolve(all); return }
        all.push(...entries)
        readBatch()
      }, () => resolve(all))
    }
    readBatch()
  })
}

async function collectFiles(entry: FileSystemEntryExt, basePath: string): Promise<{ file: File; folder: string }[]> {
  if (entry.isFile) {
    return new Promise((resolve) => {
      entry.file((f) => resolve([{ file: f, folder: basePath }]), () => resolve([]))
    })
  }
  if (entry.isDirectory) {
    const reader = entry.createReader()
    const entries = await readAllEntries(reader)
    const dirPath = basePath ? `${basePath}/${entry.name}` : entry.name
    const results: { file: File; folder: string }[] = []
    for (const sub of entries) {
      results.push(...await collectFiles(sub as FileSystemEntryExt, dirPath))
    }
    return results
  }
  return []
}

async function onDrop(e: DragEvent) {
  dragging.value = false
  const dataTransfer = e.dataTransfer
  if (!dataTransfer) return

  const items = dataTransfer.items
  let hasDirectoryEntry = false
  const collectedFiles: { file: File; folder: string }[] = []

  if (items?.length) {
    const entries: FileSystemEntryExt[] = []
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry?.() as FileSystemEntryExt | null
      if (entry) {
        entries.push(entry)
        if (entry.isDirectory) hasDirectoryEntry = true
      }
    }

    if (hasDirectoryEntry) {
      for (const entry of entries) {
        const files = await collectFiles(entry, '')
        collectedFiles.push(...files)
      }

      uploading.value = true
      uploadProgress.done = 0
      uploadProgress.total = collectedFiles.length
      for (const { file, folder } of collectedFiles) {
        const targetFolder = currentFolder.value
          ? (folder ? `${currentFolder.value}/${folder}` : currentFolder.value)
          : folder
        try {
          await uploadSingleFile(file, targetFolder)
        } catch (err: any) {
          alert(err?.data?.statusMessage || `上传 ${file.name} 失败`)
        }
        uploadProgress.done++
      }
      uploading.value = false
      clearMediaCache()
      await loadMedia()
      return
    }
  }

  handleFiles(dataTransfer.files)
}

function handleKeyboard(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  const mod = e.metaKey || e.ctrlKey
  if (mod && e.key === 'c') {
    e.preventDefault()
    if (selectedUrls.value.size > 0) clipboardCopy()
  } else if (mod && e.key === 'x') {
    e.preventDefault()
    if (selectedUrls.value.size > 0) clipboardCut()
  } else if (mod && e.key === 'v') {
    e.preventDefault()
    if (clipboard.items.length > 0) clipboardPaste()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyboard)
  loadMedia()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard)
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
