import sharp from 'sharp'
import { readdirSync, statSync, unlinkSync, renameSync } from 'fs'
import { resolve, extname } from 'path'

const UPLOAD_DIR = resolve(import.meta.dirname!, '..', 'uploads')
const PUBLIC_UPLOAD_DIR = resolve(import.meta.dirname!, '..', 'public/uploads')
const MAX_WIDTH = 1920
const WEBP_QUALITY = 80
const SIZE_THRESHOLD = 500 * 1024 // 500KB

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp']

async function compressDir(dir: string, label: string) {
  const files = readdirSync(dir)
  let processed = 0
  let savedBytes = 0

  for (const file of files) {
    const ext = extname(file).toLowerCase()
    if (!IMAGE_EXTS.includes(ext)) continue

    const fullPath = resolve(dir, file)
    const stat = statSync(fullPath)

    if (stat.size < SIZE_THRESHOLD) continue

    const originalSize = stat.size
    const baseName = file.slice(0, file.lastIndexOf('.'))
    const webpPath = resolve(dir, `${baseName}.webp`)

    try {
      await sharp(fullPath)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(webpPath)

      const newStat = statSync(webpPath)
      const saved = originalSize - newStat.size

      if (ext !== '.webp') {
        unlinkSync(fullPath)
      }

      savedBytes += saved
      processed++

      const pct = ((saved / originalSize) * 100).toFixed(1)
      console.log(
        `  ${file} → ${baseName}.webp | ` +
        `${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(newStat.size / 1024).toFixed(0)}KB | ` +
        `-${pct}%`
      )
    } catch (err) {
      console.error(`  [skip] ${file}: ${err}`)
    }
  }

  console.log(`\n[${label}] ${processed} files, saved ${(savedBytes / 1024 / 1024).toFixed(1)}MB\n`)
}

async function main() {
  console.log('=== Image Compression ===\n')

  console.log(`Processing uploads/ ...`)
  await compressDir(UPLOAD_DIR, 'uploads')

  console.log(`Processing public/uploads/ ...`)
  await compressDir(PUBLIC_UPLOAD_DIR, 'public/uploads')

  console.log('Done!')
  console.log('\nNote: Database records still reference old filenames (.jpg/.png).')
  console.log('You may need to update the database or re-upload images via admin.')
}

main().catch(console.error)
