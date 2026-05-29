export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (body.action === 'mark_all_read') {
    db.prepare('UPDATE contact_messages SET is_read = 1 WHERE is_read = 0').run()
    return { success: true, message: '全部标记已读成功' }
  }

  if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '请选择留言' })
  }

  const ids = body.ids.filter((id: any) => Number.isInteger(id) && id > 0)
  if (ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '无效的留言 ID' })
  }

  const placeholders = ids.map(() => '?').join(',')

  if (body.action === 'mark_read') {
    db.prepare(`UPDATE contact_messages SET is_read = 1 WHERE id IN (${placeholders})`).run(...ids)
    return { success: true, message: '标记已读成功' }
  }

  throw createError({ statusCode: 400, statusMessage: '未知操作' })
})
