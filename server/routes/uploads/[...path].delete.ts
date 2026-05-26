import { existsSync, unlinkSync } from 'fs'
import { resolve, normalize, sep } from 'path'

const UPLOAD_ROOT = resolve(process.cwd(), 'public/uploads')

export default defineEventHandler((event) => {
  const path = getRouterParam(event, 'path') || ''
  // 防穿越
  const safe = normalize(path).replace(/^[/\\]+/, '')
  if (safe.startsWith('..') || safe.includes(`..${sep}`)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid path' })
  }

  const full = resolve(UPLOAD_ROOT, safe)
  if (!full.startsWith(UPLOAD_ROOT)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid path' })
  }

  if (!existsSync(full)) {
    throw createError({ statusCode: 404, statusMessage: 'file not found' })
  }

  unlinkSync(full)
  return { success: true }
})
