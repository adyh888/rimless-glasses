<template>
  <view class="home-richtext" :class="bgColor === 'surface' ? 'bg-surface' : 'bg-white'">
    <view class="container">
      <section-title v-if="title" :title="title" />
      <view class="content">
        <rich-text :nodes="content" />
      </view>
    </view>
  </view>
</template>

<script>
import SectionTitle from '@/components/section-title/section-title.vue'

export default {
  components: { SectionTitle },
  props: {
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    bgColor: { type: String, default: 'white' },
  },
}
</script>

<style>
.home-richtext { padding: 96px 0; }
.bg-white { background: #fff; }
.bg-surface { background: #f7f6f3; }
.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.content { max-width: 800px; margin: 0 auto; font-size: 15px; line-height: 1.8; color: #374151; }
</style>
