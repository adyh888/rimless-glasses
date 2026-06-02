// 文章云对象。对应原 server/api/articles/*。
// 表名：articles；列表/详情公共读，写需 admin。
//
// import(url)：抓取远程页面，提取标题/正文/媒体；
// 媒体改为通过 vendor-adapter 上传到云存储，URL 替换为 fileID/HTTPS。

const { db, dbCmd, paginate, nowFields } = require('db-helpers')
const { requireAdmin } = require('auth-guard')
const { buildCloudPath, uploadFile } = require('vendor-adapter')

const COL = 'articles'

function buildItemForWrite (body) {
  return {
    title: body.title,
    slug: body.slug,
    content: body.content || '',
    cover_image: body.cover_image || '',
    summary: body.summary || '',
    is_published: body.is_published ? 1 : 0,
  }
}

module.exports = {
  _before () {},

  async list (query = {}) {
    if (query.slug) {
      const res = await db.collection(COL)
        .where({ slug: query.slug, is_published: 1, _deleted: dbCmd.neq(true) })
        .limit(1)
        .get()
      if (!res.data.length) throw { errCode: 404, errMsg: '文章不存在' }
      return res.data[0]
    }

    const where = {}
    if (query.published_only === true || query.published_only === 'true') {
      where.is_published = 1
    }

    return paginate(COL, {
      where,
      orderBy: [{ field: 'created_at', dir: 'desc' }],
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
    })
  },

  async getById (id) {
    if (!id) throw { errCode: 400, errMsg: 'id 必填' }
    const res = await db.collection(COL).doc(id).get()
    const item = res.data[0]
    if (!item || item._deleted === true) throw { errCode: 404, errMsg: '文章不存在' }
    return item
  },

  async create (body = {}) {
    await requireAdmin(this)
    if (!body.title) throw { errCode: 400, errMsg: 'title 必填' }
    const slug = body.slug || `article-${Date.now()}`
    const doc = { ...buildItemForWrite({ ...body, slug }), ...nowFields(true) }
    const res = await db.collection(COL).add(doc)
    return { id: res.id }
  },

  async update (id, body = {}) {
    await requireAdmin(this)
    if (!id) throw { errCode: 400, errMsg: 'id 必填' }
    const doc = { ...buildItemForWrite(body), ...nowFields() }
    await db.collection(COL).doc(id).update(doc)
    return { success: true }
  },

  async remove (id) {
    await requireAdmin(this)
    if (!id) throw { errCode: 400, errMsg: 'id 必填' }
    await db.collection(COL).doc(id).remove()
    return { success: true }
  },

  // 批量：delete / publish / unpublish
  async batch ({ ids, action } = {}) {
    await requireAdmin(this)
    if (!Array.isArray(ids) || ids.length === 0) {
      throw { errCode: 400, errMsg: '请选择文章' }
    }
    const safeIds = ids.filter(x => typeof x === 'string' && x.length > 0)
    if (safeIds.length === 0) throw { errCode: 400, errMsg: '无效的文章ID' }

    const where = { _id: dbCmd.in(safeIds) }
    const now = nowFields()

    switch (action) {
      case 'delete':
        await db.collection(COL).where(where).remove()
        return { success: true }
      case 'publish':
        await db.collection(COL).where(where).update({ is_published: 1, ...now })
        return { success: true }
      case 'unpublish':
        await db.collection(COL).where(where).update({ is_published: 0, ...now })
        return { success: true }
      default:
        throw { errCode: 400, errMsg: '未知操作' }
    }
  },

  // 从远程 URL 导入：抓 HTML → 提取标题/正文 → 上传媒体到云存储 → 替换 URL
  async import ({ url } = {}) {
    await requireAdmin(this)
    if (!url || typeof url !== 'string') throw { errCode: 400, errMsg: '请输入 URL' }

    let baseUrl
    try { baseUrl = new URL(url) } catch { throw { errCode: 400, errMsg: 'URL 格式不正确' } }

    let html
    try {
      const res = await fetchWithTimeout(url, 15000)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      html = await res.text()
    } catch (e) {
      throw { errCode: 502, errMsg: `无法访问该链接: ${e.message}` }
    }

    const title = extractTitle(html)
    let content = extractContent(html)

    const folderPath = `articles/${Date.now()}`
    const mediaUrls = extractMediaUrls(content)
    const urlMap = new Map()

    for (const mediaUrl of mediaUrls) {
      const absoluteUrl = resolveUrl(mediaUrl, baseUrl)
      if (!absoluteUrl || urlMap.has(mediaUrl)) continue
      try {
        const cloudUrl = await downloadAndUpload(absoluteUrl, folderPath)
        if (cloudUrl) urlMap.set(mediaUrl, cloudUrl)
      } catch {}
    }
    for (const [remote, local] of urlMap) {
      content = content.split(remote).join(local)
    }

    return { title, content }
  },
}

