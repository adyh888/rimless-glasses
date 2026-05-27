
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T


export const IconPicker: typeof import("../app/components/admin/IconPicker.vue")['default']
export const ImageCropper: typeof import("../app/components/admin/ImageCropper.vue")['default']
export const ImagePreview: typeof import("../app/components/admin/ImagePreview.vue")['default']
export const ImageUploader: typeof import("../app/components/admin/ImageUploader.vue")['default']
export const ImageUploaderMultiple: typeof import("../app/components/admin/ImageUploaderMultiple.vue")['default']
export const MediaLibrary: typeof import("../app/components/admin/MediaLibrary.vue")['default']
export const RichTextEditor: typeof import("../app/components/admin/RichTextEditor.vue")['default']
export const VideoThumbnail: typeof import("../app/components/admin/VideoThumbnail.vue")['default']
export const HomeBanner: typeof import("../app/components/home/HomeBanner.vue")['default']
export const HomeCta: typeof import("../app/components/home/HomeCta.vue")['default']
export const HomeImageText: typeof import("../app/components/home/HomeImageText.vue")['default']
export const HomeNews: typeof import("../app/components/home/HomeNews.vue")['default']
export const HomeProducts: typeof import("../app/components/home/HomeProducts.vue")['default']
export const HomeRichtext: typeof import("../app/components/home/HomeRichtext.vue")['default']
export const AdminSidebar: typeof import("../app/components/layout/AdminSidebar.vue")['default']
export const SiteFooter: typeof import("../app/components/layout/SiteFooter.vue")['default']
export const SiteHeader: typeof import("../app/components/layout/SiteHeader.vue")['default']
export const ProductCard: typeof import("../app/components/product/ProductCard.vue")['default']
export const DynamicIcon: typeof import("../app/components/shared/DynamicIcon.vue")['default']
export const ScrollReveal: typeof import("../app/components/shared/ScrollReveal.vue")['default']
export const SectionTitle: typeof import("../app/components/shared/SectionTitle.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtAnnouncer: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
export const NuxtImg: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const Motion: typeof import("@vueuse/motion")['MotionComponent']
export const MotionGroup: typeof import("@vueuse/motion")['MotionGroupComponent']
export const NuxtPage: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyIconPicker: LazyComponent<typeof import("../app/components/admin/IconPicker.vue")['default']>
export const LazyImageCropper: LazyComponent<typeof import("../app/components/admin/ImageCropper.vue")['default']>
export const LazyImagePreview: LazyComponent<typeof import("../app/components/admin/ImagePreview.vue")['default']>
export const LazyImageUploader: LazyComponent<typeof import("../app/components/admin/ImageUploader.vue")['default']>
export const LazyImageUploaderMultiple: LazyComponent<typeof import("../app/components/admin/ImageUploaderMultiple.vue")['default']>
export const LazyMediaLibrary: LazyComponent<typeof import("../app/components/admin/MediaLibrary.vue")['default']>
export const LazyRichTextEditor: LazyComponent<typeof import("../app/components/admin/RichTextEditor.vue")['default']>
export const LazyVideoThumbnail: LazyComponent<typeof import("../app/components/admin/VideoThumbnail.vue")['default']>
export const LazyHomeBanner: LazyComponent<typeof import("../app/components/home/HomeBanner.vue")['default']>
export const LazyHomeCta: LazyComponent<typeof import("../app/components/home/HomeCta.vue")['default']>
export const LazyHomeImageText: LazyComponent<typeof import("../app/components/home/HomeImageText.vue")['default']>
export const LazyHomeNews: LazyComponent<typeof import("../app/components/home/HomeNews.vue")['default']>
export const LazyHomeProducts: LazyComponent<typeof import("../app/components/home/HomeProducts.vue")['default']>
export const LazyHomeRichtext: LazyComponent<typeof import("../app/components/home/HomeRichtext.vue")['default']>
export const LazyAdminSidebar: LazyComponent<typeof import("../app/components/layout/AdminSidebar.vue")['default']>
export const LazySiteFooter: LazyComponent<typeof import("../app/components/layout/SiteFooter.vue")['default']>
export const LazySiteHeader: LazyComponent<typeof import("../app/components/layout/SiteHeader.vue")['default']>
export const LazyProductCard: LazyComponent<typeof import("../app/components/product/ProductCard.vue")['default']>
export const LazyDynamicIcon: LazyComponent<typeof import("../app/components/shared/DynamicIcon.vue")['default']>
export const LazyScrollReveal: LazyComponent<typeof import("../app/components/shared/ScrollReveal.vue")['default']>
export const LazySectionTitle: LazyComponent<typeof import("../app/components/shared/SectionTitle.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyMotion: LazyComponent<typeof import("@vueuse/motion")['MotionComponent']>
export const LazyMotionGroup: LazyComponent<typeof import("@vueuse/motion")['MotionGroupComponent']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
