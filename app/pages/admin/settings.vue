<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-light text-primary">站点设置</h1>
      <p class="text-xs text-secondary mt-1">管理网站基本信息、内容、上传、联系方式与系统安全</p>
    </div>

    <div class="sticky top-0 z-10 bg-white/80 backdrop-blur-sm -mx-8 px-8 border-b border-gray-100">
      <div class="flex gap-1 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          @click="activeTab = tab.key"
          class="px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-all"
          :class="activeTab === tab.key ? 'border-primary text-primary font-medium' : 'border-transparent text-secondary hover:text-primary'"
        >{{ tab.label }}</button>
      </div>
    </div>

    <!-- 产品价格显示开关 -->
    <section v-show="activeTab === 'content'" class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
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
    <section v-show="activeTab === 'upload'" class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
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

    <!-- 视频上传设置 -->
    <section v-show="activeTab === 'upload'" class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
      <h2 class="text-sm font-medium text-primary mb-1">视频上传设置</h2>
      <p class="text-xs text-secondary mb-5">配置允许上传的视频格式和最大文件大小</p>

      <div class="mb-4">
        <label class="block text-xs text-secondary mb-2">允许的视频格式</label>
        <div class="flex gap-6">
          <label v-for="fmt in ['mp4', 'webm', 'mov']" :key="fmt" class="inline-flex items-center gap-2 cursor-pointer select-none">
            <input v-model="videoFormats[fmt]" type="checkbox" class="w-4 h-4 accent-primary" />
            <span class="text-sm text-primary uppercase">{{ fmt }}</span>
          </label>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <label class="text-xs text-secondary">视频最大文件大小</label>
        <input
          v-model.number="videoMaxSize"
          type="number"
          min="1"
          max="500"
          class="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
        />
        <span class="text-sm text-secondary">MB</span>
      </div>

      <div class="mt-6">
        <button
          @click="saveVideoSettings"
          :disabled="savingVideo"
          class="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ savingVideo ? '保存中...' : '保存' }}
        </button>
        <span v-if="videoSaved" class="ml-3 text-sm text-green-600">已保存</span>
      </div>
    </section>

    <!-- 轮播设置 -->
    <section v-show="activeTab === 'content'" class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
      <h2 class="text-sm font-medium text-primary mb-1">轮播设置</h2>
      <p class="text-xs text-secondary mb-5">设置首页轮播图自动切换的时间间隔</p>

      <div class="flex items-center gap-4">
        <input
          v-model.number="bannerInterval"
          type="number"
          min="1"
          max="60"
          class="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
        />
        <span class="text-sm text-secondary">秒</span>
      </div>

      <div class="mt-6">
        <button
          @click="saveBannerInterval"
          :disabled="savingBannerInterval"
          class="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ savingBannerInterval ? '保存中...' : '保存' }}
        </button>
        <span v-if="bannerIntervalSaved" class="ml-3 text-sm text-green-600">已保存</span>
      </div>
    </section>

    <!-- 导航菜单设置 -->
    <section v-show="activeTab === 'basic'" class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
      <h2 class="text-sm font-medium text-primary mb-1">导航菜单设置</h2>
      <p class="text-xs text-secondary mb-5">管理前台顶部导航栏的菜单项、显示顺序和页面副标题</p>

      <div class="space-y-4">
        <div
          v-for="(item, idx) in navItems"
          :key="idx"
          class="border border-gray-100 rounded-lg p-4"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="flex flex-col gap-1">
              <button
                type="button"
                :disabled="idx === 0"
                @click="moveNav(idx, -1)"
                class="text-xs text-secondary hover:text-primary disabled:opacity-30"
              >&uarr;</button>
              <button
                type="button"
                :disabled="idx === navItems.length - 1"
                @click="moveNav(idx, 1)"
                class="text-xs text-secondary hover:text-primary disabled:opacity-30"
              >&darr;</button>
            </div>
            <span class="text-xs text-gray-400 w-5 text-center">{{ idx + 1 }}</span>
            <input
              v-model="item.label"
              type="text"
              placeholder="显示名称"
              class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
            />
            <input
              v-model="item.path"
              type="text"
              placeholder="链接路径 如 /products"
              class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
            />
            <label class="inline-flex items-center gap-2 cursor-pointer select-none shrink-0">
              <span class="relative inline-block w-9 h-5">
                <input v-model="item.is_active" type="checkbox" class="peer sr-only" />
                <span class="absolute inset-0 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
                <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </span>
              <span class="text-xs text-secondary">{{ item.is_active ? '显示' : '隐藏' }}</span>
            </label>
            <button
              type="button"
              @click="removeNav(idx)"
              class="text-xs text-red-500 hover:underline shrink-0"
            >删除</button>
          </div>
          <div>
            <input
              v-model="item.subtitle"
              type="text"
              placeholder="页面副标题（如：每一副无框眼镜，都是对极简美学的极致诠释）"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        @click="addNav"
        class="mt-4 text-xs text-accent hover:underline"
      >+ 添加导航项</button>

      <div class="mt-6">
        <button
          @click="saveNav"
          :disabled="savingNav"
          class="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ savingNav ? '保存中...' : '保存导航设置' }}
        </button>
        <span v-if="navSaved" class="ml-3 text-sm text-green-600">已保存</span>
      </div>
    </section>

    <!-- 关于我们页面图片 -->
    <section v-show="activeTab === 'content'" class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
      <h2 class="text-sm font-medium text-primary mb-1">关于我们页面图片</h2>
      <p class="text-xs text-secondary mb-3">「关于我们」页面顶部展示的大图</p>
      <p class="text-xs text-accent bg-accent/5 inline-block px-3 py-1.5 rounded-md mb-5">推荐尺寸 1920 × 600 像素（宽高比 3.2 : 1），图片将以全宽展示，高度为屏幕的 50%</p>

      <div v-if="aboutImage" class="space-y-3">
        <div class="relative inline-block">
          <img :src="aboutImage" class="h-36 max-w-full object-cover rounded-lg border border-gray-100" />
          <button
            type="button"
            @click="aboutImage = ''"
            class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
          >&times;</button>
        </div>
        <div class="flex gap-3">
          <button type="button" @click="triggerAboutFile" class="text-xs text-accent hover:underline">重新选择</button>
          <button type="button" @click="openAboutCropper(aboutImage)" class="text-xs text-accent hover:underline">裁剪调整</button>
        </div>
      </div>
      <div v-else>
        <div
          class="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
          @click="triggerAboutFile"
          @dragover.prevent
          @drop.prevent="onAboutDrop"
        >
          <p class="text-sm text-secondary">点击或拖拽上传图片</p>
          <p class="text-xs text-gray-400 mt-1">支持 JPG / PNG / WebP，上传后可裁剪</p>
          <button type="button" @click.stop="aboutLibrary = true" class="mt-3 text-xs text-accent hover:underline">从素材库选择</button>
        </div>
      </div>

      <input ref="aboutFileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onAboutFileSelect" />
      <MediaLibrary v-model="aboutLibrary" @select="onAboutLibrarySelect" />
      <ImageCropper
        v-model:show="cropperShow"
        :image-src="cropperSrc"
        :aspect-ratio="3.2"
        @cropped="onAboutCropped"
      />

      <!-- 蒙版设置 -->
      <div class="mt-6 pt-6 border-t border-gray-100">
        <h3 class="text-xs font-medium text-primary mb-3">图片蒙版效果</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs text-secondary mb-1.5">蒙版颜色</label>
            <div class="flex items-center gap-3">
              <input
                v-model="aboutOverlay.color"
                type="color"
                class="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <input
                v-model="aboutOverlay.color"
                type="text"
                class="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
                placeholder="#000000"
              />
              <button
                v-for="preset in overlayPresets"
                :key="preset.color"
                type="button"
                class="w-8 h-8 rounded-full border-2 transition-all"
                :class="aboutOverlay.color === preset.color ? 'border-accent scale-110' : 'border-gray-200 hover:border-gray-400'"
                :style="{ backgroundColor: preset.color }"
                :title="preset.label"
                @click="aboutOverlay.color = preset.color"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs text-secondary mb-1.5">透明度：{{ aboutOverlay.opacity }}%</label>
            <div class="flex items-center gap-3">
              <input
                v-model.number="aboutOverlay.opacity"
                type="range"
                min="0"
                max="100"
                step="1"
                class="flex-1 accent-primary"
              />
              <input
                v-model.number="aboutOverlay.opacity"
                type="number"
                min="0"
                max="100"
                class="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <div v-if="aboutImage" class="relative h-24 rounded-lg overflow-hidden">
            <img :src="aboutImage" class="w-full h-full object-cover" />
            <div class="absolute inset-0" :style="{ backgroundColor: aboutOverlay.color, opacity: aboutOverlay.opacity / 100 }" />
            <span class="absolute bottom-1 right-2 text-[10px] text-white/80">预览</span>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <button
          @click="saveAboutImage"
          :disabled="savingAboutImage"
          class="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ savingAboutImage ? '保存中...' : '保存图片' }}
        </button>
        <span v-if="aboutImageSaved" class="ml-3 text-sm text-green-600">已保存</span>
      </div>
    </section>

    <!-- Logo 设置 -->
    <section v-show="activeTab === 'basic'" class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
      <h2 class="text-sm font-medium text-primary mb-1">Logo 设置</h2>
      <p class="text-xs text-secondary mb-5">上传 Logo 图片后，前台 Header 和后台侧栏将显示 Logo 替代文字品牌名。关闭开关则恢复文字显示。</p>

      <label class="inline-flex items-center gap-3 cursor-pointer select-none mb-5">
        <span class="relative inline-block w-11 h-6">
          <input v-model="siteLogo.show" type="checkbox" class="peer sr-only" />
          <span class="absolute inset-0 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
          <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
        </span>
        <span class="text-sm text-primary">{{ siteLogo.show ? '显示 Logo' : '显示文字品牌名' }}</span>
      </label>

      <div>
        <label class="block text-xs text-secondary mb-1.5">Logo 图片</label>
        <div class="flex items-end gap-3">
          <ImageUploader v-model="siteLogo.url" />
          <button
            v-if="siteLogo.url"
            type="button"
            @click="openLogoCropper"
            class="text-xs text-accent hover:underline shrink-0 pb-1"
          >裁剪调整</button>
        </div>
      </div>

      <div v-if="siteLogo.url" class="mt-5 space-y-4">
        <div>
          <label class="block text-xs text-secondary mb-1.5">前台显示高度：{{ siteLogo.height }}px</label>
          <div class="flex items-center gap-3">
            <input
              v-model.number="siteLogo.height"
              type="range"
              min="20"
              max="80"
              step="1"
              class="flex-1 accent-primary"
            />
            <input
              v-model.number="siteLogo.height"
              type="number"
              min="20"
              max="80"
              class="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm text-center focus:border-accent focus:outline-none"
            />
          </div>
          <p class="text-[11px] text-gray-400 mt-1">后台侧栏高度将自动限制在 40px 以内</p>
        </div>

        <div class="px-4 py-3 bg-surface rounded-lg">
          <p class="text-xs text-secondary mb-3">实时预览</p>
          <div class="flex items-center gap-6">
            <div>
              <p class="text-[10px] text-gray-400 mb-1">前台 Header</p>
              <div class="bg-white px-4 py-2 rounded border border-gray-100 inline-block">
                <img :src="siteLogo.url" alt="Logo" class="w-auto object-contain" :style="{ height: siteLogo.height + 'px' }" />
              </div>
            </div>
            <div>
              <p class="text-[10px] text-gray-400 mb-1">后台侧栏</p>
              <div class="bg-white px-4 py-2 rounded border border-gray-100 inline-block">
                <img :src="siteLogo.url" alt="Logo" class="w-auto object-contain" :style="{ height: Math.min(siteLogo.height, 40) + 'px' }" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImageCropper
        v-model:show="logoCropperShow"
        :image-src="logoCropperSrc"
        :aspect-ratio="0"
        @cropped="onLogoCropped"
      />

      <div class="mt-6">
        <button
          @click="saveLogo"
          :disabled="savingLogo"
          class="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ savingLogo ? '保存中...' : '保存 Logo' }}
        </button>
        <span v-if="logoSaved" class="ml-3 text-sm text-green-600">已保存</span>
      </div>
    </section>

    <!-- 品牌名称 -->
    <section v-show="activeTab === 'basic'" class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
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
    <section v-show="activeTab === 'basic'" class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
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
    <section v-show="activeTab === 'contact'" class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
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

    <!-- 社交媒体 -->
    <section v-show="activeTab === 'contact'" class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
      <h2 class="text-sm font-medium text-primary mb-1">社交媒体</h2>
      <p class="text-xs text-secondary mb-5">在「联系我们」页面展示的社交媒体账号，可上传二维码图片</p>

      <div class="space-y-4">
        <div
          v-for="(link, idx) in socialLinks"
          :key="idx"
          class="border border-gray-100 rounded-lg p-4"
        >
          <div class="flex items-center gap-3 mb-3">
            <IconPicker v-model="link.icon" />
            <input
              v-model="link.label"
              type="text"
              placeholder="平台名称"
              class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
            />
            <label class="inline-flex items-center gap-2 cursor-pointer select-none shrink-0">
              <span class="relative inline-block w-9 h-5">
                <input v-model="link.is_active" type="checkbox" class="peer sr-only" />
                <span class="absolute inset-0 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
                <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </span>
              <span class="text-xs text-secondary">{{ link.is_active ? '显示' : '隐藏' }}</span>
            </label>
            <button
              type="button"
              @click="removeSocial(idx)"
              class="text-xs text-red-500 hover:underline shrink-0"
            >删除</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-secondary mb-1.5">账号/链接</label>
              <input
                v-model="link.value"
                type="text"
                placeholder="账号或链接"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs text-secondary mb-1.5">二维码图片</label>
              <div class="flex items-end gap-2">
                <ImageUploader v-model="link.qrcode" />
                <button
                  v-if="link.qrcode"
                  type="button"
                  @click="openSocialPreview(link.qrcode, link.label)"
                  class="text-xs text-accent hover:underline shrink-0 pb-1"
                >预览</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        @click="addSocial"
        class="mt-4 text-xs text-accent hover:underline"
      >+ 添加社交媒体</button>

      <div class="mt-6">
        <button
          @click="saveSocialLinks"
          :disabled="savingSocial"
          class="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ savingSocial ? '保存中...' : '保存社交媒体' }}
        </button>
        <span v-if="socialSaved" class="ml-3 text-sm text-green-600">已保存</span>
      </div>
    </section>

    <!-- 访问密钥 -->
    <section v-show="activeTab === 'system'" class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
      <h2 class="text-sm font-medium text-primary mb-1">后台访问密钥</h2>
      <p class="text-xs text-secondary mb-5">设置后，直接访问 /admin/login 将显示 404 页面。需通过 /admin/login?key=你的密钥 才能访问登录页。留空则不启用此功能。</p>

      <div>
        <label class="block text-xs text-secondary mb-1.5">访问密钥</label>
        <div class="flex items-center gap-3">
          <input
            v-model="accessKey"
            :type="showAccessKey ? 'text' : 'password'"
            placeholder="留空表示不启用访问密钥"
            class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
          />
          <button type="button" @click="showAccessKey = !showAccessKey" class="text-xs text-secondary hover:text-primary">
            {{ showAccessKey ? '隐藏' : '显示' }}
          </button>
          <button type="button" @click="generateAccessKey" class="text-xs text-accent hover:underline">
            随机生成
          </button>
        </div>
      </div>

      <div v-if="accessKey" class="mt-4 p-3 bg-surface rounded-lg">
        <p class="text-xs text-secondary mb-1">登录链接预览：</p>
        <code class="text-xs text-primary break-all">{{ loginUrlPreview }}</code>
      </div>

      <div class="mt-6">
        <button
          @click="saveAccessKey"
          :disabled="savingAccessKey"
          class="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ savingAccessKey ? '保存中...' : '保存密钥' }}
        </button>
        <span v-if="accessKeySaved" class="ml-3 text-sm text-green-600">已保存</span>
      </div>
    </section>

    <!-- 后台侧栏菜单 -->
    <section v-show="activeTab === 'system'" class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
      <h2 class="text-sm font-medium text-primary mb-1">后台侧栏菜单</h2>
      <p class="text-xs text-secondary mb-5">管理后台左侧导航菜单的项目、图标、顺序和显示状态</p>

      <div class="space-y-3">
        <div
          v-for="(item, idx) in adminMenuItems"
          :key="idx"
          class="border border-gray-100 rounded-lg p-4"
        >
          <div class="flex items-center gap-3">
            <div class="flex flex-col gap-1">
              <button
                type="button"
                :disabled="idx === 0"
                @click="moveAdminMenu(idx, -1)"
                class="text-xs text-secondary hover:text-primary disabled:opacity-30"
              >&uarr;</button>
              <button
                type="button"
                :disabled="idx === adminMenuItems.length - 1"
                @click="moveAdminMenu(idx, 1)"
                class="text-xs text-secondary hover:text-primary disabled:opacity-30"
              >&darr;</button>
            </div>
            <IconPicker v-model="item.icon" />
            <input
              v-model="item.label"
              type="text"
              placeholder="菜单名称"
              class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
            />
            <input
              v-model="item.path"
              type="text"
              placeholder="路径 如 /admin/products"
              class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
            />
            <label class="inline-flex items-center gap-2 cursor-pointer select-none shrink-0">
              <span class="relative inline-block w-9 h-5">
                <input v-model="item.is_active" type="checkbox" class="peer sr-only" />
                <span class="absolute inset-0 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
                <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </span>
              <span class="text-xs text-secondary">{{ item.is_active ? '显示' : '隐藏' }}</span>
            </label>
            <button
              type="button"
              @click="removeAdminMenu(idx)"
              class="text-xs text-red-500 hover:underline shrink-0"
            >删除</button>
          </div>
        </div>
      </div>

      <button
        type="button"
        @click="addAdminMenu"
        class="mt-4 text-xs text-accent hover:underline"
      >+ 添加菜单项</button>

      <div class="mt-6">
        <button
          @click="saveAdminMenu"
          :disabled="savingAdminMenu"
          class="px-5 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ savingAdminMenu ? '保存中...' : '保存菜单设置' }}
        </button>
        <span v-if="adminMenuSaved" class="ml-3 text-sm text-green-600">已保存（刷新页面后生效）</span>
      </div>
    </section>

    <!-- 账户与密码 -->
    <section v-show="activeTab === 'system'" class="bg-white rounded-xl shadow-sm p-8 max-w-3xl">
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

    <!-- Social QR Preview Lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="socialPreview.show"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
          @click.self="socialPreview.show = false"
        >
          <button
            type="button"
            @click="socialPreview.show = false"
            class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white text-3xl z-10"
          >&times;</button>
          <div class="text-center" @click.stop>
            <img
              :src="socialPreview.src"
              :alt="socialPreview.label"
              class="max-w-[85vw] max-h-[75vh] object-contain rounded-lg"
            />
            <p class="mt-4 text-white/70 text-sm">{{ socialPreview.label }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { authFetch, user, token, logout } = useAuth()

const tabs = [
  { key: 'basic', label: '基本设置' },
  { key: 'content', label: '内容设置' },
  { key: 'upload', label: '上传设置' },
  { key: 'contact', label: '联系与社交' },
  { key: 'system', label: '安全与系统' },
]
const activeTab = ref('basic')

const showPrice = ref(true)
const savingPrice = ref(false)
const priceSaved = ref(false)

const uploadMaxSize = ref(5)
const savingUploadMaxSize = ref(false)
const uploadMaxSizeSaved = ref(false)

const videoFormats = reactive<Record<string, boolean>>({ mp4: true, webm: true, mov: false })
const videoMaxSize = ref(50)
const savingVideo = ref(false)
const videoSaved = ref(false)

const bannerInterval = ref(5)
const savingBannerInterval = ref(false)
const bannerIntervalSaved = ref(false)

type NavItem = { label: string; path: string; subtitle: string; sort_order: number; is_active: boolean }
const navItems = reactive<NavItem[]>([])
const savingNav = ref(false)
const navSaved = ref(false)

const aboutImage = ref('')
const aboutOverlay = reactive({ color: '#000000', opacity: 20 })
const overlayPresets = [
  { color: '#000000', label: '黑色' },
  { color: '#ffffff', label: '白色' },
  { color: '#1a1a2e', label: '深蓝黑' },
  { color: '#2d3436', label: '深灰' },
  { color: '#0c3547', label: '深青' },
]
const savingAboutImage = ref(false)
const aboutImageSaved = ref(false)
const cropperShow = ref(false)
const cropperSrc = ref('')
const aboutFileInput = ref<HTMLInputElement>()
const aboutLibrary = ref(false)

function triggerAboutFile() {
  aboutFileInput.value?.click()
}
function onAboutFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    cropperSrc.value = reader.result as string
    cropperShow.value = true
  }
  reader.readAsDataURL(file)
  ;(e.target as HTMLInputElement).value = ''
}
function onAboutDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => {
    cropperSrc.value = reader.result as string
    cropperShow.value = true
  }
  reader.readAsDataURL(file)
}
function onAboutLibrarySelect(urls: string[]) {
  if (urls.length > 0) {
    openAboutCropper(urls[0])
  }
}
function openAboutCropper(src: string) {
  cropperSrc.value = src
  cropperShow.value = true
}
function onAboutCropped(url: string) {
  aboutImage.value = url
}

