// 站点设置：从 content 云对象按 key 读取，带浅缓存。
// 与 app/composables/useSiteSettings.ts 行为对齐，但以 uni-app 友好的 async getter 暴露。
import { cloud } from '@/utils/cloud.js'

const cache = {}
const inflight = {}

async function getContent (key) {
  if (key in cache) return cache[key]
  if (inflight[key]) return inflight[key]
  inflight[key] = (async () => {
    try {
      const data = await cloud.content.get(key)
      const value = data?.content ?? ''
      cache[key] = value
      return value
    } catch (e) {
      cache[key] = ''
      return ''
    } finally {
      delete inflight[key]
    }
  })()
  return inflight[key]
}

export function clearSettingsCache () {
  for (const k of Object.keys(cache)) delete cache[k]
}

// ---- brand ----
export async function getBrandName () {
  const [primary, accent] = await Promise.all([
    getContent('brand_name_primary'),
    getContent('brand_name_accent'),
  ])
  return { primary: primary || '清透', accent: accent || '视界' }
}

// ---- nav ----
export const DEFAULT_NAV_ITEMS = [
  { label: '首页', path: '/', subtitle: '', sort_order: 0, is_active: true },
  { label: '产品中心', path: '/products', subtitle: '每一副无框眼镜，都是对极简美学的极致诠释', sort_order: 1, is_active: true },
  { label: '关于我们', path: '/about', subtitle: '以极简设计重新定义视觉体验', sort_order: 2, is_active: true },
  { label: '新闻动态', path: '/news', subtitle: '了解最新资讯与行业洞察', sort_order: 3, is_active: true },
  { label: '联系我们', path: '/contact', subtitle: '期待与您的每一次对话', sort_order: 4, is_active: true },
]

export async function getNavItems () {
  const raw = await getContent('nav_items')
  if (!raw) return DEFAULT_NAV_ITEMS
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_NAV_ITEMS
    return [...parsed].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  } catch (e) {
    return DEFAULT_NAV_ITEMS
  }
}

// ---- footer tagline ----
export async function getFooterTagline () {
  const [line1, line2] = await Promise.all([
    getContent('footer_tagline_line1'),
    getContent('footer_tagline_line2'),
  ])
  return {
    line1: line1 || '以极简设计重新定义视觉体验',
    line2: line2 || '让框架消失，让世界更清晰',
  }
}

// ---- contact ----
const DEFAULT_CONTACT = {
  items: [
    { label: '客服热线', value: '400-888-0000' },
    { label: '电子邮箱', value: 'hello@qingtou.com' },
    { label: '总部地址', value: '深圳市南山区科技园南区清透大厦 18F' },
    { label: '上海体验店', value: '上海市静安区南京西路 1788 号 L3-012' },
  ],
  hours: [
    '周一至周五：9:00 - 18:00',
    '周六：10:00 - 16:00',
    '周日及法定节假日：休息',
  ],
}

export async function getContactInfo () {
  const raw = await getContent('contact_info')
  if (!raw) return DEFAULT_CONTACT
  try {
    const parsed = JSON.parse(raw)
    return {
      items: Array.isArray(parsed?.items) ? parsed.items : DEFAULT_CONTACT.items,
      hours: Array.isArray(parsed?.hours) ? parsed.hours : DEFAULT_CONTACT.hours,
    }
  } catch (e) {
    return DEFAULT_CONTACT
  }
}

// ---- show price ----
export async function getShowPrice () {
  const raw = await getContent('show_product_price')
  return (raw ?? '1') !== '0'
}

// ---- site logo ----
export async function getSiteLogo () {
  const raw = await getContent('site_logo')
  if (!raw) return { url: '', show: false, height: 32 }
  try {
    const parsed = JSON.parse(raw)
    return { url: parsed.url || '', show: !!parsed.show, height: parsed.height || 32 }
  } catch (e) {
    return { url: '', show: false, height: 32 }
  }
}

// ---- product thumb bg ----
export async function getProductThumbBg () {
  const raw = await getContent('product_thumb_bg')
  if (!raw) return { color: '#ffffff', opacity: 100 }
  try {
    const parsed = JSON.parse(raw)
    return { color: parsed.color || '#ffffff', opacity: parsed.opacity ?? 100 }
  } catch (e) {
    return { color: '#ffffff', opacity: 100 }
  }
}

