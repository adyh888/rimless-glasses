<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-light text-primary">产品管理</h1>
      <NuxtLink to="/admin/products/new" class="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all">
        + 新增产品
      </NuxtLink>
    </div>

    <!-- Search & Filters Toolbar -->
    <div class="space-y-3 mb-6">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索产品名称..."
            class="px-3 py-1.5 pr-7 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none w-56"
            @input="onSearchInput"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''; currentPage = 1; loadProducts()"
            class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >&times;</button>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs text-secondary">状态</label>
          <select
            v-model="selectedStatus"
            class="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:border-accent focus:outline-none bg-white"
            @change="currentPage = 1; clearCache(); loadProducts()"
          >
            <option value="all">全部</option>
            <option value="active">上架</option>
            <option value="inactive">下架</option>
          </select>
        </div>
        <div class="flex-1" />
        <div class="flex items-center gap-2">
          <label class="text-xs text-secondary">每页</label>
          <select
            v-model.number="pageSize"
            class="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:border-accent focus:outline-none bg-white"
            @change="currentPage = 1; loadProducts()"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
        <span class="text-xs text-secondary">共 {{ total }} 项</span>
      </div>

      <!-- Category pills -->
      <div v-if="allCategories.length > 1" class="flex flex-wrap gap-2 items-center">
        <button
          class="px-4 py-1.5 text-xs rounded-full transition-colors"
          :class="selectedCategory === '全部'
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-secondary hover:bg-gray-200'"
          @click="selectCategory('全部')"
        >
          全部
        </button>
        <button
          v-for="(cat, idx) in draggableCategories"
          :key="cat"
          draggable="true"
          class="px-4 py-1.5 text-xs rounded-full transition-colors cursor-grab active:cursor-grabbing select-none"
          :class="[
            selectedCategory === cat
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-secondary hover:bg-gray-200',
            catDragIdx === idx ? 'opacity-50 ring-2 ring-accent' : '',
            catDragOverIdx === idx && catDragIdx !== idx ? 'ring-2 ring-gray-300' : '',
          ]"
          @click="selectCategory(cat)"
          @dragstart="catDragIdx = idx"
          @dragover.prevent="catDragOverIdx = idx"
          @drop.prevent="onCatDrop"
          @dragend="catDragIdx = -1; catDragOverIdx = -1"
        >
          {{ cat }}
        </button>
        <span v-if="draggableCategories.length > 1" class="text-[10px] text-gray-300 ml-1">拖拽排序</span>
      </div>

      <!-- Sub-category pills -->
      <div v-if="subCategories.length > 0" class="flex flex-wrap gap-2 items-center">
        <button
          class="px-3 py-1 text-xs rounded-full transition-colors"
          :class="selectedSubCategory === '全部'
            ? 'bg-accent text-white'
            : 'bg-gray-50 text-secondary hover:bg-gray-100'"
          @click="selectSubCategory('全部')"
        >
          全部
        </button>
        <button
          v-for="(sub, idx) in draggableSubCategories"
          :key="sub"
          draggable="true"
          class="px-3 py-1 text-xs rounded-full transition-colors cursor-grab active:cursor-grabbing select-none"
          :class="[
            selectedSubCategory === sub
              ? 'bg-accent text-white'
              : 'bg-gray-50 text-secondary hover:bg-gray-100',
            subDragIdx === idx ? 'opacity-50 ring-2 ring-accent' : '',
            subDragOverIdx === idx && subDragIdx !== idx ? 'ring-2 ring-gray-300' : '',
          ]"
          @click="selectSubCategory(sub)"
          @dragstart="subDragIdx = idx"
          @dragover.prevent="subDragOverIdx = idx"
          @drop.prevent="onSubDrop"
          @dragend="subDragIdx = -1; subDragOverIdx = -1"
        >
          {{ sub }}
        </button>
        <span v-if="draggableSubCategories.length > 1" class="text-[10px] text-gray-300 ml-1">拖拽排序</span>
      </div>
    </div>

    <!-- Batch actions toolbar -->
    <div v-if="selectedIds.size > 0" class="flex items-center gap-3 mb-4 flex-wrap">
      <span class="text-sm text-secondary">已选 {{ selectedIds.size }} 项</span>
      <button
        @click="batchAction('set_active')"
        :disabled="batchProcessing"
        class="px-3 py-1.5 text-sm text-green-600 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-all disabled:opacity-50"
      >批量上架</button>
      <button
        @click="batchAction('set_inactive')"
        :disabled="batchProcessing"
        class="px-3 py-1.5 text-sm text-orange-600 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all disabled:opacity-50"
      >批量下架</button>
      <button
        @click="showBatchPrice = true"
        :disabled="batchProcessing"
        class="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-50"
      >批量定价</button>
      <button
        @click="showBatchCategory = true"
        :disabled="batchProcessing"
        class="px-3 py-1.5 text-sm text-purple-600 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all disabled:opacity-50"
      >批量分类</button>
      <button
        @click="batchAction('delete')"
        :disabled="batchProcessing"
        class="px-3 py-1.5 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50"
      >批量删除</button>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="w-10 px-4 py-3">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isPartialSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 text-accent rounded cursor-pointer"
              />
            </th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">媒体</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">名称</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">分类</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">价格</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">排序</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">状态</th>
            <th class="text-right px-6 py-3 text-xs font-medium text-secondary">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in products"
            :key="product.id"
            class="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
            @click="goToProduct(product)"
          >
            <td class="w-10 px-4 py-3" @click.stop>
              <input
                type="checkbox"
                :checked="selectedIds.has(product.id)"
                @change="toggleSelect(product.id)"
                class="w-4 h-4 text-accent rounded cursor-pointer"
              />
            </td>
            <td class="px-6 py-3" @click.stop>
              <div class="cursor-pointer" @click="openPreview(product)">
                <VideoThumbnail
                  v-if="isVideoUrl(getFirstMedia(product))"
                  :src="getFirstMedia(product)"
                  container-class="w-16 h-12"
                />
                <img v-else :src="getFirstMedia(product)" class="w-16 h-12 object-contain bg-gray-50 rounded hover:opacity-80 transition-opacity" />
              </div>
            </td>
            <td class="px-6 py-3" @click.stop>
              <template v-if="editingName === product.id">
                <input
                  v-model="editNameValue"
                  type="text"
                  class="w-full px-2 py-1 border border-accent rounded text-sm focus:outline-none"
                  @keyup.enter="saveInlineName(product)"
                  @keyup.esc="editingName = null"
                  @blur="saveInlineName(product)"
                  ref="nameInputRef"
                />
              </template>
              <template v-else>
                <button
                  @click="startEditName(product)"
                  class="text-sm text-primary hover:text-accent transition-colors text-left"
                  title="点击编辑名称"
                >{{ product.name }}</button>
                <div v-if="product.is_featured" class="text-xs text-accent">推荐</div>
              </template>
            </td>
            <td class="px-6 py-3 text-sm text-secondary">{{ product.category }}{{ product.sub_category ? ' / ' + product.sub_category : '' }}</td>
            <td class="px-6 py-3" @click.stop>
              <template v-if="editingPrice === product.id">
                <input
                  v-model.number="editPriceValue"
                  type="number"
                  min="0"
                  class="w-24 px-2 py-1 border border-accent rounded text-sm focus:outline-none"
                  @keyup.enter="saveInlinePrice(product)"
                  @keyup.esc="editingPrice = null"
                  @blur="saveInlinePrice(product)"
                  ref="priceInputRef"
                />
              </template>
              <template v-else>
                <button
                  @click="startEditPrice(product)"
                  class="text-sm text-primary hover:text-accent transition-colors"
                  title="点击编辑价格"
                >&yen;{{ Number(product.price).toLocaleString() }}</button>
              </template>
            </td>
            <td class="px-6 py-3" @click.stop>
              <template v-if="editingSortOrder === product.id">
                <input
                  v-model.number="editSortOrderValue"
                  type="number"
                  min="0"
                  class="w-20 px-2 py-1 border border-accent rounded text-sm focus:outline-none"
                  @keyup.enter="saveInlineSortOrder(product)"
                  @keyup.esc="editingSortOrder = null"
                  @blur="saveInlineSortOrder(product)"
                  ref="sortOrderInputRef"
                />
              </template>
              <template v-else>
                <button
                  @click="startEditSortOrder(product)"
                  class="text-sm text-secondary hover:text-accent transition-colors"
                  title="点击编辑排序"
                >{{ product.sort_order || 0 }}</button>
              </template>
            </td>
            <td class="px-6 py-3" @click.stop>
              <button
                @click="toggleStatus(product)"
                :disabled="togglingId === product.id"
                class="text-xs px-2 py-1 rounded-full cursor-pointer transition-all"
                :class="product.is_active ? 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'"
              >
                {{ togglingId === product.id ? '切换中...' : (product.is_active ? '上架' : '下架') }}
              </button>
            </td>
            <td class="px-6 py-3 text-right space-x-3" @click.stop>
              <NuxtLink :to="`/admin/products/${product.id}`" class="text-xs text-accent hover:underline">编辑</NuxtLink>
              <button
                @click="copyProduct(product)"
                :disabled="copying === product.id"
                class="text-xs text-blue-500 hover:underline disabled:opacity-50"
              >{{ copying === product.id ? '复制中...' : '复制' }}</button>
              <button @click="deleteProduct(product.id)" class="text-xs text-red-500 hover:underline">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!products.length" class="text-center py-12 text-secondary text-sm">暂无数据</div>
    </div>

    <!-- Batch Price Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showBatchPrice"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          @click.self="showBatchPrice = false"
        >
          <div class="bg-white rounded-xl shadow-2xl w-[90vw] max-w-sm p-6" @click.stop>
            <h3 class="text-base font-medium text-primary mb-4">批量设置价格</h3>
            <p class="text-xs text-secondary mb-3">将为选中的 {{ selectedIds.size }} 个产品设置统一价格</p>
            <input
              v-model.number="batchPriceValue"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
              placeholder="输入价格"
            />
            <div class="flex gap-3 mt-4">
              <button
                @click="confirmBatchPrice"
                :disabled="batchProcessing"
                class="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >确定</button>
              <button @click="showBatchPrice = false" class="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">取消</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Batch Category Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showBatchCategory"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          @click.self="showBatchCategory = false"
        >
          <div class="bg-white rounded-xl shadow-2xl w-[90vw] max-w-sm p-6" @click.stop>
            <h3 class="text-base font-medium text-primary mb-4">批量设置分类</h3>
            <p class="text-xs text-secondary mb-3">将为选中的 {{ selectedIds.size }} 个产品设置分类</p>
            <input
              v-model="batchCategoryValue"
              type="text"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
              placeholder="分类名称（用 / 分隔子分类，如：太阳镜/偏光）"
            />
            <div v-if="draggableCategories.length" class="mt-2 flex flex-wrap gap-1">
              <button
                v-for="cat in draggableCategories"
                :key="cat"
                type="button"
                @click="batchCategoryValue = cat"
                class="px-2 py-0.5 text-xs bg-gray-100 rounded hover:bg-gray-200 text-secondary"
              >{{ cat }}</button>
            </div>
            <div class="flex gap-3 mt-4">
              <button
                @click="confirmBatchCategory"
                :disabled="batchProcessing || !batchCategoryValue.trim()"
                class="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >确定</button>
              <button @click="showBatchCategory = false" class="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">取消</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-6">
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

    <!-- Media Preview Lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="preview.show"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
          @click.self="preview.show = false"
          @keydown.esc="preview.show = false"
          @keydown.left.prevent="previewPrev"
          @keydown.right.prevent="previewNext"
          tabindex="0"
          ref="previewOverlayRef"
        >
          <button
            @click="preview.show = false"
            class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white text-3xl z-10"
          >&times;</button>
          <button
            v-if="preview.index > 0"
            @click.stop="previewPrev"
            class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors z-10"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button
            v-if="preview.index < preview.items.length - 1"
            @click.stop="previewNext"
            class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors z-10"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
          <div class="text-center" @click.stop>
            <video
              v-if="isVideoUrl(preview.items[preview.index])"
              :key="preview.items[preview.index]"
              :src="preview.items[preview.index]"
              controls
              autoplay
              class="max-w-[90vw] max-h-[80vh] rounded-lg"
            />
            <img
              v-else
              :key="preview.items[preview.index]"
              :src="preview.items[preview.index]"
              class="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
            />
            <p class="mt-3 text-white/70 text-sm">{{ preview.index + 1 }} / {{ preview.items.length }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { authFetch } = useAuth()
const products = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const copying = ref<number | null>(null)
const togglingId = ref<number | null>(null)
const previewOverlayRef = ref<HTMLElement>()
const preview = reactive({ show: false, items: [] as string[], index: 0 })

const selectedIds = ref(new Set<number>())
const batchProcessing = ref(false)
const showBatchPrice = ref(false)
const batchPriceValue = ref(0)
const showBatchCategory = ref(false)
const batchCategoryValue = ref('')

const editingName = ref<number | null>(null)
const editNameValue = ref('')
const nameInputRef = ref<HTMLInputElement>()
const editingPrice = ref<number | null>(null)
const editPriceValue = ref(0)
const priceInputRef = ref<HTMLInputElement>()
const editingSortOrder = ref<number | null>(null)
const editSortOrderValue = ref(0)
const sortOrderInputRef = ref<HTMLInputElement>()

const isAllSelected = computed(() =>
  products.value.length > 0 && products.value.every(p => selectedIds.value.has(p.id))
)
const isPartialSelected = computed(() =>
  !isAllSelected.value && products.value.some(p => selectedIds.value.has(p.id))
)

function toggleSelect(id: number) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedIds.value = s
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(products.value.map(p => p.id))
  }
}