type ContactItem = { label: string; value: string }
const contact = reactive<{ items: ContactItem[]; hours: string[] }>({
  items: [],
  hours: [],
})
const savingContact = ref(false)
const contactSaved = ref(false)

const siteLogo = reactive({ url: '', show: false, height: 32 })
const savingLogo = ref(false)
const logoSaved = ref(false)
const logoCropperShow = ref(false)
const logoCropperSrc = ref('')

function openLogoCropper() {
  logoCropperSrc.value = siteLogo.url
  logoCropperShow.value = true
}
function onLogoCropped(url: string) {
  siteLogo.url = url
}

const brand = reactive({ primary: '', accent: '' })
const savingBrand = ref(false)
const brandSaved = ref(false)

const tagline = reactive({ line1: '', line2: '' })
const savingTagline = ref(false)
const taglineSaved = ref(false)

type SocialLink = { platform: string; label: string; icon: string; value: string; qrcode: string; is_active: boolean }
const socialLinks = reactive<SocialLink[]>([])
const socialPreview = reactive({ show: false, src: '', label: '' })
function openSocialPreview(src: string, label: string) {
  socialPreview.src = src
  socialPreview.label = label
  socialPreview.show = true
}
const savingSocial = ref(false)
const socialSaved = ref(false)

function addSocial() {
  socialLinks.push({ platform: `custom_${Date.now()}`, label: '', icon: '🔗', value: '', qrcode: '', is_active: true })
}
function removeSocial(idx: number) {
  if (!window.confirm('确定删除此社交媒体？')) return
  socialLinks.splice(idx, 1)
}

