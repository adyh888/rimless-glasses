type ContactItem = { label: string; value: string }
export type ContactInfo = {
  items: ContactItem[]
  hours: string[]
}

export const DEFAULT_CONTACT: ContactInfo = {
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

export type BrandName = { primary: string; accent: string }
export type NavItem = { label: string; path: string; subtitle: string; sort_order: number; is_active: boolean }
export type SocialLink = {
  platform: string
  label: string
  icon: string
  value: string
  qrcode: string
  is_active: boolean
}
export type AdminMenuItem = {
  label: string
  path: string
  icon: string
  sort_order: number
  is_active: boolean
}
export type SiteLogo = { url: string; show: boolean; height: number }
export type ProductThumbBg = { color: string; opacity: number }
export type LightboxArrowStyle = { arrowColor: string; arrowBgColor: string }
export type FooterTagline = { line1: string; line2: string }
export type AboutOverlay = { color: string; opacity: number }

export interface HomepageBlock {
  id: string
  type: 'banner' | 'products' | 'image_text' | 'news' | 'cta' | 'richtext'
  visible: boolean
  sort_order: number
  title?: string
  subtitle?: string
  limit?: number
  label?: string
  heading?: string
  description?: string
  image?: string
  link_text?: string
  link_url?: string
  image_position?: 'left' | 'right'
  bg_color?: 'white' | 'surface'
  content?: string
}

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: '首页', path: '/', subtitle: '', sort_order: 0, is_active: true },
  { label: '产品中心', path: '/products', subtitle: '每一副无框眼镜，都是对极简美学的极致诠释', sort_order: 1, is_active: true },
  { label: '关于我们', path: '/about', subtitle: '以极简设计重新定义视觉体验', sort_order: 2, is_active: true },
  { label: '新闻动态', path: '/news', subtitle: '了解最新资讯与行业洞察', sort_order: 3, is_active: true },
  { label: '联系我们', path: '/contact', subtitle: '期待与您的每一次对话', sort_order: 4, is_active: true },
]

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { platform: 'wechat', label: '微信', icon: '💬', value: '', qrcode: '', is_active: false },
  { platform: 'wechat_official', label: '微信公众号', icon: '📢', value: '', qrcode: '', is_active: false },
  { platform: 'weibo', label: '微博', icon: '🌐', value: '', qrcode: '', is_active: false },
  { platform: 'xiaohongshu', label: '小红书', icon: '📕', value: '', qrcode: '', is_active: false },
  { platform: 'douyin', label: '抖音', icon: '🎵', value: '', qrcode: '', is_active: false },
]

export const DEFAULT_ADMIN_MENU: AdminMenuItem[] = [
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

export const DEFAULT_ABOUT_IMAGE = 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=1920&q=80'

export const DEFAULT_SECTIONS: HomepageBlock[] = [
  { id: 'default-banner', type: 'banner', visible: true, sort_order: 0 },
  {
    id: 'default-products', type: 'products', visible: true, sort_order: 1,
    title: '甄选系列', subtitle: '每一副，都是对极简美学的致敬', limit: 4,
  },
  {
    id: 'default-image-text', type: 'image_text', visible: true, sort_order: 2,
    label: 'BRAND STORY', heading: '让框架消失\n让世界更清晰', description: '',
    image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80',
    link_text: '了解品牌故事', link_url: '/about',
    image_position: 'left', bg_color: 'surface',
  },
  {
    id: 'default-news', type: 'news', visible: true, sort_order: 3,
    title: '', subtitle: '', limit: 3,
  },
  {
    id: 'default-cta', type: 'cta', visible: true, sort_order: 4,
    heading: '探索无框视界', subtitle: '发现属于你的极简美学',
    link_text: '浏览全部产品', link_url: '/products', bg_color: 'surface',
  },
]

export function parseContact(raw: string | undefined): ContactInfo {
  if (!raw) return DEFAULT_CONTACT
  try {
    const parsed = JSON.parse(raw)
    return {
      items: Array.isArray(parsed?.items) ? parsed.items : DEFAULT_CONTACT.items,
      hours: Array.isArray(parsed?.hours) ? parsed.hours : DEFAULT_CONTACT.hours,
    }
  } catch {
    return DEFAULT_CONTACT
  }
}

export function parseNavItems(raw: string | undefined): NavItem[] {
  if (!raw) return DEFAULT_NAV_ITEMS
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_NAV_ITEMS
    return [...parsed].sort((a: NavItem, b: NavItem) => a.sort_order - b.sort_order)
  } catch {
    return DEFAULT_NAV_ITEMS
  }
}

