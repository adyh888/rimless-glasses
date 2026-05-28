import { copyFileSync, existsSync, mkdirSync, statSync } from 'fs'
import { resolve, extname, basename } from 'path'
import { UPLOAD_ROOT, safePath } from '../../utils/media'

function deduplicateName(dir: string, name: string): string {
  if (!existsSync(resolve(dir, name))) return name
  const ext = extname(name)
  const base = name.slice(0, name.length - ext.length)
  let suffix = 1
  let candidate = `${base}_copy${ext}`
  while (existsSync(resolve(dir, candidate))) {
    suffix++
    candidate = `${base}_copy_${suffix}${ext}`
  }
  return candidate
}

export default defineEventHandler(async (event) => {
  if (!getAuthUser(event)) {
    throw createError({ statusCode: 401, statusMessage: '未授权' })
  }

  const body = await readBody(event)
  const files: string[] = body?.files
  const targetFolder: string = String(body?.targetFolder ?? '')

  if (!Array.isArray(files) || files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '请选择要复制的文件' })
  }

  const destDir = safePath(targetFolder)
  mkdirSync(destDir, { recursive: true })

  const results: Array<{ source: string; url?: string; name?: string; error?: string }> = []

  for (const file of files) {
    try {
      const srcAbsolute = safePath(file)
      if (!existsSync(srcAbsolute) || !statSync(srcAbsolute).isFile()) {
        results.push({ source: file, error: '源文件不存在' })
        continue
      }

      const originalName = basename(file)
      const finalName = deduplicateName(destDir, originalName)
      const destAbsolute = resolve(destDir, finalName)

      copyFileSync(srcAbsolute, destAbsolute)

      const url = targetFolder
        ? `/uploads/${targetFolder}/${finalName}`
        : `/uploads/${finalName}`
      results.push({ source: file, url, name: finalName })
    } catch (e: any) {
      results.push({ source: file, error: e?.message || '复制失败' })
    }
  }

  return { results }
})
