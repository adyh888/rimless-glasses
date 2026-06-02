import { readdirSync, statSync } from 'fs'
import { resolve } from 'path'
import { UPLOAD_ROOT, safePath } from '../utils/media'

const EXT_TYPE: Record<string, string> = {
  '.jpg': 'image', '.jpeg': 'image', '.png': 'image',
  '.gif': 'image', '.webp': 'image', '.svg': 'image',
  '.mp4': 'video', '.webm': 'video', '.mov': 'video',
}

interface CollectedItem {
  url: string
  name: string
  type: string
  size: number
  mtime: number
  folderPath: string
}

interface CollectedFolder {
  name: string
  path: string
}

function walk(dir: string, relativePrefix: string, acc: { items: CollectedItem[]; folders: CollectedFolder[] }) {
  let entries: import('fs').Dirent[]
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }

  for (const e of entries) {
    if (e.name.startsWith('.')) continue
    if (e.isDirectory()) {
      const sub = relativePrefix ? `${relativePrefix}/${e.name}` : e.name
      acc.folders.push({ name: e.name, path: sub })
      walk(resolve(dir, e.name), sub, acc)
    } else if (e.isFile()) {
      const ext = e.name.slice(e.name.lastIndexOf('.')).toLowerCase()
      if (!EXT_TYPE[ext]) continue
      const full = resolve(dir, e.name)
      let stat
      try { stat = statSync(full) } catch { continue }
      acc.items.push({
        url: relativePrefix ? `/uploads/${relativePrefix}/${e.name}` : `/uploads/${e.name}`,
        name: e.name,
        type: EXT_TYPE[ext] || 'image',
        size: stat.size,
        mtime: stat.mtimeMs,
        folderPath: relativePrefix,
      })
    }
  }
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Math.max(1, parseInt(String(query.page || '1'), 10))
  const limitRaw = parseInt(String(query.limit || '0'), 10)
  const limit = limitRaw > 0 ? Math.min(100, limitRaw) : 0
  const search = String(query.search || '').toLowerCase().trim()
  const type = String(query.type || '')
  const folder = String(query.folder || '').trim()
  const globalSearch = search.length > 0

  if (globalSearch) {
    const acc: { items: CollectedItem[]; folders: CollectedFolder[] } = { items: [], folders: [] }
    walk(UPLOAD_ROOT, '', acc)

    let folders = acc.folders
      .filter(f => f.name.toLowerCase().includes(search))
      .sort((a, b) => a.path.localeCompare(b.path))

    let items = acc.items
      .filter(i =>
        i.name.toLowerCase().includes(search) ||
        i.folderPath.toLowerCase().includes(search)
      )

    if (type && type !== 'all') {
      items = items.filter(i => i.type === type)
    }
    items.sort((a, b) => b.mtime - a.mtime)

    const total = items.length
    if (limit) {
      const start = (page - 1) * limit
      return {
        folders,
        items: items.slice(start, start + limit),
        total,
        page,
        limit,
        currentFolder: folder,
        globalSearch: true,
      }
    }
    return { folders, items, total, page: 1, limit: 0, currentFolder: folder, globalSearch: true }
  }

  const dir = folder ? safePath(folder) : UPLOAD_ROOT
  const folderPrefix = folder ? folder.replace(/\\/g, '/').replace(/\/+$/, '') : ''

  let entries: import('fs').Dirent[]
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return { folders: [], items: [], total: 0, page, limit: limit || 24, currentFolder: folderPrefix, globalSearch: false }
  }

  const folders = entries
    .filter(e => e.isDirectory() && !e.name.startsWith('.'))
    .map(e => ({
      name: e.name,
      path: folderPrefix ? `${folderPrefix}/${e.name}` : e.name,
    }))
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
        folderPath: folderPrefix,
      }
    })
    .sort((a, b) => b.mtime - a.mtime)

  if (type && type !== 'all') {
    items = items.filter(i => i.type === type)
  }

  const total = items.length
  if (limit) {
    const start = (page - 1) * limit
    return { folders, items: items.slice(start, start + limit), total, page, limit, currentFolder: folderPrefix, globalSearch: false }
  }
  return { folders, items, total, page: 1, limit: 0, currentFolder: folderPrefix, globalSearch: false }
})
