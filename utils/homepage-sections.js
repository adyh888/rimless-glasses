// 首页板块定义。与 app/composables/useHomepageSections.ts 等价，纯 JS 版供 uni-app 复用。
// 6 种类型：banner / products / image_text / news / cta / richtext

export const TYPE_LABELS = {
  banner: '轮播横幅',
  products: '精选产品',
  image_text: '图文板块',
  news: '新闻动态',
  cta: '行动号召',
  richtext: '富文本',
}

export const DEFAULT_SECTIONS = [
  {
    id: 'default-banner',
    type: 'banner',
    visible: true,
    sort_order: 0,
  },
  {
    id: 'default-products',
    type: 'products',
    visible: true,
    sort_order: 1,
    title: '甄选系列',
    subtitle: '每一副，都是对极简美学的致敬',
    perRow: 3,
    rows: 1,
  },
  {
    id: 'default-image-text',
    type: 'image_text',
    visible: true,
    sort_order: 2,
    label: 'BRAND STORY',
    heading: '让框架消失\n让世界更清晰',
    description: '',
    image: '',
    link_text: '了解品牌故事',
    link_url: '/about',
    image_position: 'left',
    bg_color: 'surface',
  },
  {
    id: 'default-news',
    type: 'news',
    visible: true,
    sort_order: 3,
    title: '',
    subtitle: '',
    limit: 3,
  },
  {
    id: 'default-cta',
    type: 'cta',
    visible: true,
    sort_order: 4,
    heading: '探索无框视界',
    subtitle: '发现属于你的极简美学',
    link_text: '浏览全部产品',
    link_url: '/products',
    bg_color: 'surface',
  },
]

export function generateBlockId () {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function buildBlock (type) {
  const base = { id: generateBlockId(), type, visible: true, sort_order: 0 }
  switch (type) {
    case 'products':
      Object.assign(base, { title: '甄选系列', subtitle: '每一副，都是对极简美学的致敬', perRow: 3, rows: 1 })
      break
    case 'image_text':
      Object.assign(base, { label: '', heading: '', description: '', image: '', link_text: '', link_url: '', image_position: 'left', bg_color: 'surface' })
      break
    case 'news':
      Object.assign(base, { title: '', subtitle: '', limit: 3 })
      break
    case 'cta':
      Object.assign(base, { heading: '', subtitle: '', link_text: '', link_url: '', bg_color: 'surface' })
      break
    case 'richtext':
      Object.assign(base, { title: '', content: '', bg_color: 'white' })
      break
  }
  return base
}

export function blockSummary (block) {
  switch (block.type) {
    case 'banner': return '轮播横幅 — 内容在轮播管理中配置'
    case 'products': return block.title || '精选产品'
    case 'image_text': return (block.heading || '').replace(/\n/g, ' ') || block.label || '图文板块'
    case 'news': return block.title || '新闻动态'
    case 'cta': return block.heading || '行动号召'
    case 'richtext': return block.title || '富文本内容'
    default: return ''
  }
}
