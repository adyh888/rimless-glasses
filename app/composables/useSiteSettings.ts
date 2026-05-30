type ContactItem = { label: string; value: string }
export type ContactInfo = {
  items: ContactItem[]
  hours: string[]
}

const DEFAULT_CONTACT: ContactInfo = {
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

function parseContact(raw: string | undefined): ContactInfo {
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

export async function useContactInfo() {
  const { data } = await useFetch<{ key: string; content: string }>('/api/content/contact_info', {
    key: 'site-contact-info',
  })
  return computed<ContactInfo>(() => parseContact(data.value?.content))
}

export async function useShowPrice() {
  const { data } = await useFetch<{ key: string; content: string }>('/api/content/show_product_price', {
    key: 'site-show-price',
  })
  // 默认显示价格；只有显式设置为 "0" 才隐藏
  return computed<boolean>(() => (data.value?.content ?? '1') !== '0')
}

export type BrandName = { primary: string; accent: string }

export async function useBrandName() {
  const [{ data: primary }, { data: accent }] = await Promise.all([
    useFetch<{ key: string; content: string }>('/api/content/brand_name_primary', {
      key: 'site-brand-primary',
    }),
    useFetch<{ key: string; content: string }>('/api/content/brand_name_accent', {
      key: 'site-brand-accent',
    }),
  ])
  return computed<BrandName>(() => ({
    primary: primary.value?.content || '清透',
    accent: accent.value?.content || '视界',
  }))
}

export type NavItem = { label: string; path: string; subtitle: string; sort_order: number; is_active: boolean }

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: '首页', path: '/', subtitle: '', sort_order: 0, is_active: true },
  { label: '产品中心', path: '/products', subtitle: '每一副无框眼镜，都是对极简美学的极致诠释', sort_order: 1, is_active: true },
  { label: '关于我们', path: '/about', subtitle: '以极简设计重新定义视觉体验', sort_order: 2, is_active: true },
  { label: '新闻动态', path: '/news', subtitle: '了解最新资讯与行业洞察', sort_order: 3, is_active: true },
  { label: '联系我们', path: '/contact', subtitle: '期待与您的每一次对话', sort_order: 4, is_active: true },
]

export async function useNavItems() {
  const { data } = await useFetch<{ key: string; content: string }>('/api/content/nav_items', {
    key: 'site-nav-items',
  })
  return computed<NavItem[]>(() => {
    const raw = data.value?.content
    if (!raw) return DEFAULT_NAV_ITEMS
    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_NAV_ITEMS
      return [...parsed].sort((a: NavItem, b: NavItem) => a.sort_order - b.sort_order)
    } catch {
      return DEFAULT_NAV_ITEMS
    }
  })
}

const DEFAULT_ABOUT_IMAGE = 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=1920&q=80'

export async function useAboutImage() {
  const { data } = await useFetch<{ key: string; content: string }>('/api/content/about_image', {
    key: 'site-about-image',
  })
  return computed<string>(() => data.value?.content || DEFAULT_ABOUT_IMAGE)
}

export type SocialLink = {
  platform: string
  label: string
  icon: string
  value: string
  qrcode: string
  is_active: boolean
}

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { platform: 'wechat', label: '微信', icon: '💬', value: '', qrcode: '', is_active: false },
  { platform: 'wechat_official', label: '微信公众号', icon: '📢', value: '', qrcode: '', is_active: false },
  { platform: 'weibo', label: '微博', icon: '🌐', value: '', qrcode: '', is_active: false },
  { platform: 'xiaohongshu', label: '小红书', icon: '📕', value: '', qrcode: '', is_active: false },
  { platform: 'douyin', label: '抖音', icon: '🎵', value: '', qrcode: '', is_active: false },
]

export async function useSocialLinks() {
  const { data } = await useFetch<{ key: string; content: string }>('/api/content/social_links', {
    key: 'site-social-links',
  })
  return computed<SocialLink[]>(() => {
    const raw = data.value?.content
    if (!raw) return DEFAULT_SOCIAL_LINKS
    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_SOCIAL_LINKS
      return parsed
    } catch {
      return DEFAULT_SOCIAL_LINKS
    }
  })
}

export type AdminMenuItem = {
  label: string
  path: string
  icon: string
  sort_order: number
  is_active: boolean
}

const DEFAULT_ADMIN_MENU: AdminMenuItem[] = [
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

export { DEFAULT_ADMIN_MENU }

export async function useAdminMenu() {
  const { data } = await useFetch<{ key: string; content: string }>('/api/content/admin_menu_items', {
    key: 'site-admin-menu',
  })
  return computed<AdminMenuItem[]>(() => {
    const raw = data.value?.content
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
  })
}

export type SiteLogo = { url: string; show: boolean; height: number }

export async function useSiteLogo() {
  const { data } = await useFetch<{ key: string; content: string }>('/api/content/site_logo', {
    key: 'site-logo',
  })
  return computed<SiteLogo>(() => {
    const raw = data.value?.content
    if (!raw) return { url: '', show: false, height: 32 }
    try {
      const parsed = JSON.parse(raw)
      return { url: parsed.url || '', show: !!parsed.show, height: parsed.height || 32 }
    } catch {
      return { url: '', show: false, height: 32 }
    }
  })
}

export type ProductThumbBg = { color: string; opacity: number }

export async function useProductThumbBg() {
  const { data } = await useFetch<{ key: string; content: string }>('/api/content/product_thumb_bg', {
    key: 'site-product-thumb-bg',
  })
  return computed<ProductThumbBg>(() => {
    const raw = data.value?.content
    if (!raw) return { color: '#ffffff', opacity: 100 }
    try {
      const parsed = JSON.parse(raw)
      return { color: parsed.color || '#ffffff', opacity: parsed.opacity ?? 100 }
    } catch {
      return { color: '#ffffff', opacity: 100 }
    }
  })
}

export type FooterTagline = { line1: string; line2: string }

export async function useFooterTagline() {
  const [{ data: l1 }, { data: l2 }] = await Promise.all([
    useFetch<{ key: string; content: string }>('/api/content/footer_tagline_line1', {
      key: 'site-tagline-1',
    }),
    useFetch<{ key: string; content: string }>('/api/content/footer_tagline_line2', {
      key: 'site-tagline-2',
    }),
  ])
  return computed<FooterTagline>(() => ({
    line1: l1.value?.content || '以极简设计重新定义视觉体验',
    line2: l2.value?.content || '让框架消失，让世界更清晰',
  }))
}
