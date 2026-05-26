export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body || {}
  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入用户名和密码' })
  }
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as any
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw createError({ statusCode: 401, statusMessage: '用户名或密码错误' })
  }
  const token = signToken({ id: user.id, username: user.username })
  return { token, user: { id: user.id, username: user.username } }
})
