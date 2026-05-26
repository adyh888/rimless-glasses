export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  db.prepare('DELETE FROM articles WHERE id = ?').run(id)
  return { success: true }
})
