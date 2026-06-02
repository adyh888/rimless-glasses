<template>
  <site-layout :no-top-padding="firstIsBanner">
    <template v-for="block in visibleBlocks" :key="block.id">
      <home-banner v-if="block.type === 'banner'" />

      <home-products
        v-else-if="block.type === 'products'"
        :title="block.title || '甄选系列'"
        :subtitle="block.subtitle || '每一副，都是对极简美学的致敬'"
        :per-row="block.perRow || 3"
        :rows="block.rows || (block.limit ? Math.ceil(block.limit / 3) : 1)"
      />

      <home-image-text
        v-else-if="block.type === 'image_text'"
        :label="block.label || ''"
        :heading="block.heading || ''"
        :description="block.description || ''"
        :image="block.image || ''"
        :link-text="block.link_text || ''"
        :link-url="block.link_url || ''"
        :image-position="block.image_position || 'left'"
        :bg-color="block.bg_color || 'white'"
      />

      <home-news
        v-else-if="block.type === 'news'"
        :title="block.title || ''"
        :subtitle="block.subtitle || ''"
        :limit="block.limit || 3"
      />

      <home-cta
        v-else-if="block.type === 'cta'"
        :heading="block.heading || ''"
        :subtitle="block.subtitle || ''"
        :link-text="block.link_text || ''"
        :link-url="block.link_url || ''"
        :bg-color="block.bg_color || 'surface'"
      />

      <home-richtext
        v-else-if="block.type === 'richtext'"
        :title="block.title || ''"
        :content="block.content || ''"
        :bg-color="block.bg_color || 'white'"
      />
    </template>
  </site-layout>
</template>

<script>
import SiteLayout from '@/components/site-layout/site-layout.vue'
import HomeBanner from '@/components/home-banner/home-banner.vue'
import HomeProducts from '@/components/home-products/home-products.vue'
import HomeImageText from '@/components/home-image-text/home-image-text.vue'
import HomeNews from '@/components/home-news/home-news.vue'
import HomeCta from '@/components/home-cta/home-cta.vue'
import HomeRichtext from '@/components/home-richtext/home-richtext.vue'
import { getHomepageSections, getBrandName } from '@/utils/site-settings.js'
import { DEFAULT_SECTIONS } from '@/utils/homepage-sections.js'

export default {
  components: { SiteLayout, HomeBanner, HomeProducts, HomeImageText, HomeNews, HomeCta, HomeRichtext },
  data () {
    return {
      blocks: [],
    }
  },
  computed: {
    visibleBlocks () { return (this.blocks || []).filter(b => b.visible !== false) },
    firstIsBanner () { return this.visibleBlocks[0]?.type === 'banner' },
  },
  async onLoad () {
    const sections = await getHomepageSections()
    this.blocks = sections && sections.length ? sections : DEFAULT_SECTIONS
    const brand = await getBrandName()
    uni.setNavigationBarTitle({ title: brand.primary + brand.accent })
  },
}
</script>

<style>
page { background: #fff; }
</style>
