export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.name || !body.email || !body.message) {
    throw createError({ statusCode: 400, statusMessage: '请填写必填字段' })
  }
  db.prepare(
    'INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)'
  ).run(body.name, body.email, body.phone || '', body.message)
  return { success: true, message: '感谢您的留言，我们会尽快回复！' }
})