const accessKey = ref('')
const showAccessKey = ref(false)
const savingAccessKey = ref(false)
const accessKeySaved = ref(false)
const loginUrlPreview = computed(() => {
  const origin = import.meta.client ? window.location.origin : ''
  return `${origin}/admin/login?key=${accessKey.value}`
})

function generateAccessKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  accessKey.value = result
}

type AdminMenuItem = { label: string; path: string; icon: string; sort_order: number; is_active: boolean }
const adminMenuItems = reactive<AdminMenuItem[]>([])
const savingAdminMenu = ref(false)
const adminMenuSaved = ref(false)

function addAdminMenu() {
  adminMenuItems.push({ label: '', path: '/admin/', icon: '📄', sort_order: adminMenuItems.length, is_active: true })
}
function removeAdminMenu(idx: number) {
  if (!window.confirm('确定删除此菜单项？')) return
  adminMenuItems.splice(idx, 1)
}
function moveAdminMenu(idx: number, dir: number) {
  const target = idx + dir
  if (target < 0 || target >= adminMenuItems.length) return
  const temp = adminMenuItems[idx]
  adminMenuItems[idx] = adminMenuItems[target]
  adminMenuItems[target] = temp
}

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
  const [priceRes, contactRes, brandP, brandA, tag1, tag2, uploadSizeRes, videoFormatsRes, videoSizeRes, bannerIntervalRes, navRes, aboutImageRes, socialRes, adminMenuRes, logoRes, accessKeyRes, aboutOverlayRes] = await Promise.all([
    $fetch<any>('/api/content/show_product_price'),
    $fetch<any>('/api/content/contact_info'),
    $fetch<any>('/api/content/brand_name_primary'),
    $fetch<any>('/api/content/brand_name_accent'),
    $fetch<any>('/api/content/footer_tagline_line1'),
    $fetch<any>('/api/content/footer_tagline_line2'),
    $fetch<any>('/api/content/upload_max_size'),
    $fetch<any>('/api/content/video_allowed_formats'),
    $fetch<any>('/api/content/video_max_size'),
    $fetch<any>('/api/content/banner_interval'),
    $fetch<any>('/api/content/nav_items'),
    $fetch<any>('/api/content/about_image'),
    $fetch<any>('/api/content/social_links'),
    $fetch<any>('/api/content/admin_menu_items'),
    $fetch<any>('/api/content/site_logo'),
    $fetch<any>('/api/content/admin_access_key'),
    $fetch<any>('/api/content/about_overlay'),
  ])
  showPrice.value = (priceRes?.content ?? '1') !== '0'
  uploadMaxSize.value = uploadSizeRes?.content ? parseInt(uploadSizeRes.content, 10) : 5

  const enabledFormats = (videoFormatsRes?.content || 'mp4,webm').split(',').map((s: string) => s.trim())
  videoFormats.mp4 = enabledFormats.includes('mp4')
  videoFormats.webm = enabledFormats.includes('webm')
  videoFormats.mov = enabledFormats.includes('mov')
  videoMaxSize.value = videoSizeRes?.content ? parseInt(videoSizeRes.content, 10) : 50
  bannerInterval.value = bannerIntervalRes?.content ? parseInt(bannerIntervalRes.content, 10) : 5
  accessKey.value = accessKeyRes?.content || ''

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

  const defaultNav: NavItem[] = [
    { label: '首页', path: '/', subtitle: '', sort_order: 0, is_active: true },
    { label: '产品中心', path: '/products', subtitle: '每一副无框眼镜，都是对极简美学的极致诠释', sort_order: 1, is_active: true },
    { label: '关于我们', path: '/about', subtitle: '以极简设计重新定义视觉体验', sort_order: 2, is_active: true },
    { label: '新闻动态', path: '/news', subtitle: '了解最新资讯与行业洞察', sort_order: 3, is_active: true },
    { label: '联系我们', path: '/contact', subtitle: '期待与您的每一次对话', sort_order: 4, is_active: true },
  ]
  try {
    const parsedNav = navRes?.content ? JSON.parse(navRes.content) : null
    if (Array.isArray(parsedNav) && parsedNav.length > 0) {
      navItems.splice(0, navItems.length, ...parsedNav.sort((a: NavItem, b: NavItem) => a.sort_order - b.sort_order))
    } else {
      navItems.splice(0, navItems.length, ...defaultNav)
    }
  } catch {
    navItems.splice(0, navItems.length, ...defaultNav)
  }

  aboutImage.value = aboutImageRes?.content || ''
  try {
    const parsedOverlay = aboutOverlayRes?.content ? JSON.parse(aboutOverlayRes.content) : null
    if (parsedOverlay) {
      aboutOverlay.color = parsedOverlay.color || '#000000'
      aboutOverlay.opacity = parsedOverlay.opacity ?? 20
    }
  } catch {}

  try {
    const parsedLogo = logoRes?.content ? JSON.parse(logoRes.content) : null
    if (parsedLogo) {
      siteLogo.url = parsedLogo.url || ''
      siteLogo.show = !!parsedLogo.show
      siteLogo.height = parsedLogo.height || 32
    }
  } catch {}

  const defaultSocial: SocialLink[] = [
    { platform: 'wechat', label: '微信', icon: '💬', value: '', qrcode: '', is_active: false },
    { platform: 'wechat_official', label: '微信公众号', icon: '📢', value: '', qrcode: '', is_active: false },
    { platform: 'weibo', label: '微博', icon: '🌐', value: '', qrcode: '', is_active: false },
    { platform: 'xiaohongshu', label: '小红书', icon: '📕', value: '', qrcode: '', is_active: false },
    { platform: 'douyin', label: '抖音', icon: '🎵', value: '', qrcode: '', is_active: false },
  ]
  try {
    const parsedSocial = socialRes?.content ? JSON.parse(socialRes.content) : null
    if (Array.isArray(parsedSocial) && parsedSocial.length > 0) {
      socialLinks.splice(0, socialLinks.length, ...parsedSocial)
    } else {
      socialLinks.splice(0, socialLinks.length, ...defaultSocial)
    }
  } catch {
    socialLinks.splice(0, socialLinks.length, ...defaultSocial)
  }

  const defaultAdminMenu: AdminMenuItem[] = [
    { label: '仪表盘', path: '/admin', icon: '📊', sort_order: 0, is_active: true },
    { label: '首页管理', path: '/admin/homepage', icon: '🏠', sort_order: 1, is_active: true },
    { label: '轮播管理', path: '/admin/banners', icon: '🎠', sort_order: 2, is_active: true },
    { label: '产品管理', path: '/admin/products', icon: '📦', sort_order: 3, is_active: true },
    { label: '文章管理', path: '/admin/articles', icon: '📝', sort_order: 4, is_active: true },
    { label: '留言管理', path: '/admin/messages', icon: '✉️', sort_order: 5, is_active: true },
    { label: '素材库', path: '/admin/media', icon: '🖼️', sort_order: 6, is_active: true },
    { label: '内容管理', path: '/admin/content', icon: '📄', sort_order: 7, is_active: true },
    { label: '站点设置', path: '/admin/settings', icon: '⚙️', sort_order: 8, is_active: true },
  ]
  try {
    const parsedMenu = adminMenuRes?.content ? JSON.parse(adminMenuRes.content) : null
    if (Array.isArray(parsedMenu) && parsedMenu.length > 0) {
      adminMenuItems.splice(0, adminMenuItems.length, ...parsedMenu.sort((a: AdminMenuItem, b: AdminMenuItem) => a.sort_order - b.sort_order))
    } else {
      adminMenuItems.splice(0, adminMenuItems.length, ...defaultAdminMenu)
    }
  } catch {
    adminMenuItems.splice(0, adminMenuItems.length, ...defaultAdminMenu)
  }

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

