<template>
  <view class="site-header" :class="{ scrolled }">
    <view class="bar">
      <view class="logo" @tap="goHome">
        <image v-if="logo.show && logo.url" class="logo-img" :src="logo.url" mode="heightFix" :style="{ height: logo.height + 'px' }" />
        <text v-else class="logo-text">
          <text class="primary">{{ brand.primary }}</text><text class="accent">{{ brand.accent }}</text>
        </text>
      </view>

      <view class="nav">
        <text
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          @tap="onNavTap(item)"
        >{{ item.label }}</text>
      </view>

      <view class="menu-btn" @tap="toggleMobile">
        <text v-if="!mobileOpen">≡</text>
        <text v-else>×</text>
      </view>
    </view>

    <view v-if="mobileOpen" class="mobile-menu">
      <text
        v-for="item in navItems"
        :key="item.path"
        class="mobile-item"
        @tap="onNavTap(item)"
      >{{ item.label }}</text>
    </view>
  </view>
</template>

<script>
import { getBrandName, getSiteLogo, getNavItems, navigateToPath } from '@/utils/site-settings.js'

export default {
  props: {
    transparent: { type: Boolean, default: false },
  },
  data () {
    return {
      brand: { primary: '清透', accent: '视界' },
      logo: { url: '', show: false, height: 32 },
      navItems: [],
      mobileOpen: false,
      scrolled: !this.transparent,
    }
  },
  async created () {
    const [brand, logo, items] = await Promise.all([
      getBrandName(), getSiteLogo(), getNavItems(),
    ])
    this.brand = brand
    this.logo = logo
    this.navItems = (items || []).filter(i => i.is_active !== false)
  },
  methods: {
    goHome () { uni.reLaunch({ url: '/pages/index/index' }) },
    toggleMobile () { this.mobileOpen = !this.mobileOpen },
    onNavTap (item) {
      this.mobileOpen = false
      navigateToPath(item.path)
    },
  },
}
</script>

<style>
.site-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
  border-bottom: 1px solid #f3f4f6;
}
.bar { max-width: 1280px; margin: 0 auto; height: 80px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }
.logo { display: flex; align-items: center; gap: 8px; }
.logo-img { width: auto; }
.logo-text { font-size: 20px; font-weight: 300; letter-spacing: 2px; }
.logo-text .primary { color: #1f2937; }
.logo-text .accent { color: #c8a464; }
.nav { display: flex; gap: 32px; }
.nav-item { font-size: 14px; color: #6b7280; letter-spacing: 0.5px; }
.menu-btn { display: none; font-size: 24px; color: #1f2937; padding: 8px; }
.mobile-menu { border-top: 1px solid #f3f4f6; padding: 16px 24px; display: none; flex-direction: column; gap: 16px; background: rgba(255,255,255,0.95); }
.mobile-item { font-size: 14px; color: #6b7280; padding: 8px 0; }

@media (max-width: 768px) {
  .nav { display: none; }
  .menu-btn { display: block; }
  .mobile-menu { display: flex; }
}
</style>
