export default defineEventHandler((event) => {
  const query = getQuery(event)
  if (query.active_only === 'true') {
    return db.prepare('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC').all()
  }
  return db.prepare('SELECT * FROM banners ORDER BY sort_order ASC').all()
})
