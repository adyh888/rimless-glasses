<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-light text-primary">轮播管理</h1>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-400">拖拽行可调整排序</span>
        <NuxtLink
          to="/admin/banners/new"
          class="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all"
        >
          + 新增轮播
        </NuxtLink>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="w-10 px-2 py-3"></th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">媒体</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">标题</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">排序</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">状态</th>
            <th class="text-right px-6 py-3 text-xs font-medium text-secondary">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(banner, idx) in banners"
            :key="banner.id"
            draggable="true"
            class="border-b border-gray-50 hover:bg-gray-50/50 select-none transition-colors"
            :class="[
              dragIdx === idx ? 'opacity-50' : '',
              dragOverIdx === idx && dragIdx !== idx ? 'bg-accent/5' : '',
            ]"
            @dragstart="dragIdx = idx"
            @dragover.prevent="dragOverIdx = idx"
            @drop.prevent="onDrop"
            @dragend="dragIdx = -1; dragOverIdx = -1"
          >
            <td class="w-10 px-2 py-3 text-center text-gray-300 cursor-grab active:cursor-grabbing">
              <svg class="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
            </td>
            <td class="px-6 py-3">
              <VideoThumbnail
                v-if="isVideoUrl(banner.image_url)"
                :src="banner.image_url"
                container-class="w-20 h-12"
              />
              <img v-else :src="banner.image_url" class="w-20 h-12 object-cover rounded" />
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
const dragIdx = ref(-1)
const dragOverIdx = ref(-1)

async function loadBanners() {
  banners.value = await $fetch<any[]>('/api/banners')
}

async function deleteBanner(id: number) {
  if (!confirm('确定要删除这个轮播图吗？')) return
  await authFetch(`/api/banners/${id}`, { method: 'DELETE' })
  await loadBanners()
}

async function onDrop() {
  const from = dragIdx.value
  const to = dragOverIdx.value
  dragIdx.value = -1
  dragOverIdx.value = -1
  if (from === -1 || to === -1 || from === to) return

  const items = [...banners.value]
  const [moved] = items.splice(from, 1)
  items.splice(to, 0, moved)

  const prevSnapshot = banners.value
  const updated = items.map((b, i) => ({ ...b, sort_order: i + 1 }))
  banners.value = updated

  try {
    await Promise.all(
      updated.map(b => authFetch(`/api/banners/${b.id}`, { method: 'PUT', body: b }))
    )
  } catch (e: any) {
    banners.value = prevSnapshot
    alert(e?.data?.statusMessage || '排序保存失败')
  }
}

onMounted(loadBanners)
</script>
