import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }

    return new Promise((resolve) => {
      const nuxtApp = useNuxtApp()
      nuxtApp.hooks.hookOnce('page:finish', () => {
        resolve({ top: 0 })
      })
    })
  },
}
