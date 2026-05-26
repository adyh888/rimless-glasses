<template>
  <div>
    <h1 class="text-2xl font-light text-primary mb-8">{{ isNew ? '新增产品' : '编辑产品' }}</h1>

    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm p-8 max-w-4xl space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm text-secondary mb-1.5">产品名称</label>
          <input v-model="form.name" type="text" required class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
        </div>
        <div>
          <label class="block text-sm text-secondary mb-1.5">Slug（URL路径）</label>
          <input v-model="form.slug" type="text" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" placeholder="自动生成" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm text-secondary mb-1.5">分类</label>
          <input v-model="form.category" type="text" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" placeholder="例：经典系列" />
        </div>
        <div>
          <label class="block text-sm text-secondary mb-1.5">价格（元）</label>
          <input v-model.number="form.price" type="number" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
        </div>
        <div>
          <label class="block text-sm text-secondary mb-1.5">排序</label>
          <input v-model.number="form.sort_order" type="number" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="block text-sm text-secondary mb-1.5">推荐产品</label>
          <select v-model="form.is_featured" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none">
            <option :value="1">是</option>
            <option :value="0">否</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-secondary mb-1.5">状态</label>
          <select v-model="form.is_active" class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none">
            <option :value="1">上架</option>
            <option :value="0">下架</option>
          </select>
        </div>
      </div>

      <!-- Images -->
      <div>
        <label class="block text-sm text-secondary mb-1.5">产品图片</label>
        <div class="flex flex-wrap gap-3 mb-3">
          <div v-for="(img, idx) in form.images" :key="idx" class="relative">
            <img :src="img" class="w-24 h-24 object-cover rounded-lg" />
            <button type="button" @click="form.images.splice(idx, 1)"
              class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
              &times;
            </button>
          </div>
        </div>
        <ImageUploader :model-value="''" @update:model-value="(v: string) => { if(v) form.images.push(v) }" />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm text-secondary mb-1.5">产品描述</label>
        <RichTextEditor v-model="form.description" />
      </div>

      <!-- Specs -->
      <div>
        <label class="block text-sm text-secondary mb-1.5">产品参数</label>
        <div class="space-y-2">
          <div v-for="(_, idx) in form.specRows" :key="idx" class="flex gap-2">
            <input v-model="form.specRows[idx].key" type="text" placeholder="参数名" class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
            <input v-model="form.specRows[idx].value" type="text" placeholder="参数值" class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
            <button type="button" @click="form.specRows.splice(idx, 1)" class="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm">删除</button>
          </div>
        </div>
        <button type="button" @click="form.specRows.push({ key: '', value: '' })" class="mt-2 text-sm text-accent hover:underline">
          + 添加参数
        </button>
      </div>

      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="px-6 py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50">
          {{ saving ? '保存中...' : '保存' }}
        </button>
        <NuxtLink to="/admin/products" class="px-6 py-2.5 border border-gray-200 text-sm text-secondary rounded-lg hover:bg-gray-50 transition-all">
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
  name: '',
  slug: '',
  category: '',
  price: 0,
  sort_order: 0,
  is_featured: 0,
  is_active: 1,
  images: [] as string[],
  description: '',
  specRows: [{ key: '', value: '' }] as { key: string; value: string }[],
})

if (!isNew) {
  onMounted(async () => {
    const data = await $fetch<any>(`/api/products/${route.params.id}`)
    form.name = data.name
    form.slug = data.slug
    form.category = data.category
    form.price = data.price
    form.sort_order = data.sort_order
    form.is_featured = data.is_featured
    form.is_active = data.is_active
    form.description = data.description || ''
    try {
      form.images = JSON.parse(data.images_json || '[]')
    } catch { form.images = [] }
    try {
      const specs = JSON.parse(data.specs_json || '{}')
      form.specRows = Object.entries(specs).map(([key, value]) => ({ key, value: value as string }))
      if (form.specRows.length === 0) form.specRows = [{ key: '', value: '' }]
    } catch { form.specRows = [{ key: '', value: '' }] }
  })
}

async function save() {
  saving.value = true
  const specs: Record<string, string> = {}
  form.specRows.forEach(r => { if (r.key) specs[r.key] = r.value })

  const body = {
    name: form.name,
    slug: form.slug || `product-${Date.now()}`,
    category: form.category,
    price: form.price,
    sort_order: form.sort_order,
    is_featured: form.is_featured,
    is_active: form.is_active,
    images: form.images,
    description: form.description,
    specs,
  }

  try {
    if (isNew) {
      await authFetch('/api/products', { method: 'POST', body })
    } else {
      await authFetch(`/api/products/${route.params.id}`, { method: 'PUT', body })
    }
    navigateTo('/admin/products')
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>
