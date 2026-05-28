import { readFileSync, statSync, existsSync } from 'fs'
import { safePath } from '../../utils/media'

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
}

export default defineEventHandler((event) => {
  const path = getRouterParam(event, 'path') || ''
  const full = safePath(path)

  if (!existsSync(full)) {
    throw createError({ statusCode: 404, statusMessage: 'not found' })
  }

  const stat = statSync(full)
  if (!stat.isFile()) {
    throw createError({ statusCode: 404, statusMessage: 'not found' })
  }

  const ext = full.slice(full.lastIndexOf('.')).toLowerCase()
  setHeader(event, 'Content-Type', MIME[ext] || 'application/octet-stream')
  setHeader(event, 'Content-Length', stat.size)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return readFileSync(full)
})
