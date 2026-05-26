<template>
  <div>
    <h1 class="text-2xl font-light text-primary mb-8">{{ isNew ? '新增文章' : '编辑文章' }}</h1>

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
