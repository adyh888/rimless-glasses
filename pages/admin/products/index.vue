<template>
  <admin-layout title="产品管理">
    <view class="page">
      <!-- 顶部工具栏 -->
      <view class="toolbar">
        <view class="toolbar-left">
          <input class="search" v-model="searchQuery" placeholder="搜索产品名称..." @input="onSearchInput" />
          <picker mode="selector" :range="statusOptions" range-key="label" :value="statusIndex" @change="onStatusChange">
            <view class="picker">{{ statusOptions[statusIndex].label }}</view>
          </picker>
          <picker mode="selector" :range="pageSizeOptions" :value="pageSizeIndex" @change="onPageSizeChange">
            <view class="picker">每页 {{ pageSize }}</view>
          </picker>
          <text class="total">共 {{ total }} 项</text>
        </view>
        <button class="btn-primary" @tap="goNew">+ 新增产品</button>
      </view>

      <!-- 一级分类 -->
      <scroll-view class="chip-row" scroll-x v-if="allCategories.length > 1">
        <view
          class="chip"
          :class="{ active: selectedCategory === '全部' }"
          @tap="selectCategory('全部')"
        >全部</view>
        <view
          v-for="cat in allCategories.filter(c => c !== '全部')"
          :key="cat"
          class="chip"
          :class="{ active: selectedCategory === cat }"
          @tap="selectCategory(cat)"
        >{{ cat }}</view>
      </scroll-view>

      <!-- 二级分类 -->
      <scroll-view class="chip-row sub" scroll-x v-if="subCategories.length">
        <view
          class="chip chip-sub"
          :class="{ active: selectedSubCategory === '全部' }"
          @tap="selectSubCategory('全部')"
        >全部</view>
        <view
          v-for="sub in subCategories"
          :key="sub"
          class="chip chip-sub"
          :class="{ active: selectedSubCategory === sub }"
          @tap="selectSubCategory(sub)"
        >{{ sub }}</view>
      </scroll-view>

      <!-- 批量操作 -->
      <view class="batch-bar" v-if="selectedIds.size > 0">
        <text class="batch-count">已选 {{ selectedIds.size }} 项</text>
        <button class="batch-btn green" :disabled="batchProcessing" @tap="batchAction('set_active')">批量上架</button>
        <button class="batch-btn orange" :disabled="batchProcessing" @tap="batchAction('set_inactive')">批量下架</button>
        <button class="batch-btn blue" :disabled="batchProcessing" @tap="showBatchPrice = true">批量定价</button>
        <button class="batch-btn purple" :disabled="batchProcessing" @tap="showBatchCategory = true">批量分类</button>
        <button class="batch-btn red" :disabled="batchProcessing" @tap="batchAction('delete')">批量删除</button>
      </view>

      <!-- 列表 -->
      <view class="card">
        <view class="row head">
          <view class="col-check">
            <checkbox :checked="isAllSelected" @tap="toggleSelectAll" />
          </view>
          <view class="col-media">媒体</view>
          <view class="col-name">名称</view>
          <view class="col-cat">分类</view>
          <view class="col-price">价格</view>
          <view class="col-sort">排序</view>
          <view class="col-flag">推荐</view>
          <view class="col-flag">状态</view>
          <view class="col-actions">操作</view>
        </view>

        <view v-if="!products.length" class="empty">暂无数据</view>

        <view
          v-for="p in products"
          :key="p._id"
          class="row body"
        >
          <view class="col-check" @tap.stop="toggleSelect(p._id)">
            <checkbox :checked="selectedIds.has(p._id)" />
          </view>
          <view class="col-media">
            <image class="thumb" :src="getFirstMedia(p)" mode="aspectFill" />
          </view>
          <view class="col-name">
            <text class="name">{{ p.name }}</text>
          </view>
          <view class="col-cat">
            <text class="cat">{{ p.category }}{{ p.sub_category ? ' / ' + p.sub_category : '' }}</text>
          </view>
          <view class="col-price">¥{{ Number(p.price).toLocaleString() }}</view>
          <view class="col-sort">{{ p.sort_order || 0 }}</view>
          <view class="col-flag">
            <view
              class="pill"
              :class="p.is_featured ? 'pill-accent' : 'pill-gray'"
              @tap.stop="toggleFeatured(p)"
            >{{ p.is_featured ? '推荐' : '普通' }}</view>
          </view>
          <view class="col-flag">
            <view
              class="pill"
              :class="p.is_active ? 'pill-green' : 'pill-gray'"
              @tap.stop="toggleStatus(p)"
            >{{ p.is_active ? '上架' : '下架' }}</view>
          </view>
          <view class="col-actions">
            <text class="link" @tap.stop="goEdit(p)">编辑</text>
            <text class="link copy" @tap.stop="copyProduct(p)">复制</text>
            <text class="link danger" @tap.stop="deleteProduct(p)">删除</text>
          </view>
        </view>
      </view>

      <!-- 分页 -->
      <view class="pager" v-if="totalPages > 1">
        <button :disabled="currentPage <= 1" @tap="changePage(currentPage - 1)">上一页</button>
        <text class="pager-info">{{ currentPage }} / {{ totalPages }}</text>
        <button :disabled="currentPage >= totalPages" @tap="changePage(currentPage + 1)">下一页</button>
      </view>

      <!-- 批量定价 modal -->
      <view class="modal-mask" v-if="showBatchPrice" @tap.self="showBatchPrice = false">
        <view class="modal">
          <text class="modal-title">批量设置价格</text>
          <text class="modal-tip">将为 {{ selectedIds.size }} 个产品设置统一价格</text>
          <input class="input" v-model.number="batchPriceValue" type="number" placeholder="输入价格" />
          <view class="modal-actions">
            <button class="btn-primary" :disabled="batchProcessing" @tap="confirmBatchPrice">确定</button>
            <button @tap="showBatchPrice = false">取消</button>
          </view>
        </view>
      </view>

      <!-- 批量分类 modal -->
      <view class="modal-mask" v-if="showBatchCategory" @tap.self="showBatchCategory = false">
        <view class="modal">
          <text class="modal-title">批量设置分类</text>
          <text class="modal-tip">为选中产品设置分类，用 / 分隔子分类，例如：太阳镜/偏光</text>
          <input class="input" v-model="batchCategoryValue" placeholder="分类名" />
          <view class="modal-actions">
            <button class="btn-primary" :disabled="batchProcessing || !batchCategoryValue.trim()" @tap="confirmBatchCategory">确定</button>
            <button @tap="showBatchCategory = false">取消</button>
          </view>
        </view>
      </view>
    </view>
  </admin-layout>
