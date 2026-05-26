<template>
  <div>
    <h1 class="text-2xl font-light text-primary mb-8">{{ isNew ? '新增轮播' : '编辑轮播' }}</h1>

    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm p-8 max-w-2xl space-y-6">
      <div>
        <label class="block text-sm text-secondary mb-1.5">标题</label>
        <input v-model="form.title" type="text" required class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
      </div>
      <div>
        <label class="block text-sm text-secondary mb-1.5">副标题</label>
        <input v-model="form.subtitle" type="text" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-secondary mb-1.5">按钮文案</label>
          <input v-model="form.button_text" type="text" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
        </div>
        <div>
          <label class="block text-sm text-secondary mb-1.5">按钮链接</label>
          <input v-model="form.button_link" type="text" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
        </div>
      </div>
      <div>
        <label class="block text-sm text-secondary mb-1.5">背景图片</label>
        <ImageUploader v-model="form.image_url" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-secondary mb-1.5">排序</label>
          <input v-model.number="form.sort_order" type="number" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
        </div>
        <div>
          <label class="block text-sm text-secondary mb-1.5">状态</label>
          <select v-model="form.is_active" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none">
            <option :value="1">启用</option>
            <option :value="0">禁用</option>
          </select>
        </div>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="px-6 py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50">
          {{ saving ? '保存中...' : '保存' }}
        </button>
        <NuxtLink to="/admin/banners" class="px-6 py-2.5 border border-gray-200 text-sm text-secondary rounded-lg hover:bg-gray-50 transition-all">
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
  subtitle: '',
  button_text: '',
  button_link: '',
  image_url: '',
  sort_order: 0,
  is_active: 1,
})

if (!isNew) {
  onMounted(async () => {
    const data = await $fetch<any>(`/api/banners/${route.params.id}`)
    Object.assign(form, data)
  })
}

async function save() {
  saving.value = true
  try {
    if (isNew) {
      await authFetch('/api/banners', { method: 'POST', body: form })
    } else {
      await authFetch(`/api/banners/${route.params.id}`, { method: 'PUT', body: form })
    }
    navigateTo('/admin/banners')
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>
