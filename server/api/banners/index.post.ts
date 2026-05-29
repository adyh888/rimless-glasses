export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = db.prepare(
    `INSERT INTO banners (title, subtitle, button_text, button_link, image_url, sort_order, is_active, video_poster)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    body.title || '', body.subtitle || '', body.button_text || '',
    body.button_link || '', body.image_url || '', body.sort_order || 0, body.is_active ?? 1,
    body.video_poster || ''
  )
  return { id: result.lastInsertRowid }
})
