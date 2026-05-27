export default defineEventHandler((event) => {
  const query = getQuery(event)
  const key = String(query.key || '')

  const row = db.prepare('SELECT content FROM site_content WHERE key = ?').get('admin_access_key') as any
  const storedKey = row?.content || ''

  if (!storedKey) {
    return { valid: true }
  }

  return { valid: key === storedKey }
})
