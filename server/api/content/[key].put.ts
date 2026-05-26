export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  const body = await readBody(event)
  const existing = db.prepare('SELECT id FROM site_content WHERE key = ?').get(key)
  if (existing) {
    db.prepare('UPDATE site_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?').run(body.content || '', key)
  } else {
    db.prepare('INSERT INTO site_content (key, content) VALUES (?, ?)').run(key, body.content || '')
  }
  return { success: true }
})
