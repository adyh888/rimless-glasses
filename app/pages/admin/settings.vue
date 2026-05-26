<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-light text-primary">站点设置</h1>

    <!-- 产品价格显示开关 -->
    <section class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
      <h2 class="text-sm font-medium text-primary mb-1">产品中心价格显示</h2>
      <p class="text-xs text-secondary mb-5">关闭后，前台产品卡片和详情页将不显示价格（后台始终可见）</p>

      <label class="inline-flex items-center gap-3 cursor-pointer select-none">
        <span class="relative inline-block w-11 h-6">
          <input v-model="showPrice" type="checkbox" class="peer sr-only" />
          <span class="absolute inset-0 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
          <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
        </span>
        <span class="text-sm text-primary">{{ showPrice ? '显示价格' : '隐藏价格' }}</span>
      </label>

      <div class="mt-6">
        <button
          @click="savePriceFlag"
          :disabled="savingPrice"
          class="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ savingPrice ? '保存中...' : '保存' }}
        </button>
        <span v-if="priceSaved" class="ml-3 text-sm text-green-600">已保存</span>
      </div>
    </section>

    <!-- 联系方式 -->
    <section class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
      <h2 class="text-sm font-medium text-primary mb-1">联系方式</h2>
      <p class="text-xs text-secondary mb-5">在「联系我们」页面展示的联系方式与营业时间</p>

      <div class="space-y-3">
        <p class="text-xs text-secondary">联系信息</p>
        <div
          v-for="(item, idx) in contact.items"
          :key="idx"
          class="grid grid-cols-[1fr_2fr_auto] gap-3 items-center"
        >
          <input
            v-model="item.label"
            type="text"
            placeholder="标签（如 客服热线）"
            class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
          />
          <input
            v-model="item.value"
            type="text"
            placeholder="内容（如 400-888-0000）"
            class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            @click="removeItem(idx)"
            class="text-xs text-red-500 hover:underline px-2"
          >
            删除
          </button>
        </div>
        <button
          type="button"
          @click="addItem"
          class="text-xs text-accent hover:underline"
        >
          + 添加一条联系信息
        </button>
      </div>

      <div class="mt-8 space-y-3">
        <p class="text-xs text-secondary">营业时间（每行一条）</p>
        <div
          v-for="(line, idx) in contact.hours"
          :key="idx"
          class="grid grid-cols-[1fr_auto] gap-3 items-center"
        >
          <input
            :value="line"
            @input="(e) => updateHour(idx, (e.target as HTMLInputElement).value)"
            type="text"
            placeholder="如 周一至周五：9:00 - 18:00"
            class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            @click="removeHour(idx)"
            class="text-xs text-red-500 hover:underline px-2"
          >
            删除
          </button>
        </div>
        <button
          type="button"
          @click="addHour"
          class="text-xs text-accent hover:underline"
        >
          + 添加一行营业时间
        </button>
      </div>

      <div class="mt-8">
        <button
          @click="saveContact"
          :disabled="savingContact"
          class="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ savingContact ? '保存中...' : '保存联系方式' }}
        </button>
        <span v-if="contactSaved" class="ml-3 text-sm text-green-600">已保存</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { authFetch } = useAuth()

const showPrice = ref(true)
const savingPrice = ref(false)
const priceSaved = ref(false)

type ContactItem = { label: string; value: string }
const contact = reactive<{ items: ContactItem[]; hours: string[] }>({
  items: [],
  hours: [],
})
const savingContact = ref(false)
const contactSaved = ref(false)

onMounted(async () => {
  const [priceRes, contactRes] = await Promise.all([
    $fetch<any>('/api/content/show_product_price'),
    $fetch<any>('/api/content/contact_info'),
  ])
  showPrice.value = (priceRes?.content ?? '1') !== '0'

  let parsed: any = {}
  try {
    parsed = contactRes?.content ? JSON.parse(contactRes.content) : {}
  } catch {
    parsed = {}
  }
  contact.items = Array.isArray(parsed.items) && parsed.items.length
    ? parsed.items
    : [{ label: '', value: '' }]
  contact.hours = Array.isArray(parsed.hours) && parsed.hours.length
    ? parsed.hours
    : ['']
})

function addItem() {
  contact.items.push({ label: '', value: '' })
}
function removeItem(idx: number) {
  contact.items.splice(idx, 1)
}
function addHour() {
  contact.hours.push('')
}
function removeHour(idx: number) {
  contact.hours.splice(idx, 1)
}
function updateHour(idx: number, value: string) {
  contact.hours[idx] = value
}

async function savePriceFlag() {
  savingPrice.value = true
  priceSaved.value = false
  try {
    await authFetch('/api/content/show_product_price', {
      method: 'PUT',
      body: { content: showPrice.value ? '1' : '0' },
    })
    priceSaved.value = true
    setTimeout(() => { priceSaved.value = false }, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    savingPrice.value = false
  }
}

async function saveContact() {
  savingContact.value = true
  contactSaved.value = false
  const payload = {
    items: contact.items.filter(i => i.label.trim() || i.value.trim()),
    hours: contact.hours.map(s => s.trim()).filter(Boolean),
  }
  try {
    await authFetch('/api/content/contact_info', {
      method: 'PUT',
      body: { content: JSON.stringify(payload) },
    })
    contactSaved.value = true
    setTimeout(() => { contactSaved.value = false }, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    savingContact.value = false
  }
}
</script>
