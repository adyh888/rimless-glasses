<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-light text-primary">首页管理</h1>
        <p class="text-xs text-secondary mt-1">拖拽排序、编辑内容、控制显示隐藏，自定义首页布局</p>
      </div>
      <div class="relative">
        <button
          type="button"
          @click.stop="showAddMenu = !showAddMenu"
          class="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all"
        >
          + 添加板块
        </button>
        <div
          v-if="showAddMenu"
          class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20"
          @click.stop
        >
          <button
            v-for="opt in addOptions"
            :key="opt.type"
            type="button"
            :disabled="opt.disabled"
            @click="addBlock(opt.type)"
            class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span class="mr-2">{{ opt.icon }}</span>{{ opt.label }}
            <span v-if="opt.disabled" class="text-xs text-gray-400 ml-1">(已存在)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Block list -->
    <div v-if="blocks.length" class="space-y-3">
      <div
        v-for="(block, idx) in blocks"
        :key="block.id"
        class="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <!-- Collapsed header -->
        <div class="flex items-center gap-3 px-5 py-4">
          <div class="flex flex-col gap-0.5 shrink-0">
            <button
              type="button"
              :disabled="idx === 0"
              @click="moveBlock(idx, -1)"
              class="text-xs text-secondary hover:text-primary disabled:opacity-30"
            >&uarr;</button>
            <button
              type="button"
              :disabled="idx === blocks.length - 1"
              @click="moveBlock(idx, 1)"
              class="text-xs text-secondary hover:text-primary disabled:opacity-30"
            >&darr;</button>
          </div>

          <span
            class="shrink-0 px-2 py-0.5 rounded text-xs font-medium"
            :class="typeColor(block.type)"
          >{{ typeLabels[block.type] || block.type }}</span>

          <span class="text-sm text-primary truncate flex-1">{{ blockSummary(block) }}</span>

          <label class="inline-flex items-center gap-2 cursor-pointer select-none shrink-0">
            <span class="relative inline-block w-9 h-5">
              <input v-model="block.visible" type="checkbox" class="peer sr-only" />
              <span class="absolute inset-0 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
              <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </span>
          </label>

          <button
            type="button"
            @click="toggleExpand(block.id)"
            class="text-secondary hover:text-primary text-sm shrink-0 w-8 text-center"
          >{{ expandedId === block.id ? '▲' : '▼' }}</button>

          <button
            type="button"
            @click="removeBlock(idx)"
            class="text-xs text-red-400 hover:text-red-600 shrink-0"
          >删除</button>
        </div>

        <!-- Expanded editor -->
        <div v-if="expandedId === block.id" class="border-t border-gray-100 px-5 py-5 bg-gray-50/50">
          <!-- Banner -->
          <div v-if="block.type === 'banner'" class="text-sm text-secondary">
            轮播横幅的内容在
            <NuxtLink to="/admin/banners" class="text-accent hover:underline">轮播管理</NuxtLink>
            页面配置。此处仅控制是否显示及排序位置。
          </div>

          <!-- Products -->
          <div v-else-if="block.type === 'products'" class="space-y-4 max-w-xl">
            <div>
              <label class="block text-xs text-secondary mb-1.5">区块标题</label>
              <input v-model="block.title" type="text" placeholder="如：甄选系列" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs text-secondary mb-1.5">副标题</label>
              <input v-model="block.subtitle" type="text" placeholder="如：每一副，都是对极简美学的致敬" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-secondary mb-1.5">每行显示数</label>
                <select v-model.number="block.perRow" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none bg-white">
                  <option :value="2">每行 2 个</option>
                  <option :value="3">每行 3 个</option>
                  <option :value="4">每行 4 个</option>
                  <option :value="5">每行 5 个</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-secondary mb-1.5">显示行数</label>
                <input v-model.number="block.rows" type="number" min="1" max="5" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
              </div>
            </div>
            <p class="text-xs text-gray-400">实际显示数量 = 每行显示数 × 行数</p>
          </div>

          <!-- Image Text -->
          <div v-else-if="block.type === 'image_text'" class="space-y-4 max-w-2xl">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-secondary mb-1.5">标签文字</label>
                <input v-model="block.label" type="text" placeholder="如：BRAND STORY" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs text-secondary mb-1.5">图片位置</label>
                <select v-model="block.image_position" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none bg-white">
                  <option value="left">图片在左</option>
                  <option value="right">图片在右</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-xs text-secondary mb-1.5">主标题（换行用 Enter）</label>
              <textarea v-model="block.heading" rows="2" placeholder="如：让框架消失&#10;让世界更清晰" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none resize-none" />
            </div>
            <div>
              <label class="block text-xs text-secondary mb-1.5">描述文字</label>
              <textarea v-model="block.description" rows="3" placeholder="板块的描述内容..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none resize-none" />
            </div>
            <div>
              <label class="block text-xs text-secondary mb-1.5">图片</label>
              <ImageUploader v-model="block.image" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-secondary mb-1.5">链接文字</label>
                <input v-model="block.link_text" type="text" placeholder="如：了解品牌故事" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs text-secondary mb-1.5">链接地址</label>
                <input v-model="block.link_url" type="text" placeholder="如：/about" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-xs text-secondary mb-1.5">背景颜色</label>
              <div class="flex gap-4">
                <label class="inline-flex items-center gap-2 cursor-pointer">
                  <input v-model="block.bg_color" type="radio" value="white" class="accent-primary" />
                  <span class="text-sm text-primary">白色</span>
                </label>
                <label class="inline-flex items-center gap-2 cursor-pointer">
                  <input v-model="block.bg_color" type="radio" value="surface" class="accent-primary" />
                  <span class="text-sm text-primary">浅灰</span>
                </label>
              </div>
            </div>
          </div>

          <!-- News -->
          <div v-else-if="block.type === 'news'" class="space-y-4 max-w-xl">
            <div>
              <label class="block text-xs text-secondary mb-1.5">区块标题</label>
              <input v-model="block.title" type="text" placeholder="留空则使用导航菜单中的名称" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs text-secondary mb-1.5">副标题</label>
              <input v-model="block.subtitle" type="text" placeholder="留空则使用导航菜单中的副标题" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs text-secondary mb-1.5">显示数量</label>
              <input v-model.number="block.limit" type="number" min="1" max="12" class="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
            </div>
          </div>

          <!-- CTA -->
          <div v-else-if="block.type === 'cta'" class="space-y-4 max-w-xl">
            <div>
              <label class="block text-xs text-secondary mb-1.5">标题</label>
              <input v-model="block.heading" type="text" placeholder="如：探索无框视界" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs text-secondary mb-1.5">副标题</label>
              <input v-model="block.subtitle" type="text" placeholder="如：发现属于你的极简美学" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-secondary mb-1.5">按钮文字</label>
                <input v-model="block.link_text" type="text" placeholder="如：浏览全部产品" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs text-secondary mb-1.5">按钮链接</label>
                <input v-model="block.link_url" type="text" placeholder="如：/products" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-xs text-secondary mb-1.5">背景颜色</label>
              <div class="flex gap-4">
                <label class="inline-flex items-center gap-2 cursor-pointer">
                  <input v-model="block.bg_color" type="radio" value="white" class="accent-primary" />
                  <span class="text-sm text-primary">白色</span>
                </label>
                <label class="inline-flex items-center gap-2 cursor-pointer">
                  <input v-model="block.bg_color" type="radio" value="surface" class="accent-primary" />
                  <span class="text-sm text-primary">浅灰</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Richtext -->
          <div v-else-if="block.type === 'richtext'" class="space-y-4 max-w-2xl">
            <div>
              <label class="block text-xs text-secondary mb-1.5">区块标题（可选）</label>
              <input v-model="block.title" type="text" placeholder="留空则不显示标题" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs text-secondary mb-1.5">内容</label>
              <RichTextEditor v-model="block.content" />
            </div>
            <div>
              <label class="block text-xs text-secondary mb-1.5">背景颜色</label>
              <div class="flex gap-4">
                <label class="inline-flex items-center gap-2 cursor-pointer">
                  <input v-model="block.bg_color" type="radio" value="white" class="accent-primary" />
                  <span class="text-sm text-primary">白色</span>
                </label>
                <label class="inline-flex items-center gap-2 cursor-pointer">
                  <input v-model="block.bg_color" type="radio" value="surface" class="accent-primary" />
                  <span class="text-sm text-primary">浅灰</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 text-secondary">
      暂无板块，点击上方「添加板块」开始搭建首页
    </div>

    <!-- Save -->
    <div class="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-100 -mx-8 px-8 py-4 flex items-center gap-3">
      <button
        @click="saveLayout"
        :disabled="saving"
        class="px-6 py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        {{ saving ? '保存中...' : '保存布局' }}
      </button>
      <span v-if="saved" class="text-sm text-green-600">已保存</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HomepageBlock } from '~/composables/useHomepageSections'
