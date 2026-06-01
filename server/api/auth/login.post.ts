export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)

  const lockedMs = isLocked(ip)
  if (lockedMs > 0) {
    throw createError({
      statusCode: 429,
      statusMessage: `尝试过于频繁，请 ${Math.ceil(lockedMs / 1000)} 秒后再试`,
    })
  }

  const body = await readBody(event)
  const { username, password, captcha } = body || {}
  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: '请输入用户名和密码' })
  }

  if (needsCaptcha(ip)) {
    const captchaId = getCookie(event, 'captcha_id') || ''
    if (!verifyCaptcha(captchaId, String(captcha || ''))) {
      recordFailure(ip)
      throw createError({ statusCode: 400, statusMessage: '验证码错误', data: { captchaRequired: true } })
    }
  }

  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as any
  if (!user || !verifyPassword(password, user.password_hash)) {
    recordFailure(ip)
    throw createError({
      statusCode: 401,
      statusMessage: '用户名或密码错误',
      data: { captchaRequired: needsCaptcha(ip) },
    })
  }

  clearFailures(ip)
  const token = signToken({ id: user.id, username: user.username })
  return { token, user: { id: user.id, username: user.username } }
})
