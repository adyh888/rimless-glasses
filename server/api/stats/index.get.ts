export default defineEventHandler(() => {
  const products = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count
  const articles = (db.prepare('SELECT COUNT(*) as count FROM articles').get() as any).count
  const banners = (db.prepare('SELECT COUNT(*) as count FROM banners').get() as any).count
  const messages = (db.prepare('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0').get() as any).count
  return { products, articles, banners, messages }
})
