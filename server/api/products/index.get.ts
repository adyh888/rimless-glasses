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
  if (query.search) {
    sql += ' AND name LIKE ?'
    params.push(`%${query.search}%`)
  }
  if (query.is_active !== undefined) {
    sql += ' AND is_active = ?'
    params.push(query.is_active === '1' || query.is_active === 1 ? 1 : 0)
  }

  // 排序
  const orderBy = query.order_by as string || 'sort_order'
  const orderDir = query.order_dir as string || 'ASC'
  const allowedOrderBy = ['sort_order', 'is_active', 'created_at', 'price']
  const allowedOrderDir = ['ASC', 'DESC']

  if (allowedOrderBy.includes(orderBy) && allowedOrderDir.includes(orderDir.toUpperCase())) {
    sql += ` ORDER BY ${orderBy} ${orderDir.toUpperCase()}`
    // 当按 is_active 排序时，添加 sort_order 作为次要排序
    if (orderBy === 'is_active') {
      sql += ', sort_order ASC'
    }
  } else {
    sql += ' ORDER BY sort_order ASC'
  }

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
