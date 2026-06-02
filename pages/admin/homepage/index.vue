<template>
  <admin-layout title="首页管理">
    <view class="page">
      <view class="header">
        <view>
          <text class="title">首页布局</text>
          <text class="subtitle">调整顺序、编辑内容、控制显示隐藏，自定义首页板块</text>
        </view>
        <view class="add-wrap">
          <button class="btn-primary" @tap="toggleAddMenu">+ 添加板块</button>
          <view v-if="showAddMenu" class="add-menu" @tap.stop>
            <view
              v-for="opt in addOptions"
              :key="opt.type"
              class="add-item"
              :class="{ disabled: opt.disabled }"
              @tap="addBlock(opt)"
            >
              <text class="add-icon">{{ opt.icon }}</text>
              <text class="add-label">{{ opt.label }}</text>
              <text v-if="opt.disabled" class="add-hint">(已存在)</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="blocks.length" class="blocks">
        <view v-for="(block, idx) in blocks" :key="block.id" class="block">
          <view class="block-head">
            <view class="order">
              <text class="arrow" :class="{ disabled: idx === 0 }" @tap="moveBlock(idx, -1)">↑</text>
              <text class="arrow" :class="{ disabled: idx === blocks.length - 1 }" @tap="moveBlock(idx, 1)">↓</text>
            </view>
            <text class="type-pill" :class="'type-' + block.type">{{ TYPE_LABELS[block.type] || block.type }}</text>
            <text class="summary">{{ blockSummary(block) }}</text>
            <switch class="visible-switch" :checked="block.visible" @change="onVisibleChange(block, $event)" color="#1f2937" />
            <text class="toggle" @tap="toggleExpand(block.id)">{{ expandedId === block.id ? '▲' : '▼' }}</text>
            <text class="remove-link" @tap="removeBlock(idx)">删除</text>
          </view>

          <view v-if="expandedId === block.id" class="block-body">
            <view v-if="block.type === 'banner'" class="hint-text">
              轮播横幅的内容在「轮播管理」中维护，此处仅控制是否显示及排序。
            </view>

            <template v-else-if="block.type === 'products'">
              <view class="field">
                <text class="label">区块标题</text>
                <input class="input" v-model="block.title" placeholder="如：甄选系列" />
              </view>
              <view class="field">
                <text class="label">副标题</text>
                <input class="input" v-model="block.subtitle" placeholder="如：每一副，都是对极简美学的致敬" />
              </view>
              <view class="grid-2">
                <view class="field">
                  <text class="label">每行显示数</text>
                  <picker mode="selector" :range="perRowOptions" :value="perRowOptions.indexOf(String(block.perRow || 3))" @change="e => block.perRow = Number(perRowOptions[e.detail.value])">
                    <view class="picker-box">每行 {{ block.perRow || 3 }} 个</view>
                  </picker>
                </view>
                <view class="field">
                  <text class="label">显示行数</text>
                  <input class="input" type="number" v-model.number="block.rows" />
                </view>
              </view>
              <text class="hint-text">实际显示数量 = 每行显示数 × 行数</text>
            </template>

            <template v-else-if="block.type === 'image_text'">
              <view class="grid-2">
                <view class="field">
                  <text class="label">标签文字</text>
                  <input class="input" v-model="block.label" placeholder="如：BRAND STORY" />
                </view>
                <view class="field">
                  <text class="label">图片位置</text>
                  <picker mode="selector" :range="positionOptions" :value="block.image_position === 'right' ? 1 : 0" @change="e => block.image_position = e.detail.value === '0' || e.detail.value === 0 ? 'left' : 'right'">
                    <view class="picker-box">{{ block.image_position === 'right' ? '图片在右' : '图片在左' }}</view>
                  </picker>
                </view>
              </view>
              <view class="field">
                <text class="label">主标题（换行用 Enter）</text>
                <textarea class="textarea" v-model="block.heading" placeholder="如：让框架消失&#10;让世界更清晰" />
              </view>
              <view class="field">
                <text class="label">描述文字</text>
                <textarea class="textarea" v-model="block.description" placeholder="板块的描述内容..." />
              </view>
              <view class="field">
                <text class="label">图片</text>
                <image-uploader v-model="block.image" folder="homepage" />
              </view>
              <view class="grid-2">
                <view class="field">
                  <text class="label">链接文字</text>
                  <input class="input" v-model="block.link_text" placeholder="如：了解品牌故事" />
                </view>
                <view class="field">
                  <text class="label">链接地址</text>
                  <input class="input" v-model="block.link_url" placeholder="如：/about" />
                </view>
              </view>
              <view class="field">
                <text class="label">背景颜色</text>
                <view class="radio-row">
                  <view class="radio" :class="{ active: block.bg_color === 'white' }" @tap="block.bg_color = 'white'">白色</view>
                  <view class="radio" :class="{ active: block.bg_color === 'surface' }" @tap="block.bg_color = 'surface'">浅灰</view>
                </view>
              </view>
            </template>

            <template v-else-if="block.type === 'news'">
              <view class="field">
                <text class="label">区块标题</text>
                <input class="input" v-model="block.title" placeholder="留空则使用导航菜单中的名称" />
              </view>
              <view class="field">
                <text class="label">副标题</text>
                <input class="input" v-model="block.subtitle" placeholder="留空则使用导航菜单中的副标题" />
              </view>
              <view class="field">
                <text class="label">显示数量</text>
                <input class="input small" type="number" v-model.number="block.limit" />
              </view>
            </template>

            <template v-else-if="block.type === 'cta'">
              <view class="field">
                <text class="label">标题</text>
                <input class="input" v-model="block.heading" placeholder="如：探索无框视界" />
              </view>
              <view class="field">
                <text class="label">副标题</text>
                <input class="input" v-model="block.subtitle" placeholder="如：发现属于你的极简美学" />
              </view>
              <view class="grid-2">
                <view class="field">
                  <text class="label">按钮文字</text>
                  <input class="input" v-model="block.link_text" placeholder="如：浏览全部产品" />
                </view>
                <view class="field">
                  <text class="label">按钮链接</text>
                  <input class="input" v-model="block.link_url" placeholder="如：/products" />
                </view>
              </view>
              <view class="field">
                <text class="label">背景颜色</text>
                <view class="radio-row">
                  <view class="radio" :class="{ active: block.bg_color === 'white' }" @tap="block.bg_color = 'white'">白色</view>
                  <view class="radio" :class="{ active: block.bg_color === 'surface' }" @tap="block.bg_color = 'surface'">浅灰</view>
                </view>
              </view>
            </template>

            <template v-else-if="block.type === 'richtext'">
              <view class="field">
                <text class="label">区块标题（可选）</text>
                <input class="input" v-model="block.title" placeholder="留空则不显示标题" />
              </view>
              <view class="field">
                <text class="label">内容</text>
                <rich-text-editor v-model="block.content" placeholder="富文本板块内容" />
              </view>
              <view class="field">
                <text class="label">背景颜色</text>
                <view class="radio-row">
                  <view class="radio" :class="{ active: block.bg_color === 'white' }" @tap="block.bg_color = 'white'">白色</view>
                  <view class="radio" :class="{ active: block.bg_color === 'surface' }" @tap="block.bg_color = 'surface'">浅灰</view>
                </view>
              </view>
            </template>
          </view>
        </view>
      </view>

      <view v-else class="empty">暂无板块，点击右上方「添加板块」开始搭建首页</view>

      <view class="save-bar">
        <button class="btn-primary" :disabled="saving" @tap="saveLayout">{{ saving ? '保存中...' : '保存布局' }}</button>
        <text v-if="saved" class="saved-tip">已保存</text>
      </view>
    </view>
  </admin-layout>