function addNav() {
  navItems.push({ label: '', path: '/', subtitle: '', sort_order: navItems.length, is_active: true })
}
function removeNav(idx: number) {
  navItems.splice(idx, 1)
}
function moveNav(idx: number, dir: number) {
  const target = idx + dir
  if (target < 0 || target >= navItems.length) return
  const temp = navItems[idx]
  navItems[idx] = navItems[target]
  navItems[target] = temp
}

async function saveNav() {
  savingNav.value = true
  navSaved.value = false
  const payload = navItems.map((item, idx) => ({ ...item, sort_order: idx }))
  try {
    await authFetch('/api/content/nav_items', {
      method: 'PUT',
      body: { content: JSON.stringify(payload) },
    })
    navSaved.value = true
    setTimeout(() => { navSaved.value = false }, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    savingNav.value = false
  }
}

async function saveAboutImage() {
  savingAboutImage.value = true
  aboutImageSaved.value = false
  try {
    await Promise.all([
      authFetch('/api/content/about_image', {
        method: 'PUT',
        body: { content: aboutImage.value },
      }),
      authFetch('/api/content/about_overlay', {
        method: 'PUT',
        body: { content: JSON.stringify({ color: aboutOverlay.color, opacity: aboutOverlay.opacity }) },
      }),
    ])
    aboutImageSaved.value = true
    setTimeout(() => { aboutImageSaved.value = false }, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    savingAboutImage.value = false
  }
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

async function saveBannerInterval() {
  savingBannerInterval.value = true
  bannerIntervalSaved.value = false
  try {
    await authFetch('/api/content/banner_interval', {
      method: 'PUT',
      body: { content: String(bannerInterval.value) },
    })
    bannerIntervalSaved.value = true
    setTimeout(() => { bannerIntervalSaved.value = false }, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    savingBannerInterval.value = false
  }
}

async function saveVideoSettings() {
  const formats = ['mp4', 'webm', 'mov'].filter(f => videoFormats[f]).join(',')
  if (!formats) {
    alert('请至少选择一种视频格式')
    return
  }
  savingVideo.value = true
  videoSaved.value = false
  try {
    await Promise.all([
      authFetch('/api/content/video_allowed_formats', {
        method: 'PUT',
        body: { content: formats },
      }),
      authFetch('/api/content/video_max_size', {
        method: 'PUT',
        body: { content: String(videoMaxSize.value) },
      }),
    ])
    videoSaved.value = true
    setTimeout(() => { videoSaved.value = false }, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    savingVideo.value = false
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

async function saveSocialLinks() {
  savingSocial.value = true
  socialSaved.value = false
  try {
    await authFetch('/api/content/social_links', {
      method: 'PUT',
      body: { content: JSON.stringify(socialLinks) },
    })
    socialSaved.value = true
    setTimeout(() => { socialSaved.value = false }, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    savingSocial.value = false
  }
}

async function saveAdminMenu() {
  savingAdminMenu.value = true
  adminMenuSaved.value = false
  const payload = adminMenuItems.map((item, idx) => ({ ...item, sort_order: idx }))
  try {
    await authFetch('/api/content/admin_menu_items', {
      method: 'PUT',
      body: { content: JSON.stringify(payload) },
    })
    adminMenuSaved.value = true
    setTimeout(() => { adminMenuSaved.value = false }, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    savingAdminMenu.value = false
  }
}

async function saveAccessKey() {
  savingAccessKey.value = true
  accessKeySaved.value = false
  try {
    await authFetch('/api/content/admin_access_key', {
      method: 'PUT',
      body: { content: accessKey.value.trim() },
    })
    accessKeySaved.value = true
    setTimeout(() => { accessKeySaved.value = false }, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    savingAccessKey.value = false
  }
}

async function saveLogo() {
  savingLogo.value = true
  logoSaved.value = false
  try {
    await authFetch('/api/content/site_logo', {
      method: 'PUT',
      body: { content: JSON.stringify({ url: siteLogo.url, show: siteLogo.show, height: siteLogo.height }) },
    })
    logoSaved.value = true
    setTimeout(() => { logoSaved.value = false }, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || '保存失败')
  } finally {
    savingLogo.value = false
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