function goToProduct(product: any) {
  window.open(`/products/${product.slug}`, '_blank')
}

function startEditName(product: any) {
  editingName.value = product.id
  editNameValue.value = product.name
  nextTick(() => nameInputRef.value?.focus())
}

async function saveInlineName(product: any) {
  if (editingName.value !== product.id) return
  editingName.value = null
  const newName = editNameValue.value.trim()
  if (!newName || newName === product.name) return
  try {
    await authFetch(`/api/products/${product.id}`, {
      method: 'PUT',
      body: { ...product, name: newName, images: getAllMedia(product), specs: JSON.parse(product.specs_json || '{}') },
    })
    product.name = newName
    clearCache()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '修改失败')
  }
}

function startEditPrice(product: any) {
  editingPrice.value = product.id
  editPriceValue.value = Number(product.price)
  nextTick(() => priceInputRef.value?.focus())
}

async function saveInlinePrice(product: any) {
  if (editingPrice.value !== product.id) return
  editingPrice.value = null
  const newPrice = editPriceValue.value
  if (newPrice === Number(product.price)) return
  try {
    await authFetch(`/api/products/${product.id}`, {
      method: 'PUT',
      body: { ...product, price: newPrice, images: getAllMedia(product), specs: JSON.parse(product.specs_json || '{}') },
    })
    product.price = newPrice
    clearCache()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '修改失败')
  }
}