export function thumbBgStyle (bg) {
  if (!bg || !bg.color) return {}
  const c = bg.color.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${(bg.opacity ?? 100) / 100})` }
}

// ---- about image / overlay / content ----
const DEFAULT_ABOUT_IMAGE = 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=1920&q=80'
export async function getAboutImage () {
  const raw = await getContent('about_image')
  return raw || DEFAULT_ABOUT_IMAGE
}

export async function getAboutOverlay () {
  const raw = await getContent('about_overlay')
  if (!raw) return { color: '#000000', opacity: 0.2 }
  try {
    const cfg = JSON.parse(raw)
    return { color: cfg.color || '#000000', opacity: (cfg.opacity ?? 20) / 100 }
  } catch (e) {
    return { color: '#000000', opacity: 0.2 }
  }
}

export async function getAboutContent () {
  return await getContent('about_us')
}

// ---- social links ----
const DEFAULT_SOCIAL_LINKS = [
  { platform: 'wechat', label: '微信', icon: '💬', value: '', qrcode: '', is_active: false },
  { platform: 'wechat_official', label: '微信公众号', icon: '📢', value: '', qrcode: '', is_active: false },
  { platform: 'weibo', label: '微博', icon: '🌐', value: '', qrcode: '', is_active: false },
  { platform: 'xiaohongshu', label: '小红书', icon: '📕', value: '', qrcode: '', is_active: false },
  { platform: 'douyin', label: '抖音', icon: '🎵', value: '', qrcode: '', is_active: false },
]

export async function getSocialLinks () {
  const raw = await getContent('social_links')
  if (!raw) return DEFAULT_SOCIAL_LINKS
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.length) return DEFAULT_SOCIAL_LINKS
    return parsed
  } catch (e) {
    return DEFAULT_SOCIAL_LINKS
  }
}

// ---- contact form validation rules ----
const DEFAULT_VALIDATION = {
  name: { minLength: 2, maxLength: 20 },
  email: { enabled: true, pattern: '' },
  phone: { enabled: true, pattern: '', minLength: 7, maxLength: 20 },
  message: { minLength: 10, maxLength: 500 },
}

export async function getContactValidation () {
  const raw = await getContent('contact_validation')
  if (!raw) return DEFAULT_VALIDATION
  try {
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_VALIDATION, ...parsed }
  } catch (e) {
    return DEFAULT_VALIDATION
  }
}

// ---- banner interval ----
export async function getBannerInterval () {
  const raw = await getContent('banner_interval')
  const sec = parseInt(raw, 10)
  return (sec > 0 ? sec : 5) * 1000
}

// ---- product category order ----
export async function getProductCategoryOrder () {
  const raw = await getContent('product_category_order')
  if (!raw) return []
  try { return JSON.parse(raw) || [] } catch (e) { return [] }
}

export async function getProductSubcategoryOrder () {
  const raw = await getContent('product_subcategory_order')
  if (!raw) return {}
  try { return JSON.parse(raw) || {} } catch (e) { return {} }
}

export async function getProductsPerRow () {
  const raw = await getContent('products_per_row')
  const v = parseInt(raw, 10)
  return v >= 2 && v <= 5 ? v : 3
}

// ---- homepage sections ----
export async function getHomepageSections () {
  const raw = await getContent('homepage_sections')
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed.slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  } catch (e) {
    return null
  }
}

// ---- helpers ----
export function isVideoUrl (url) {
  return /\.(mp4|mov|webm|m3u8)(\?|$)/i.test(url || '')
}

// 把 web 风格的路径映射到 uni-app pages 路径
const ROUTE_MAP = {
  '/': '/pages/index/index',
  '/products': '/pages/products/index',
  '/about': '/pages/about/index',
  '/news': '/pages/news/index',
  '/contact': '/pages/contact/index',
}

export function resolvePath (path) {
  if (!path) return ''
  if (path.startsWith('/pages/')) return path
  // 产品详情 /products/<slug> → /pages/products/detail?slug=xxx
  const m = path.match(/^\/products\/([^/?#]+)/)
  if (m) return `/pages/products/detail?slug=${encodeURIComponent(m[1])}`
  const n = path.match(/^\/news\/([^/?#]+)/)
  if (n) return `/pages/news/detail?slug=${encodeURIComponent(n[1])}`
  // 带 query 的 /products?category=xxx
  const q = path.indexOf('?')
  if (q !== -1) {
    const base = path.slice(0, q)
    const query = path.slice(q)
    return (ROUTE_MAP[base] || base) + query
  }
  return ROUTE_MAP[path] || path
}

export function navigateToPath (path) {
  const url = resolvePath(path)
  if (!url) return
  // 首页用 switchTab/reLaunch，其他用 navigateTo
  if (url === '/pages/index/index') {
    uni.reLaunch({ url })
  } else {
    uni.navigateTo({ url })
  }
}
