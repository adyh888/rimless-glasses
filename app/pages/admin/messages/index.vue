<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-light text-primary">留言管理</h1>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <label class="text-xs text-secondary">每页</label>
          <select
            v-model.number="pageSize"
            class="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:border-accent focus:outline-none bg-white"
            @change="currentPage = 1; loadMessages()"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
        <span class="text-sm text-secondary">共 {{ total }} 条留言</span>
      </div>
    </div>

    <!-- Batch actions toolbar -->
    <div class="flex items-center gap-3 mb-4">
      <button
        @click="markAllRead"
        :disabled="batchProcessing"
        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all disabled:opacity-50"
      >
        {{ batchProcessing ? '处理中...' : '一键全部已读' }}
      </button>
      <template v-if="selectedIds.size > 0">
        <button
          @click="batchMarkRead"
          :disabled="batchProcessing"
          class="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-50"
        >标记已读 ({{ selectedIds.size }})</button>
        <button
          @click="batchDelete"
          :disabled="batchProcessing"
          class="px-3 py-1.5 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50"
        >删除选中 ({{ selectedIds.size }})</button>
      </template>
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
            <th class="text-left px-4 py-3 text-xs font-medium text-secondary">状态</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-secondary">姓名</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-secondary">邮箱</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-secondary">电话</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-secondary">留言内容</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-secondary">时间</th>
            <th class="text-right px-4 py-3 text-xs font-medium text-secondary">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="msg in messages"
            :key="msg.id"
            class="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
            :class="{ 'bg-blue-50/30': !msg.is_read }"
            @click="viewMessage(msg)"
          >
            <td class="w-10 px-4 py-3" @click.stop>
              <input
                type="checkbox"
                :checked="selectedIds.has(msg.id)"
                @change="toggleSelect(msg.id)"
                class="w-4 h-4 text-accent rounded cursor-pointer"
              />
            </td>
            <td class="px-4 py-3">
              <span
                class="text-xs px-2 py-1 rounded-full"
                :class="msg.is_read ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'"
              >{{ msg.is_read ? '已读' : '未读' }}</span>
            </td>
            <td class="px-4 py-3 text-sm text-primary font-medium max-w-[120px] truncate" :title="msg.name">{{ msg.name }}</td>
            <td class="px-4 py-3 text-sm text-secondary max-w-[160px] truncate" :title="msg.email">{{ msg.email }}</td>
            <td class="px-4 py-3 text-sm text-secondary whitespace-nowrap">{{ msg.phone || '-' }}</td>
            <td class="px-4 py-3 text-sm text-secondary max-w-[200px] truncate" :title="msg.message">{{ msg.message }}</td>
            <td class="px-4 py-3 text-sm text-secondary whitespace-nowrap">{{ formatTime(msg.created_at) }}</td>
            <td class="px-4 py-3 text-right space-x-3" @click.stop>
              <button
                v-if="!msg.is_read"
                @click="markRead(msg)"
                class="text-xs text-accent hover:underline"
              >标记已读</button>
              <button @click="deleteMessage(msg.id)" class="text-xs text-red-500 hover:underline">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!messages.length" class="text-center py-12 text-secondary text-sm">暂无留言</div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-6">
      <button
        :disabled="currentPage <= 1"
        @click="currentPage--; loadMessages()"
        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"
      >上一页</button>
      <template v-for="p in paginationRange" :key="p">
        <button
          v-if="p !== '...'"
          @click="currentPage = p as number; loadMessages()"
          class="w-8 h-8 text-sm rounded-lg transition-colors"
          :class="currentPage === p ? 'bg-primary text-white' : 'hover:bg-gray-50 text-secondary'"
        >{{ p }}</button>
        <span v-else class="text-secondary text-sm px-1">...</span>
      </template>
      <button
        :disabled="currentPage >= totalPages"
        @click="currentPage++; loadMessages()"
        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"
      >下一页</button>
    </div>

    <!-- Detail modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDetail"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          @click.self="showDetail = false"
        >
          <div class="bg-white rounded-xl shadow-2xl w-[90vw] max-w-lg p-6" @click.stop>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-primary">留言详情</h3>
              <button @click="showDetail = false" class="text-secondary hover:text-primary text-lg">&times;</button>
            </div>
            <div v-if="currentMsg" class="space-y-3 text-sm">
              <div class="flex gap-2">
                <span class="text-secondary w-14 shrink-0">姓名：</span>
                <span class="text-primary">{{ currentMsg.name }}</span>
              </div>
              <div class="flex gap-2">
                <span class="text-secondary w-14 shrink-0">邮箱：</span>
                <span class="text-primary">{{ currentMsg.email }}</span>
              </div>
              <div v-if="currentMsg.phone" class="flex gap-2">
                <span class="text-secondary w-14 shrink-0">电话：</span>
                <span class="text-primary">{{ currentMsg.phone }}</span>
              </div>
              <div class="flex gap-2">
                <span class="text-secondary w-14 shrink-0">时间：</span>
                <span class="text-primary">{{ formatTime(currentMsg.created_at) }}</span>
              </div>
              <div>
                <span class="text-secondary">留言内容：</span>
                <p class="mt-1 text-primary whitespace-pre-wrap bg-gray-50 rounded-lg p-4">{{ currentMsg.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { authFetch } = useAuth()
const messages = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const showDetail = ref(false)
const currentMsg = ref<any>(null)
const batchProcessing = ref(false)
const selectedIds = ref(new Set<number>())

const PAGESIZE_KEY = 'admin-messages-pagesize'
const pageSize = ref(20)
if (import.meta.client) {
  const saved = localStorage.getItem(PAGESIZE_KEY)
  if (saved) pageSize.value = Number(saved) || 20
}
watch(pageSize, (v) => {
  if (import.meta.client) localStorage.setItem(PAGESIZE_KEY, String(v))
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const isAllSelected = computed(() =>
  messages.value.length > 0 && messages.value.every(m => selectedIds.value.has(m.id))
)
const isPartialSelected = computed(() =>
  !isAllSelected.value && messages.value.some(m => selectedIds.value.has(m.id))
)

const paginationRange = computed(() => {
  const pages: (number | string)[] = []
  const tp = totalPages.value
  const cp = currentPage.value
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 3) pages.push('...')
    for (let i = Math.max(2, cp - 1); i <= Math.min(tp - 1, cp + 1); i++) pages.push(i)
    if (cp < tp - 2) pages.push('...')
    pages.push(tp)
  }
  return pages
})

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
    selectedIds.value = new Set(messages.value.map(m => m.id))
  }
}

