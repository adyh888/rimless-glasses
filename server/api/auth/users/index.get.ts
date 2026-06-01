export default defineEventHandler((event) => {
  const auth = getAuthUser(event)
  if (!auth) {
    throw createError({ statusCode: 401, statusMessage: '未授权' })
  }
  const rows = db.prepare('SELECT id, username, created_at FROM admin_users ORDER BY id ASC').all()
  return { users: rows }
})
