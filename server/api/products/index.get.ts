export default defineEventHandler((event) => {
  const query = getQuery(event)
  if (query.slug) {
    const product = db.prepare('SELECT * FROM products WHERE slug = ? AND is_active = 1').get(query.slug)
    if (!product) throw createError({ statusCode: 404, statusMessage: '产品不存在' })
    return product
  }
  let sql = 'SELECT * FROM products WHERE 1=1'
  const params: any[] = []
  if (query.active_only === 'true') {
    sql += ' AND is_active = 1'
  }
  if (query.featured === 'true') {
    sql += ' AND is_featured = 1'
  }
  if (query.category) {
    sql += ' AND category = ?'
    params.push(query.category)
  }
  if (query.sub_category) {
    sql += ' AND sub_category = ?'
    params.push(query.sub_category)
  }
  sql += ' ORDER BY sort_order ASC'
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 50
  const offset = (page - 1) * limit
  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total')
  const total = (db.prepare(countSql).get(...params) as any).total
  sql += ' LIMIT ? OFFSET ?'
  params.push(limit, offset)
  const items = db.prepare(sql).all(...params)
  return { items, total, page, limit }
})
