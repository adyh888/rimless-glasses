import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import db from '../utils/db'
import { UPLOAD_ROOT, VIDEO_MIME_MAP, safePath } from '../utils/media'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMAGE_WIDTH = 1920
const WEBP_QUALITY = 80

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '请选择文件' })
  }
  const file = formData[0]!
  const mimeType = file.type || ''

  const query = getQuery(event)
  const folder = String(query.folder || '').trim()
  let uploadDir = UPLOAD_ROOT
  if (folder) {
    uploadDir = safePath(folder)
    mkdirSync(uploadDir, { recursive: true })
  }
  const urlPrefix = folder ? `/uploads/${folder.replace(/\\/g, '/')}` : '/uploads'

  const isImage = IMAGE_TYPES.includes(mimeType)
  const isVideo = Object.values(VIDEO_MIME_MAP).includes(mimeType)

  if (!isImage && !isVideo) {
    throw createError({ statusCode: 400, statusMessage: '不支持的文件格式' })
  }

  if (isVideo) {
    const formatsRow = db.prepare('SELECT content FROM site_content WHERE key = ?').get('video_allowed_formats') as { content: string } | undefined
    const allowedFormats = (formatsRow?.content || 'mp4,webm').split(',').map(f => f.trim()).filter(Boolean)
    const allowedMimes = allowedFormats.map(f => VIDEO_MIME_MAP[f]).filter(Boolean)

    if (!allowedMimes.includes(mimeType)) {
      throw createError({ statusCode: 400, statusMessage: `不支持的视频格式，当前允许：${allowedFormats.join('、')}` })
    }

    const videoSizeRow = db.prepare('SELECT content FROM site_content WHERE key = ?').get('video_max_size') as { content: string } | undefined
    const maxSizeMB = videoSizeRow?.content ? parseInt(videoSizeRow.content, 10) : 50
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.data.length > maxSizeBytes) {
      throw createError({ statusCode: 400, statusMessage: `视频文件大小不能超过 ${maxSizeMB}MB` })
    }

    const ext = (file.filename || 'file').split('.').pop() || 'mp4'
    const filename = `${uuidv4()}.${ext}`
    writeFileSync(resolve(uploadDir, filename), file.data)
    return { url: `${urlPrefix}/${filename}` }
  }

  const maxSizeRow = db.prepare('SELECT content FROM site_content WHERE key = ?').get('upload_max_size') as { content: string } | undefined
  const maxSizeMB = maxSizeRow?.content ? parseInt(maxSizeRow.content, 10) : 5
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.data.length > maxSizeBytes) {
    throw createError({ statusCode: 400, statusMessage: `图片文件大小不能超过 ${maxSizeMB}MB` })
  }

  const keepFormat = String(query.keepFormat || '') === 'true'
  const customMaxWidth = query.maxWidth ? parseInt(String(query.maxWidth), 10) : 0
  const resizeWidth = (customMaxWidth > 0 && customMaxWidth <= MAX_IMAGE_WIDTH) ? customMaxWidth : MAX_IMAGE_WIDTH

  if (keepFormat) {
    // 保持原始格式（不转 WebP），用于 favicon 等场景
    const FORMAT_MAP: Record<string, { ext: string; sharp: (s: sharp.Sharp) => sharp.Sharp }> = {
      'image/png': { ext: 'png', sharp: s => s.png() },
      'image/jpeg': { ext: 'jpg', sharp: s => s.jpeg({ quality: 92 }) },
      'image/gif': { ext: 'gif', sharp: s => s.gif() },
      'image/webp': { ext: 'webp', sharp: s => s.webp({ quality: WEBP_QUALITY }) },
    }
    const fmt = FORMAT_MAP[mimeType] || FORMAT_MAP['image/png']
    const filename = `${uuidv4()}.${fmt.ext}`
    const optimized = await fmt.sharp(
      sharp(file.data).resize({ width: resizeWidth, withoutEnlargement: true }),
    ).toBuffer()
    writeFileSync(resolve(uploadDir, filename), optimized)
    return { url: `${urlPrefix}/${filename}` }
  }

  const filename = `${uuidv4()}.webp`

  const optimized = await sharp(file.data)
    .resize({ width: resizeWidth, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()

  writeFileSync(resolve(uploadDir, filename), optimized)
  return { url: `${urlPrefix}/${filename}` }
})
