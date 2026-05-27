import { readdirSync, statSync } from 'fs'
import { resolve } from 'path'

const UPLOAD_ROOT = resolve(process.cwd(), 'public/uploads')

const EXT_TYPE: Record<string, string> = {
  '.jpg': 'image', '.jpeg': 'image', '.png': 'image',
  '.gif': 'image', '.webp': 'image', '.svg': 'image',
  '.mp4': 'video', '.webm': 'video', '.mov': 'video',
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Math.max(1, parseInt(String(query.page || '1'), 10))
  const limitRaw = parseInt(String(query.limit || '0'), 10)
  const limit = limitRaw > 0 ? Math.min(100, limitRaw) : 0
  const search = String(query.search || '').toLowerCase()
  const type = String(query.type || '')

  let files: string[]
  try {
    files = readdirSync(UPLOAD_ROOT)
  } catch {
    return limit ? { items: [], total: 0, page, limit } : []
  }

  let items = files
    .filter(f => {
      const ext = f.slice(f.lastIndexOf('.')).toLowerCase()
      return !!EXT_TYPE[ext]
    })
    .map(f => {
      const full = resolve(UPLOAD_ROOT, f)
      const stat = statSync(full)
      const ext = f.slice(f.lastIndexOf('.')).toLowerCase()
      return {
        url: `/uploads/${f}`,
        name: f,
        type: EXT_TYPE[ext] || 'image',
        size: stat.size,
        mtime: stat.mtimeMs,
      }
    })
    .sort((a, b) => b.mtime - a.mtime)

  if (type && type !== 'all') {
    items = items.filter(i => i.type === type)
  }
  if (search) {
    items = items.filter(i => i.name.toLowerCase().includes(search))
  }

  if (!limit) return items

  const total = items.length
  const start = (page - 1) * limit
  return { items: items.slice(start, start + limit), total, page, limit }
})
