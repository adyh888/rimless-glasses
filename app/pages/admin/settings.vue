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

    <!-- 上传设置 -->
    <section class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
      <h2 class="text-sm font-medium text-primary mb-1">上传设置</h2>
      <p class="text-xs text-secondary mb-5">限制图片上传文件大小（单位：MB）</p>

      <div class="flex items-center gap-4">
        <input
          v-model.number="uploadMaxSize"
          type="number"
          min="1"
          max="50"
          class="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
        />
        <span class="text-sm text-secondary">MB</span>
      </div>

      <div class="mt-6">
        <button
          @click="saveUploadMaxSize"
          :disabled="savingUploadMaxSize"
          class="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ savingUploadMaxSize ? '保存中...' : '保存' }}
        </button>
        <span v-if="uploadMaxSizeSaved" class="ml-3 text-sm text-green-600">已保存</span>
      </div>
    </section>

    <!-- 品牌名称 -->
    <section class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
      <h2 class="text-sm font-medium text-primary mb-1">品牌名称</h2>
      <p class="text-xs text-secondary mb-5">显示在前台 Header、Footer 以及后台侧栏 / 登录页。前半部分使用主色，后半部分使用强调色（香槟金）。</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-secondary mb-1.5">前半部分（主色）</label>
          <input
            v-model="brand.primary"
            type="text"
            placeholder="如 清透"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs text-secondary mb-1.5">后半部分（强调色）</label>
          <input
            v-model="brand.accent"
            type="text"
            placeholder="如 视界"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div class="mt-5 px-4 py-3 bg-surface rounded-lg text-lg font-light tracking-wider">
        <span class="text-primary">{{ brand.primary || '清透' }}</span><span class="text-accent">{{ brand.accent || '视界' }}</span>
        <span class="ml-3 text-xs text-secondary align-middle">实时预览</span>
      </div>

      <div class="mt-6">
        <button
          @click="saveBrand"
          :disabled="savingBrand"
          class="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ savingBrand ? '保存中...' : '保存品牌名称' }}
        </button>
        <span v-if="brandSaved" class="ml-3 text-sm text-green-600">已保存（刷新前台可见）</span>
      </div>
    </section>

    <!-- 页脚标语 -->
    <section class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
      <h2 class="text-sm font-medium text-primary mb-1">页脚标语</h2>
      <p class="text-xs text-secondary mb-5">显示在前台 Footer 左侧品牌下方，共两行</p>

      <div class="space-y-3">
        <div>
          <label class="block text-xs text-secondary mb-1.5">第一行</label>
          <input
            v-model="tagline.line1"
            type="text"
            placeholder="如 以极简设计重新定义视觉体验"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs text-secondary mb-1.5">第二行</label>
          <input
            v-model="tagline.line2"
            type="text"
            placeholder="如 让框架消失，让世界更清晰"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div class="mt-6">
        <button
          @click="saveTagline"
          :disabled="savingTagline"
          class="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ savingTagline ? '保存中...' : '保存标语' }}
        </button>
        <span v-if="taglineSaved" class="ml-3 text-sm text-green-600">已保存</span>
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

    <!-- 账户与密码 -->
    <section class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
      <h2 class="text-sm font-medium text-primary mb-1">账户与密码</h2>
      <p class="text-xs text-secondary mb-5">
        当前登录账号：<span class="text-primary">{{ currentUsername }}</span>。
        修改用户名或密码均需输入当前密码以确认身份。
      </p>

      <div class="space-y-4">
        <div>
          <label class="block text-xs text-secondary mb-1.5">新用户名（留空则不修改）</label>
          <input
            v-model="account.newUsername"
            type="text"
            autocomplete="off"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs text-secondary mb-1.5">新密码（留空则不修改，至少 6 位）</label>
          <input
            v-model="account.newPassword"
            type="password"
            autocomplete="new-password"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs text-secondary mb-1.5">确认新密码</label>
          <input
            v-model="account.confirmPassword"
            type="password"
            autocomplete="new-password"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-xs text-secondary mb-1.5">当前密码 <span class="text-red-500">*</span></label>
          <input
            v-model="account.currentPassword"
            type="password"
            autocomplete="current-password"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div class="mt-6">
        <button
          @click="saveAccount"
          :disabled="savingAccount"
          class="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ savingAccount ? '保存中...' : '保存账户信息' }}
        </button>
        <span v-if="accountSaved" class="ml-3 text-sm text-green-600">已保存，请使用新凭据重新登录</span>
        <span v-if="accountError" class="ml-3 text-sm text-red-500">{{ accountError }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { authFetch, user, token, logout } = useAuth()

const showPrice = ref(true)
const savingPrice = ref(false)
const priceSaved = ref(false)

const uploadMaxSize = ref(5)
const savingUploadMaxSize = ref(false)
const uploadMaxSizeSaved = ref(false)

type ContactItem = { label: string; value: string }
const contact = reactive<{ items: ContactItem[]; hours: string[] }>({
  items: [],
  hours: [],
})
const savingContact = ref(false)
const contactSaved = ref(false)

const brand = reactive({ primary: '', accent: '' })
const savingBrand = ref(false)
const brandSaved = ref(false)

const tagline = reactive({ line1: '', line2: '' })
const savingTagline = ref(false)
const taglineSaved = ref(false)

const account = reactive({
  newUsername: '',
  newPassword: '',
  confirmPassword: '',
  currentPassword: '',
})
const savingAccount = ref(false)
const accountSaved = ref(false)
const accountError = ref('')
const currentUsername = computed(() => user.value?.username || '—')

onMounted(async () => {
  const [priceRes, contactRes, brandP, brandA, tag1, tag2, uploadSizeRes] = await Promise.all([
    $fetch<any>('/api/content/show_product_price'),
    $fetch<any>('/api/content/contact_info'),
    $fetch<any>('/api/content/brand_name_primary'),
    $fetch<any>('/api/content/brand_name_accent'),
    $fetch<any>('/api/content/footer_tagline_line1'),
    $fetch<any>('/api/content/footer_tagline_line2'),
    $fetch<any>('/api/content/upload_max_size'),
  ])
  showPrice.value = (priceRes?.content ?? '1') !== '0'
  uploadMaxSize.value = uploadSizeRes?.content ? parseInt(uploadSizeRes.content, 10) : 5

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

  brand.primary = brandP?.content || '清透'
  brand.accent = brandA?.content || '视界'
  tagline.line1 = tag1?.content || '以极简设计重新定义视觉体验'
  tagline.line2 = tag2?.content || '让框架消失，让世界更清晰'

  // 同步当前用户名（authFetch /api/auth/me）
  if (!user.value && token.value) {
    try {
      const me = await authFetch<any>('/api/auth/me')
      user.value = me.user
    } catch {
      /* 忽略 */
    }
  }
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

async function saveUploadMaxSize() {
  savingUploadMaxSize.value = true
  uploadMaxSizeSaved.value = false
  try {
    await authFetch('/api/content/upload_max_size', {
      method: 'PUT',
      body: { content: String(uploadMaxSize.value) },
    })
    uploadMaxSizeSaved.value = true
    setTimeout(() => { uploadMaxSizeSaved.value = false }, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    savingUploadMaxSize.value = false
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

async function saveBrand() {
  if (!brand.primary.trim() && !brand.accent.trim()) {
    alert('品牌名称不能全部为空')
    return
  }
  savingBrand.value = true
  brandSaved.value = false
  try {
    await Promise.all([
      authFetch('/api/content/brand_name_primary', {
        method: 'PUT',
        body: { content: brand.primary.trim() },
      }),
      authFetch('/api/content/brand_name_accent', {
        method: 'PUT',
        body: { content: brand.accent.trim() },
      }),
    ])
    brandSaved.value = true
    setTimeout(() => { brandSaved.value = false }, 4000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    savingBrand.value = false
  }
}

async function saveTagline() {
  savingTagline.value = true
  taglineSaved.value = false
  try {
    await Promise.all([
      authFetch('/api/content/footer_tagline_line1', {
        method: 'PUT',
        body: { content: tagline.line1.trim() },
      }),
      authFetch('/api/content/footer_tagline_line2', {
        method: 'PUT',
        body: { content: tagline.line2.trim() },
      }),
    ])
    taglineSaved.value = true
    setTimeout(() => { taglineSaved.value = false }, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    savingTagline.value = false
  }
}

async function saveAccount() {
  accountError.value = ''
  accountSaved.value = false

  if (!account.currentPassword) {
    accountError.value = '请输入当前密码'
    return
  }
  if (!account.newUsername.trim() && !account.newPassword) {
    accountError.value = '请输入新的用户名或新密码'
    return
  }
  if (account.newPassword && account.newPassword !== account.confirmPassword) {
    accountError.value = '两次输入的新密码不一致'
    return
  }
  if (account.newPassword && account.newPassword.length < 6) {
    accountError.value = '新密码至少 6 位'
    return
  }

  savingAccount.value = true
  try {
    await authFetch<any>('/api/auth/account', {
      method: 'PUT',
      body: {
        currentPassword: account.currentPassword,
        newUsername: account.newUsername.trim(),
        newPassword: account.newPassword,
      },
    })
    accountSaved.value = true
    // 清空表单，等待用户重新登录
    account.newUsername = ''
    account.newPassword = ''
    account.confirmPassword = ''
    account.currentPassword = ''
    setTimeout(() => {
      logout()
    }, 1500)
  } catch (e: any) {
    accountError.value = e?.data?.statusMessage || '保存失败'
  } finally {
    savingAccount.value = false
  }
}
</script>
