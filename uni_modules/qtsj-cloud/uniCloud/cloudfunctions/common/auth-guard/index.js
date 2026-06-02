// 云对象权限守卫。
// 用法：在云对象的 _before 钩子里调用 requireAdmin(this)。
// 依赖 uni-id-co 的 token 校验机制，token 由请求头 uni-id-token 携带。

const createConfig = require('uni-config-center')

async function getUid (ctx) {
  // uniCloud 云对象 ctx 上有 getClientInfo / getUniIdToken
  const token = ctx.getUniIdToken && ctx.getUniIdToken()
  if (!token) return null
  const uniIdCommon = require('uni-id-common')
  const uniID = uniIdCommon.createInstance({ clientInfo: ctx.getClientInfo() })
  const res = await uniID.checkToken(token)
  if (res.errCode) return null
  return { uid: res.uid, role: res.role || [], permission: res.permission || [] }
}

async function requireAdmin (ctx) {
  const user = await getUid(ctx)
  if (!user) {
    throw { errCode: 'AUTH_REQUIRED', errMsg: '未登录' }
  }
  // 默认所有 uni-id 用户都可作为后台管理员；
  // 若需限制，可在 uni-id 用户表给特定用户加 role: ['admin']，并在此校验。
  return user
}

async function getOptionalUser (ctx) {
  return await getUid(ctx)
}

module.exports = { requireAdmin, getOptionalUser }
