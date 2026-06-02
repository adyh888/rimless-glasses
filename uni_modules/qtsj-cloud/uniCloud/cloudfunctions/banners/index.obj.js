// 轮播图云对象。对应原 server/api/banners/*。
// 表名：banners；list 公共读，写需 admin。
// 注意：原 list 不分页（轮播条数很少），保持一致。

const { db, dbCmd, nowFields } = require('db-helpers')
const { requireAdmin } = require('auth-guard')

const COL = 'banners'

function buildItemForWrite (body) {
  return {
    title: body.title || '',
    subtitle: body.subtitle || '',
    button_text: body.button_text || '',
    button_link: body.button_link || '',
    image_url: body.image_url || '',
    video_poster: body.video_poster || '',
    sort_order: Number(body.sort_order) || 0,
    is_active: body.is_active === 0 || body.is_active === false ? 0 : 1,
  }
}

module.exports = {
  _before () {},

  async list (query = {}) {
    const where = { _deleted: dbCmd.neq(true) }
    if (query.active_only === true || query.active_only === 'true') where.is_active = 1
    const res = await db.collection(COL)
      .where(where)
      .orderBy('sort_order', 'asc')
      .get()
    return res.data
  },

  async getById (id) {
    if (!id) throw { errCode: 400, errMsg: 'id 必填' }
    const res = await db.collection(COL).doc(id).get()
    const item = res.data[0]
    if (!item || item._deleted === true) throw { errCode: 404, errMsg: '轮播图不存在' }
    return item
  },

  async create (body = {}) {
    await requireAdmin(this)
    const doc = { ...buildItemForWrite(body), ...nowFields(true) }
    const res = await db.collection(COL).add(doc)
    return { id: res.id }
  },

  async update (id, body = {}) {
    await requireAdmin(this)
    if (!id) throw { errCode: 400, errMsg: 'id 必填' }
    const doc = { ...buildItemForWrite(body), ...nowFields() }
    await db.collection(COL).doc(id).update(doc)
    return { success: true }
  },

  async remove (id) {
    await requireAdmin(this)
    if (!id) throw { errCode: 400, errMsg: 'id 必填' }
    await db.collection(COL).doc(id).remove()
    return { success: true }
  },
}
