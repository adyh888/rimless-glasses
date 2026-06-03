<template>
  <section class="py-24 md:py-32 bg-white">
    <div class="max-w-7xl mx-auto px-6">
      <ScrollReveal>
        <SectionTitle :title="title" :subtitle="subtitle" />
      </ScrollReveal>

      <div class="grid gap-8" :class="gridColsClass">
        <ScrollReveal
          v-for="(product, idx) in featuredProducts"
          :key="product.id"
          :delay="idx * 100"
        >
          <ProductCard :product="product" :show-price="showPrice" :thumb-bg="thumbBg" />
        </ScrollReveal>
      </div>

      <ScrollReveal :delay="400" class="text-center mt-12">
        <NuxtLink
          to="/products"
          class="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary link-underline transition-colors"
        >
          查看全部产品
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
      </ScrollReveal>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  subtitle: string
  perRow: number
  rows: number
}>(), {
  title: '甄选系列',
  subtitle: '每一副，都是对极简美学的致敬',
  perRow: 3,
  rows: 1,
})

// 计算实际显示数量 = 行数 × 每行显示数
const limit = computed(() => props.rows * props.perRow)

const { data: productsData } = await useFetch('/api/products', {
  query: computed(() => ({ featured: 'true', active_only: 'true', limit: limit.value })),
  lazy: true,
})
const featuredProducts = computed(() => (productsData.value as any)?.items || [])

const showPriceRef = useShowPrice()
const showPrice = computed(() => showPriceRef.value)
const thumbBgRef = useProductThumbBg()
const thumbBg = computed(() => thumbBgRef.value)

const gridColsClass = computed(() => {
  const cols = props.perRow
  return `grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols}`
})
</script>
