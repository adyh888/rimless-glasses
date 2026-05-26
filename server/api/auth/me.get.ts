export default defineEventHandler((event) => {
  const user = getAuthUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '未授权' })
  }
  return { user }
})