function startEditSortOrder(product: any) {
  editingSortOrder.value = product.id
  editSortOrderValue.value = Number(product.sort_order) || 0
  nextTick(() => sortOrderInputRef.value?.focus())
}

async function saveInlineSortOrder(product: any) {
  if (editingSortOrder.value !== product.id) return
  editingSortOrder.value = null
  const newSortOrder = editSortOrderValue.value
  if (newSortOrder === Number(product.sort_order)) return
  try {
    await authFetch(`/api/products/${product.id}`, {
      method: 'PUT',
      body: { ...product, sort_order: newSortOrder, images: getAllMedia(product), specs: JSON.parse(product.specs_json || '{}') },
    })
    product.sort_order = newSortOrder
    clearCache()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '修改失败')
  }
}

async function batchAction(action: string) {
  if (selectedIds.value.size === 0) return
  const actionNames: Record<string, string> = {
    delete: '删除',
    set_active: '上架',
    set_inactive: '下架',
  }
  if (!confirm(`确定要${actionNames[action] || '操作'}选中的 ${selectedIds.value.size} 个产品吗？`)) return
  batchProcessing.value = true
  try {
    await authFetch('/api/products/batch', {
      method: 'POST',
      body: { ids: Array.from(selectedIds.value), action },
    })
    selectedIds.value = new Set()
    clearCache()
    await loadProducts()
    if (action === 'delete') await loadCategories()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '操作失败')
  } finally {
    batchProcessing.value = false
  }
}

