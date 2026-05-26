export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const slug = body.slug || `article-${Date.now()}`
  const result = db.prepare(
    `INSERT INTO articles (title, slug, content, cover_image, summary, is_published) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(body.title, slug, body.content || '', body.cover_image || '', body.summary || '', body.is_published || 0)
  return { id: result.lastInsertRowid }
})