async function loadMessages() {
  const data = await $fetch<any>('/api/messages', {
    query: {
      page: currentPage.value,
      limit: pageSize.value,
    },
  })
  messages.value = data.items || []
  total.value = data.total || 0
  selectedIds.value = new Set()
}

async function viewMessage(msg: any) {
  currentMsg.value = msg
  showDetail.value = true
  if (!msg.is_read) {
    await markRead(msg)
  }
}

async function markRead(msg: any) {
  await authFetch(`/api/messages/${msg.id}`, { method: 'PUT', body: { is_read: 1 } })
  msg.is_read = 1
}

async function markAllRead() {
  if (!confirm('确定将所有留言标记为已读吗？')) return
  batchProcessing.value = true
  try {
    await authFetch('/api/messages/batch', {
      method: 'PUT',
      body: { ids: [], action: 'mark_all_read' },
    })
    await loadMessages()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '操作失败')
  } finally {
    batchProcessing.value = false
  }
}

async function batchMarkRead() {
  if (selectedIds.value.size === 0) return
  batchProcessing.value = true
  try {
    await authFetch('/api/messages/batch', {
      method: 'PUT',
      body: { ids: Array.from(selectedIds.value), action: 'mark_read' },
    })
    await loadMessages()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '操作失败')
  } finally {
    batchProcessing.value = false
  }
}

async function batchDelete() {
  if (selectedIds.value.size === 0) return
  if (!confirm(`确定删除选中的 ${selectedIds.value.size} 条留言吗？`)) return
  batchProcessing.value = true
  try {
    await authFetch('/api/messages/batch', {
      method: 'DELETE',
      body: { ids: Array.from(selectedIds.value) },
    })
    await loadMessages()
  } catch (e: any) {
    alert(e?.data?.statusMessage || '删除失败')
  } finally {
    batchProcessing.value = false
  }
}

async function deleteMessage(id: number) {
  if (!confirm('确定删除这条留言吗？')) return
  await authFetch(`/api/messages/${id}`, { method: 'DELETE' })
  await loadMessages()
}

function formatTime(dt: string) {
  if (!dt) return ''
  const d = new Date(dt)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(loadMessages)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
