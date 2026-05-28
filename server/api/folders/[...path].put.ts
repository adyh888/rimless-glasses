import { renameSync, existsSync, statSync } from 'fs'
import { resolve, dirname } from 'path'
import { safePath, validateName } from '../../utils/media'

export default defineEventHandler(async (event) => {
  const folderPath = getRouterParam(event, 'path')
  if (!folderPath) {
    throw createError({ statusCode: 400, statusMessage: '缺少文件夹路径' })
  }

  const body = await readBody(event)
  const newName = String(body?.newName || '').trim()
  if (!newName) {
    throw createError({ statusCode: 400, statusMessage: '请输入新名称' })
  }
  validateName(newName)

  const oldAbsolute = safePath(folderPath)
  if (!existsSync(oldAbsolute) || !statSync(oldAbsolute).isDirectory()) {
    throw createError({ statusCode: 404, statusMessage: '文件夹不存在' })
  }

  const parent = dirname(oldAbsolute)
  const newAbsolute = resolve(parent, newName)
  if (existsSync(newAbsolute) && oldAbsolute !== newAbsolute) {
    throw createError({ statusCode: 409, statusMessage: '同名文件夹已存在' })
  }

  renameSync(oldAbsolute, newAbsolute)

  const parts = folderPath.split('/')
  parts[parts.length - 1] = newName
  return { success: true, path: parts.join('/') }
})
