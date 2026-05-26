export default defineEventHandler((event) => {
  const key = getRouterParam(event, 'key')
  const row = db.prepare('SELECT * FROM site_content WHERE key = ?').get(key)
  if (!row) return { key, content: '' }
  return row
})
