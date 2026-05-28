<template>
  <div>
    <h1 class="text-2xl font-light text-primary mb-8">{{ isNew ? '新增文章' : '编辑文章' }}</h1>

    <!-- Import from URL -->
    <div v-if="isNew" class="bg-white rounded-xl shadow-sm p-6 max-w-4xl mb-6">
      <div class="flex items-center gap-3">
        <input
          v-model="importUrl"
          type="url"
          placeholder="输入文章链接，从外部网页导入内容..."
          class="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
          @keydown.enter.prevent="importFromUrl"
        />
        <button
          type="button"
          :disabled="importing || !importUrl.trim()"
          @click="importFromUrl"
          class="px-5 py-2.5 bg-accent text-white text-sm rounded-lg hover:bg-accent/90 transition-all disabled:opacity-50 whitespace-nowrap"
        >{{ importing ? '导入中...' : '从链接导入' }}</button>
      </div>
      <p v-if="importing" class="text-xs text-secondary mt-2">正在抓取页面内容并下载图片/视频到素材库，请稍候...</p>
      <p v-if="importError" class="text-red-500 text-xs mt-2">{{ importError }}</p>
    </div>

    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm p-8 max-w-4xl space-y-6">
      <div>
        <label class="block text-sm text-secondary mb-1.5">文章标题</label>
        <input v-model="form.title" type="text" required class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm text-secondary mb-1.5">Slug（URL路径）</label>
          <input v-model="form.slug" type="text" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" placeholder="自动生成" />
        </div>
        <div>
          <label class="block text-sm text-secondary mb-1.5">发布状态</label>
          <select v-model="form.is_published" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none">
            <option :value="1">已发布</option>
            <option :value="0">草稿</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm text-secondary mb-1.5">摘要</label>
        <textarea v-model="form.summary" rows="2" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none resize-none" placeholder="文章摘要，用于列表展示" />
      </div>

      <div>
        <label class="block text-sm text-secondary mb-1.5">封面图片</label>
        <ImageUploader v-model="form.cover_image" />
      </div>

      <div>
        <label class="block text-sm text-secondary mb-1.5">文章内容</label>
        <RichTextEditor v-model="form.content" />
      </div>

      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="px-6 py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50">
          {{ saving ? '保存中...' : '保存' }}
        </button>
        <NuxtLink to="/admin/articles" class="px-6 py-2.5 border border-gray-200 text-sm text-secondary rounded-lg hover:bg-gray-50 transition-all">
          取消
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const route = useRoute()
const { authFetch } = useAuth()
const isNew = route.params.id === 'new'
const saving = ref(false)
const importUrl = ref('')
const importing = ref(false)
const importError = ref('')

const form = reactive({
  title: '',
  slug: '',
  summary: '',
  cover_image: '',
  content: '',
  is_published: 0,
})

if (!isNew) {
  onMounted(async () => {
    const data = await $fetch<any>(`/api/articles/${route.params.id}`)
    Object.assign(form, {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      cover_image: data.cover_image,
      content: data.content,
      is_published: data.is_published,
    })
  })
}

async function importFromUrl() {
  const url = importUrl.value.trim()
  if (!url) return
  if (form.title || form.content) {
    if (!window.confirm('导入将覆盖当前标题和内容，确定继续？')) return
  }
  importing.value = true
  importError.value = ''
  try {
    const res = await authFetch<{ title: string; content: string }>('/api/articles/import', {
      method: 'POST',
      body: { url },
    })
    form.title = res.title || form.title
    form.content = res.content || form.content
  } catch (e: any) {
    importError.value = e?.data?.statusMessage || '导入失败，请检查链接是否可访问'
  } finally {
    importing.value = false
  }
}

async function save() {
  saving.value = true
  const body = { ...form }
  if (!body.slug) body.slug = `article-${Date.now()}`

  try {
    if (isNew) {
      await authFetch('/api/articles', { method: 'POST', body })
    } else {
      await authFetch(`/api/articles/${route.params.id}`, { method: 'PUT', body })
    }
    navigateTo('/admin/articles')
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>
