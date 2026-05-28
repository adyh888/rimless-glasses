import { renameSync, existsSync, mkdirSync } from 'fs'
import { resolve, extname, dirname, basename } from 'path'
import { UPLOAD_ROOT, safePath, validateName } from '../../utils/media'

export default defineEventHandler(async (event) => {
  if (!getAuthUser(event)) {
    throw createError({ statusCode: 401, statusMessage: '未授权' })
  }

  const filePath = getRouterParam(event, 'path')
  if (!filePath) throw createError({ statusCode: 400, statusMessage: '缺少文件路径' })

  const body = await readBody(event)
  const newName = String(body?.newName || '').trim()
  const targetFolder = body?.folder != null ? String(body.folder).trim() : null

  if (!newName && targetFolder === null) {
    throw createError({ statusCode: 400, statusMessage: '请输入新文件名或目标文件夹' })
  }

  const oldAbsolute = safePath(filePath)
  if (!existsSync(oldAbsolute)) {
    throw createError({ statusCode: 404, statusMessage: '原文件不存在' })
  }

  const oldFileName = basename(filePath)
  const oldExt = extname(oldFileName).toLowerCase()

  let finalName = oldFileName
  if (newName) {
    validateName(newName)
    const newExt = extname(newName).toLowerCase()
    finalName = newExt ? newName : newName + oldExt
  }

  let destDir = dirname(oldAbsolute)
  let folderPath = filePath.includes('/') ? filePath.slice(0, filePath.lastIndexOf('/')) : ''
  if (targetFolder !== null) {
    if (targetFolder === '') {
      destDir = UPLOAD_ROOT
      folderPath = ''
    } else {
      destDir = safePath(targetFolder)
      mkdirSync(destDir, { recursive: true })
      folderPath = targetFolder.replace(/\\/g, '/')
    }
  }

  const newAbsolute = resolve(destDir, finalName)
  if (existsSync(newAbsolute) && oldAbsolute !== newAbsolute) {
    throw createError({ statusCode: 409, statusMessage: '目标文件名已存在' })
  }

  renameSync(oldAbsolute, newAbsolute)

  const newUrl = folderPath ? `/uploads/${folderPath}/${finalName}` : `/uploads/${finalName}`
  return { url: newUrl, name: finalName, folder: folderPath }
})
