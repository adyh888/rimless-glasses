export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id)
  if (!article) throw createError({ statusCode: 404, statusMessage: '文章不存在' })
  return article
})
