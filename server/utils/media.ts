import { resolve, normalize, sep } from 'path'

export const UPLOAD_ROOT = resolve(process.cwd(), 'public/uploads')

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov']

export function isVideoUrl(url: string): boolean {
  if (!url) return false
  const ext = url.slice(url.lastIndexOf('.')).toLowerCase()
  return VIDEO_EXTENSIONS.includes(ext)
}

export const VIDEO_MIME_MAP: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
}

export function safePath(relativePath: string): string {
  const safe = normalize(relativePath).replace(/^[/\\]+/, '')
  if (safe === '.' || safe === '') return UPLOAD_ROOT
  if (safe.startsWith('..') || safe.includes(`..${sep}`)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid path' })
  }
  const full = resolve(UPLOAD_ROOT, safe)
  if (!full.startsWith(UPLOAD_ROOT)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid path' })
  }
  return full
}

export function validateName(name: string): void {
  if (!name || name.includes('/') || name.includes('\\') || name.startsWith('.') || name.includes('..')) {
    throw createError({ statusCode: 400, statusMessage: '名称不合法' })
  }
  if (/[<>:"|?*\x00-\x1f]/.test(name)) {
    throw createError({ statusCode: 400, statusMessage: '名称包含非法字符' })
  }
  if (name.length > 255) {
    throw createError({ statusCode: 400, statusMessage: '名称过长' })
  }
}
