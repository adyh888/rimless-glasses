<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-light text-primary">留言管理</h1>
      <span class="text-sm text-secondary">共 {{ total }} 条留言</span>
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">状态</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">姓名</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">邮箱</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">电话</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">留言内容</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-secondary">时间</th>
            <th class="text-right px-6 py-3 text-xs font-medium text-secondary">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="msg in messages"
            :key="msg.id"
            class="border-b border-gray-50 hover:bg-gray-50/50"
            :class="{ 'bg-blue-50/30': !msg.is_read }"
          >
            <td class="px-6 py-3">
              <span
                class="text-xs px-2 py-1 rounded-full"
                :class="msg.is_read ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'"
              >{{ msg.is_read ? '已读' : '未读' }}</span>
            </td>
            <td class="px-6 py-3 text-sm text-primary font-medium">{{ msg.name }}</td>
            <td class="px-6 py-3 text-sm text-secondary">{{ msg.email }}</td>
            <td class="px-6 py-3 text-sm text-secondary">{{ msg.phone || '-' }}</td>
            <td class="px-6 py-3 text-sm text-secondary max-w-xs">
              <button
                type="button"
                class="text-left hover:text-primary transition-colors"
                @click="viewMessage(msg)"
              >
                {{ msg.message.length > 40 ? msg.message.slice(0, 40) + '...' : msg.message }}
              </button>
            </td>
            <td class="px-6 py-3 text-sm text-secondary whitespace-nowrap">{{ formatTime(msg.created_at) }}</td>
            <td class="px-6 py-3 text-right space-x-3">
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
const showDetail = ref(false)
const currentMsg = ref<any>(null)

async function loadMessages() {
  const data = await $fetch<any>('/api/messages', { query: { limit: 100 } })
  messages.value = data.items || []
  total.value = data.total || 0
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
