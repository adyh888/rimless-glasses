
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

interface _GlobalComponents {
  IconPicker: typeof import("../../app/components/admin/IconPicker.vue")['default']
  ImageCropper: typeof import("../../app/components/admin/ImageCropper.vue")['default']
  ImagePreview: typeof import("../../app/components/admin/ImagePreview.vue")['default']
  ImageUploader: typeof import("../../app/components/admin/ImageUploader.vue")['default']
  ImageUploaderMultiple: typeof import("../../app/components/admin/ImageUploaderMultiple.vue")['default']
  MediaLibrary: typeof import("../../app/components/admin/MediaLibrary.vue")['default']
  RichTextEditor: typeof import("../../app/components/admin/RichTextEditor.vue")['default']
  VideoThumbnail: typeof import("../../app/components/admin/VideoThumbnail.vue")['default']
  HomeBanner: typeof import("../../app/components/home/HomeBanner.vue")['default']
  HomeCta: typeof import("../../app/components/home/HomeCta.vue")['default']
  HomeImageText: typeof import("../../app/components/home/HomeImageText.vue")['default']
  HomeNews: typeof import("../../app/components/home/HomeNews.vue")['default']
  HomeProducts: typeof import("../../app/components/home/HomeProducts.vue")['default']
  HomeRichtext: typeof import("../../app/components/home/HomeRichtext.vue")['default']
  AdminSidebar: typeof import("../../app/components/layout/AdminSidebar.vue")['default']
  SiteFooter: typeof import("../../app/components/layout/SiteFooter.vue")['default']
  SiteHeader: typeof import("../../app/components/layout/SiteHeader.vue")['default']
  ProductCard: typeof import("../../app/components/product/ProductCard.vue")['default']
  DynamicIcon: typeof import("../../app/components/shared/DynamicIcon.vue")['default']
  ScrollReveal: typeof import("../../app/components/shared/ScrollReveal.vue")['default']
  SectionTitle: typeof import("../../app/components/shared/SectionTitle.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtAnnouncer: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
  NuxtImg: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  Motion: typeof import("@vueuse/motion")['MotionComponent']
  MotionGroup: typeof import("@vueuse/motion")['MotionGroupComponent']
  NuxtPage: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyIconPicker: LazyComponent<typeof import("../../app/components/admin/IconPicker.vue")['default']>
  LazyImageCropper: LazyComponent<typeof import("../../app/components/admin/ImageCropper.vue")['default']>
  LazyImagePreview: LazyComponent<typeof import("../../app/components/admin/ImagePreview.vue")['default']>
  LazyImageUploader: LazyComponent<typeof import("../../app/components/admin/ImageUploader.vue")['default']>
  LazyImageUploaderMultiple: LazyComponent<typeof import("../../app/components/admin/ImageUploaderMultiple.vue")['default']>
  LazyMediaLibrary: LazyComponent<typeof import("../../app/components/admin/MediaLibrary.vue")['default']>
  LazyRichTextEditor: LazyComponent<typeof import("../../app/components/admin/RichTextEditor.vue")['default']>
  LazyVideoThumbnail: LazyComponent<typeof import("../../app/components/admin/VideoThumbnail.vue")['default']>
  LazyHomeBanner: LazyComponent<typeof import("../../app/components/home/HomeBanner.vue")['default']>
  LazyHomeCta: LazyComponent<typeof import("../../app/components/home/HomeCta.vue")['default']>
  LazyHomeImageText: LazyComponent<typeof import("../../app/components/home/HomeImageText.vue")['default']>
  LazyHomeNews: LazyComponent<typeof import("../../app/components/home/HomeNews.vue")['default']>
  LazyHomeProducts: LazyComponent<typeof import("../../app/components/home/HomeProducts.vue")['default']>
  LazyHomeRichtext: LazyComponent<typeof import("../../app/components/home/HomeRichtext.vue")['default']>
  LazyAdminSidebar: LazyComponent<typeof import("../../app/components/layout/AdminSidebar.vue")['default']>
  LazySiteFooter: LazyComponent<typeof import("../../app/components/layout/SiteFooter.vue")['default']>
  LazySiteHeader: LazyComponent<typeof import("../../app/components/layout/SiteHeader.vue")['default']>
  LazyProductCard: LazyComponent<typeof import("../../app/components/product/ProductCard.vue")['default']>
  LazyDynamicIcon: LazyComponent<typeof import("../../app/components/shared/DynamicIcon.vue")['default']>
  LazyScrollReveal: LazyComponent<typeof import("../../app/components/shared/ScrollReveal.vue")['default']>
  LazySectionTitle: LazyComponent<typeof import("../../app/components/shared/SectionTitle.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtAnnouncer: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyMotion: LazyComponent<typeof import("@vueuse/motion")['MotionComponent']>
  LazyMotionGroup: LazyComponent<typeof import("@vueuse/motion")['MotionGroupComponent']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.4.6_@babel+plugin-syntax-jsx@7.29.7_@babel+core@7.29.7__@babel+plugin-syntax-typ_fdadf39e74b3ba2f0ebc1c8bde92de70/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
