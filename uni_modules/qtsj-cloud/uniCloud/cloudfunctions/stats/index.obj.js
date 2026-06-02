// 统计 & 后台预校验云对象。
// summary  - 后台首页统计计数（需 admin）
// verifyAccessKey - 入口预校验：site_content.admin_access_key 不为空时，
//                   前端在进入后台登录页前要先匹配 key，避免暴露登录入口（保留原行为）

const { db, dbCmd } = require('db-helpers')
const { requireAdmin } = require('auth-guard')

module.exports = {
  _before () {},

  async summary () {
    await requireAdmin(this)

    // 并发四个 count，缩短首屏等待
    const [products, articles, banners, messages] = await Promise.all([
      db.collection('products').where({ _deleted: dbCmd.neq(true) }).count(),
      db.collection('articles').where({ _deleted: dbCmd.neq(true) }).count(),
      db.collection('banners').where({ _deleted: dbCmd.neq(true) }).count(),
      db.collection('contact_messages').where({ is_read: 0, _deleted: dbCmd.neq(true) }).count(),
    ])

    return {
      products: products.total || 0,
      articles: articles.total || 0,
      banners: banners.total || 0,
      messages: messages.total || 0,
    }
  },

  // 入口 access key 校验。匿名调用。
  // 若 site_content.admin_access_key 未设置或为空，则任意请求都视为通过。
  async verifyAccessKey (key) {
    const res = await db.collection('site_content')
      .where({ key: 'admin_access_key' })
      .limit(1)
      .get()
    const stored = res.data[0]?.content || ''
    if (!stored) return { valid: true }
    return { valid: String(key || '') === stored }
  },
}
