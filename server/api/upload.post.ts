import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { v4 as uuidv4 } from 'uuid'
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
  if (file.data.length > 5 * 1024 * 1024) {
    throw createError({ statusCode: 400, statusMessage: '文件大小不能超过 5MB' })
  }
  const ext = (file.filename || 'file').split('.').pop() || 'jpg'
  const filename = `${uuidv4()}.${ext}`
  const uploadDir = resolve(process.cwd(), 'public/uploads')
  writeFileSync(resolve(uploadDir, filename), file.data)
  return { url: `/uploads/${filename}` }
})