export function parseSocialLinks(raw: string | undefined): SocialLink[] {
  if (!raw) return DEFAULT_SOCIAL_LINKS
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_SOCIAL_LINKS
    return parsed
  } catch {
    return DEFAULT_SOCIAL_LINKS
  }
}

export function parseAdminMenu(raw: string | undefined): AdminMenuItem[] {
  if (!raw) return DEFAULT_ADMIN_MENU
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_ADMIN_MENU
    const savedPaths = new Set(parsed.map((i: AdminMenuItem) => i.path))
    const missing = DEFAULT_ADMIN_MENU.filter(d => !savedPaths.has(d.path))
    const merged = [...parsed]
    for (const item of missing) {
      merged.push({ ...item, sort_order: merged.length })
    }
    return merged
      .filter((item: AdminMenuItem) => item.is_active !== false)
      .sort((a: AdminMenuItem, b: AdminMenuItem) => a.sort_order - b.sort_order)
  } catch {
    return DEFAULT_ADMIN_MENU
  }
}

export function parseSiteLogo(raw: string | undefined): SiteLogo {
  if (!raw) return { url: '', show: false, height: 32 }
  try {
    const parsed = JSON.parse(raw)
    return { url: parsed.url || '', show: !!parsed.show, height: parsed.height || 32 }
  } catch {
    return { url: '', show: false, height: 32 }
  }
}

export function parseProductThumbBg(raw: string | undefined): ProductThumbBg {
  if (!raw) return { color: '#ffffff', opacity: 100 }
  try {
    const parsed = JSON.parse(raw)
    return { color: parsed.color || '#ffffff', opacity: parsed.opacity ?? 100 }
  } catch {
    return { color: '#ffffff', opacity: 100 }
  }
}

export function parseLightboxArrowStyle(raw: string | undefined): LightboxArrowStyle {
  if (!raw) return { arrowColor: '#ffffff', arrowBgColor: 'rgba(0, 0, 0, 0.3)' }
  try {
    const parsed = JSON.parse(raw)
    return {
      arrowColor: parsed.arrowColor || '#ffffff',
      arrowBgColor: parsed.arrowBgColor || 'rgba(0, 0, 0, 0.3)',
    }
  } catch {
    return { arrowColor: '#ffffff', arrowBgColor: 'rgba(0, 0, 0, 0.3)' }
  }
}

export function parseAboutOverlay(raw: string | undefined): AboutOverlay {
  if (!raw) return { color: '#000000', opacity: 20 }
  try {
    const parsed = JSON.parse(raw)
    return { color: parsed.color || '#000000', opacity: parsed.opacity ?? 20 }
  } catch {
    return { color: '#000000', opacity: 20 }
  }
}

export function parseHomepageSections(raw: string | undefined): HomepageBlock[] {
  if (!raw) return DEFAULT_SECTIONS
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_SECTIONS
    return [...parsed]
      .filter((b: HomepageBlock) => b.visible !== false)
      .sort((a: HomepageBlock, b: HomepageBlock) => a.sort_order - b.sort_order)
  } catch {
    return DEFAULT_SECTIONS
  }
}

export function parseStringArray(raw: string | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function parseSubcategoryOrder(raw: string | undefined): Record<string, string[]> {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function parseBannerInterval(raw: string | undefined): number {
  const sec = parseInt(raw || '', 10)
  return sec > 0 ? sec : 5
}

export function parseProductsPerRow(raw: string | undefined): number {
  const val = parseInt(raw || '', 10)
  return val >= 2 && val <= 5 ? val : 3
}
