import { existsSync, unlinkSync, statSync } from 'fs'
import { safePath } from '../../utils/media'

export default defineEventHandler((event) => {
  const path = getRouterParam(event, 'path') || ''
  const full = safePath(path)

  if (!existsSync(full)) {
    throw createError({ statusCode: 404, statusMessage: 'file not found' })
  }

  if (!statSync(full).isFile()) {
    throw createError({ statusCode: 400, statusMessage: '不能通过此接口删除文件夹' })
  }

  unlinkSync(full)
  return { success: true }
})
