import { existsSync, statSync, readdirSync, rmSync } from 'fs'
import { safePath } from '../../utils/media'

export default defineEventHandler((event) => {
  const folderPath = getRouterParam(event, 'path')
  if (!folderPath) {
    throw createError({ statusCode: 400, statusMessage: '缺少文件夹路径' })
  }

  const query = getQuery(event)
  const force = query.force === 'true'

  const absolute = safePath(folderPath)
  if (!existsSync(absolute) || !statSync(absolute).isDirectory()) {
    throw createError({ statusCode: 404, statusMessage: '文件夹不存在' })
  }

  const contents = readdirSync(absolute)
  if (contents.length > 0 && !force) {
    throw createError({ statusCode: 409, statusMessage: '文件夹不为空，请先清空或使用强制删除' })
  }

  rmSync(absolute, { recursive: true, force: true })
  return { success: true }
})