// ----- 抓取/解析辅助函数（原逻辑等价移植） -----

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
}

const MAX_BYTES = 50 * 1024 * 1024

async function fetchWithTimeout (url, ms) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ArticleImporter/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: ctrl.signal,
    })
  } finally {
    clearTimeout(t)
  }
}

function resolveUrl (src, base) {
  try { return new URL(src, base).href } catch { return null }
}

async function downloadAndUpload (url, folderPath) {
  const res = await fetchWithTimeout(url, 30000)
  if (!res.ok) return null
  const contentType = (res.headers.get('content-type') || '').split(';')[0].trim()
  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.length > MAX_BYTES) return null

  let ext = MIME_TO_EXT[contentType]
  if (!ext) {
    const pathname = new URL(url).pathname.toLowerCase()
    const dot = pathname.lastIndexOf('.')
    const urlExt = dot >= 0 ? pathname.slice(dot) : ''
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.mp4', '.webm', '.mov'].includes(urlExt)) {
      ext = urlExt
    } else {
      return null
    }
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
  const cloudPath = buildCloudPath(folderPath, filename)
  const up = await uploadFile({ cloudPath, fileBuffer: buffer, contentType })
  return up.url || up.fileID
}

function extractMediaUrls (html) {
  const urls = []
  const re = /src="([^"]+)"/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const src = m[1]
    if (!src.startsWith('data:') && !src.startsWith('/uploads/') && !src.startsWith('cloud://')) {
      urls.push(src)
    }
  }
  return [...new Set(urls)]
}

function extractTitle (html) {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
  if (og) return decodeHtmlEntities(og[1])
  const t = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (t) return decodeHtmlEntities(t[1].trim())
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (h1) return stripTags(h1[1]).trim()
  return ''
}

const ALLOWED_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote',
  'img', 'a', 'strong', 'em', 'b', 'i', 'br', 'hr',
  'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'video', 'source',
])

function extractContent (html) {
  let body = html
  const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
  if (article) {
    body = article[1]
  } else {
    const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    if (main) body = main[1]
    else {
      const b = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (b) body = b[1]
    }
  }

  body = body.replace(/<script[\s\S]*?<\/script>/gi, '')
  body = body.replace(/<style[\s\S]*?<\/style>/gi, '')
  body = body.replace(/<nav[\s\S]*?<\/nav>/gi, '')
  body = body.replace(/<header[\s\S]*?<\/header>/gi, '')
  body = body.replace(/<footer[\s\S]*?<\/footer>/gi, '')
  body = body.replace(/<aside[\s\S]*?<\/aside>/gi, '')
  body = body.replace(/<!--[\s\S]*?-->/g, '')

  body = body.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g, (match, tagName) => {
    const lower = tagName.toLowerCase()
    if (!ALLOWED_TAGS.has(lower)) return ''
    if (match.startsWith('</')) return `</${lower}>`
    if (lower === 'img') {
      const src = match.match(/src=["']([^"']+)["']/i)
      const alt = match.match(/alt=["']([^"']*?)["']/i)
      if (src) return `<img src="${src[1]}"${alt ? ` alt="${alt[1]}"` : ''} />`
      return ''
    }
    if (lower === 'video') {
      const src = match.match(/src=["']([^"']+)["']/i)
      return src ? `<video src="${src[1]}" controls />` : '<video controls>'
    }
    if (lower === 'source') {
      const src = match.match(/src=["']([^"']+)["']/i)
      return src ? `<source src="${src[1]}" />` : ''
    }
    if (lower === 'a') {
      const href = match.match(/href=["']([^"']+)["']/i)
      return href ? `<a href="${href[1]}">` : '<a>'
    }
    return `<${lower}>`
  })

  body = body.replace(/\n\s*\n\s*\n/g, '\n\n')
  return body.trim()
}

function stripTags (h) { return h.replace(/<[^>]+>/g, '') }

function decodeHtmlEntities (text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
}
