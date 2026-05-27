export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    const token = useCookie('admin_token')
    if (!token.value) {
      return navigateTo('/admin/login')
    }
  }

  if (to.path === '/admin/login') {
    const accessGranted = useCookie('admin_access_granted')
    if (accessGranted.value) return

    const keyParam = to.query.key as string | undefined
    if (keyParam) {
      accessGranted.value = keyParam
    }
  }
})
