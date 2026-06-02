// 留言云对象。合并 contact.post（前台提交）+ messages/*（后台查看/标记/删除）。
// 表名：contact_messages。
//   submit  - 前台匿名调用，依赖 site_content.contact_validation 做校验 + IP 限流
//   list/markRead/remove/batchDelete/batchMarkRead - 需 admin

const { db, dbCmd, paginate, nowFields } = require('db-helpers')
const { requireAdmin } = require('auth-guard')

const COL = 'contact_messages'

// 内存限流：单实例内有效；冷启动会清空。低频提交场景够用。
// 若需跨实例严格限流，未来可换 Redis 或单独的限流集合。
const rateLimitMap = new Map()
const RL_PURGE_INTERVAL = 600_000 // 10 分钟扫一次
const RL_PURGE_TTL = 86_400_000   // 1 天后清

let purgeTimer = null
function ensurePurgeTimer () {
  if (purgeTimer) return
  purgeTimer = setInterval(() => {
    const now = Date.now()
    for (const [ip, ts] of rateLimitMap) {
      if (now - ts > RL_PURGE_TTL) rateLimitMap.delete(ip)
    }
  }, RL_PURGE_INTERVAL)
  if (purgeTimer.unref) purgeTimer.unref()
}

function sanitize (str, maxLength) {
  return String(str)
    .slice(0, maxLength)
    // 控制字符
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
    // HTML/JS 元字符
    .replace(/[<>'"\\\/]/g, '')
    .replace(/\.\./g, '')
}

const DEFAULT_VALIDATION = {
  name: { minLength: 2, maxLength: 20 },
  email: { enabled: true, pattern: '' },
  phone: { enabled: true, pattern: '', minLength: 7, maxLength: 20 },
  message: { minLength: 10, maxLength: 500 },
  rateLimit: { enabled: true, interval: 60 },
}

async function loadValidation () {
  const res = await db.collection('site_content')
    .where({ key: 'contact_validation' })
    .limit(1)
    .get()
  if (!res.data.length || !res.data[0].content) return DEFAULT_VALIDATION
  try { return { ...DEFAULT_VALIDATION, ...JSON.parse(res.data[0].content) } }
  catch { return DEFAULT_VALIDATION }
}

function getClientIp (ctx) {
  const info = ctx.getClientInfo && ctx.getClientInfo()
  return (info && (info.clientIP || info.uniIdToken || info.deviceId)) || 'unknown'
}

module.exports = {
  _before () { ensurePurgeTimer() },

  // 前台提交留言。匿名。
  async submit (body = {}) {
    if (!body.name || typeof body.name !== 'string') {
      throw { errCode: 400, errMsg: '请填写必填字段' }
    }
    if (!body.message || typeof body.message !== 'string') {
      throw { errCode: 400, errMsg: '请填写必填字段' }
    }
    if (body.email && typeof body.email !== 'string') {
      throw { errCode: 400, errMsg: '邮箱格式不正确' }
    }
    if (body.phone && typeof body.phone !== 'string') {
      throw { errCode: 400, errMsg: '电话格式不正确' }
    }
    if (!body.email && !body.phone) {
      throw { errCode: 400, errMsg: '请至少填写邮箱或电话其中一项' }
    }

    const name = sanitize(body.name, 50)
    const email = body.email ? sanitize(body.email, 100) : ''
    const phone = body.phone ? sanitize(body.phone, 30) : ''
    const message = sanitize(body.message, 5000)

    const validation = await loadValidation()

    if (!name.trim()) throw { errCode: 400, errMsg: '姓名不能为空' }
    const nameMin = validation.name?.minLength ?? 2
    const nameMax = validation.name?.maxLength ?? 20
    if (name.length < nameMin) throw { errCode: 400, errMsg: `姓名至少需要 ${nameMin} 个字符` }
    if (name.length > nameMax) throw { errCode: 400, errMsg: `姓名不能超过 ${nameMax} 个字符` }
    if (!message.trim()) throw { errCode: 400, errMsg: '留言内容不能为空' }

    const clientIp = getClientIp(this)
    if (validation.rateLimit?.enabled !== false) {
      const interval = (validation.rateLimit?.interval || 60) * 1000
      const last = rateLimitMap.get(clientIp)
      if (last && Date.now() - last < interval) {
        const remaining = Math.ceil((interval - (Date.now() - last)) / 1000)
        throw { errCode: 429, errMsg: `提交过于频繁，请 ${remaining} 秒后再试` }
      }
    }

    if (email && validation.email?.enabled) {
      const pattern = validation.email.pattern || '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
      if (!new RegExp(pattern).test(email)) {
        throw { errCode: 400, errMsg: '邮箱格式不正确' }
      }
    }

    if (phone && validation.phone?.enabled) {
      const pattern = validation.phone.pattern || '^1[3-9]\\d{9}$|^0\\d{2,3}-?\\d{7,8}$'
      if (!new RegExp(pattern).test(phone)) {
        throw { errCode: 400, errMsg: '电话格式不正确' }
      }
      const phoneDigits = phone.replace(/[^0-9]/g, '').length
      const pMin = validation.phone.minLength || 7
      const pMax = validation.phone.maxLength || 20
      if (phoneDigits < pMin || phoneDigits > pMax) {
        throw { errCode: 400, errMsg: `电话长度应在 ${pMin} 到 ${pMax} 位之间` }
      }
    }

    const mLen = message.length
    const mMin = validation.message?.minLength ?? 10
    const mMax = validation.message?.maxLength ?? 500
    if (mLen < mMin) throw { errCode: 400, errMsg: `留言内容至少需要 ${mMin} 个字符` }
    if (mLen > mMax) throw { errCode: 400, errMsg: `留言内容不能超过 ${mMax} 个字符` }

    await db.collection(COL).add({
      name, email, phone, message,
      is_read: 0,
      ...nowFields(true),
    })

    rateLimitMap.set(clientIp, Date.now())
    return { success: true, message: '感谢您的留言，我们会尽快回复！' }
  },

  // 后台列表
  async list (query = {}) {
    await requireAdmin(this)
    return paginate(COL, {
      orderBy: [{ field: 'created_at', dir: 'desc' }],
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
    })
  },

  // 单条标记已读 / 未读
  async markRead (id, body = {}) {
    await requireAdmin(this)
    if (!id) throw { errCode: 400, errMsg: 'id 必填' }
    const is_read = body.is_read === 0 || body.is_read === false ? 0 : 1
    await db.collection(COL).doc(id).update({ is_read })
    return { success: true }
  },

  async remove (id) {
    await requireAdmin(this)
    if (!id) throw { errCode: 400, errMsg: 'id 必填' }
    await db.collection(COL).doc(id).remove()
    return { success: true }
  },

  async batchDelete ({ ids } = {}) {
    await requireAdmin(this)
    if (!Array.isArray(ids) || ids.length === 0) {
      throw { errCode: 400, errMsg: '请选择留言' }
    }
    const safeIds = ids.filter(x => typeof x === 'string' && x.length > 0)
    if (safeIds.length === 0) throw { errCode: 400, errMsg: '无效的留言 ID' }
    await db.collection(COL).where({ _id: dbCmd.in(safeIds) }).remove()
    return { success: true, message: '删除成功' }
  },

  // action: mark_read（指定 ids）/ mark_all_read（全部未读）
  async batchMarkRead ({ ids, action } = {}) {
    await requireAdmin(this)

    if (action === 'mark_all_read') {
      await db.collection(COL).where({ is_read: 0 }).update({ is_read: 1 })
      return { success: true, message: '全部标记已读成功' }
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      throw { errCode: 400, errMsg: '请选择留言' }
    }
    const safeIds = ids.filter(x => typeof x === 'string' && x.length > 0)
    if (safeIds.length === 0) throw { errCode: 400, errMsg: '无效的留言 ID' }

    if (action === 'mark_read') {
      await db.collection(COL).where({ _id: dbCmd.in(safeIds) }).update({ is_read: 1 })
      return { success: true, message: '标记已读成功' }
    }

    throw { errCode: 400, errMsg: '未知操作' }
  },
}
