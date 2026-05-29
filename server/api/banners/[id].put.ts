export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  db.prepare(
    `UPDATE banners SET title=?, subtitle=?, button_text=?, button_link=?, image_url=?, sort_order=?, is_active=?, video_poster=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
  ).run(
    body.title, body.subtitle, body.button_text, body.button_link,
    body.image_url, body.sort_order, body.is_active ?? 1, body.video_poster || '', id
  )
  return { success: true }
})
