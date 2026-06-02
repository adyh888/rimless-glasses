// 主题色（对齐原 Nuxt 项目 Tailwind config）
export const theme = {
  primary: '#1f2937',
  accent: '#c8a464',
  secondary: '#6b7280',
  surface: '#f7f6f3',
  border: '#e5e7eb',
}

// 后台菜单（原 useAdminMenu 简化版；暂时硬编码，后续可改为从 site_content 读）
export const adminMenu = [
  { label: '仪表盘',   path: '/pages/admin/index/index',          icon: 'home' },
  { label: '产品管理', path: '/pages/admin/products/index',       icon: 'shop' },
  { label: '文章管理', path: '/pages/admin/articles/index',       icon: 'paperplane' },
  { label: '轮播图',   path: '/pages/admin/banners/index',        icon: 'image' },
  { label: '首页编排', path: '/pages/admin/homepage/index',       icon: 'list' },
  { label: '客户留言', path: '/pages/admin/messages/index',       icon: 'chat' },
  { label: '内容管理', path: '/pages/admin/content/index',        icon: 'compose' },
  { label: '素材库',   path: '/pages/admin/media/index',          icon: 'folder' },
  { label: '系统设置', path: '/pages/admin/settings/index',       icon: 'settings' },
]
