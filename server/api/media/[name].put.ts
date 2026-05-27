import { renameSync, existsSync } from 'fs'
import { resolve, extname } from 'path'

const UPLOAD_ROOT = resolve(process.cwd(), 'public/uploads')

export default defineEventHandler(async (event) => {
  if (!getAuthUser(event)) {
    throw createError({ statusCode: 401, statusMessage: '未授权' })
  }

  const oldName = getRouterParam(event, 'name')
  if (!oldName) throw createError({ statusCode: 400, statusMessage: '缺少文件名' })

  const body = await readBody(event)
  const newName = String(body?.newName || '').trim()
  if (!newName) throw createError({ statusCode: 400, statusMessage: '请输入新文件名' })

  const oldExt = extname(oldName).toLowerCase()
  const newExt = extname(newName).toLowerCase()
  const finalName = newExt ? newName : newName + oldExt

  if (finalName.includes('/') || finalName.includes('\\') || finalName.startsWith('.')) {
    throw createError({ statusCode: 400, statusMessage: '文件名不合法' })
  }

  const oldPath = resolve(UPLOAD_ROOT, oldName)
  const newPath = resolve(UPLOAD_ROOT, finalName)

  if (!existsSync(oldPath)) {
    throw createError({ statusCode: 404, statusMessage: '原文件不存在' })
  }
  if (existsSync(newPath) && oldName !== finalName) {
    throw createError({ statusCode: 409, statusMessage: '目标文件名已存在' })
  }

  renameSync(oldPath, newPath)
  return { url: `/uploads/${finalName}`, name: finalName }
})
