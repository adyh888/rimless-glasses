// 产品云对象。对应原 server/api/products/*。
// 表名：products；公共读，写需 admin。

const { db, dbCmd, paginate, safeOrderBy, nowFields } = require('db-helpers')
const { requireAdmin } = require('auth-guard')

const COL = 'products'

// JQL 集合不接受 SQL，自然没有注入；但仍校验排序白名单，避免传入未知字段。
const ALLOWED_ORDER = ['sort_order', 'is_active', 'created_at', 'price']

function parseJson (str, fallback) {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}

function buildItemForWrite (body) {
  return {
    name: body.name,
    slug: body.slug,
    price: Number(body.price) || 0,
    description: body.description || '',
    specs_json: JSON.stringify(body.specs || {}),
    images_json: JSON.stringify(body.images || []),
    category: body.category || '',
    sub_category: body.sub_category || '',
    is_featured: body.is_featured ? 1 : 0,
    is_active: body.is_active === 0 || body.is_active === false ? 0 : 1,
    sort_order: Number(body.sort_order) || 0,
  }
}

module.exports = {
  _before () {},

  // 列表 / 单 slug 查询。匿名可调用。
  async list (query = {}) {
    if (query.slug) {
      const res = await db.collection(COL)
        .where({ slug: query.slug, is_active: 1, _deleted: dbCmd.neq(true) })
        .limit(1)
        .get()
      if (!res.data.length) throw { errCode: 404, errMsg: '产品不存在' }
      return res.data[0]
    }

    const where = {}
    if (query.active_only === true || query.active_only === 'true') where.is_active = 1
    if (query.featured === true || query.featured === 'true') where.is_featured = 1
    if (query.category) where.category = query.category
    if (query.sub_category) where.sub_category = query.sub_category
    if (query.is_active !== undefined && query.is_active !== '') {
      where.is_active = (query.is_active === 1 || query.is_active === '1') ? 1 : 0
    }
    if (query.search) {
      // JQL 用正则做模糊匹配
      const safe = String(query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      where.name = new RegExp(safe, 'i')
    }

    const orderBy = safeOrderBy(query.order_by, query.order_dir, ALLOWED_ORDER, 'sort_order')
    // 兼容原 SQL：按 is_active 排序时追加 sort_order 次序
    if (orderBy[0].field === 'is_active') orderBy.push({ field: 'sort_order', dir: 'asc' })

    return paginate(COL, {
      where,
      orderBy,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 50,
    })
  },

  // 按 _id 查询单条。匿名可调用（后台预览也走这里）。
  async getById (id) {
    if (!id) throw { errCode: 400, errMsg: 'id 必填' }
    const res = await db.collection(COL).doc(id).get()
    const item = res.data[0]
    if (!item || item._deleted === true) throw { errCode: 404, errMsg: '产品不存在' }
    return item
  },

  async create (body = {}) {
    await requireAdmin(this)
    if (!body.name) throw { errCode: 400, errMsg: 'name 必填' }
    const slug = body.slug || `product-${Date.now()}`
    const doc = { ...buildItemForWrite({ ...body, slug }), ...nowFields(true) }
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

  // 批量操作：delete / set_active / set_inactive / set_price / set_category
  async batch ({ ids, action, value } = {}) {
    await requireAdmin(this)
    if (!Array.isArray(ids) || ids.length === 0) {
      throw { errCode: 400, errMsg: '请选择产品' }
    }
    const safeIds = ids.filter(x => typeof x === 'string' && x.length > 0)
    if (safeIds.length === 0) throw { errCode: 400, errMsg: '无效的产品ID' }

    const where = { _id: dbCmd.in(safeIds) }
    const now = nowFields()

    switch (action) {
      case 'delete':
        await db.collection(COL).where(where).remove()
        return { success: true }
      case 'set_active':
        await db.collection(COL).where(where).update({ is_active: 1, ...now })
        return { success: true }
      case 'set_inactive':
        await db.collection(COL).where(where).update({ is_active: 0, ...now })
        return { success: true }
      case 'set_price':
        if (typeof value !== 'number' || value < 0) {
          throw { errCode: 400, errMsg: '价格无效' }
        }
        await db.collection(COL).where(where).update({ price: value, ...now })
        return { success: true }
      case 'set_category': {
        if (!value || typeof value !== 'string') {
          throw { errCode: 400, errMsg: '分类不能为空' }
        }
        const parts = value.split('/')
        const category = (parts[0] || '').trim()
        const sub_category = (parts[1] || '').trim()
        await db.collection(COL).where(where).update({ category, sub_category, ...now })
        return { success: true }
      }
      default:
        throw { errCode: 400, errMsg: '未知操作' }
    }
  },

  // 拖拽重排：传入有序 _id 数组，按下标写回 sort_order
  async reorder ({ ids } = {}) {
    await requireAdmin(this)
    if (!Array.isArray(ids)) throw { errCode: 400, errMsg: 'ids 必须是数组' }
    const safeIds = ids.filter(x => typeof x === 'string' && x.length > 0)
    if (safeIds.length === 0) return { success: true, updated: 0 }

    // uniCloud 没有原子批事务，但单文档 update 失败也不影响其它项；
    // 顺序更新即可，并发量小（管理端拖拽）。
    for (let i = 0; i < safeIds.length; i++) {
      await db.collection(COL).doc(safeIds[i]).update({
        sort_order: i + 1,
        ...nowFields(),
      })
    }
    return { success: true, updated: safeIds.length }
  },
}
