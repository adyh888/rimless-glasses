import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import db from '../utils/db'
import { VIDEO_MIME_MAP } from '../utils/media'

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
    const uploadDir = resolve(process.cwd(), 'public/uploads')
    writeFileSync(resolve(uploadDir, filename), file.data)
    return { url: `/uploads/${filename}` }
  }

  const maxSizeRow = db.prepare('SELECT content FROM site_content WHERE key = ?').get('upload_max_size') as { content: string } | undefined
  const maxSizeMB = maxSizeRow?.content ? parseInt(maxSizeRow.content, 10) : 5
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.data.length > maxSizeBytes) {
    throw createError({ statusCode: 400, statusMessage: `图片文件大小不能超过 ${maxSizeMB}MB` })
  }

  const filename = `${uuidv4()}.webp`
  const uploadDir = resolve(process.cwd(), 'public/uploads')

  const optimized = await sharp(file.data)
    .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()

  writeFileSync(resolve(uploadDir, filename), optimized)
  return { url: `/uploads/${filename}` }
})
