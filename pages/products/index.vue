<template>
  <site-layout>
    <view class="hero">
      <view class="hero-inner">
        <text class="page-title">{{ pageTitle }}</text>
        <text class="page-subtitle">{{ pageSubtitle }}</text>
      </view>
    </view>

    <view class="filter">
      <view class="filter-inner">
        <view class="cats">
          <text
            v-for="cat in categories"
            :key="cat"
            class="cat-btn"
            :class="{ active: selectedCategory === cat }"
            @tap="onSelectCategory(cat)"
          >{{ cat }}</text>
        </view>
        <view v-if="subCategories.length" class="subs">
          <text
            v-for="sub in subCategories"
            :key="sub"
            class="sub-btn"
            :class="{ active: selectedSubCategory === sub }"
            @tap="onSelectSub(sub)"
          >{{ sub }}</text>
        </view>
      </view>
    </view>

    <view class="grid-section">
      <view class="grid-inner">
        <view v-if="filteredProducts.length" class="grid" :style="gridStyle">
          <product-card
            v-for="p in filteredProducts"
            :key="p._id || p.id"
            :product="p"
            :show-price="showPrice"
            :thumb-bg="thumbBg"
          />
        </view>
        <view v-else class="empty">暂无相关产品</view>
      </view>
    </view>
  </site-layout>
</template>

<script>
import SiteLayout from '@/components/site-layout/site-layout.vue'
import ProductCard from '@/components/product-card/product-card.vue'
import { cloud } from '@/utils/cloud.js'
import {
  getNavItems, getShowPrice, getProductThumbBg,
  getProductCategoryOrder, getProductSubcategoryOrder, getProductsPerRow,
} from '@/utils/site-settings.js'

export default {
  components: { SiteLayout, ProductCard },
  data () {
    return {
      allProducts: [],
      navItems: [],
      showPrice: true,
      thumbBg: { color: '#ffffff', opacity: 100 },
      catOrder: [],
      subOrder: {},
      perRow: 3,
      selectedCategory: '全部',
      selectedSubCategory: '全部',
    }
  },
  computed: {
    navItem () { return this.navItems.find(n => n.path === '/products') },
    pageTitle () { return this.navItem?.label || '产品中心' },
    pageSubtitle () { return this.navItem?.subtitle || '每一副无框眼镜，都是对极简美学的极致诠释' },
    categories () {
      const raw = [...new Set(this.allProducts.map(p => p.category).filter(Boolean))]
      const sorted = (this.catOrder || []).filter(c => raw.includes(c))
      const rest = raw.filter(c => !sorted.includes(c))
      return ['全部', ...sorted, ...rest]
    },
    subCategories () {
      let products = this.allProducts
      if (this.selectedCategory !== '全部') {
        products = products.filter(p => p.category === this.selectedCategory)
      }
      const raw = [...new Set(products.map(p => p.sub_category).filter(Boolean))]
      if (!raw.length) return []
      const order = (this.subOrder && this.subOrder[this.selectedCategory]) || []
      const sorted = order.filter(s => raw.includes(s))
      const rest = raw.filter(s => !sorted.includes(s))
      return ['全部', ...sorted, ...rest]
    },
    filteredProducts () {
      let result = this.allProducts
      if (this.selectedCategory !== '全部') result = result.filter(p => p.category === this.selectedCategory)
      if (this.selectedSubCategory !== '全部') result = result.filter(p => p.sub_category === this.selectedSubCategory)
      return result
    },
    gridStyle () {
      return { 'grid-template-columns': `repeat(${this.perRow}, minmax(0, 1fr))` }
    },
  },
  onLoad (q) {
    if (q && q.category) this.selectedCategory = q.category
    this.load()
  },
  methods: {
    async load () {
      const [data, navItems, catOrder, subOrder, perRow, showPrice, thumbBg] = await Promise.all([
        cloud.products.list({ active_only: 'true', limit: 50 }).catch(() => ({ items: [] })),
        getNavItems(),
        getProductCategoryOrder(),
        getProductSubcategoryOrder(),
        getProductsPerRow(),
        getShowPrice(),
        getProductThumbBg(),
      ])
      this.allProducts = data?.items || []
      this.navItems = navItems
      this.catOrder = catOrder
      this.subOrder = subOrder
      this.perRow = perRow
      this.showPrice = showPrice
      this.thumbBg = thumbBg
    },
    onSelectCategory (cat) {
      this.selectedCategory = cat
      this.selectedSubCategory = '全部'
    },
    onSelectSub (sub) {
      this.selectedSubCategory = sub
    },
  },
}
</script>

<style>
page { background: #fff; }
.hero { background: #f7f6f3; padding: 128px 0 64px; }
.hero-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; text-align: center; display: flex; flex-direction: column; gap: 16px; align-items: center; }
.page-title { font-size: 44px; font-weight: 300; letter-spacing: -0.5px; color: #1f2937; }
.page-subtitle { font-size: 14px; color: #6b7280; }

.filter { background: #fff; border-bottom: 1px solid #f3f4f6; padding: 32px 0; }
.filter-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; gap: 16px; align-items: center; }
.cats { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.cat-btn { padding: 8px 20px; font-size: 13px; border-radius: 999px; background: #f7f6f3; color: #6b7280; }
.cat-btn.active { background: #1f2937; color: #fff; }
.subs { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.sub-btn { padding: 6px 16px; font-size: 12px; border-radius: 999px; background: #f3f4f6; color: #6b7280; }
.sub-btn.active { background: #c8a464; color: #fff; }

.grid-section { background: #fff; padding: 64px 0; }
.grid-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.grid { display: grid; gap: 32px; }
.empty { text-align: center; padding: 80px 0; color: #6b7280; font-size: 14px; }

@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr !important; }
  .page-title { font-size: 28px; }
  .hero { padding: 96px 0 48px; }
}
</style>
