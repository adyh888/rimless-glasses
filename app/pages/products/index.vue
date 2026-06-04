<template>
  <div>
    <!-- Page Hero -->
    <section class="pt-32 pb-16 bg-surface">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <h1 class="text-4xl md:text-5xl font-light tracking-tight text-primary">{{ pageTitle }}</h1>
        <p class="mt-4 text-secondary">{{ pageSubtitle }}</p>
      </div>
    </section>

    <!-- Filter -->
    <section class="py-8 bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-6 flex flex-wrap gap-3 justify-center">
        <button
          v-for="cat in categories"
          :key="cat"
          class="px-5 py-2 text-sm rounded-full transition-all duration-300"
          :class="selectedCategory === cat
            ? 'bg-primary text-white'
            : 'bg-surface text-secondary hover:bg-gray-200'"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
      <!-- Sub-category filter -->
      <div v-if="subCategories.length" class="max-w-7xl mx-auto px-6 flex flex-wrap gap-2 justify-center mt-4">
        <button
          v-for="sub in subCategories"
          :key="sub"
          class="px-4 py-1.5 text-xs rounded-full transition-all duration-300"
          :class="selectedSubCategory === sub
            ? 'bg-accent text-white'
            : 'bg-gray-100 text-secondary hover:bg-gray-200'"
          @click="selectedSubCategory = sub"
        >
          {{ sub }}
        </button>
      </div>
    </section>

    <!-- Products Grid -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div v-if="pending && !allProducts.length" class="grid gap-8" :class="gridColClass">
          <div
            v-for="n in productsPerRow * 2"
            :key="n"
            class="rounded-2xl overflow-hidden"
          >
            <div class="aspect-square bg-surface skeleton-shimmer" />
            <div class="mt-4 h-4 bg-surface rounded skeleton-shimmer w-3/4" />
            <div class="mt-2 h-3 bg-surface rounded skeleton-shimmer w-1/2" />
          </div>
        </div>
        <div v-else-if="filteredProducts.length" class="grid gap-8" :class="gridColClass">
          <ScrollReveal
            v-for="(product, idx) in filteredProducts"
            :key="product.id"
            :delay="idx * 80"
          >
            <ProductCard :product="product" :show-price="showPrice" :thumb-bg="thumbBg" />
          </ScrollReveal>
        </div>
        <div v-else class="text-center py-20 text-secondary">
          暂无相关产品
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const navRef = useNavItems()
const navItem = computed(() => navRef.value.find(n => n.path === '/products'))
const pageTitle = computed(() => navItem.value?.label || '产品中心')
const pageSubtitle = computed(() => navItem.value?.subtitle || '每一副无框眼镜，都是对极简美学的极致诠释')

const { data, pending } = await useFetch('/api/products', {
  query: { active_only: 'true', limit: 50 },
  lazy: true,
})

const catOrderRef = useProductCategoryOrder()
const subOrderRef = useProductSubcategoryOrder()
const productsPerRowRef = useProductsPerRow()

const showPriceRef = useShowPrice()
const showPrice = computed(() => showPriceRef.value)
const thumbBgRef = useProductThumbBg()
const thumbBg = computed(() => thumbBgRef.value)

const productsPerRow = computed(() => productsPerRowRef.value)

const gridColClass = computed(() => {
  const map: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  }
  return map[productsPerRow.value] || map[3]
})

const allProducts = computed(() => (data.value as any)?.items || [])

const categories = computed(() => {
  const rawCats = [...new Set(allProducts.value.map((p: any) => p.category).filter(Boolean))] as string[]
  const savedOrder = catOrderRef.value
  const sorted = savedOrder.filter((c: string) => rawCats.includes(c))
  const rest = rawCats.filter((c: string) => !sorted.includes(c))
  return ['全部', ...sorted, ...rest]
})

const route = useRoute()

const selectedCategory = ref('全部')
const selectedSubCategory = ref('全部')

// 从 query 参数初始化分类（SSR 安全）
if (route.query.category && typeof route.query.category === 'string') {
  selectedCategory.value = route.query.category
}

// 客户端：如果没有 query 参数，从 sessionStorage 恢复
onMounted(() => {
  if (!route.query.category) {
    const savedCat = sessionStorage.getItem('products-category')
    const savedSub = sessionStorage.getItem('products-subcategory')
    if (savedCat) selectedCategory.value = savedCat
    if (savedSub) selectedSubCategory.value = savedSub
  }
})

const subCategories = computed(() => {
  let products = allProducts.value
  if (selectedCategory.value !== '全部') {
    products = products.filter((p: any) => p.category === selectedCategory.value)
  }
  const rawSubs = [...new Set(products.map((p: any) => p.sub_category).filter(Boolean))] as string[]
  if (rawSubs.length === 0) return []

  const savedSubOrder = subOrderRef.value
  const catOrder = savedSubOrder[selectedCategory.value] || []
  const sorted = catOrder.filter((s: string) => rawSubs.includes(s))
  const rest = rawSubs.filter((s: string) => !sorted.includes(s))
  return ['全部', ...sorted, ...rest]
})

watch(selectedCategory, (v) => {
  selectedSubCategory.value = '全部'
  if (import.meta.client) {
    sessionStorage.setItem('products-category', v)
    sessionStorage.setItem('products-subcategory', '全部')
  }
})

watch(selectedSubCategory, (v) => {
  if (import.meta.client) {
    sessionStorage.setItem('products-subcategory', v)
  }
})

watch(() => route.query.category, (cat) => {
  if (cat && typeof cat === 'string') {
    selectedCategory.value = cat
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const filteredProducts = computed(() => {
  let result = allProducts.value
  if (selectedCategory.value !== '全部') {
    result = result.filter((p: any) => p.category === selectedCategory.value)
  }
  if (selectedSubCategory.value !== '全部') {
    result = result.filter((p: any) => p.sub_category === selectedSubCategory.value)
  }
  return result
})
</script>
