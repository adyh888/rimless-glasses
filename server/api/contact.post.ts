const rateLimitMap = new Map<string, number>()

setInterval(() => {
  const now = Date.now()
  for (const [ip, ts] of rateLimitMap) {
    if (now - ts > 86400_000) rateLimitMap.delete(ip)
  }
}, 600_000)

function getClientIp(event: any): string {
  const forwarded = getHeader(event, 'x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = getHeader(event, 'x-real-ip')
  if (real) return real
  return event.node?.req?.socket?.remoteAddress || 'unknown'
}

function sanitizeInput(str: string, maxLength: number): string {
  return str
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
    .replace(/[<>'"\\\/]/g, '')
    .replace(/\.\./g, '')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.name || typeof body.name !== 'string') {
    throw createError({ statusCode: 400, statusMessage: '请填写必填字段' })
  }
  if (!body.message || typeof body.message !== 'string') {
    throw createError({ statusCode: 400, statusMessage: '请填写必填字段' })
  }
  if (body.email && typeof body.email !== 'string') {
    throw createError({ statusCode: 400, statusMessage: '邮箱格式不正确' })
  }
  if (body.phone && typeof body.phone !== 'string') {
    throw createError({ statusCode: 400, statusMessage: '电话格式不正确' })
  }
  if (!body.email && !body.phone) {
    throw createError({ statusCode: 400, statusMessage: '请至少填写邮箱或电话其中一项' })
  }

  const name = sanitizeInput(body.name, 50)
  const email = body.email ? sanitizeInput(body.email, 100) : ''
  const phone = body.phone ? sanitizeInput(body.phone, 30) : ''
  const message = sanitizeInput(body.message, 5000)

  const validationConfig = db.prepare('SELECT content FROM site_content WHERE key = ?').get('contact_validation') as any
  let validation: any = {
    name: { minLength: 2, maxLength: 20 },
    email: { enabled: true, pattern: '' },
    phone: { enabled: true, pattern: '', minLength: 7, maxLength: 20 },
    message: { minLength: 10, maxLength: 500 },
    rateLimit: { enabled: true, interval: 60 },
  }

  if (validationConfig?.content) {
    try {
      validation = JSON.parse(validationConfig.content)
    } catch {}
  }

  if (!name.trim()) {
    throw createError({ statusCode: 400, statusMessage: '姓名不能为空' })
  }
  const nameMinLen = validation.name?.minLength ?? 2
  const nameMaxLen = validation.name?.maxLength ?? 20
  if (name.length < nameMinLen) {
    throw createError({ statusCode: 400, statusMessage: `姓名至少需要 ${nameMinLen} 个字符` })
  }
  if (name.length > nameMaxLen) {
    throw createError({ statusCode: 400, statusMessage: `姓名不能超过 ${nameMaxLen} 个字符` })
  }
  if (!message.trim()) {
    throw createError({ statusCode: 400, statusMessage: '留言内容不能为空' })
  }

  const clientIp = getClientIp(event)
  if (validation.rateLimit?.enabled !== false) {
    const interval = (validation.rateLimit?.interval || 60) * 1000
    const lastSubmit = rateLimitMap.get(clientIp)
    if (lastSubmit && Date.now() - lastSubmit < interval) {
      const remaining = Math.ceil((interval - (Date.now() - lastSubmit)) / 1000)
      throw createError({ statusCode: 429, statusMessage: `提交过于频繁，请 ${remaining} 秒后再试` })
    }
  }

  if (email && validation.email?.enabled) {
    const emailPattern = validation.email.pattern || '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
    const emailRegex = new RegExp(emailPattern)
    if (!emailRegex.test(email)) {
      throw createError({ statusCode: 400, statusMessage: '邮箱格式不正确' })
    }
  }

  if (phone && validation.phone?.enabled) {
    const phonePattern = validation.phone.pattern || '^1[3-9]\\d{9}$|^0\\d{2,3}-?\\d{7,8}$'
    const phoneRegex = new RegExp(phonePattern)
    if (!phoneRegex.test(phone)) {
      throw createError({ statusCode: 400, statusMessage: '电话格式不正确' })
    }
    const phoneDigits = phone.replace(/[^0-9]/g, '').length
    if (phoneDigits < (validation.phone.minLength || 7) || phoneDigits > (validation.phone.maxLength || 20)) {
      throw createError({ statusCode: 400, statusMessage: `电话长度应在 ${validation.phone.minLength || 7} 到 ${validation.phone.maxLength || 20} 位之间` })
    }
  }

  const msgLen = message.length
  const minLen = validation.message?.minLength ?? 10
  const maxLen = validation.message?.maxLength ?? 500
  if (msgLen < minLen) {
    throw createError({ statusCode: 400, statusMessage: `留言内容至少需要 ${minLen} 个字符` })
  }
  if (msgLen > maxLen) {
    throw createError({ statusCode: 400, statusMessage: `留言内容不能超过 ${maxLen} 个字符` })
  }

  db.prepare(
    'INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)'
  ).run(name, email, phone, message)

  rateLimitMap.set(clientIp, Date.now())

  return { success: true, message: '感谢您的留言，我们会尽快回复！' }
})
