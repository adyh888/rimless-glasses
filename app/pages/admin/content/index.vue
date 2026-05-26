<template>
  <div>
    <h1 class="text-2xl font-light text-primary mb-8">内容管理</h1>

    <div class="bg-white rounded-xl shadow-sm p-8 max-w-4xl">
      <h2 class="text-sm font-medium text-secondary mb-4">关于我们 / 品牌故事</h2>

      <RichTextEditor v-model="content" />

      <div class="mt-6">
        <button
          @click="saveContent"
          :disabled="saving"
          class="px-6 py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ saving ? '保存中...' : '保存内容' }}
        </button>
        <span v-if="saved" class="ml-3 text-sm text-green-600">已保存</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { authFetch } = useAuth()
const content = ref('')
const saving = ref(false)
const saved = ref(false)

onMounted(async () => {
  const data = await $fetch<any>('/api/content/about_us')
  content.value = data.content || ''
})

async function saveContent() {
  saving.value = true
  saved.value = false
  try {
    await authFetch('/api/content/about_us', {
      method: 'PUT',
      body: { content: content.value },
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>
