<template>
  <view class="home-products">
    <view class="container">
      <section-title :title="title" :subtitle="subtitle" />

      <view class="grid" :style="gridStyle">
        <product-card
          v-for="p in products"
          :key="p._id || p.id"
          :product="p"
          :show-price="showPrice"
          :thumb-bg="thumbBg"
        />
      </view>

      <view class="more">
        <text class="more-link" @tap="goAll">查看全部产品 →</text>
      </view>
    </view>
  </view>
</template>

<script>
import { cloud } from '@/utils/cloud.js'
import { getShowPrice, getProductThumbBg } from '@/utils/site-settings.js'
import ProductCard from '@/components/product-card/product-card.vue'
import SectionTitle from '@/components/section-title/section-title.vue'

export default {
  components: { ProductCard, SectionTitle },
  props: {
    title: { type: String, default: '甄选系列' },
    subtitle: { type: String, default: '每一副，都是对极简美学的致敬' },
    perRow: { type: Number, default: 3 },
    rows: { type: Number, default: 1 },
  },
  data () {
    return {
      products: [],
      showPrice: true,
      thumbBg: { color: '#ffffff', opacity: 100 },
    }
  },
  computed: {
    limit () { return Math.max(1, (this.rows || 1) * (this.perRow || 3)) },
    gridStyle () {
      return { 'grid-template-columns': `repeat(${this.perRow}, minmax(0, 1fr))` }
    },
  },
  async created () {
    const [list, showPrice, thumbBg] = await Promise.all([
      cloud.products.list({ featured: 'true', active_only: 'true', limit: this.limit }).catch(() => ({ items: [] })),
      getShowPrice(),
      getProductThumbBg(),
    ])
    this.products = list?.items || []
    this.showPrice = showPrice
    this.thumbBg = thumbBg
  },
  methods: {
    goAll () { uni.navigateTo({ url: '/pages/products/index' }) },
  },
}
</script>

<style>
.home-products { padding: 96px 0; background: #fff; }
.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.grid { display: grid; gap: 32px; }
.more { text-align: center; margin-top: 48px; }
.more-link { font-size: 14px; color: #6b7280; }

@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr !important; }
}
</style>
