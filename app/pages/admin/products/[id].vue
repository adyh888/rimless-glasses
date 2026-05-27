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
        <label class="block text-sm text-secondary mb-1.5">产品媒体（图片/视频） <span class="text-xs text-gray-400">（拖拽可调节顺序）</span></label>
        <div class="flex flex-wrap gap-3 mb-3">
          <div
            v-for="(img, idx) in form.images"
            :key="img + idx"
            class="relative group cursor-move"
            :class="{ 'opacity-50 ring-2 ring-accent': dragIdx === idx, 'ring-2 ring-gray-300': dragOverIdx === idx && dragIdx !== idx }"
            draggable="true"
            @dragstart="onDragStart(idx)"
            @dragover.prevent="onDragOver(idx)"
            @drop.prevent="onDrop"
            @dragend="onDragEnd"
          >
            <template v-if="isVideoUrl(img)">
              <VideoThumbnail
                :src="img"
                container-class="w-24 h-24"
                canvas-class="rounded-lg"
                @click.stop="previewSrc = img; showPreview = true"
              />
            </template>
            <template v-else>
              <img
                :src="img"
                class="w-24 h-24 object-cover rounded-lg"
                @click.stop="previewSrc = img; showPreview = true"
              />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center" @click.stop="previewSrc = img; showPreview = true">
                <svg class="w-5 h-5 text-white opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                </svg>
              </div>
            </template>
            <button type="button" @click.stop="form.images.splice(idx, 1)"
              class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">
              &times;
            </button>
            <div class="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">{{ idx + 1 }}</div>
          </div>
        </div>
        <ImageUploaderMultiple v-model="form.images" />
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

    <ImagePreview v-model="showPreview" :src="previewSrc" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const route = useRoute()
const { authFetch } = useAuth()
const isNew = route.params.id === 'new'
const saving = ref(false)
const showPreview = ref(false)
const previewSrc = ref('')
const dragIdx = ref(-1)
const dragOverIdx = ref(-1)
const originalImages = ref<string[]>([])

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
    originalImages.value = [...form.images]
    try {
      const specs = JSON.parse(data.specs_json || '{}')
      form.specRows = Object.entries(specs).map(([key, value]) => ({ key, value: value as string }))
      if (form.specRows.length === 0) form.specRows = [{ key: '', value: '' }]
    } catch { form.specRows = [{ key: '', value: '' }] }
  })
}

function onDragStart(idx: number) {
  dragIdx.value = idx
}

function onDragOver(idx: number) {
  if (dragIdx.value !== idx) {
    dragOverIdx.value = idx
  }
}

function onDrop() {
  if (dragIdx.value !== -1 && dragOverIdx.value !== -1 && dragIdx.value !== dragOverIdx.value) {
    const items = [...form.images]
    const [moved] = items.splice(dragIdx.value, 1)
    items.splice(dragOverIdx.value, 0, moved)
    form.images = items
  }
}

function onDragEnd() {
  dragIdx.value = -1
  dragOverIdx.value = -1
}

async function deleteUploadFile(url: string) {
  if (!url) return
  try {
    const path = url.replace('/uploads/', '')
    await $fetch(`/uploads/${path}`, { method: 'DELETE' })
  } catch { /* ignore */ }
}

async function save() {
  // 删除被移除的图片
  const removedImages = originalImages.value.filter(img => !form.images.includes(img))
  for (const img of removedImages) {
    await deleteUploadFile(img)
  }

  saving.value = true
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
