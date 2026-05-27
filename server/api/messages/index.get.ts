export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20
  const offset = (page - 1) * limit

  const total = (db.prepare('SELECT COUNT(*) as total FROM contact_messages').get() as any).total
  const items = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset)

  return { items, total, page, limit }
})
