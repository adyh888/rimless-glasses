export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  db.prepare('UPDATE contact_messages SET is_read = ? WHERE id = ?').run(body.is_read ?? 1, id)
  return { success: true }
})
