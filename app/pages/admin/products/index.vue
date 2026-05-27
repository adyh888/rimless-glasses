<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-light text-primary">产品管理</h1>
      <NuxtLink to="/admin/products/new" class="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all">
        + 新增产品
      </NuxtLink>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">媒体</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">名称</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">分类</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">价格</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">状态</th>
            <th class="text-right px-6 py-3 text-xs font-medium text-secondary">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id" class="border-b border-gray-50 hover:bg-gray-50/50">
            <td class="px-6 py-3">
              <VideoThumbnail
                v-if="isVideoUrl(getFirstMedia(product))"
                :src="getFirstMedia(product)"
                container-class="w-16 h-12"
              />
              <img v-else :src="getFirstMedia(product)" class="w-16 h-12 object-cover rounded" />
            </td>
            <td class="px-6 py-3">
              <div class="text-sm text-primary">{{ product.name }}</div>
              <div v-if="product.is_featured" class="text-xs text-accent">推荐</div>
            </td>
            <td class="px-6 py-3 text-sm text-secondary">{{ product.category }}{{ product.sub_category ? ' / ' + product.sub_category : '' }}</td>
            <td class="px-6 py-3 text-sm text-primary">&yen;{{ Number(product.price).toLocaleString() }}</td>
            <td class="px-6 py-3">
              <span class="text-xs px-2 py-1 rounded-full" :class="product.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'">
                {{ product.is_active ? '上架' : '下架' }}
              </span>
            </td>
            <td class="px-6 py-3 text-right space-x-3">
              <NuxtLink :to="`/admin/products/${product.id}`" class="text-xs text-accent hover:underline">编辑</NuxtLink>
              <button @click="deleteProduct(product.id)" class="text-xs text-red-500 hover:underline">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!products.length" class="text-center py-12 text-secondary text-sm">暂无数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { authFetch } = useAuth()
const products = ref<any[]>([])

function getFirstMedia(product: any) {
  try {
    const images = JSON.parse(product.images_json || '[]')
    return images[0] || 'https://via.placeholder.com/100x75'
  } catch {
    return 'https://via.placeholder.com/100x75'
  }
}

async function loadProducts() {
  const data = await $fetch<any>('/api/products', { query: { limit: 100 } })
  products.value = data.items || []
}

async function deleteProduct(id: number) {
  if (!confirm('确定要删除这个产品吗？')) return
  await authFetch(`/api/products/${id}`, { method: 'DELETE' })
  await loadProducts()
}

onMounted(loadProducts)
</script>
