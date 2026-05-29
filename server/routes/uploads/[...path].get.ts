import { createReadStream, statSync, existsSync } from 'fs'
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

const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov'])

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
  const mime = MIME[ext] || 'application/octet-stream'
  const fileSize = stat.size

  if (VIDEO_EXTS.has(ext)) {
    const rangeHeader = getHeader(event, 'range')

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/)
      if (match) {
        const start = parseInt(match[1], 10)
        const end = match[2] ? parseInt(match[2], 10) : fileSize - 1
        const chunkSize = end - start + 1

        setResponseStatus(event, 206)
        setHeader(event, 'Content-Type', mime)
        setHeader(event, 'Content-Range', `bytes ${start}-${end}/${fileSize}`)
        setHeader(event, 'Content-Length', chunkSize)
        setHeader(event, 'Accept-Ranges', 'bytes')
        setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

        return sendStream(event, createReadStream(full, { start, end }))
      }
    }

    setHeader(event, 'Content-Type', mime)
    setHeader(event, 'Content-Length', fileSize)
    setHeader(event, 'Accept-Ranges', 'bytes')
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

    return sendStream(event, createReadStream(full))
  }

  setHeader(event, 'Content-Type', mime)
  setHeader(event, 'Content-Length', fileSize)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  const { readFileSync } = require('fs')
  return readFileSync(full)
})
