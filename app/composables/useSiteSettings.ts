import type { SiteSettings } from '~/plugins/site-settings'
import {
  DEFAULT_CONTACT,
  DEFAULT_NAV_ITEMS,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_ADMIN_MENU,
  DEFAULT_ABOUT_IMAGE,
} from '#shared/site-settings'

export type {
  ContactInfo,
  BrandName,
  NavItem,
  SocialLink,
  AdminMenuItem,
  SiteLogo,
  ProductThumbBg,
  LightboxArrowStyle,
  FooterTagline,
  AboutOverlay,
} from '#shared/site-settings'

export { DEFAULT_ADMIN_MENU }

function siteSettings() {
  return useState<SiteSettings | null>('site-settings', () => null)
}

export function useContactInfo() {
  const s = siteSettings()
  return computed(() => s.value?.contactInfo || DEFAULT_CONTACT)
}

export function useShowPrice() {
  const s = siteSettings()
  return computed(() => s.value?.showPrice ?? true)
}

export function useBrandName() {
  const s = siteSettings()
  return computed(() => s.value?.brand || { primary: '清透', accent: '视界' })
}

export function useNavItems() {
  const s = siteSettings()
  return computed(() => s.value?.navItems || DEFAULT_NAV_ITEMS)
}

export function useAboutImage() {
  const s = siteSettings()
  return computed(() => s.value?.aboutImage || DEFAULT_ABOUT_IMAGE)
}

export function useAboutOverlay() {
  const s = siteSettings()
  return computed(() => s.value?.aboutOverlay || { color: '#000000', opacity: 20 })
}

export function useAboutContent() {
  const s = siteSettings()
  return computed(() => s.value?.aboutContent || '')
}

export function useSocialLinks() {
  const s = siteSettings()
  return computed(() => s.value?.socialLinks || DEFAULT_SOCIAL_LINKS)
}

export function useAdminMenu() {
  const s = siteSettings()
  return computed(() => s.value?.adminMenuItems || DEFAULT_ADMIN_MENU)
}

export function useSiteLogo() {
  const s = siteSettings()
  return computed(() => s.value?.logo || { url: '', show: false, height: 32 })
}

export function useFavicon() {
  const s = siteSettings()
  return computed(() => s.value?.favicon || '')
}

export function useProductThumbBg() {
  const s = siteSettings()
  return computed(() => s.value?.productThumbBg || { color: '#ffffff', opacity: 100 })
}

export function useLightboxArrowStyle() {
  const s = siteSettings()
  return computed(() => s.value?.lightboxArrowStyle || { arrowColor: '#ffffff', arrowBgColor: 'rgba(0, 0, 0, 0.3)' })
}

export function useFooterTagline() {
  const s = siteSettings()
  return computed(() => s.value?.footerTagline || { line1: '以极简设计重新定义视觉体验', line2: '让框架消失，让世界更清晰' })
}

export function useBannerInterval() {
  const s = siteSettings()
  return computed(() => s.value?.bannerInterval ?? 5)
}

export function useProductsPerRow() {
  const s = siteSettings()
  return computed(() => s.value?.productsPerRow ?? 3)
}

export function useProductCategories() {
  const s = siteSettings()
  return computed(() => s.value?.productCategories || [])
}

export function useProductCategoryOrder() {
  const s = siteSettings()
  return computed(() => s.value?.productCategoryOrder || [])
}

export function useProductSubcategoryOrder() {
  const s = siteSettings()
  return computed(() => s.value?.productSubcategoryOrder || {})
}
