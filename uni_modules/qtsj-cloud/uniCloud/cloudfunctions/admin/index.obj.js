// 管理员管理云对象。
// 登录 / 注册 / 改密 / Token 校验 全部由 uni-id-co 接管，不在这里实现。
// 本对象只覆盖"管理员列表 / 删除管理员 / 改自己用户名"等后台特有的诉求。
//
// 权限：所有方法都要求 admin 角色（auth-guard.requireAdmin）。
// 表：uni-id-users（uni-id 默认表，含 username/password/role/...）

const uniIdCommon = require('uni-id-common')
const { requireAdmin } = require('auth-guard')
const { db, dbCmd } = require('db-helpers')

const USER_COL = 'uni-id-users'
const ADMIN_ROLE = 'admin'

function createUniID (ctx) {
  return uniIdCommon.createInstance({ clientInfo: ctx.getClientInfo() })
}

module.exports = {
  _before () {},

  // 列出所有管理员账号（仅 role 含 admin 的）
  async listAdmins () {
    await requireAdmin(this)
    const res = await db.collection(USER_COL)
      .where({ role: ADMIN_ROLE })
      .field({ _id: true, username: true, register_date: true, last_login_date: true })
      .orderBy('register_date', 'asc')
      .get()
    return { users: res.data }
  },

  // 创建管理员账号（已登录管理员才能新建）
  async createAdmin ({ username, password } = {}) {
    await requireAdmin(this)
    if (!username || !password) {
      throw { errCode: 400, errMsg: '请输入用户名和密码' }
    }
    if (String(username).trim().length < 2) {
      throw { errCode: 400, errMsg: '用户名至少 2 位' }
    }
    if (String(password).length < 6) {
      throw { errCode: 400, errMsg: '密码至少 6 位' }
    }

    const uniID = createUniID(this)
    // uni-id 的 register 内部已处理密码哈希、用户名唯一性
    const res = await uniID.register({
      username: String(username).trim(),
      password: String(password),
      role: [ADMIN_ROLE],
    })
    if (res.errCode) {
      // 复用 uni-id 的错误码（USERNAME_EXISTS 等）
      throw { errCode: res.errCode, errMsg: res.errMsg || '创建失败' }
    }
    return { success: true, user: { id: res.uid, username } }
  },

  // 删除管理员账号；不允许删除自己 + 至少保留 1 个
  async removeAdmin (id) {
    const me = await requireAdmin(this)
    if (!id) throw { errCode: 400, errMsg: 'id 必填' }
    if (id === me.uid) throw { errCode: 400, errMsg: '不能删除当前登录的账号' }

    const total = await db.collection(USER_COL).where({ role: ADMIN_ROLE }).count()
    if ((total.total || 0) <= 1) {
      throw { errCode: 400, errMsg: '至少保留一个管理员账号' }
    }

    const target = await db.collection(USER_COL).doc(id).get()
    if (!target.data.length) throw { errCode: 404, errMsg: '账号不存在' }

    await db.collection(USER_COL).doc(id).remove()
    return { success: true }
  },

  // 改自己的用户名/密码（需要当前密码二次确认）
  async updateAccount ({ currentPassword, newUsername, newPassword } = {}) {
    const me = await requireAdmin(this)
    if (!currentPassword) throw { errCode: 400, errMsg: '请输入当前密码' }
    if (!newUsername && !newPassword) {
      throw { errCode: 400, errMsg: '请输入新的用户名或新密码' }
    }
    if (newPassword && String(newPassword).length < 6) {
      throw { errCode: 400, errMsg: '新密码至少 6 位' }
    }

    const uniID = createUniID(this)

    // 用 uni-id 的 updatePwd 做密码校验 + 改密
    if (newPassword) {
      const r = await uniID.updatePwd({
        uid: me.uid,
        oldPassword: String(currentPassword),
        newPassword: String(newPassword),
      })
      if (r.errCode) throw { errCode: r.errCode, errMsg: r.errMsg || '密码错误' }
    } else {
      // 只改用户名时，仍然要校验当前密码
      const check = await uniID.checkPassword({
        uid: me.uid,
        password: String(currentPassword),
      })
      if (check.errCode) throw { errCode: 401, errMsg: '当前密码错误' }
    }

    // 改用户名（uniqueness 校验 + 直接更新 username 字段）
    let username
    if (newUsername) {
      username = String(newUsername).trim()
      if (username.length < 2) throw { errCode: 400, errMsg: '用户名至少 2 位' }
      const dup = await db.collection(USER_COL)
        .where({ username, _id: dbCmd.neq(me.uid) })
        .count()
      if (dup.total > 0) throw { errCode: 409, errMsg: '该用户名已被占用' }
      await db.collection(USER_COL).doc(me.uid).update({ username })
    } else {
      const cur = await db.collection(USER_COL).doc(me.uid).field({ username: true }).get()
      username = cur.data[0]?.username
    }

    // 修改后重新签发 token（密码变化会让旧 token 失效）
    const newToken = await uniID.createToken({ uid: me.uid })
    if (newToken.errCode) throw { errCode: newToken.errCode, errMsg: newToken.errMsg }

    return {
      success: true,
      token: newToken.token,
      tokenExpired: newToken.tokenExpired,
      user: { id: me.uid, username },
    }
  },
}
