<template>
  <view class="section-title">
    <text class="title">{{ title }}</text>
    <text v-if="subtitle" class="subtitle">{{ subtitle }}</text>
    <view class="accent-bar" />
  </view>
</template>

<script>
export default {
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
  },
}
</script>

<style>
.section-title { text-align: center; margin-bottom: 48px; display: flex; flex-direction: column; align-items: center; }
.title { font-size: 32px; font-weight: 300; letter-spacing: -0.5px; color: #1f2937; }
.subtitle { font-size: 14px; color: #6b7280; margin-top: 12px; }
.accent-bar { width: 48px; height: 1px; background: #c8a464; margin-top: 16px; }
</style>