</template>

<script>
import AdminLayout from '@/components/admin-layout/admin-layout.vue'
import { cloud, ensureLogin, showErr } from '@/utils/cloud.js'

export default {
  components: { AdminLayout },
  data () {
    return {
      products: [],
      total: 0,
      currentPage: 1,
      pageSize: 20,
      pageSizeOptions: [10, 20, 50, 100],
      pageSizeIndex: 1,
      searchQuery: '',
      searchTimer: null,
      statusOptions: [
        { label: '全部状态', value: 'all' },
        { label: '上架', value: 'active' },
        { label: '下架', value: 'inactive' },
      ],
      statusIndex: 0,
      selectedCategory: '全部',
      selectedSubCategory: '全部',
      allCategories: ['全部'],
      categorySubMap: {},
      selectedIds: new Set(),
      batchProcessing: false,
      showBatchPrice: false,
      showBatchCategory: false,
      batchPriceValue: 0,
      batchCategoryValue: '',
    }
  },
  computed: {
    totalPages () {
      return Math.max(1, Math.ceil(this.total / this.pageSize))
    },
    subCategories () {
      if (this.selectedCategory === '全部') return []
      return this.categorySubMap[this.selectedCategory] || []
    },
    isAllSelected () {
      return this.products.length > 0 && this.products.every(p => this.selectedIds.has(p._id))
    },
  },
  onShow () {
    if (!ensureLogin()) return
    this.loadProducts()
    this.loadCategories()
  },
  methods: {
    parseImages (p) {
      try { return JSON.parse(p.images_json || '[]') } catch (e) { return [] }
    },
    getFirstMedia (p) {
      const imgs = this.parseImages(p)
      return imgs[0] || '/static/placeholder.png'
    },

    onSearchInput () {
      if (this.searchTimer) clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.currentPage = 1
        this.loadProducts()
      }, 300)
    },
    onStatusChange (e) {
      this.statusIndex = e.detail.value
      this.currentPage = 1
      this.loadProducts()
    },
    onPageSizeChange (e) {
      this.pageSizeIndex = e.detail.value
      this.pageSize = this.pageSizeOptions[this.pageSizeIndex]
      this.currentPage = 1
      this.loadProducts()
    },
    changePage (p) {
      if (p < 1 || p > this.totalPages) return
      this.currentPage = p
      this.loadProducts()
    },

    selectCategory (cat) {
      this.selectedCategory = cat
      this.selectedSubCategory = '全部'
      this.currentPage = 1
      this.loadProducts()
    },
    selectSubCategory (sub) {
      this.selectedSubCategory = sub
      this.currentPage = 1
      this.loadProducts()
    },

    toggleSelect (id) {
      const s = new Set(this.selectedIds)
      if (s.has(id)) s.delete(id); else s.add(id)
      this.selectedIds = s
    },
    toggleSelectAll () {
      if (this.isAllSelected) {
        this.selectedIds = new Set()
      } else {
        this.selectedIds = new Set(this.products.map(p => p._id))
      }
    },

    async loadProducts () {
      const query = {
        page: this.currentPage,
        limit: this.pageSize,
      }
      if (this.selectedCategory !== '全部') query.category = this.selectedCategory
      if (this.selectedSubCategory !== '全部') query.sub_category = this.selectedSubCategory
      if (this.searchQuery.trim()) query.search = this.searchQuery.trim()
      const status = this.statusOptions[this.statusIndex].value
      if (status === 'active') query.is_active = 1
      else if (status === 'inactive') query.is_active = 0
      else { query.order_by = 'is_active'; query.order_dir = 'DESC' }

      try {
        const data = await cloud.products.list(query)
        this.products = data.items || []
        this.total = data.total || 0
        this.selectedIds = new Set()
        if (this.products.length === 0 && this.currentPage > 1) {
          this.currentPage = Math.max(1, Math.ceil(this.total / this.pageSize))
          this.loadProducts()
        }
      } catch (e) {
        if (e?.errCode === 'AUTH_REQUIRED' || e?.errCode === 'uni-id-token-expired') {
          uni.reLaunch({ url: '/pages/admin/login/index' })
          return
        }
        showErr(e, '加载失败')
      }
    },

    async loadCategories () {
      try {
        const data = await cloud.products.list({ limit: 9999 })
        const items = data.items || []
        const cats = new Set()
        const map = {}
        for (const p of items) {
          if (p.category) {
            cats.add(p.category)
            if (!map[p.category]) map[p.category] = new Set()
            if (p.sub_category) map[p.category].add(p.sub_category)
          }
        }
        const ordered = [...cats]
        this.allCategories = ['全部', ...ordered]
        const subMap = {}
        for (const [c, set] of Object.entries(map)) subMap[c] = [...set]
        this.categorySubMap = subMap
      } catch (e) {
        // 分类加载失败不影响主列表，静默
      }
    },

    async toggleFeatured (p) {
      try {
        const newVal = p.is_featured ? 0 : 1
        await cloud.products.update(p._id, {
          ...p,
          is_featured: newVal,
          images: this.parseImages(p),
          specs: this.parseSpecs(p),
        })
        p.is_featured = newVal
      } catch (e) {
        showErr(e, '切换推荐失败')
      }
    },
    async toggleStatus (p) {
      try {
        const newVal = p.is_active ? 0 : 1
        await cloud.products.update(p._id, {
          ...p,
          is_active: newVal,
          images: this.parseImages(p),
          specs: this.parseSpecs(p),
        })
        p.is_active = newVal
      } catch (e) {
        showErr(e, '切换状态失败')
      }
    },
    parseSpecs (p) {
      try { return JSON.parse(p.specs_json || '{}') } catch (e) { return {} }
    },

    async batchAction (action) {
      if (this.selectedIds.size === 0) return
      const names = { delete: '删除', set_active: '上架', set_inactive: '下架' }
      const confirmed = await this.confirm(`确定要${names[action] || '操作'}选中的 ${this.selectedIds.size} 个产品吗？`)
      if (!confirmed) return
      this.batchProcessing = true
      try {
        await cloud.products.batch({ ids: [...this.selectedIds], action })
        this.selectedIds = new Set()
        await this.loadProducts()
        if (action === 'delete') await this.loadCategories()
      } catch (e) {
        showErr(e, '操作失败')
      } finally {
        this.batchProcessing = false
      }
    },
    async confirmBatchPrice () {
      this.batchProcessing = true
      try {
        await cloud.products.batch({
          ids: [...this.selectedIds],
          action: 'set_price',
          value: Number(this.batchPriceValue) || 0,
        })
        this.showBatchPrice = false
        this.selectedIds = new Set()
        await this.loadProducts()
      } catch (e) {
        showErr(e, '操作失败')
      } finally {
        this.batchProcessing = false
      }
    },
    async confirmBatchCategory () {
      const value = this.batchCategoryValue.trim()
      if (!value) return
      this.batchProcessing = true
      try {
        await cloud.products.batch({
          ids: [...this.selectedIds],
          action: 'set_category',
          value,
        })
        this.showBatchCategory = false
        this.selectedIds = new Set()
        this.batchCategoryValue = ''
        await this.loadProducts()
        await this.loadCategories()
      } catch (e) {
        showErr(e, '操作失败')
      } finally {
        this.batchProcessing = false
      }
    },

    async copyProduct (p) {
      try {
        const src = await cloud.products.getById(p._id)
        const body = {
          name: `${src.name}（副本）`,
          slug: `product-copy-${Date.now()}`,
          category: src.category || '',
          sub_category: src.sub_category || '',
          price: src.price || 0,
          sort_order: src.sort_order || 0,
          is_featured: src.is_featured || 0,
          is_active: 0,
          images: this.parseImages(src),
          description: src.description || '',
          specs: this.parseSpecs(src),
        }
        await cloud.products.create(body)
        await this.loadProducts()
        await this.loadCategories()
      } catch (e) {
        showErr(e, '复制失败')
      }
    },

    async deleteProduct (p) {
      const ok = await this.confirm('确定要删除这个产品吗？')
      if (!ok) return
      try {
        await cloud.products.remove(p._id)
        await this.loadProducts()
        await this.loadCategories()
      } catch (e) {
        showErr(e, '删除失败')
      }
    },

    goNew () {
      uni.navigateTo({ url: '/pages/admin/products/edit' })
    },
    goEdit (p) {
      uni.navigateTo({ url: `/pages/admin/products/edit?id=${p._id}` })
    },

    confirm (content) {
      return new Promise((resolve) => {
        uni.showModal({
          title: '确认',
          content,
          success: (res) => resolve(!!res.confirm),
          fail: () => resolve(false),
        })
      })
    },
  },
}
</script>

