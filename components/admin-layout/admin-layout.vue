<template>
  <view class="admin-shell">
    <!-- 侧边栏：H5 / 桌面端显示 -->
    <view class="sidebar" v-if="!isMobile">
      <view class="brand" @tap="goHome">
        <text class="brand-primary">{{ brand.primary }}</text><text class="brand-accent">{{ brand.accent }}</text>
      </view>
      <scroll-view class="menu" scroll-y>
        <view
          v-for="item in menu"
          :key="item.path"
          class="menu-item"
          :class="{ active: isActive(item.path) }"
          @tap="navigate(item.path)"
        >
          {{ item.label }}
        </view>
      </scroll-view>
      <view class="sidebar-footer">
        <text class="footer-link" @tap="logoutNow">退出登录</text>
      </view>
    </view>

    <view class="main" :class="{ 'main-mobile': isMobile }">
      <view class="topbar">
        <text class="title">{{ title }}</text>
      </view>
      <view class="content">
        <slot />
      </view>
    </view>

    <!-- 移动端底部导航 -->
    <view class="mobile-nav" v-if="isMobile">
      <view
        v-for="item in mobileMenu"
        :key="item.path"
        class="mobile-nav-item"
        :class="{ active: isActive(item.path) }"
        @tap="navigate(item.path)"
      >
        {{ item.label }}
      </view>
    </view>
  </view>
</template>

<script>
import { adminMenu, theme } from '@/utils/theme.js'
import { logout } from '@/utils/cloud.js'

export default {
  name: 'AdminLayout',
  props: {
    title: { type: String, default: '管理后台' },
  },
  data () {
    return {
      menu: adminMenu,
      brand: { primary: '清透', accent: '视界' },
      theme,
    }
  },
  computed: {
    isMobile () {
      try {
        const sys = uni.getSystemInfoSync()
        return sys.windowWidth < 768
      } catch (e) { return false }
    },
    mobileMenu () {
      // 底部只放 5 个常用的
      return this.menu.slice(0, 5)
    },
    currentPath () {
      const pages = getCurrentPages()
      const cur = pages[pages.length - 1]
      return '/' + (cur?.route || '')
    },
  },
  methods: {
    isActive (path) {
      return this.currentPath === path || this.currentPath.startsWith(path.replace(/\/index$/, ''))
    },
    navigate (path) {
      if (this.isActive(path)) return
      uni.reLaunch({ url: path })
    },
    goHome () {
      uni.reLaunch({ url: '/pages/index/index' })
    },
    logoutNow () {
      uni.showModal({
        title: '退出登录',
        content: '确认退出？',
        success: (res) => { if (res.confirm) logout() },
      })
    },
  },
}
</script>

<style>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: #f7f6f3;
}
.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #eef0f4;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0; top: 0; bottom: 0;
  z-index: 10;
}
.brand {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #eef0f4;
  font-size: 18px;
  letter-spacing: 2px;
  font-weight: 300;
}
.brand-primary { color: #1f2937; }
.brand-accent { color: #c8a464; }
.menu { flex: 1; padding: 12px 12px; }
.menu-item {
  padding: 12rpx 24rpx;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
  cursor: pointer;
}
.menu-item.active {
  background: #f3f4f6;
  color: #1f2937;
  font-weight: 500;
}
.sidebar-footer {
  padding: 16px 24px;
  border-top: 1px solid #eef0f4;
}
.footer-link {
  font-size: 12px;
  color: #6b7280;
}
.main {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-mobile {
  margin-left: 0;
  padding-bottom: 60px;
}
.topbar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
  display: flex;
  align-items: center;
  padding: 0 32rpx;
}
.title { font-size: 16px; color: #1f2937; }
.content { padding: 32rpx; }

/* 移动端底部导航 */
.mobile-nav {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  height: 60px;
  background: #fff;
  border-top: 1px solid #eef0f4;
  display: flex;
  z-index: 100;
}
.mobile-nav-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #6b7280;
}
.mobile-nav-item.active { color: #c8a464; }
</style>
