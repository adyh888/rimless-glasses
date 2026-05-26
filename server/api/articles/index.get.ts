export default defineEventHandler((event) => {
  const query = getQuery(event)
  if (query.slug) {
    const article = db.prepare('SELECT * FROM articles WHERE slug = ? AND is_published = 1').get(query.slug)
    if (!article) throw createError({ statusCode: 404, statusMessage: '文章不存在' })
    return article
  }
  let sql = 'SELECT * FROM articles WHERE 1=1'
  const params: any[] = []
  if (query.published_only === 'true') {
    sql += ' AND is_published = 1'
  }
  sql += ' ORDER BY created_at DESC'
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20
  const offset = (page - 1) * limit
  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total')
  const total = (db.prepare(countSql).get(...params) as any).total
  sql += ' LIMIT ? OFFSET ?'
  params.push(limit, offset)
  const items = db.prepare(sql).all(...params)
  return { items, total, page, limit }
})
