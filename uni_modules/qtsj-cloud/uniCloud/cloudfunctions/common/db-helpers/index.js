// 通用 DB 工具：分页、白名单排序、软删除过滤。
// 所有云对象都用这里的 helper，避免散点写 JQL。

const db = uniCloud.database()
const dbCmd = db.command

// 标准分页：返回 { items, total, page, limit }
async function paginate (collectionName, {
  where = {},
  orderBy = null,        // [{ field, dir }, ...]
  page = 1,
  limit = 50,
  fieldProjection = null,
} = {}) {
  const col = db.collection(collectionName)
  let query = col.where({ _deleted: dbCmd.neq(true), ...where })

  if (Array.isArray(orderBy)) {
    for (const o of orderBy) query = query.orderBy(o.field, o.dir || 'asc')
  }

  const countRes = await col.where({ _deleted: dbCmd.neq(true), ...where }).count()
  const total = countRes.total

  query = query.skip((page - 1) * limit).limit(limit)
  if (fieldProjection) query = query.field(fieldProjection)

  const listRes = await query.get()
  return { items: listRes.data, total, page, limit }
}

// 排序白名单校验
function safeOrderBy (orderBy, orderDir, allowedFields, defaultField) {
  const field = allowedFields.includes(orderBy) ? orderBy : defaultField
  const dir = String(orderDir || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc'
  return [{ field, dir }]
}

// 软删除
async function softDelete (collectionName, id) {
  return db.collection(collectionName).doc(id).update({
    _deleted: true,
    _delete_date: Date.now(),
  })
}

// 标准化时间字段
function nowFields (isCreate = false) {
  const t = Date.now()
  return isCreate ? { _create_date: t, _update_date: t } : { _update_date: t }
}

module.exports = { db, dbCmd, paginate, safeOrderBy, softDelete, nowFields }
