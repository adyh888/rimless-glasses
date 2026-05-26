<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-light text-primary">轮播管理</h1>
      <NuxtLink
        to="/admin/banners/new"
        class="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all"
      >
        + 新增轮播
      </NuxtLink>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">图片</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">标题</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">排序</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">状态</th>
            <th class="text-right px-6 py-3 text-xs font-medium text-secondary">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="banner in banners" :key="banner.id" class="border-b border-gray-50 hover:bg-gray-50/50">
            <td class="px-6 py-3">
              <img :src="banner.image_url" class="w-20 h-12 object-cover rounded" />
            </td>
            <td class="px-6 py-3 text-sm text-primary">{{ banner.title }}</td>
            <td class="px-6 py-3 text-sm text-secondary">{{ banner.sort_order }}</td>
            <td class="px-6 py-3">
              <span
                class="text-xs px-2 py-1 rounded-full"
                :class="banner.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'"
              >
                {{ banner.is_active ? '启用' : '禁用' }}
              </span>
            </td>
            <td class="px-6 py-3 text-right space-x-3">
              <NuxtLink :to="`/admin/banners/${banner.id}`" class="text-xs text-accent hover:underline">编辑</NuxtLink>
              <button @click="deleteBanner(banner.id)" class="text-xs text-red-500 hover:underline">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!banners.length" class="text-center py-12 text-secondary text-sm">暂无数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { authFetch } = useAuth()
const banners = ref<any[]>([])

async function loadBanners() {
  banners.value = await $fetch<any[]>('/api/banners')
}

async function deleteBanner(id: number) {
  if (!confirm('确定要删除这个轮播图吗？')) return
  await authFetch(`/api/banners/${id}`, { method: 'DELETE' })
  await loadBanners()
}

onMounted(loadBanners)
</script>
