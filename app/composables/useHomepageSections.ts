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

export const DEFAULT_SECTIONS: HomepageBlock[] = [
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
    limit: 4,
  },
  {
    id: 'default-image-text',
    type: 'image_text',
    visible: true,
    sort_order: 2,
    label: 'BRAND STORY',
    heading: '让框架消失\n让世界更清晰',
    description: '',
    image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80',
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

export function generateBlockId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export async function useHomepageSections() {
  const { data } = await useFetch<{ key: string; content: string }>('/api/content/homepage_sections', {
    key: 'site-homepage-sections',
  })
  return computed<HomepageBlock[]>(() => {
    const raw = data.value?.content
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
  })
}
