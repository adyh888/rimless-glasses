import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, extname } from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = resolve(process.cwd(), 'public/uploads')

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
}

export default defineEventHandler(async (event) => {
  if (!getAuthUser(event)) {
    throw createError({ statusCode: 401, statusMessage: '未授权' })
  }

  const body = await readBody(event)
  const url = String(body?.url || '').trim()
  if (!url) throw createError({ statusCode: 400, statusMessage: '请输入 URL' })

  let baseUrl: URL
  try {
    baseUrl = new URL(url)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'URL 格式不正确' })
  }

  let html: string
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ArticleImporter/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    html = await res.text()
  } catch (e: any) {
    throw createError({ statusCode: 502, statusMessage: `无法访问该链接: ${e.message}` })
  }

  const title = extractTitle(html)
  let content = extractContent(html)

  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true })
  }

  const mediaUrls = extractMediaUrls(content)
  const urlMap = new Map<string, string>()

  for (const mediaUrl of mediaUrls) {
    const absoluteUrl = resolveUrl(mediaUrl, baseUrl)
    if (!absoluteUrl || urlMap.has(mediaUrl)) continue
    try {
      const localUrl = await downloadMedia(absoluteUrl)
      if (localUrl) urlMap.set(mediaUrl, localUrl)
    } catch {}
  }

  for (const [remote, local] of urlMap) {
    content = content.split(remote).join(local)
  }

  return { title, content }
})

function extractMediaUrls(html: string): string[] {
  const urls: string[] = []
  const imgPattern = /src="([^"]+)"/gi
  let match
  while ((match = imgPattern.exec(html)) !== null) {
    const src = match[1]!
    if (!src.startsWith('data:') && !src.startsWith('/uploads/')) {
      urls.push(src)
    }
  }
  return [...new Set(urls)]
}

function resolveUrl(src: string, base: URL): string | null {
  try {
    return new URL(src, base).href
  } catch {
    return null
  }
}

async function downloadMedia(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ArticleImporter/1.0)' },
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) return null

    const contentType = res.headers.get('content-type')?.split(';')[0]?.trim() || ''
    const buffer = Buffer.from(await res.arrayBuffer())

    if (buffer.length > 50 * 1024 * 1024) return null

    let ext = MIME_TO_EXT[contentType]
    if (!ext) {
      const urlExt = extname(new URL(url).pathname).toLowerCase()
      if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.mp4', '.webm', '.mov'].includes(urlExt)) {
        ext = urlExt
      } else {
        return null
      }
    }

    const filename = `${uuidv4()}${ext}`
    writeFileSync(resolve(UPLOAD_DIR, filename), buffer)
    return `/uploads/${filename}`
  } catch {
    return null
  }
}

function extractTitle(html: string): string {
  const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
  if (ogMatch) return decodeHtmlEntities(ogMatch[1]!)

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) return decodeHtmlEntities(titleMatch[1]!.trim())

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (h1Match) return stripTags(h1Match[1]!).trim()

  return ''
}

function extractContent(html: string): string {
  let body = html

  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
  if (articleMatch) {
    body = articleMatch[1]!
  } else {
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    if (mainMatch) body = mainMatch[1]!
    else {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch) body = bodyMatch[1]!
    }
  }

  body = body.replace(/<script[\s\S]*?<\/script>/gi, '')
  body = body.replace(/<style[\s\S]*?<\/style>/gi, '')
  body = body.replace(/<nav[\s\S]*?<\/nav>/gi, '')
  body = body.replace(/<header[\s\S]*?<\/header>/gi, '')
  body = body.replace(/<footer[\s\S]*?<\/footer>/gi, '')
  body = body.replace(/<aside[\s\S]*?<\/aside>/gi, '')
  body = body.replace(/<!--[\s\S]*?-->/g, '')

  const allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'img', 'a', 'strong', 'em', 'b', 'i', 'br', 'hr', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'video', 'source']

  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g
  body = body.replace(tagPattern, (match, tagName) => {
    const lower = tagName.toLowerCase()
    if (allowedTags.includes(lower)) {
      if (match.startsWith('</')) return `</${lower}>`
      if (lower === 'img') {
        const srcMatch = match.match(/src=["']([^"']+)["']/i)
        const altMatch = match.match(/alt=["']([^"']*?)["']/i)
        if (srcMatch) {
          return `<img src="${srcMatch[1]}"${altMatch ? ` alt="${altMatch[1]}"` : ''} />`
        }
        return ''
      }
      if (lower === 'video') {
        const srcMatch = match.match(/src=["']([^"']+)["']/i)
        if (srcMatch) return `<video src="${srcMatch[1]}" controls />`
        return '<video controls>'
      }
      if (lower === 'source') {
        const srcMatch = match.match(/src=["']([^"']+)["']/i)
        if (srcMatch) return `<source src="${srcMatch[1]}" />`
        return ''
      }
      if (lower === 'a') {
        const hrefMatch = match.match(/href=["']([^"']+)["']/i)
        if (hrefMatch) return `<a href="${hrefMatch[1]}">`
        return '<a>'
      }
      return `<${lower}>`
    }
    if (['div', 'section', 'span'].includes(lower)) return ''
    return ''
  })

  body = body.replace(/\n\s*\n\s*\n/g, '\n\n')
  return body.trim()
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '')
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
}