async function confirmBatchPrice() {
  batchProcessing.value = true
  try {
    await authFetch('/api/products/batch', {
      method: 'POST',
      body: { ids: Array.from(selectedIds.value), action: 'set_price', value: batchPriceValue.value },
    })
    showBatchPrice.value = false
    selectedIds.value = new Set()
    clearCache()
    await loadProducts()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '操作失败')
  } finally {
    batchProcessing.value = false
  }
}

async function confirmBatchCategory() {
  if (!batchCategoryValue.value.trim()) return
  batchProcessing.value = true
  try {
    await authFetch('/api/products/batch', {
      method: 'POST',
      body: { ids: Array.from(selectedIds.value), action: 'set_category', value: batchCategoryValue.value.trim() },
    })
    showBatchCategory.value = false
    selectedIds.value = new Set()
    clearCache()
    await Promise.all([loadProducts(), loadCategories()])
  } catch (e: any) {
    alert(e?.data?.statusMessage || '操作失败')
  } finally {
    batchProcessing.value = false
  }
}

const pageCache = new Map<string, { items: any[], total: number, timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

function getCacheKey() {
  return `${selectedCategory.value}|${selectedSubCategory.value}|${searchQuery.value}|${selectedStatus.value}|${currentPage.value}|${pageSize.value}`
}

function clearCache() {
  pageCache.clear()
}

const PAGESIZE_KEY = 'admin-products-pagesize'
const CURRENTPAGE_KEY = 'admin-products-currentpage'
const CATEGORY_KEY = 'admin-products-category'
const SUBCATEGORY_KEY = 'admin-products-subcategory'
const pageSize = ref(20)

if (import.meta.client) {
  const savedSize = localStorage.getItem(PAGESIZE_KEY)
  const savedPage = localStorage.getItem(CURRENTPAGE_KEY)
  if (savedSize) pageSize.value = Number(savedSize) || 20
  if (savedPage) currentPage.value = Number(savedPage) || 1
}

watch(pageSize, (v) => {
  if (import.meta.client) localStorage.setItem(PAGESIZE_KEY, String(v))
  clearCache()
})

watch(currentPage, (v) => {
  if (import.meta.client) localStorage.setItem(CURRENTPAGE_KEY, String(v))
  loadProducts()
})

const searchQuery = ref('')
const selectedStatus = ref('all')
const allCategories = ref<string[]>([])
const draggableCategories = ref<string[]>([])
const categorySubMap = ref<Record<string, string[]>>({})
const draggableSubCategories = ref<string[]>([])
const selectedCategory = ref('全部')
const selectedSubCategory = ref('全部')

if (import.meta.client) {
  const savedCat = localStorage.getItem(CATEGORY_KEY)
  const savedSubCat = localStorage.getItem(SUBCATEGORY_KEY)
  if (savedCat) selectedCategory.value = savedCat
  if (savedSubCat) selectedSubCategory.value = savedSubCat
}
const catDragIdx = ref(-1)
const catDragOverIdx = ref(-1)
const subDragIdx = ref(-1)
const subDragOverIdx = ref(-1)

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

const subCategories = computed(() => {
  if (selectedCategory.value === '全部') return []
  return draggableSubCategories.value.length > 0 ? draggableSubCategories.value : []
})

function getFirstMedia(product: any) {
  try {
    const images = JSON.parse(product.images_json || '[]')
    return images[0] || 'https://via.placeholder.com/100x75'
  } catch {
    return 'https://via.placeholder.com/100x75'
  }
}

function getAllMedia(product: any): string[] {
  try {
    return JSON.parse(product.images_json || '[]')
  } catch {
    return []
  }
}

function openPreview(product: any) {
  const media = getAllMedia(product)
  if (!media.length) return
  preview.items = media
  preview.index = 0
  preview.show = true
  nextTick(() => previewOverlayRef.value?.focus())
}

function previewPrev() {
  if (preview.index > 0) preview.index--
}

function previewNext() {
  if (preview.index < preview.items.length - 1) preview.index++
}

async function toggleStatus(product: any) {
  togglingId.value = product.id
  try {
    const newStatus = product.is_active ? 0 : 1
    await authFetch(`/api/products/${product.id}`, {
      method: 'PUT',
      body: { ...product, is_active: newStatus, images: getAllMedia(product), specs: JSON.parse(product.specs_json || '{}') },
    })
    product.is_active = newStatus
    clearCache()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '切换状态失败')
  } finally {
    togglingId.value = null
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    clearCache()
    loadProducts()
  }, 300)
}

