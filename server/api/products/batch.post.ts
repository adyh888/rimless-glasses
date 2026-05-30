export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { ids, action, value } = body

  if (!Array.isArray(ids) || ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '请选择产品' })
  }

  const safeIds = ids.filter((id: any) => Number.isInteger(id) && id > 0)
  if (safeIds.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '无效的产品ID' })
  }

  const placeholders = safeIds.map(() => '?').join(',')

  switch (action) {
    case 'delete':
      db.prepare(`DELETE FROM products WHERE id IN (${placeholders})`).run(...safeIds)
      break
    case 'set_active':
      db.prepare(`UPDATE products SET is_active=1, updated_at=CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(...safeIds)
      break
    case 'set_inactive':
      db.prepare(`UPDATE products SET is_active=0, updated_at=CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(...safeIds)
      break
    case 'set_price':
      if (typeof value !== 'number' || value < 0) {
        throw createError({ statusCode: 400, statusMessage: '价格无效' })
      }
      db.prepare(`UPDATE products SET price=?, updated_at=CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(value, ...safeIds)
      break
    case 'set_category': {
      if (!value || typeof value !== 'string') {
        throw createError({ statusCode: 400, statusMessage: '分类不能为空' })
      }
      const parts = (value as string).split('/')
      const category = (parts[0] || '').trim()
      const subCategory = (parts[1] || '').trim()
      db.prepare(`UPDATE products SET category=?, sub_category=?, updated_at=CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(category, subCategory, ...safeIds)
      break
    }
    default:
      throw createError({ statusCode: 400, statusMessage: '未知操作' })
  }

  return { success: true }
})
