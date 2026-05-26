import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { v4 as uuidv4 } from 'uuid'
import db from '../utils/db'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '请选择文件' })
  }
  const file = formData[0]
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type || '')) {
    throw createError({ statusCode: 400, statusMessage: '仅支持 JPG/PNG/WebP/GIF 格式' })
  }

  const maxSizeRow = db.prepare('SELECT content FROM site_content WHERE key = ?').get('upload_max_size') as { content: string } | undefined
  const maxSizeMB = maxSizeRow?.content ? parseInt(maxSizeRow.content, 10) : 5
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.data.length > maxSizeBytes) {
    throw createError({ statusCode: 400, statusMessage: `文件大小不能超过 ${maxSizeMB}MB` })
  }

  const ext = (file.filename || 'file').split('.').pop() || 'jpg'
  const filename = `${uuidv4()}.${ext}`
  const uploadDir = resolve(process.cwd(), 'public/uploads')
  writeFileSync(resolve(uploadDir, filename), file.data)
  return { url: `/uploads/${filename}` }
})
