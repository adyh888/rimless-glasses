import { mkdirSync, existsSync, statSync } from 'fs'
import { UPLOAD_ROOT, safePath, validateName } from '../../utils/media'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const folderPath = String(body?.path || '').trim()
  if (!folderPath) {
    throw createError({ statusCode: 400, statusMessage: '请输入文件夹路径' })
  }

  const segments = folderPath.split('/').filter(Boolean)
  for (const seg of segments) {
    validateName(seg)
  }

  const absolute = safePath(folderPath)

  if (existsSync(absolute) && statSync(absolute).isFile()) {
    throw createError({ statusCode: 409, statusMessage: '同名文件已存在' })
  }

  mkdirSync(absolute, { recursive: true })
  return { success: true, path: folderPath }
})
