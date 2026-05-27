<template>
  <aside class="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex flex-col z-40">
    <div class="h-16 flex items-center px-6 border-b border-gray-100">
      <NuxtLink to="/" class="text-lg font-light tracking-wider">
        {{ brand.primary }}<span class="text-accent">{{ brand.accent }}</span>
      </NuxtLink>
    </div>

    <nav class="flex-1 py-4 px-3">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 mb-1"
        :class="isActive(item.path) ? 'bg-primary/5 text-primary font-medium' : 'text-secondary hover:bg-gray-50 hover:text-primary'"
      >
        <DynamicIcon :icon="item.icon" icon-class="text-base w-5 h-5" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <div class="px-6 py-4 border-t border-gray-100">
      <NuxtLink to="/" class="text-xs text-secondary hover:text-primary transition-colors">
        ← 返回前台
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const brandRef = await useBrandName()
const brand = computed(() => brandRef.value)

const menuRef = await useAdminMenu()
const menuItems = computed(() => menuRef.value)

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}
</script>
