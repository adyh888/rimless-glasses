export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  db.prepare(
    `UPDATE articles SET title=?, slug=?, content=?, cover_image=?, summary=?, is_published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
  ).run(body.title, body.slug, body.content || '', body.cover_image || '', body.summary || '', body.is_published || 0, id)
  return { success: true }
})
