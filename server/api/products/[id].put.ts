export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  db.prepare(
    `UPDATE products SET name=?, slug=?, price=?, description=?, specs_json=?, images_json=?, category=?, sub_category=?, is_featured=?, is_active=?, sort_order=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
  ).run(
    body.name, body.slug, body.price || 0, body.description || '',
    JSON.stringify(body.specs || {}), JSON.stringify(body.images || []),
    body.category || '', body.sub_category || '', body.is_featured || 0, body.is_active ?? 1, body.sort_order || 0, id
  )
  return { success: true }
})
