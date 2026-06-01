export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) {
    throw createError({ statusCode: 401, statusMessage: '未授权' })
  }

  const body = await readBody(event)
  const username = body?.username ? String(body.username).trim() : ''
  const password = body?.password ? String(body.password) : ''

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入用户名和密码' })
  }
  if (username.length < 2) {
    throw createError({ statusCode: 400, statusMessage: '用户名至少 2 位' })
  }
  if (password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: '密码至少 6 位' })
  }

  const dup = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username)
  if (dup) {
    throw createError({ statusCode: 409, statusMessage: '该用户名已被占用' })
  }

  const hash = hashPassword(password)
  const info = db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(username, hash)
  return { success: true, user: { id: info.lastInsertRowid, username } }
})
