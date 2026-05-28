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
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索产品名称..."
          class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none w-56"
          @input="onSearchInput"
        />
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
      <div v-if="allCategories.length > 1" class="flex flex-wrap gap-2">
        <button
          v-for="cat in allCategories"
          :key="cat"
          class="px-4 py-1.5 text-xs rounded-full transition-colors"
          :class="selectedCategory === cat
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-secondary hover:bg-gray-200'"
          @click="selectCategory(cat)"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Sub-category pills -->
      <div v-if="subCategories.length > 0" class="flex flex-wrap gap-2">
        <button
          v-for="sub in subCategories"
          :key="sub"
          class="px-3 py-1 text-xs rounded-full transition-colors"
          :class="selectedSubCategory === sub
            ? 'bg-accent text-white'
            : 'bg-gray-50 text-secondary hover:bg-gray-100'"
          @click="selectSubCategory(sub)"
        >
          {{ sub }}
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">媒体</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">名称</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">分类</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">价格</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">状态</th>
            <th class="text-right px-6 py-3 text-xs font-medium text-secondary">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id" class="border-b border-gray-50 hover:bg-gray-50/50">
            <td class="px-6 py-3">
              <VideoThumbnail
                v-if="isVideoUrl(getFirstMedia(product))"
                :src="getFirstMedia(product)"
                container-class="w-16 h-12"
              />
              <img v-else :src="getFirstMedia(product)" class="w-16 h-12 object-cover rounded" />
            </td>
            <td class="px-6 py-3">
              <div class="text-sm text-primary">{{ product.name }}</div>
              <div v-if="product.is_featured" class="text-xs text-accent">推荐</div>
            </td>
            <td class="px-6 py-3 text-sm text-secondary">{{ product.category }}{{ product.sub_category ? ' / ' + product.sub_category : '' }}</td>
            <td class="px-6 py-3 text-sm text-primary">&yen;{{ Number(product.price).toLocaleString() }}</td>
            <td class="px-6 py-3">
              <span class="text-xs px-2 py-1 rounded-full" :class="product.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'">
                {{ product.is_active ? '上架' : '下架' }}
              </span>
            </td>
            <td class="px-6 py-3 text-right space-x-3">
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { authFetch } = useAuth()
const products = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const copying = ref<number | null>(null)

const PAGESIZE_KEY = 'admin-products-pagesize'
const pageSize = ref(20)
if (import.meta.client) {
  const saved = localStorage.getItem(PAGESIZE_KEY)
  if (saved) pageSize.value = Number(saved) || 20
}
watch(pageSize, (v) => {
  if (import.meta.client) localStorage.setItem(PAGESIZE_KEY, String(v))
})

const searchQuery = ref('')
const allCategories = ref<string[]>([])
const categorySubMap = ref<Record<string, string[]>>({})
const selectedCategory = ref('全部')
const selectedSubCategory = ref('全部')

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
  const subs = categorySubMap.value[selectedCategory.value] || []
  return subs.length > 0 ? ['全部', ...subs] : []
})

function getFirstMedia(product: any) {
  try {
    const images = JSON.parse(product.images_json || '[]')
    return images[0] || 'https://via.placeholder.com/100x75'
  } catch {
    return 'https://via.placeholder.com/100x75'
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadProducts()
  }, 300)
}

function selectCategory(cat: string) {
  selectedCategory.value = cat
  selectedSubCategory.value = '全部'
  currentPage.value = 1
  loadProducts()
}

function selectSubCategory(sub: string) {
  selectedSubCategory.value = sub
  currentPage.value = 1
  loadProducts()
}

async function loadProducts() {
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
  const data = await $fetch<any>('/api/products', { query })
  products.value = data.items || []
  total.value = data.total || 0
}

async function loadCategories() {
  const data = await $fetch<any>('/api/products', { query: { limit: 9999 } })
  const items = data.items || []
  const cats = new Set<string>()
  const map: Record<string, Set<string>> = {}
  for (const p of items) {
    if (p.category) {
      cats.add(p.category)
      if (!map[p.category]) map[p.category] = new Set()
      if (p.sub_category) map[p.category].add(p.sub_category)
    }
  }
  allCategories.value = ['全部', ...cats]
  categorySubMap.value = Object.fromEntries(
    Object.entries(map).map(([k, v]) => [k, [...v]])
  )
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
  await loadProducts()
  await loadCategories()
}

watch(currentPage, () => {
  loadProducts()
})

onMounted(async () => {
  await Promise.all([loadProducts(), loadCategories()])
})
</script>
