import { readdirSync, statSync } from 'fs'
import { resolve } from 'path'
import { UPLOAD_ROOT, safePath } from '../utils/media'

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
  const folder = String(query.folder || '').trim()

  const dir = folder ? safePath(folder) : UPLOAD_ROOT
  const folderPrefix = folder ? folder.replace(/\\/g, '/').replace(/\/+$/, '') : ''

  let entries: import('fs').Dirent[]
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return { folders: [], items: [], total: 0, page, limit: limit || 24, currentFolder: folderPrefix }
  }

  const folders = entries
    .filter(e => e.isDirectory() && !e.name.startsWith('.'))
    .map(e => ({
      name: e.name,
      path: folderPrefix ? `${folderPrefix}/${e.name}` : e.name,
    }))
    .filter(f => !search || f.name.toLowerCase().includes(search))
    .sort((a, b) => a.name.localeCompare(b.name))

  let items = entries
    .filter(e => {
      if (!e.isFile()) return false
      const ext = e.name.slice(e.name.lastIndexOf('.')).toLowerCase()
      return !!EXT_TYPE[ext]
    })
    .map(e => {
      const full = resolve(dir, e.name)
      const stat = statSync(full)
      const ext = e.name.slice(e.name.lastIndexOf('.')).toLowerCase()
      return {
        url: folderPrefix ? `/uploads/${folderPrefix}/${e.name}` : `/uploads/${e.name}`,
        name: e.name,
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

  const total = items.length
  if (limit) {
    const start = (page - 1) * limit
    return { folders, items: items.slice(start, start + limit), total, page, limit, currentFolder: folderPrefix }
  }
  return { folders, items, total, page: 1, limit: 0, currentFolder: folderPrefix }
})
