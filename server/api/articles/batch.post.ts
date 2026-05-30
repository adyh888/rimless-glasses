export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { ids, action } = body

  if (!Array.isArray(ids) || ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '请选择文章' })
  }

  const safeIds = ids.filter((id: any) => Number.isInteger(id) && id > 0)
  if (safeIds.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '无效的文章ID' })
  }

  const placeholders = safeIds.map(() => '?').join(',')

  switch (action) {
    case 'delete':
      db.prepare(`DELETE FROM articles WHERE id IN (${placeholders})`).run(...safeIds)
      break
    case 'publish':
      db.prepare(`UPDATE articles SET is_published=1, updated_at=CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(...safeIds)
      break
    case 'unpublish':
      db.prepare(`UPDATE articles SET is_published=0, updated_at=CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(...safeIds)
      break
    default:
      throw createError({ statusCode: 400, statusMessage: '未知操作' })
  }

  return { success: true }
})
