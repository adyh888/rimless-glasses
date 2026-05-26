<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-light text-primary">文章管理</h1>
      <NuxtLink to="/admin/articles/new" class="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all">
        + 新增文章
      </NuxtLink>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">标题</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">发布时间</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">状态</th>
            <th class="text-right px-6 py-3 text-xs font-medium text-secondary">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id" class="border-b border-gray-50 hover:bg-gray-50/50">
            <td class="px-6 py-3 text-sm text-primary">{{ article.title }}</td>
            <td class="px-6 py-3 text-sm text-secondary">{{ formatDate(article.created_at) }}</td>
            <td class="px-6 py-3">
              <span class="text-xs px-2 py-1 rounded-full" :class="article.is_published ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'">
                {{ article.is_published ? '已发布' : '草稿' }}
              </span>
            </td>
            <td class="px-6 py-3 text-right space-x-3">
              <NuxtLink :to="`/admin/articles/${article.id}`" class="text-xs text-accent hover:underline">编辑</NuxtLink>
              <button @click="deleteArticle(article.id)" class="text-xs text-red-500 hover:underline">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!articles.length" class="text-center py-12 text-secondary text-sm">暂无数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { authFetch } = useAuth()
const articles = ref<any[]>([])

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function loadArticles() {
  const data = await $fetch<any>('/api/articles', { query: { limit: 100 } })
  articles.value = data.items || []
}

async function deleteArticle(id: number) {
  if (!confirm('确定要删除这篇文章吗？')) return
  await authFetch(`/api/articles/${id}`, { method: 'DELETE' })
  await loadArticles()
}

onMounted(loadArticles)
</script>