import { DEFAULT_SECTIONS, generateBlockId } from '~/composables/useHomepageSections'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { authFetch } = useAuth()

const blocks = reactive<HomepageBlock[]>([])
const saving = ref(false)
const saved = ref(false)
const expandedId = ref<string | null>(null)
const showAddMenu = ref(false)

const typeLabels: Record<string, string> = {
  banner: '轮播横幅',
  products: '精选产品',
  image_text: '图文板块',
  news: '新闻动态',
  cta: '行动号召',
  richtext: '富文本',
}

function typeColor(type: string): string {
  const map: Record<string, string> = {
    banner: 'bg-blue-50 text-blue-600',
    products: 'bg-green-50 text-green-600',
    image_text: 'bg-purple-50 text-purple-600',
    news: 'bg-orange-50 text-orange-600',
    cta: 'bg-pink-50 text-pink-600',
    richtext: 'bg-yellow-50 text-yellow-700',
  }
  return map[type] || 'bg-gray-50 text-gray-600'
}

function blockSummary(block: HomepageBlock): string {
  switch (block.type) {
    case 'banner': return '轮播横幅 — 内容在轮播管理中配置'
    case 'products': return block.title || '精选产品'
    case 'image_text': return block.heading?.replace(/\n/g, ' ') || block.label || '图文板块'
    case 'news': return block.title || '新闻动态'
    case 'cta': return block.heading || '行动号召'
    case 'richtext': return block.title || '富文本内容'
    default: return ''
  }
}

