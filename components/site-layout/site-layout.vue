<template>
  <view class="site-layout">
    <site-header />
    <view class="site-main" :class="{ 'no-padding': noTopPadding }">
      <slot />
    </view>
    <site-footer />
  </view>
</template>

<script>
import SiteHeader from '@/components/site-header/site-header.vue'
import SiteFooter from '@/components/site-footer/site-footer.vue'

export default {
  components: { SiteHeader, SiteFooter },
  props: {
    // 当首屏是全屏 banner 时，避免在内容顶部再加 80px padding
    noTopPadding: { type: Boolean, default: false },
  },
}
</script>

<style>
.site-layout { min-height: 100vh; display: flex; flex-direction: column; background: #fff; }
.site-main { flex: 1; padding-top: 80px; }
.site-main.no-padding { padding-top: 0; }
</style>
