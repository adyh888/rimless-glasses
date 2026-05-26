export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  if (!product) throw createError({ statusCode: 404, statusMessage: '产品不存在' })
  return product
})
