import { readFileSync, statSync, existsSync } from 'fs'
import { resolve, normalize, sep } from 'path'

// 运行时上传目录：
// - 开发模式  process.cwd() = 项目根  →  <root>/public/uploads
// - 生产/Docker  process.cwd() = /app  →  /app/public/uploads（entrypoint 已软链到 /app/uploads）
const UPLOAD_ROOT = resolve(process.cwd(), 'public/uploads')

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

export default defineEventHandler((event) => {
  const path = getRouterParam(event, 'path') || ''
  // 防穿越：不允许出现 .. 或绝对路径
  const safe = normalize(path).replace(/^[/\\]+/, '')
  if (safe.startsWith('..') || safe.includes(`..${sep}`)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid path' })
  }

  const full = resolve(UPLOAD_ROOT, safe)
  if (!full.startsWith(UPLOAD_ROOT)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid path' })
  }
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
