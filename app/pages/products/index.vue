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
        <div v-if="filteredProducts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <ScrollReveal
            v-for="(product, idx) in filteredProducts"
            :key="product.id"
            :delay="idx * 80"
          >
            <ProductCard :product="product" />
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
const navRef = await useNavItems()
const navItem = computed(() => navRef.value.find(n => n.path === '/products'))
const pageTitle = computed(() => navItem.value?.label || '产品中心')
const pageSubtitle = computed(() => navItem.value?.subtitle || '每一副无框眼镜，都是对极简美学的极致诠释')

const { data } = await useFetch('/api/products', {
  query: { active_only: 'true', limit: 50 },
})

const allProducts = computed(() => (data.value as any)?.items || [])

const categories = computed(() => {
  const cats = ['全部', ...new Set(allProducts.value.map((p: any) => p.category).filter(Boolean))]
  return cats
})

const selectedCategory = ref('全部')
const selectedSubCategory = ref('全部')

const subCategories = computed(() => {
  let products = allProducts.value
  if (selectedCategory.value !== '全部') {
    products = products.filter((p: any) => p.category === selectedCategory.value)
  }
  const subs = [...new Set(products.map((p: any) => p.sub_category).filter(Boolean))]
  return subs.length > 0 ? ['全部', ...subs] : []
})

watch(selectedCategory, () => {
  selectedSubCategory.value = '全部'
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
