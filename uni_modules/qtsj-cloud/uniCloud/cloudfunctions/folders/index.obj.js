// 文件夹云对象。文件夹是逻辑概念，通过 media_folders 表存路径。
// rename / remove 时需要级联更新子文件夹和 media_files 里的 folderPath 字段。

const { db, dbCmd, nowFields } = require('db-helpers')
const { requireAdmin } = require('auth-guard')

const FILES = 'media_files'
const FOLDERS = 'media_folders'

function normPath (p) {
  return String(p || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
}

function escapeRe (str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function validateName (name) {
  if (!name || name.includes('/') || name.includes('\\') || name.startsWith('.') || name.includes('..')) {
    throw { errCode: 400, errMsg: '名称不合法' }
  }
  if (/[<>:"|?*\x00-\x1f]/.test(name)) {
    throw { errCode: 400, errMsg: '名称包含非法字符' }
  }
  if (name.length > 255) {
    throw { errCode: 400, errMsg: '名称过长' }
  }
}

module.exports = {
  _before () {},

  // 新建文件夹（path 形如 "产品/2026-06"，自动建中间层）
  async create ({ path } = {}) {
    await requireAdmin(this)
    const p = normPath(path)
    if (!p) throw { errCode: 400, errMsg: '请输入文件夹路径' }

    const segments = p.split('/').filter(Boolean)
    for (const seg of segments) validateName(seg)

    // 自顶向下确保每一层都存在
    let acc = ''
    for (const seg of segments) {
      const parent = acc
      const fullPath = acc ? `${acc}/${seg}` : seg

      const existing = await db.collection(FOLDERS).where({ path: fullPath }).limit(1).get()
      if (!existing.data.length) {
        await db.collection(FOLDERS).add({
          path: fullPath,
          name: seg,
          parent,
          ...nowFields(true),
        })
      }
      acc = fullPath
    }
    return { success: true, path: p }
  },

  // 重命名文件夹（不能移动到别的父目录；移动靠 media.rename）
  async rename (id, body = {}) {
    await requireAdmin(this)
    if (!id) throw { errCode: 400, errMsg: 'id 必填' }
    const newName = String(body.newName || '').trim()
    if (!newName) throw { errCode: 400, errMsg: '请输入新名称' }
    validateName(newName)

    const res = await db.collection(FOLDERS).doc(id).get()
    const folder = res.data[0]
    if (!folder) throw { errCode: 404, errMsg: '文件夹不存在' }

    const newPath = folder.parent ? `${folder.parent}/${newName}` : newName
    if (newPath === folder.path) return { success: true, path: folder.path }

    // 同层级唯一性
    const dup = await db.collection(FOLDERS)
      .where({ parent: folder.parent, name: newName })
      .count()
    if (dup.total > 0) throw { errCode: 409, errMsg: '同名文件夹已存在' }

    const oldPath = folder.path
    const prefixRe = new RegExp(`^${escapeRe(oldPath)}(/|$)`)

    // 级联：所有 path 以 oldPath 开头的子文件夹
    const children = await db.collection(FOLDERS).where({ path: prefixRe }).get()
    for (const c of children.data) {
      const newChildPath = newPath + c.path.slice(oldPath.length)
      const newChildParent = c.parent === oldPath
        ? newPath
        : c.parent.replace(prefixRe, (m, sep) => newPath + sep)
      await db.collection(FOLDERS).doc(c._id).update({
        path: newChildPath,
        parent: newChildParent,
        ...(c._id === id ? { name: newName } : {}),
      })
    }

    // 级联：所有 folderPath 在该子树下的文件
    const filesRes = await db.collection(FILES).where({ folderPath: prefixRe }).get()
    for (const f of filesRes.data) {
      await db.collection(FILES).doc(f._id).update({
        folderPath: newPath + f.folderPath.slice(oldPath.length),
      })
    }

    return { success: true, path: newPath }
  },

  // 删除文件夹。force=true 时递归删除子树（含文件元数据）；
  //   但云存储对象按 fileID 引用计数清理（与 media.remove 一致）。
  async remove (id, query = {}) {
    await requireAdmin(this)
    if (!id) throw { errCode: 400, errMsg: 'id 必填' }
    const force = query.force === true || query.force === 'true'

    const res = await db.collection(FOLDERS).doc(id).get()
    const folder = res.data[0]
    if (!folder) throw { errCode: 404, errMsg: '文件夹不存在' }

    const oldPath = folder.path
    const prefixRe = new RegExp(`^${escapeRe(oldPath)}(/|$)`)

    const fileCount = await db.collection(FILES).where({ folderPath: prefixRe }).count()
    const subCount = await db.collection(FOLDERS).where({ path: prefixRe, _id: dbCmd.neq(id) }).count()
    if ((fileCount.total > 0 || subCount.total > 0) && !force) {
      throw { errCode: 409, errMsg: '文件夹不为空，请先清空或使用强制删除' }
    }

    if (force) {
      // 收集所有 fileID 用于引用计数
      const filesRes = await db.collection(FILES).where({ folderPath: prefixRe }).get()
      const fileIDs = filesRes.data.map(f => f.fileID).filter(Boolean)

      // 删除文件元数据
      await db.collection(FILES).where({ folderPath: prefixRe }).remove()

      // 删除子文件夹 + 自身
      await db.collection(FOLDERS).where({ path: prefixRe }).remove()

      // 释放云存储对象（仅当所有引用都被删除）
      const { deleteFiles } = require('vendor-adapter')
      const uniq = [...new Set(fileIDs)]
      for (const fid of uniq) {
        const remain = await db.collection(FILES).where({ fileID: fid }).count()
        if (remain.total === 0) {
          try { await deleteFiles(fid) } catch {}
        }
      }
    } else {
      await db.collection(FOLDERS).doc(id).remove()
    }

    return { success: true }
  },
}