function selectCategory(cat: string) {
  selectedCategory.value = cat
  selectedSubCategory.value = '全部'
  currentPage.value = 1
  if (cat !== '全部') {
    draggableSubCategories.value = categorySubMap.value[cat] || []
  } else {
    draggableSubCategories.value = []
  }
  if (import.meta.client) {
    localStorage.setItem(CATEGORY_KEY, cat)
    localStorage.setItem(SUBCATEGORY_KEY, '全部')
  }
  clearCache()
  loadProducts()
}

function selectSubCategory(sub: string) {
  selectedSubCategory.value = sub
  currentPage.value = 1
  if (import.meta.client) localStorage.setItem(SUBCATEGORY_KEY, sub)
  clearCache()
  loadProducts()
}

async function loadProducts() {
  const cacheKey = getCacheKey()
  const cached = pageCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    products.value = cached.items
    total.value = cached.total
    selectedIds.value = new Set()
    return
  }

  const query: Record<string, any> = {
    page: currentPage.value,
    limit: pageSize.value,
  }
  if (selectedCategory.value !== '全部') {
    query.category = selectedCategory.value
  }
  if (selectedSubCategory.value !== '全部') {
    query.sub_category = selectedSubCategory.value
  }
  if (searchQuery.value.trim()) {
    query.search = searchQuery.value.trim()
  }
  if (selectedStatus.value === 'active') {
    query.is_active = 1
  } else if (selectedStatus.value === 'inactive') {
    query.is_active = 0
  }
  // 全部状态时，按上架状态排序（上架在前）
  if (selectedStatus.value === 'all') {
    query.order_by = 'is_active'
    query.order_dir = 'DESC'
  }
  const data = await $fetch<any>('/api/products', { query })
  products.value = data.items || []
  total.value = data.total || 0
  selectedIds.value = new Set()

  // 如果当前页无数据且不是第一页，自动跳转到最后一页
  if (products.value.length === 0 && currentPage.value > 1 && total.value > 0) {
    const maxPage = Math.ceil(total.value / pageSize.value)
    currentPage.value = Math.max(1, maxPage)
    return // watch 会触发重新加载
  }

  pageCache.set(cacheKey, {
    items: data.items || [],
    total: data.total || 0,
    timestamp: Date.now(),
  })
}

