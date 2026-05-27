import { readdirSync, statSync } from 'fs'
import { resolve } from 'path'

const UPLOAD_ROOT = resolve(process.cwd(), 'public/uploads')

const EXT_TYPE: Record<string, string> = {
  '.jpg': 'image', '.jpeg': 'image', '.png': 'image',
  '.gif': 'image', '.webp': 'image', '.svg': 'image',
  '.mp4': 'video', '.webm': 'video', '.mov': 'video',
}

export default defineEventHandler(() => {
  let files: string[]
  try {
    files = readdirSync(UPLOAD_ROOT)
  } catch {
    return []
  }

  const items = files
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

  return items
})
