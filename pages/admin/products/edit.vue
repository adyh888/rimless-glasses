<template>
  <admin-layout :title="isNew ? '新增产品' : '编辑产品'">
    <view class="page">
      <view class="form">
        <view class="grid-2">
          <view class="field">
            <text class="label">产品名称 *</text>
            <input class="input" v-model="form.name" placeholder="必填" />
          </view>
          <view class="field">
            <text class="label">Slug（URL路径）</text>
            <input class="input" v-model="form.slug" placeholder="留空自动生成" />
          </view>
        </view>

        <view class="grid-4">
          <view class="field">
            <text class="label">分类</text>
            <input class="input" v-model="form.category" placeholder="分类名" />
            <view class="suggest" v-if="allCategories.length">
              <text
                v-for="c in allCategories.slice(0, 8)"
                :key="c"
                class="suggest-item"
                @tap="form.category = c"
              >{{ c }}</text>
            </view>
          </view>
          <view class="field">
            <text class="label">子分类</text>
            <input class="input" v-model="form.sub_category" placeholder="子分类" />
            <view class="suggest" v-if="subCategoriesForCurrent.length">
              <text
                v-for="s in subCategoriesForCurrent.slice(0, 8)"
                :key="s"
                class="suggest-item"
                @tap="form.sub_category = s"
              >{{ s }}</text>
            </view>
          </view>
          <view class="field">
            <text class="label">价格（元）</text>
            <input class="input" type="number" v-model.number="form.price" />
          </view>
          <view class="field">
            <text class="label">排序</text>
            <input class="input" type="number" v-model.number="form.sort_order" />
          </view>
        </view>

        <view class="grid-2">
          <view class="field">
            <text class="label">推荐产品</text>
            <picker mode="selector" :range="boolOptions" range-key="label" :value="form.is_featured ? 0 : 1" @change="(e) => form.is_featured = e.detail.value === '0' || e.detail.value === 0 ? 1 : 0">
              <view class="picker-box">{{ form.is_featured ? '是' : '否' }}</view>
            </picker>
          </view>
          <view class="field">
            <text class="label">状态</text>
            <picker mode="selector" :range="statusOptions" range-key="label" :value="form.is_active ? 0 : 1" @change="(e) => form.is_active = e.detail.value === '0' || e.detail.value === 0 ? 1 : 0">
              <view class="picker-box">{{ form.is_active ? '上架' : '下架' }}</view>
            </picker>
          </view>
        </view>

        <!-- 产品媒体 -->
        <view class="field">
          <view class="label-row">
            <text class="label">产品媒体（图片/视频）</text>
            <text class="hint">拖拽暂未实现；先按数组顺序保存</text>
          </view>
          <view class="media-grid">
            <view
              v-for="(url, idx) in form.images"
              :key="url + idx"
              class="media-item"
            >
              <image v-if="!isVideoUrl(url)" class="media-img" :src="url" mode="aspectFill" />
              <view v-else class="media-video">视频</view>
              <text class="media-remove" @tap="form.images.splice(idx, 1)">×</text>
              <text class="media-idx">{{ idx + 1 }}</text>
            </view>
            <view class="media-add" @tap="chooseImage">+ 添加图片</view>
            <view class="media-add" @tap="chooseVideo">+ 添加视频</view>
          </view>
          <view class="media-manual">
            <input class="input" v-model="manualUrl" placeholder="或粘贴媒体 URL" />
            <button class="btn-mini" @tap="addManualUrl">添加</button>
          </view>
        </view>

        <!-- 产品描述（富文本占位：暂用 textarea） -->
        <view class="field">
          <text class="label">产品描述</text>
          <textarea
            class="textarea"
            v-model="form.description"
            placeholder="支持 HTML（富文本编辑器后续接入）"
            auto-height
          />
        </view>

        <!-- 产品参数 -->
        <view class="field">
          <text class="label">产品参数</text>
          <view
            v-for="(row, idx) in form.specRows"
            :key="idx"
            class="spec-row"
          >
            <input class="input spec-key" v-model="row.key" placeholder="参数名" />
            <input class="input spec-val" v-model="row.value" placeholder="参数值" />
            <text class="link danger" @tap="form.specRows.splice(idx, 1)">删除</text>
          </view>
          <text class="link" @tap="form.specRows.push({ key: '', value: '' })">+ 添加参数</text>
        </view>

        <view class="actions">
          <button class="btn-primary" :disabled="saving" @tap="save">
            {{ saving ? '保存中...' : '保存' }}
          </button>
          <button @tap="cancel">取消</button>
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
      isNew: true,
      id: '',
      saving: false,
      form: {
        name: '',
        slug: '',
        category: '',
        sub_category: '',
        price: 0,
        sort_order: 0,
        is_featured: 0,
        is_active: 1,
        images: [],
        description: '',
        specRows: [{ key: '', value: '' }],
      },
      manualUrl: '',
      allCategories: [],
      categorySubMap: {},
      boolOptions: [{ label: '是' }, { label: '否' }],
      statusOptions: [{ label: '上架' }, { label: '下架' }],
    }
  },
  computed: {
    subCategoriesForCurrent () {
      const cat = (this.form.category || '').trim()
      if (!cat) return []
      return this.categorySubMap[cat] || []
    },
  },
  onLoad (q) {
    if (!ensureLogin()) return
    this.id = q?.id || ''
    this.isNew = !this.id
    this.loadCatalogOptions()
    if (!this.isNew) this.loadProduct()
  },
  methods: {
    isVideoUrl (url) {
      return /\.(mp4|mov|webm|m3u8)(\?|$)/i.test(url || '')
    },

    async loadProduct () {
      try {
        const data = await cloud.products.getById(this.id)
        this.form.name = data.name
        this.form.slug = data.slug
        this.form.category = data.category
        this.form.sub_category = data.sub_category || ''
        this.form.price = data.price
        this.form.sort_order = data.sort_order
        this.form.is_featured = data.is_featured
        this.form.is_active = data.is_active
        this.form.description = data.description || ''
        try { this.form.images = JSON.parse(data.images_json || '[]') } catch (e) { this.form.images = [] }
        try {
          const specs = JSON.parse(data.specs_json || '{}')
          const rows = Object.entries(specs).map(([key, value]) => ({ key, value: String(value) }))
          this.form.specRows = rows.length ? rows : [{ key: '', value: '' }]
        } catch (e) {
          this.form.specRows = [{ key: '', value: '' }]
        }
      } catch (e) {
        if (e?.errCode === 'AUTH_REQUIRED' || e?.errCode === 'uni-id-token-expired') {
          uni.reLaunch({ url: '/pages/admin/login/index' })
          return
        }
        showErr(e, '加载产品失败')
      }
    },

    async loadCatalogOptions () {
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
        this.allCategories = [...cats]
        const subMap = {}
        for (const [c, set] of Object.entries(map)) subMap[c] = [...set]
        this.categorySubMap = subMap
      } catch (e) {
        // 静默
      }
    },

    addManualUrl () {
      const url = this.manualUrl.trim()
      if (!url) return
      this.form.images.push(url)
      this.manualUrl = ''
    },

    chooseImage () {
      uni.chooseImage({
        count: 9,
        success: async (res) => {
          for (const path of res.tempFilePaths) {
            await this.uploadFileAndRegister(path, 'image')
          }
        },
      })
    },
    chooseVideo () {
      uni.chooseVideo({
        sourceType: ['album', 'camera'],
        success: async (res) => {
          await this.uploadFileAndRegister(res.tempFilePath, 'video', res.size, res.name)
        },
      })
    },

    async uploadFileAndRegister (filePath, type = 'image', size = 0, name = '') {
      try {
        uni.showLoading({ title: '上传中...' })
        const baseName = name || (filePath.split('/').pop() || `${type}-${Date.now()}`)
        const cloudPath = `products/${Date.now()}-${baseName.replace(/[^\w.\-]/g, '_')}`
        const res = await uniCloud.uploadFile({ cloudPath, filePath })
        const fileID = res.fileID
        // 直传完成；后端登记媒体，可选
        try {
          await cloud.media.register({
            fileID,
            name: baseName,
            type,
            size: size || 0,
            folderPath: 'products',
          })
        } catch (e) {
          // 登记失败不影响图片绑定到产品
        }
        // 取一个可访问的 URL
        let publicUrl = fileID
        try {
          const tmp = await uniCloud.getTempFileURL({ fileList: [fileID] })
          publicUrl = tmp.fileList[0]?.tempFileURL || fileID
        } catch (e) {}
        this.form.images.push(publicUrl)
      } catch (e) {
        showErr(e, '上传失败')
      } finally {
        uni.hideLoading()
      }
    },

    async save () {
      if (!this.form.name.trim()) {
        return uni.showToast({ icon: 'none', title: '请填写产品名称' })
      }
      this.saving = true
      try {
        const specs = {}
        this.form.specRows.forEach(r => {
          if (r.key && r.key.trim()) specs[r.key.trim()] = r.value
        })
        const body = {
          name: this.form.name,
          slug: this.form.slug || `product-${Date.now()}`,
          category: this.form.category,
          sub_category: this.form.sub_category,
          price: Number(this.form.price) || 0,
          sort_order: Number(this.form.sort_order) || 0,
          is_featured: this.form.is_featured,
          is_active: this.form.is_active,
          images: this.form.images,
          description: this.form.description,
          specs,
        }
        if (this.isNew) {
          await cloud.products.create(body)
        } else {
          await cloud.products.update(this.id, body)
        }
        uni.showToast({ icon: 'success', title: '已保存' })
        setTimeout(() => uni.navigateBack(), 600)
      } catch (e) {
        showErr(e, '保存失败')
      } finally {
        this.saving = false
      }
    },

    cancel () {
      uni.navigateBack()
    },
  },
}
</script>

