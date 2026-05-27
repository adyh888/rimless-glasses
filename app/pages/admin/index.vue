<template>
  <div>
    <h1 class="text-2xl font-light text-primary mb-8">仪表盘</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl p-6 shadow-sm">
        <p class="text-sm text-secondary">{{ stat.label }}</p>
        <p class="mt-2 text-3xl font-light text-primary">{{ stat.value }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-sm font-medium text-primary mb-4">快捷操作</h3>
        <div class="space-y-2">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.path"
            :to="action.path"
            class="block px-4 py-3 rounded-lg bg-surface hover:bg-gray-100 text-sm text-secondary hover:text-primary transition-all"
          >
            {{ action.label }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { authFetch } = useAuth()
const statsData = ref<any>({})

onMounted(async () => {
  try {
    statsData.value = await authFetch('/api/stats')
  } catch {}
})

const stats = computed(() => [
  { label: '产品总数', value: statsData.value.products || 0 },
  { label: '文章总数', value: statsData.value.articles || 0 },
  { label: '轮播图数', value: statsData.value.banners || 0 },
  { label: '未读留言', value: statsData.value.messages || 0 },
])

const quickActions = [
  { label: '+ 添加新产品', path: '/admin/products/new' },
  { label: '+ 发布新文章', path: '/admin/articles/new' },
  { label: '+ 添加轮播图', path: '/admin/banners/new' },
  { label: '查看客户留言', path: '/admin/messages' },
  { label: '编辑品牌故事', path: '/admin/content' },
]
</script>
