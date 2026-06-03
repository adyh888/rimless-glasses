import type { SiteSettings } from '~/plugins/site-settings'
import { DEFAULT_SECTIONS } from '#shared/site-settings'

export type { HomepageBlock } from '#shared/site-settings'
export { DEFAULT_SECTIONS }

export function generateBlockId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function useHomepageSections() {
  const s = useState<SiteSettings | null>('site-settings', () => null)
  return computed(() => s.value?.homepageSections || DEFAULT_SECTIONS)
}
