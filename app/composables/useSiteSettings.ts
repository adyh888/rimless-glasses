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
