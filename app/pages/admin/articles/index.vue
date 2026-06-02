<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-light text-primary">文章管理</h1>
      <NuxtLink to="/admin/articles/new" class="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all">
        + 新增文章
      </NuxtLink>
    </div>

    <!-- Batch actions toolbar -->
    <div v-if="selectedIds.size > 0" class="flex items-center gap-3 mb-4 flex-wrap">
      <span class="text-sm text-secondary">已选 {{ selectedIds.size }} 项</span>
      <button
        @click="batchAction('publish')"
        :disabled="batchProcessing"
        class="px-3 py-1.5 text-sm text-green-600 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-all disabled:opacity-50"
      >批量发布</button>
      <button
        @click="batchAction('unpublish')"
        :disabled="batchProcessing"
        class="px-3 py-1.5 text-sm text-yellow-600 border border-yellow-200 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-all disabled:opacity-50"
      >放入草稿箱</button>
      <button
        @click="batchAction('delete')"
        :disabled="batchProcessing"
        class="px-3 py-1.5 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50"
      >批量删除</button>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="w-10 px-4 py-3">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isPartialSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 text-accent rounded cursor-pointer"
              />
            </th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">标题</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">发布时间</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">状态</th>
            <th class="text-right px-6 py-3 text-xs font-medium text-secondary">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="article in articles"
            :key="article.id"
            class="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
            @click="goToArticle(article)"
          >
            <td class="w-10 px-4 py-3" @click.stop>
              <input
                type="checkbox"
                :checked="selectedIds.has(article.id)"
                @change="toggleSelect(article.id)"
                class="w-4 h-4 text-accent rounded cursor-pointer"
              />
            </td>
            <td class="px-6 py-3 text-sm text-primary">{{ article.title }}</td>
            <td class="px-6 py-3 text-sm text-secondary">{{ formatDate(article.created_at) }}</td>
            <td class="px-6 py-3" @click.stop>
              <button
                @click="togglePublish(article)"
                :disabled="togglingId === article.id"
                class="text-xs px-2 py-1 rounded-full cursor-pointer transition-all"
                :class="article.is_published ? 'bg-green-50 text-green-600 hover:bg-yellow-50 hover:text-yellow-600' : 'bg-yellow-50 text-yellow-600 hover:bg-green-50 hover:text-green-600'"
                :title="article.is_published ? '点击放入草稿箱' : '点击发布'"
              >
                {{ togglingId === article.id ? '切换中...' : (article.is_published ? '已发布' : '草稿') }}
              </button>
            </td>
            <td class="px-6 py-3 text-right space-x-3" @click.stop>
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
const selectedIds = ref(new Set<number>())
const batchProcessing = ref(false)
const togglingId = ref<number | null>(null)

const isAllSelected = computed(() =>
  articles.value.length > 0 && articles.value.every(a => selectedIds.value.has(a.id))
)
const isPartialSelected = computed(() =>
  !isAllSelected.value && articles.value.some(a => selectedIds.value.has(a.id))
)

function toggleSelect(id: number) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedIds.value = s
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(articles.value.map(a => a.id))
  }
}

function goToArticle(article: any) {
  window.open(`/news/${article.slug}`, '_blank')
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const normalized = dateStr.replace(/-/g, '/')
  const d = new Date(normalized)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function loadArticles() {
  const data = await $fetch<any>('/api/articles', { query: { limit: 100 } })
  articles.value = data.items || []
  selectedIds.value = new Set()
}

async function batchAction(action: string) {
  if (selectedIds.value.size === 0) return
  const actionNames: Record<string, string> = {
    delete: '删除',
    publish: '发布',
    unpublish: '放入草稿箱',
  }
  if (!confirm(`确定要${actionNames[action] || '操作'}选中的 ${selectedIds.value.size} 篇文章吗？`)) return
  batchProcessing.value = true
  try {
    await authFetch('/api/articles/batch', {
      method: 'POST',
      body: { ids: Array.from(selectedIds.value), action },
    })
    await loadArticles()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '操作失败')
  } finally {
    batchProcessing.value = false
  }
}

async function togglePublish(article: any) {
  togglingId.value = article.id
  try {
    const action = article.is_published ? 'unpublish' : 'publish'
    await authFetch('/api/articles/batch', {
      method: 'POST',
      body: { ids: [article.id], action },
    })
    article.is_published = article.is_published ? 0 : 1
  } catch (e: any) {
    alert(e?.data?.statusMessage || '切换状态失败')
  } finally {
    togglingId.value = null
  }
}

async function deleteArticle(id: number) {
  if (!confirm('确定要删除这篇文章吗？')) return
  await authFetch(`/api/articles/${id}`, { method: 'DELETE' })
  await loadArticles()
}

onMounted(loadArticles)
</script>
