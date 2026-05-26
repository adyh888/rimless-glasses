export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const banner = db.prepare('SELECT * FROM banners WHERE id = ?').get(id)
  if (!banner) throw createError({ statusCode: 404, statusMessage: '轮播图不存在' })
  return banner
})
