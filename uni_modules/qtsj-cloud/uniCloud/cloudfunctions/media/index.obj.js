// 媒体云对象。
// 关键变化：云存储没有"目录"概念，统一用 media_files / media_folders 两张元数据表。
// 上传流程改为：前端 uniCloud.uploadFile() 直传 → 本对象 register() 落库。
// 服务端不做图片压缩（云函数装不上 sharp），改为前端压缩或读取时用 buildImageProcessURL 动态缩图。

const { db, dbCmd, paginate, nowFields } = require('db-helpers')
const { requireAdmin } = require('auth-guard')
const { deleteFiles, resolveFileURL } = require('vendor-adapter')

const FILES = 'media_files'
const FOLDERS = 'media_folders'

function normPath (p) {
  return String(p || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
}

function escapeRe (str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

module.exports = {
  _before () {},

  // 列表 / 全局搜索（替代原 GET /api/media）
  // 参数：page / limit / folder / type=image|video|all / search
  async list (query = {}) {
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Number(query.limit) > 0 ? Math.min(100, Number(query.limit)) : 0
    const search = String(query.search || '').trim()
    const type = String(query.type || '')
    const folder = normPath(query.folder)
    const typeFilter = type && type !== 'all' ? type : null
    const globalSearch = search.length > 0 || !!typeFilter

    if (globalSearch) {
      const searchRe = search ? new RegExp(escapeRe(search), 'i') : null

      // 全局搜索文件夹（仅按名匹配）
      let folders = []
      if (searchRe) {
        const fRes = await db.collection(FOLDERS).where({ name: searchRe }).orderBy('path', 'asc').get()
        folders = fRes.data.map(f => ({ name: f.name, path: f.path }))
      }

      // 全局搜索文件
      const where = {}
      if (searchRe) {
        // 文件名 OR 所在文件夹路径匹配
        where.$or = [{ name: searchRe }, { folderPath: searchRe }]
      }
      if (typeFilter) where.type = typeFilter

      const countRes = await db.collection(FILES).where(where).count()
      const total = countRes.total

      let q = db.collection(FILES).where(where).orderBy('mtime', 'desc')
      if (limit) q = q.skip((page - 1) * limit).limit(limit)
      const items = (await q.get()).data

      return {
        folders,
        items,
        total,
        page: limit ? page : 1,
        limit,
        currentFolder: folder,
        globalSearch: true,
      }
    }

    // 浏览某层级：只看 folderPath == folder
    const foldersRes = await db.collection(FOLDERS)
      .where({ parent: folder })
      .orderBy('name', 'asc')
      .get()
    const folders = foldersRes.data.map(f => ({ name: f.name, path: f.path }))

    const where = { folderPath: folder }
    if (typeFilter) where.type = typeFilter

    const countRes = await db.collection(FILES).where(where).count()
    const total = countRes.total

    let q = db.collection(FILES).where(where).orderBy('mtime', 'desc')
    if (limit) q = q.skip((page - 1) * limit).limit(limit)
    const items = (await q.get()).data

    return {
      folders,
      items,
      total,
      page: limit ? page : 1,
      limit: limit || 0,
      currentFolder: folder,
      globalSearch: false,
    }
  },

  // 上传后登记元数据。前端 uniCloud.uploadFile() 拿到 fileID 后调用此方法。
  //   body: { fileID, name, type: 'image'|'video', size, folderPath }
  async register (body = {}) {
    await requireAdmin(this)
    const { fileID, name, type, size, folderPath } = body
    if (!fileID || !name || !type) {
      throw { errCode: 400, errMsg: 'fileID / name / type 必填' }
    }
    if (type !== 'image' && type !== 'video') {
      throw { errCode: 400, errMsg: 'type 仅支持 image / video' }
    }

    const url = await resolveFileURL(fileID)
    const folder = normPath(folderPath)
    const now = Date.now()

    const doc = {
      fileID,
      url,
      name,
      type,
      size: Number(size) || 0,
      mtime: now,
      folderPath: folder,
      ...nowFields(true),
    }
    const res = await db.collection(FILES).add(doc)
    return { id: res.id, url, fileID, folderPath: folder }
  },

  // 重命名 + 移动（替代原 PUT /api/media/[...path]）
  //   id 必填；newName 可选；targetFolder 可选（""=根目录，null=不改）
  async rename (id, body = {}) {
    await requireAdmin(this)
    if (!id) throw { errCode: 400, errMsg: 'id 必填' }
    const newName = body.newName != null ? String(body.newName).trim() : ''
    const targetFolder = body.targetFolder != null ? normPath(body.targetFolder) : null

    if (!newName && targetFolder === null) {
      throw { errCode: 400, errMsg: '请输入新文件名或目标文件夹' }
    }

    const res = await db.collection(FILES).doc(id).get()
    const file = res.data[0]
    if (!file) throw { errCode: 404, errMsg: '文件不存在' }

    const finalName = newName || file.name
    const finalFolder = targetFolder !== null ? targetFolder : file.folderPath

    // 同目录下名字唯一性
    const dup = await db.collection(FILES)
      .where({
        name: finalName,
        folderPath: finalFolder,
        _id: dbCmd.neq(id),
      })
      .count()
    if (dup.total > 0) throw { errCode: 409, errMsg: '目标文件名已存在' }

    await db.collection(FILES).doc(id).update({
      name: finalName,
      folderPath: finalFolder,
    })
    return {
      url: file.url,
      name: finalName,
      folder: finalFolder,
    }
  },

  // 批量复制（替代原 POST /api/media/copy）
  // 云存储不直接支持 server-to-server copy；本实现"复制元数据记录"——
  // 同一 fileID 多条 media_files 文档，节省存储成本，但删除时要小心引用计数。
  //   body: { ids: [], targetFolder: '' }
  async copy ({ ids, targetFolder } = {}) {
    await requireAdmin(this)
    if (!Array.isArray(ids) || ids.length === 0) {
      throw { errCode: 400, errMsg: '请选择要复制的文件' }
    }
    const safeIds = ids.filter(x => typeof x === 'string' && x.length > 0)
    if (safeIds.length === 0) throw { errCode: 400, errMsg: '无效 id' }

    const dest = normPath(targetFolder)
    const srcRes = await db.collection(FILES).where({ _id: dbCmd.in(safeIds) }).get()
    const results = []

    for (const file of srcRes.data) {
      try {
        let finalName = file.name
        let suffix = 1
        // 同目录去重命名（_copy / _copy_2...）
        while (true) {
          const c = await db.collection(FILES)
            .where({ folderPath: dest, name: finalName })
            .count()
          if (c.total === 0) break
          const ext = finalName.lastIndexOf('.') > 0 ? finalName.slice(finalName.lastIndexOf('.')) : ''
          const base = ext ? file.name.slice(0, file.name.length - ext.length) : file.name
          finalName = suffix === 1 ? `${base}_copy${ext}` : `${base}_copy_${suffix}${ext}`
          suffix++
        }

        const newDoc = {
          fileID: file.fileID,
          url: file.url,
          name: finalName,
          type: file.type,
          size: file.size,
          mtime: Date.now(),
          folderPath: dest,
          ...nowFields(true),
        }
        const add = await db.collection(FILES).add(newDoc)
        results.push({ source: file._id, id: add.id, url: file.url, name: finalName })
      } catch (e) {
        results.push({ source: file._id, error: e.message || '复制失败' })
      }
    }
    return { results }
  },

  // 删除文件。最后一份引用时同步清理云存储对象（按 fileID 引用计数）。
  async remove (id) {
    await requireAdmin(this)
    if (!id) throw { errCode: 400, errMsg: 'id 必填' }

    const res = await db.collection(FILES).doc(id).get()
    const file = res.data[0]
    if (!file) throw { errCode: 404, errMsg: '文件不存在' }

    await db.collection(FILES).doc(id).remove()

    const others = await db.collection(FILES).where({ fileID: file.fileID }).count()
    if (others.total === 0) {
      try { await deleteFiles(file.fileID) } catch {}
    }
    return { success: true }
  },
}
