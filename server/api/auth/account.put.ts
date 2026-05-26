export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) {
    throw createError({ statusCode: 401, statusMessage: '未授权' })
  }

  const body = await readBody(event)
  const currentPassword = String(body?.currentPassword || '')
  const newUsername = body?.newUsername ? String(body.newUsername).trim() : ''
  const newPassword = body?.newPassword ? String(body.newPassword) : ''

  if (!currentPassword) {
    throw createError({ statusCode: 400, statusMessage: '请输入当前密码' })
  }
  if (!newUsername && !newPassword) {
    throw createError({ statusCode: 400, statusMessage: '请输入新的用户名或新密码' })
  }
  if (newPassword && newPassword.length < 6) {
    throw createError({ statusCode: 400, statusMessage: '新密码至少 6 位' })
  }

  const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(auth.id) as any
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: '账号不存在' })
  }
  if (!verifyPassword(currentPassword, user.password_hash)) {
    throw createError({ statusCode: 401, statusMessage: '当前密码错误' })
  }

  if (newUsername && newUsername !== user.username) {
    const dup = db.prepare('SELECT id FROM admin_users WHERE username = ? AND id != ?').get(newUsername, auth.id)
    if (dup) {
      throw createError({ statusCode: 409, statusMessage: '该用户名已被占用' })
    }
    db.prepare('UPDATE admin_users SET username = ? WHERE id = ?').run(newUsername, auth.id)
  }

  if (newPassword) {
    const hash = hashPassword(newPassword)
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hash, auth.id)
  }

  const updated = db.prepare('SELECT id, username FROM admin_users WHERE id = ?').get(auth.id) as any
  const token = signToken({ id: updated.id, username: updated.username })
  return { success: true, token, user: updated }
})
