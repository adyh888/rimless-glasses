export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const ids = body?.ids
  if (!Array.isArray(ids)) {
    throw createError({ statusCode: 400, statusMessage: 'ids 必须是数组' })
  }

  const safeIds = ids.filter((id: any) => Number.isInteger(id) && id > 0)
  if (safeIds.length === 0) return { success: true, updated: 0 }

  const stmt = db.prepare('UPDATE products SET sort_order=?, updated_at=CURRENT_TIMESTAMP WHERE id=?')
  const tx = db.transaction((items: number[]) => {
    items.forEach((id, idx) => stmt.run(idx + 1, id))
  })
  tx(safeIds)

  return { success: true, updated: safeIds.length }
})
