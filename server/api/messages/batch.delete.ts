export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '请选择留言' })
  }

  const ids = body.ids.filter((id: any) => Number.isInteger(id) && id > 0)
  if (ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '无效的留言 ID' })
  }

  const placeholders = ids.map(() => '?').join(',')
  db.prepare(`DELETE FROM contact_messages WHERE id IN (${placeholders})`).run(...ids)
  return { success: true, message: '删除成功' }
})
