export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id)
  return { success: true }
})
