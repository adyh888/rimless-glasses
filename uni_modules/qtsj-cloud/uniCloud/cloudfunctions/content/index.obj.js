// 站点内容云对象。对应原 server/api/content/[key]。
// 表名：site_content；读公开（前台拿配置），写需 admin。
// upsert 语义：set(key, content) 不存在则插入。

const { db, dbCmd, nowFields } = require('db-helpers')
const { requireAdmin } = require('auth-guard')

const COL = 'site_content'

module.exports = {
  _before () {},

  // 按 key 读取，缺失时返回空内容（与原 GET 行为一致，避免前台报错）
  async get (key) {
    if (!key) throw { errCode: 400, errMsg: 'key 必填' }
    const res = await db.collection(COL)
      .where({ key, _deleted: dbCmd.neq(true) })
      .limit(1)
      .get()
    if (!res.data.length) return { key, content: '' }
    return res.data[0]
  },

  // upsert
  async set (key, body = {}) {
    await requireAdmin(this)
    if (!key) throw { errCode: 400, errMsg: 'key 必填' }
    const content = body.content || ''

    const existing = await db.collection(COL).where({ key }).limit(1).get()
    if (existing.data.length) {
      await db.collection(COL)
        .doc(existing.data[0]._id)
        .update({ content, ...nowFields() })
    } else {
      await db.collection(COL).add({ key, content, ...nowFields(true) })
    }
    return { success: true }
  },
}
