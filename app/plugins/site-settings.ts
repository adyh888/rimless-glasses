import type {
  BrandName,
  SiteLogo,
  NavItem,
  FooterTagline,
  ContactInfo,
  SocialLink,
  ProductThumbBg,
  LightboxArrowStyle,
  AboutOverlay,
  AdminMenuItem,
  HomepageBlock,
} from '#shared/site-settings'

export type SiteSettings = {
  brand: BrandName
  logo: SiteLogo
  favicon: string
  navItems: NavItem[]
  footerTagline: FooterTagline
  contactInfo: ContactInfo
  socialLinks: SocialLink[]
  showPrice: boolean
  productsPerRow: number
  productThumbBg: ProductThumbBg
  lightboxArrowStyle: LightboxArrowStyle
  bannerInterval: number
  aboutImage: string
  aboutOverlay: AboutOverlay
  aboutContent: string
  productCategories: string[]
  productCategoryOrder: string[]
  productSubcategoryOrder: Record<string, string[]>
  homepageSections: HomepageBlock[]
  adminMenuItems: AdminMenuItem[]
}

export default defineNuxtPlugin(async () => {
  const state = useState<SiteSettings | null>('site-settings', () => null)
  if (state.value) return
  try {
    state.value = await $fetch<SiteSettings>('/api/site/bootstrap')
  } catch {
    state.value = null
  }
})