</template>

<script>
import AdminLayout from '@/components/admin-layout/admin-layout.vue'
import ImageUploader from '@/components/image-uploader/image-uploader.vue'
import RichTextEditor from '@/components/rich-text-editor/rich-text-editor.vue'
import { cloud, ensureLogin, showErr } from '@/utils/cloud.js'
import { DEFAULT_SECTIONS, TYPE_LABELS, buildBlock, blockSummary } from '@/utils/homepage-sections.js'

export default {
  components: { AdminLayout, ImageUploader, RichTextEditor },
  data () {
    return {
      blocks: [],
      saving: false,
      saved: false,
      expandedId: null,
      showAddMenu: false,
      TYPE_LABELS,
      perRowOptions: ['2', '3', '4', '5'],
      positionOptions: ['图片在左', '图片在右'],
    }
  },
  computed: {
    addOptions () {
      const hasBanner = this.blocks.some(b => b.type === 'banner')
      return [
        { type: 'banner', label: '轮播横幅', icon: '🎠', disabled: hasBanner },
        { type: 'products', label: '精选产品', icon: '🛍️', disabled: false },
        { type: 'image_text', label: '图文板块', icon: '🖼️', disabled: false },
        { type: 'news', label: '新闻动态', icon: '📰', disabled: false },
        { type: 'cta', label: '行动号召', icon: '📢', disabled: false },
        { type: 'richtext', label: '富文本', icon: '📝', disabled: false },
      ]
    },
  },
  onLoad () {
    if (!ensureLogin()) return
    this.load()
  },
  methods: {
    blockSummary,
    async load () {
      try {
        const data = await cloud.content.get('homepage_sections')
        let parsed = null
        try { parsed = data?.content ? JSON.parse(data.content) : null } catch (e) {}
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.blocks = parsed.slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        } else {
          this.blocks = DEFAULT_SECTIONS.map(b => ({ ...b }))
        }
      } catch (e) {
        if (e?.errCode === 'AUTH_REQUIRED') { uni.reLaunch({ url: '/pages/admin/login/index' }); return }
        showErr(e, '加载失败')
      }
    },
    toggleAddMenu () { this.showAddMenu = !this.showAddMenu },
    addBlock (opt) {
      if (opt.disabled) return
      const block = buildBlock(opt.type)
      block.sort_order = this.blocks.length
      this.blocks.push(block)
      this.expandedId = block.id
      this.showAddMenu = false
    },
    removeBlock (idx) {
      uni.showModal({
        title: '确认',
        content: '确定删除此板块？',
        success: res => {
          if (!res.confirm) return
          const removed = this.blocks.splice(idx, 1)[0]
          if (removed && removed.id === this.expandedId) this.expandedId = null
        },
      })
    },
    moveBlock (idx, dir) {
      const target = idx + dir
      if (target < 0 || target >= this.blocks.length) return
      const items = [...this.blocks]
      const [moved] = items.splice(idx, 1)
      items.splice(target, 0, moved)
      this.blocks = items
    },
    toggleExpand (id) {
      this.expandedId = this.expandedId === id ? null : id
    },
    onVisibleChange (block, e) {
      block.visible = !!e.detail.value
    },
    async saveLayout () {
      this.saving = true
      this.saved = false
      const payload = this.blocks.map((block, idx) => ({ ...block, sort_order: idx }))
      try {
        await cloud.content.set('homepage_sections', { content: JSON.stringify(payload) })
        this.saved = true
        setTimeout(() => { this.saved = false }, 3000)
        uni.showToast({ icon: 'success', title: '已保存' })
      } catch (e) { showErr(e, '保存失败') } finally { this.saving = false }
    },
  },
}
</script>