<style>
.page { width: 100%; }

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 16rpx;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}
.search {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10rpx 24rpx;
  font-size: 13px;
  width: 320rpx;
  background: #fff;
}
.picker {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8rpx 20rpx;
  font-size: 12px;
  background: #fff;
  color: #1f2937;
}
.total { font-size: 12px; color: #6b7280; }
.btn-primary {
  background: #1f2937;
  color: #fff;
  font-size: 13px;
  padding: 0 28rpx;
  height: 36px;
  line-height: 36px;
  border-radius: 8px;
}

.chip-row {
  white-space: nowrap;
  margin-bottom: 16rpx;
}
.chip {
  display: inline-block;
  padding: 6rpx 24rpx;
  margin-right: 12rpx;
  font-size: 12px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #6b7280;
}
.chip.active { background: #1f2937; color: #fff; }
.chip-sub.active { background: #c8a464; color: #fff; }

.batch-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.batch-count { font-size: 13px; color: #6b7280; }
.batch-btn {
  font-size: 12px;
  border-radius: 8px;
  height: 32px;
  line-height: 32px;
  padding: 0 20rpx;
  background: #fff;
  border: 1px solid #e5e7eb;
}
.batch-btn.green { color: #16a34a; border-color: #bbf7d0; background: #f0fdf4; }
.batch-btn.orange { color: #ea580c; border-color: #fed7aa; background: #fff7ed; }
.batch-btn.blue { color: #2563eb; border-color: #bfdbfe; background: #eff6ff; }
.batch-btn.purple { color: #9333ea; border-color: #e9d5ff; background: #faf5ff; }
.batch-btn.red { color: #dc2626; border-color: #fecaca; background: #fef2f2; }

.card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.row {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  font-size: 13px;
  border-bottom: 1px solid #f3f4f6;
}
.row.head { background: #f9fafb; color: #6b7280; font-size: 12px; }
.row.body { color: #1f2937; }
.row.body:last-child { border-bottom: none; }
.col-check { width: 56rpx; }
.col-media { width: 120rpx; }
.col-name { flex: 2; padding-right: 16rpx; }
.col-cat { flex: 1.4; color: #6b7280; }
.col-price { width: 140rpx; }
.col-sort { width: 80rpx; }
.col-flag { width: 100rpx; }
.col-actions { flex: 1; text-align: right; }
.thumb { width: 96rpx; height: 72rpx; background: #f3f4f6; border-radius: 6px; }
.name { color: #1f2937; }
.cat { color: #6b7280; }
.pill { display: inline-block; padding: 2rpx 16rpx; font-size: 11px; border-radius: 999px; }
.pill-green { background: #ecfdf5; color: #16a34a; }
.pill-accent { background: rgba(200,164,100,0.12); color: #c8a464; }
.pill-gray { background: #f3f4f6; color: #6b7280; }
.link { color: #c8a464; font-size: 12px; margin-left: 16rpx; }
.link.copy { color: #2563eb; }
.link.danger { color: #dc2626; }
.empty { padding: 60rpx 0; text-align: center; color: #9ca3af; font-size: 13px; }

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx 0;
}
.pager-info { font-size: 13px; color: #6b7280; padding: 0 12rpx; }

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal {
  width: 80vw;
  max-width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 32rpx;
}
.modal-title { display: block; font-size: 15px; color: #1f2937; font-weight: 500; margin-bottom: 16rpx; }
.modal-tip { display: block; font-size: 12px; color: #6b7280; margin-bottom: 12rpx; }
.modal-actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
.input {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12rpx 20rpx;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}
</style>
