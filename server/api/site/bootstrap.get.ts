import {
  parseContact,
  parseNavItems,
  parseSocialLinks,
  parseAdminMenu,
  parseSiteLogo,
  parseProductThumbBg,
  parseLightboxArrowStyle,
  parseAboutOverlay,
  parseHomepageSections,
  parseStringArray,
  parseSubcategoryOrder,
  parseBannerInterval,
  parseProductsPerRow,
  parseFavicon,
  DEFAULT_ABOUT_IMAGE,
} from '#shared/site-settings'

export default defineEventHandler(() => {
  const rows = db.prepare('SELECT key, content FROM site_content').all() as { key: string; content: string }[]
  const map: Record<string, string> = {}
  for (const row of rows) map[row.key] = row.content || ''

  const catRows = db
    .prepare(`SELECT DISTINCT category FROM products WHERE is_active = 1 AND category IS NOT NULL AND category != ''`)
    .all() as { category: string }[]
  const productCategories = catRows.map(r => r.category)

  return {
    brand: {
      primary: map.brand_name_primary || '清透',
      accent: map.brand_name_accent || '视界',
    },
    logo: parseSiteLogo(map.site_logo),
    favicon: parseFavicon(map.site_favicon),
    navItems: parseNavItems(map.nav_items),
    footerTagline: {
      line1: map.footer_tagline_line1 || '以极简设计重新定义视觉体验',
      line2: map.footer_tagline_line2 || '让框架消失，让世界更清晰',
    },
    contactInfo: parseContact(map.contact_info),
    socialLinks: parseSocialLinks(map.social_links),
    showPrice: (map.show_product_price ?? '1') !== '0',
    productsPerRow: parseProductsPerRow(map.products_per_row),
    productThumbBg: parseProductThumbBg(map.product_thumb_bg),
    lightboxArrowStyle: parseLightboxArrowStyle(map.lightbox_arrow_style),
    bannerInterval: parseBannerInterval(map.banner_interval),
    aboutImage: map.about_image || DEFAULT_ABOUT_IMAGE,
    aboutOverlay: parseAboutOverlay(map.about_overlay),
    aboutContent: map.about_us || '',
    productCategories,
    productCategoryOrder: parseStringArray(map.product_category_order),
    productSubcategoryOrder: parseSubcategoryOrder(map.product_subcategory_order),
    homepageSections: parseHomepageSections(map.homepage_sections),
    adminMenuItems: parseAdminMenu(map.admin_menu_items),
  }
})
