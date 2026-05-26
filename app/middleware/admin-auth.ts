export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    const token = useCookie('admin_token')
    if (!token.value) {
      return navigateTo('/admin/login')
    }
  }
})