async function loadCategories() {
  const [prodData, orderData, subOrderData] = await Promise.all([
    $fetch<any>('/api/products', { query: { limit: 9999 } }),
    $fetch<any>('/api/content/product_category_order'),
    $fetch<any>('/api/content/product_subcategory_order'),
  ])
  const items = prodData.items || []
  const cats = new Set<string>()
  const map: Record<string, Set<string>> = {}
  for (const p of items) {
    if (p.category) {
      cats.add(p.category)
      if (!map[p.category]) map[p.category] = new Set()
      if (p.sub_category) map[p.category].add(p.sub_category)
    }
  }

  let savedOrder: string[] = []
  try { savedOrder = JSON.parse(orderData.content || '[]') } catch {}

  const allCats = [...cats]
  const sorted = savedOrder.filter(c => allCats.includes(c))
  const rest = allCats.filter(c => !sorted.includes(c))
  const ordered = [...sorted, ...rest]

  draggableCategories.value = ordered
  allCategories.value = ['全部', ...ordered]

  let savedSubOrder: Record<string, string[]> = {}
  try { savedSubOrder = JSON.parse(subOrderData.content || '{}') } catch {}

  const orderedSubMap: Record<string, string[]> = {}
  for (const [cat, subs] of Object.entries(map)) {
    const subArray = [...subs]
    const catOrder = savedSubOrder[cat] || []
    const sortedSubs = catOrder.filter(s => subArray.includes(s))
    const restSubs = subArray.filter(s => !sortedSubs.includes(s))
    orderedSubMap[cat] = [...sortedSubs, ...restSubs]
  }
  categorySubMap.value = orderedSubMap

  if (selectedCategory.value !== '全部') {
    if (ordered.includes(selectedCategory.value)) {
      draggableSubCategories.value = orderedSubMap[selectedCategory.value] || []
      if (selectedSubCategory.value !== '全部' && !draggableSubCategories.value.includes(selectedSubCategory.value)) {
        selectedSubCategory.value = '全部'
        if (import.meta.client) localStorage.setItem(SUBCATEGORY_KEY, '全部')
      }
    } else {
      selectedCategory.value = '全部'
      selectedSubCategory.value = '全部'
      draggableSubCategories.value = []
      if (import.meta.client) {
        localStorage.setItem(CATEGORY_KEY, '全部')
        localStorage.setItem(SUBCATEGORY_KEY, '全部')
      }
      await loadProducts()
    }
  }
}

