export default defineEventHandler((event) => {
  const auth = getAuthUser(event)
  if (!auth) {
    throw createError({ statusCode: 401, statusMessage: '未授权' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: '无效的账号 ID' })
  }
  if (id === auth.id) {
    throw createError({ statusCode: 400, statusMessage: '不能删除当前登录的账号' })
  }

  const total = (db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as any).count
  if (total <= 1) {
    throw createError({ statusCode: 400, statusMessage: '至少保留一个管理员账号' })
  }

  const target = db.prepare('SELECT id FROM admin_users WHERE id = ?').get(id)
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: '账号不存在' })
  }

  db.prepare('DELETE FROM admin_users WHERE id = ?').run(id)
  return { success: true }
})
