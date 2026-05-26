export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const slug = body.slug || `product-${Date.now()}`
  const result = db.prepare(
    `INSERT INTO products (name, slug, price, description, specs_json, images_json, category, is_featured, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    body.name, slug, body.price || 0, body.description || '',
    JSON.stringify(body.specs || {}), JSON.stringify(body.images || []),
    body.category || '', body.is_featured || 0, body.is_active ?? 1, body.sort_order || 0
  )
  return { id: result.lastInsertRowid }
})