async function onCatDrop() {
  if (catDragIdx.value === -1 || catDragOverIdx.value === -1 || catDragIdx.value === catDragOverIdx.value) return
  const items = [...draggableCategories.value]
  const [moved] = items.splice(catDragIdx.value, 1)
  items.splice(catDragOverIdx.value, 0, moved)
  draggableCategories.value = items
  allCategories.value = ['全部', ...items]
  catDragIdx.value = -1
  catDragOverIdx.value = -1
  await authFetch('/api/content/product_category_order', {
    method: 'PUT',
    body: { content: JSON.stringify(items) },
  })
}

async function onSubDrop() {
  if (subDragIdx.value === -1 || subDragOverIdx.value === -1 || subDragIdx.value === subDragOverIdx.value) return
  const items = [...draggableSubCategories.value]
  const [moved] = items.splice(subDragIdx.value, 1)
  items.splice(subDragOverIdx.value, 0, moved)
  draggableSubCategories.value = items
  categorySubMap.value[selectedCategory.value] = items
  subDragIdx.value = -1
  subDragOverIdx.value = -1

  let allSubOrders: Record<string, string[]> = {}
  try {
    const res = await $fetch<any>('/api/content/product_subcategory_order')
    allSubOrders = JSON.parse(res.content || '{}')
  } catch {}

  allSubOrders[selectedCategory.value] = items

  await authFetch('/api/content/product_subcategory_order', {
    method: 'PUT',
    body: { content: JSON.stringify(allSubOrders) },
  })
}

async function copyProduct(product: any) {
  if (copying.value) return
  copying.value = product.id
  try {
    const source = await $fetch<any>(`/api/products/${product.id}`)

    let images: string[] = []
    try { images = JSON.parse(source.images_json || '[]') } catch {}

    let specs: Record<string, string> = {}
    try { specs = JSON.parse(source.specs_json || '{}') } catch {}

    const body = {
      name: `${source.name}（副本）`,
      slug: `product-copy-${Date.now()}`,
      category: source.category || '',
      sub_category: source.sub_category || '',
      price: source.price || 0,
      sort_order: source.sort_order || 0,
      is_featured: source.is_featured || 0,
      is_active: 0,
      images,
      description: source.description || '',
      specs,
    }

    await authFetch('/api/products', { method: 'POST', body })
    clearCache()
    await loadProducts()
    await loadCategories()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '复制失败')
  } finally {
    copying.value = null
  }
}

async function deleteProduct(id: number) {
  if (!confirm('确定要删除这个产品吗？')) return
  await authFetch(`/api/products/${id}`, { method: 'DELETE' })
  clearCache()
  await loadProducts()
  await loadCategories()
}

onMounted(async () => {
  await Promise.all([loadProducts(), loadCategories()])
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