const addOptions = computed(() => {
  const hasBanner = blocks.some(b => b.type === 'banner')
  return [
    { type: 'banner' as const, label: '轮播横幅', icon: '🎠', disabled: hasBanner },
    { type: 'products' as const, label: '精选产品', icon: '🛍️', disabled: false },
    { type: 'image_text' as const, label: '图文板块', icon: '🖼️', disabled: false },
    { type: 'news' as const, label: '新闻动态', icon: '📰', disabled: false },
    { type: 'cta' as const, label: '行动号召', icon: '📢', disabled: false },
    { type: 'richtext' as const, label: '富文本', icon: '📝', disabled: false },
  ]
})

function addBlock(type: HomepageBlock['type']) {
  if (type === 'banner' && blocks.some(b => b.type === 'banner')) return

  const base: HomepageBlock = {
    id: generateBlockId(),
    type,
    visible: true,
    sort_order: blocks.length,
  }

  switch (type) {
    case 'products':
      base.title = '甄选系列'
      base.subtitle = '每一副，都是对极简美学的致敬'
      base.perRow = 3
      base.rows = 1
      break
    case 'image_text':
      base.label = ''
      base.heading = ''
      base.description = ''
      base.image = ''
      base.link_text = ''
      base.link_url = ''
      base.image_position = 'left'
      base.bg_color = 'surface'
      break
    case 'news':
      base.title = ''
      base.subtitle = ''
      base.limit = 3
      break
    case 'cta':
      base.heading = ''
      base.subtitle = ''
      base.link_text = ''
      base.link_url = ''
      base.bg_color = 'surface'
      break
    case 'richtext':
      base.title = ''
      base.content = ''
      base.bg_color = 'white'
      break
  }

  blocks.push(base)
  expandedId.value = base.id
  showAddMenu.value = false
}

function removeBlock(idx: number) {
  if (!window.confirm('确定删除此板块？')) return
  blocks.splice(idx, 1)
  if (blocks[idx]?.id === expandedId.value) expandedId.value = null
}

function moveBlock(idx: number, dir: number) {
  const target = idx + dir
  if (target < 0 || target >= blocks.length) return
  const temp = blocks[idx]
  blocks[idx] = blocks[target]
  blocks[target] = temp
}

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

async function saveLayout() {
  saving.value = true
  saved.value = false
  const payload = blocks.map((block, idx) => ({ ...block, sort_order: idx }))
  try {
    await authFetch('/api/content/homepage_sections', {
      method: 'PUT',
      body: { content: JSON.stringify(payload) },
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const res = await $fetch<any>('/api/content/homepage_sections')
  let parsed: HomepageBlock[] | null = null
  try {
    parsed = res?.content ? JSON.parse(res.content) : null
  } catch {}
  if (Array.isArray(parsed) && parsed.length > 0) {
    blocks.splice(0, blocks.length, ...parsed.sort((a, b) => a.sort_order - b.sort_order))
  } else {
    blocks.splice(0, blocks.length, ...DEFAULT_SECTIONS)
  }
})

// Close add menu on click outside
if (import.meta.client) {
  const onClickOutside = (e: Event) => {
    if (showAddMenu.value) showAddMenu.value = false
  }
  onMounted(() => document.addEventListener('click', onClickOutside))
  onUnmounted(() => document.removeEventListener('click', onClickOutside))
}
</script>