<style>
.page { width: 100%; padding-bottom: 32rpx; }
.header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24rpx; gap: 16rpx; flex-wrap: wrap; }
.title { display: block; font-size: 18px; color: #1f2937; font-weight: 500; }
.subtitle { display: block; font-size: 12px; color: #9ca3af; margin-top: 4rpx; }
.btn-primary { background: #1f2937; color: #fff; font-size: 13px; padding: 0 28rpx; height: 36px; line-height: 36px; border-radius: 8px; }
.add-wrap { position: relative; }
.add-menu { position: absolute; right: 0; top: 40px; width: 200rpx; background: #fff; border: 1px solid #f3f4f6; border-radius: 8px; box-shadow: 0 6px 16px rgba(0,0,0,0.06); padding: 8rpx 0; z-index: 100; }
.add-item { display: flex; align-items: center; gap: 8rpx; padding: 16rpx 20rpx; font-size: 13px; color: #1f2937; }
.add-item.disabled { color: #d1d5db; }
.add-icon { font-size: 14px; }
.add-label { flex: 1; }
.add-hint { font-size: 11px; color: #9ca3af; }
.blocks { display: flex; flex-direction: column; gap: 16rpx; }
.block { background: #fff; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); overflow: hidden; }
.block-head { display: flex; align-items: center; gap: 12rpx; padding: 20rpx 24rpx; }
.order { display: flex; flex-direction: column; gap: 4rpx; }
.arrow { font-size: 12px; color: #6b7280; padding: 2rpx 6rpx; }
.arrow.disabled { color: #d1d5db; }
.type-pill { font-size: 11px; padding: 2rpx 12rpx; border-radius: 999px; background: #f3f4f6; color: #6b7280; flex-shrink: 0; }
.type-banner { background: #eff6ff; color: #2563eb; }
.type-products { background: #ecfdf5; color: #16a34a; }
.type-image_text { background: #faf5ff; color: #9333ea; }
.type-news { background: #fff7ed; color: #ea580c; }
.type-cta { background: #fdf2f8; color: #db2777; }
.type-richtext { background: #fefce8; color: #ca8a04; }
.summary { flex: 1; font-size: 13px; color: #1f2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.visible-switch { transform: scale(0.8); }
.toggle { font-size: 12px; color: #6b7280; padding: 0 8rpx; }
.remove-link { font-size: 12px; color: #dc2626; padding: 0 4rpx; }
.block-body { border-top: 1px solid #f3f4f6; padding: 24rpx; background: #fafafa; }
.field { margin-bottom: 20rpx; }
.label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 8rpx; }
.hint-text { display: block; font-size: 12px; color: #9ca3af; }
.input { width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12rpx 20rpx; font-size: 13px; background: #fff; box-sizing: border-box; }
.input.small { width: 160rpx; }
.picker-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12rpx 20rpx; font-size: 13px; background: #fff; }
.textarea { width: 100%; min-height: 120rpx; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12rpx 20rpx; font-size: 13px; background: #fff; box-sizing: border-box; }
.textarea.tall { min-height: 320rpx; }
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280rpx, 1fr)); gap: 20rpx; }
.media-block { border: 1px solid #f3f4f6; border-radius: 8px; padding: 16rpx; background: #fff; }
.preview { width: 100%; max-width: 480rpx; border-radius: 6px; background: #f9fafb; }
.preview.placeholder { padding: 24rpx; text-align: center; color: #6b7280; font-size: 12px; }
.media-actions { display: flex; gap: 12rpx; align-items: center; margin-top: 12rpx; flex-wrap: wrap; }
.btn-mini { height: 32px; line-height: 32px; font-size: 12px; padding: 0 24rpx; background: #1f2937; color: #fff; border-radius: 8px; }
.radio-row { display: flex; gap: 16rpx; }
.radio { font-size: 13px; color: #6b7280; padding: 8rpx 24rpx; border: 1px solid #e5e7eb; border-radius: 999px; background: #fff; }
.radio.active { border-color: #1f2937; color: #1f2937; background: #f3f4f6; }
.empty { padding: 80rpx 0; text-align: center; color: #9ca3af; font-size: 13px; }
.save-bar { display: flex; align-items: center; gap: 16rpx; margin-top: 32rpx; padding: 24rpx; background: #fff; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); position: sticky; bottom: 16rpx; }
.saved-tip { font-size: 12px; color: #16a34a; }
</style>