<style>
.page { width: 100%; }
.form {
  background: #fff;
  border-radius: 12px;
  padding: 32rpx;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.field { margin-bottom: 24rpx; }
.label-row { display: flex; align-items: center; justify-content: space-between; }
.label { display: block; font-size: 13px; color: #6b7280; margin-bottom: 8rpx; }
.hint { font-size: 11px; color: #9ca3af; }
.input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12rpx 20rpx;
  font-size: 14px;
  background: #fff;
  box-sizing: border-box;
}
.textarea {
  width: 100%;
  min-height: 240rpx;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12rpx 20rpx;
  font-size: 14px;
  background: #fff;
  box-sizing: border-box;
}
.picker-box {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12rpx 20rpx;
  font-size: 14px;
  background: #fff;
}

.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280rpx, 1fr)); gap: 24rpx; }
.grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220rpx, 1fr)); gap: 24rpx; }

.suggest { margin-top: 8rpx; display: flex; flex-wrap: wrap; gap: 8rpx; }
.suggest-item {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4rpx 16rpx;
  border-radius: 999px;
}

.media-grid { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 8rpx; }
.media-item {
  position: relative;
  width: 192rpx;
  height: 192rpx;
  background: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
}
.media-img { width: 100%; height: 100%; }
.media-video {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 12px;
}
.media-remove {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  border-radius: 50%;
  background: #dc2626;
  color: #fff;
  font-size: 14px;
}
.media-idx {
  position: absolute;
  bottom: 8rpx;
  left: 8rpx;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 11px;
  padding: 0 8rpx;
  border-radius: 4px;
}
.media-add {
  width: 192rpx;
  height: 192rpx;
  border: 1px dashed #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 12px;
}
.media-manual {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
  align-items: center;
}
.btn-mini {
  height: 32px;
  line-height: 32px;
  font-size: 12px;
  padding: 0 24rpx;
  background: #1f2937;
  color: #fff;
  border-radius: 8px;
}

.spec-row {
  display: flex;
  gap: 12rpx;
  align-items: center;
  margin-bottom: 12rpx;
}
.spec-key { flex: 1; }
.spec-val { flex: 1; }

.actions { display: flex; gap: 16rpx; margin-top: 32rpx; }
.btn-primary {
  background: #1f2937;
  color: #fff;
  font-size: 14px;
  padding: 0 32rpx;
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
}
.link { color: #c8a464; font-size: 13px; }
.link.danger { color: #dc2626; margin-left: 12rpx; }
</style>
