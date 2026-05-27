export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.name || !body.message) {
    throw createError({ statusCode: 400, statusMessage: '请填写必填字段' })
  }
  if (!body.email && !body.phone) {
    throw createError({ statusCode: 400, statusMessage: '请至少填写邮箱或电话其中一项' })
  }
  db.prepare(
    'INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)'
  ).run(body.name, body.email || '', body.phone || '', body.message)
  return { success: true, message: '感谢您的留言，我们会尽快回复！' }
})
