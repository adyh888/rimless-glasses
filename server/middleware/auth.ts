export default defineEventHandler(async (event) => {
  const method = event.method
  const url = getRequestURL(event).pathname
  if (url.startsWith('/api/') && ['POST', 'PUT', 'DELETE'].includes(method)) {
    if (url === '/api/auth/login' || url === '/api/contact') return
    const user = getAuthUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: '未授权，请先登录' })
    }
    event.context.user = user
  }
})
