// SEO 预渲染脚本
//
// 前置：HBuilderX → 发行 → 网站 PC-Web 或手机 H5 → 输出到 unpackage/dist/build/h5/
// 用法：node scripts/prerender.mjs
// 环境变量（可选）：
//   SITE_HOST   — 用于 <link rel="canonical"> 的绝对域名，例如 https://qingtou.example.com
//   PORT        — 本地静态服务端口，默认 5174
//   CONCURRENCY — 并发渲染页签数，默认 4
//
// 输出：直接写到 unpackage/dist/build/h5/ 内，按"美化 URL"目录结构：
//   /index.html                       — 首页
//   /products/index.html              — 产品列表
//   /products/<slug>/index.html       — 产品详情
//   /news/index.html, /news/<slug>/index.html
//   /about/index.html, /contact/index.html
//
// 部署时 nginx try_files $uri $uri/index.html /index.html; 即可。

import { createServer } from 'node:http'
import { createReadStream, existsSync } from 'node:fs'
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = resolve(ROOT, 'unpackage/dist/build/h5')
const PORT = Number(process.env.PORT) || 5174
const CONCURRENCY = Number(process.env.CONCURRENCY) || 4
const SITE_HOST = (process.env.SITE_HOST || '').replace(/\/$/, '')

const STATIC_ROUTES = [
  { pretty: '/',          internal: '/pages/index/index' },
  { pretty: '/products',  internal: '/pages/products/index' },
  { pretty: '/news',      internal: '/pages/news/index' },
  { pretty: '/about',     internal: '/pages/about/index' },
  { pretty: '/contact',   internal: '/pages/contact/index' },
]

// 每个页面在 puppeteer 里等待哪个选择器出现再 dump HTML。
const WAIT_SELECTOR = {
  '/pages/index/index':       '.site-footer',
  '/pages/products/index':    '.product-card, .empty',
  '/pages/news/index':        '.card, .empty',
  '/pages/about/index':       '.values-section',
  '/pages/contact/index':     '.info-col',
  '/pages/products/detail':   '.detail, .empty',
  '/pages/news/detail':       '.detail, .empty',
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.map':  'application/json',
}

async function startServer (root, fallbackHtml) {
  return new Promise((resolveServer) => {
    const server = createServer(async (req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0])
      const filePath = join(root, urlPath === '/' ? '/__no_index__' : urlPath)
      try {
        const st = await stat(filePath)
        if (st.isFile()) {
          const ext = extname(filePath).toLowerCase()
          res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
          createReadStream(filePath).pipe(res)
          return
        }
      } catch (_) {}
      // SPA fallback：始终返回原始 index.html（不读磁盘，避免被本轮已写的 prerender 输出污染）
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(fallbackHtml)
    })
    server.listen(PORT, '127.0.0.1', () => resolveServer(server))
  })
}

async function renderRoute (browser, internalUrl) {
  const page = await browser.newPage()
  try {
    await page.setViewport({ width: 1280, height: 800 })
    const url = `http://127.0.0.1:${PORT}${internalUrl}`
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
    const pageKey = internalUrl.split('?')[0]
    const selector = WAIT_SELECTOR[pageKey] || '.site-footer'
    await page.waitForSelector(selector, { timeout: 15000 }).catch(() => {})
    await new Promise(r => setTimeout(r, 400))
    return await page.content()
  } finally {
    await page.close().catch(() => {})
  }
}

async function discoverSlugs (browser, listInternalUrl, cardSelector) {
  const page = await browser.newPage()
  try {
    await page.goto(`http://127.0.0.1:${PORT}${listInternalUrl}`, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.waitForSelector(`${cardSelector}, .empty`, { timeout: 15000 }).catch(() => {})
    const slugs = await page.$$eval(cardSelector, els =>
      els.map(el => el.getAttribute('data-slug')).filter(Boolean)
    )
    return [...new Set(slugs)]
  } finally {
    await page.close().catch(() => {})
  }
}

function injectMeta (html, { canonical, title, description }) {
  let out = html
  if (title) {
    out = /<title>[\s\S]*?<\/title>/i.test(out)
      ? out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
      : out.replace(/<\/head>/i, `<title>${escapeHtml(title)}</title>\n  </head>`)
  }
  const tags = []
  if (canonical) {
    tags.push(`<link rel="canonical" href="${escapeAttr(canonical)}" />`)
    tags.push(`<meta property="og:url" content="${escapeAttr(canonical)}" />`)
  }
  if (title) tags.push(`<meta property="og:title" content="${escapeAttr(title)}" />`)
  if (description) {
    tags.push(`<meta name="description" content="${escapeAttr(description)}" />`)
    tags.push(`<meta property="og:description" content="${escapeAttr(description)}" />`)
  }
  if (tags.length) {
    out = out.replace(/<\/head>/i, `  ${tags.join('\n  ')}\n  </head>`)
  }
  return out
}

function escapeHtml (s) {
  return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
}
function escapeAttr (s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

function outputPath (prettyUrl) {
  if (prettyUrl === '/') return join(DIST, 'index.html')
  const seg = prettyUrl.replace(/^\/|\/$/g, '')
  return join(DIST, seg, 'index.html')
}

async function pool (items, limit, fn) {
  const queue = items.slice()
  const results = []
  await Promise.all(Array.from({ length: limit }, async () => {
    while (queue.length) {
      const item = queue.shift()
      results.push(await fn(item))
    }
  }))
  return results
}

async function main () {
  if (!existsSync(DIST)) {
    console.error(`[prerender] H5 build directory not found: ${DIST}`)
    console.error('[prerender] HBuilderX → 发行 → 网站 PC-Web 或手机 H5，先得到构建产物再跑本脚本。')
    process.exit(1)
  }

  const rawIndexHtml = await readFile(join(DIST, 'index.html'), 'utf8')

  console.log(`[prerender] starting static server on http://127.0.0.1:${PORT}`)
  const server = await startServer(DIST, rawIndexHtml)

  console.log('[prerender] launching puppeteer')
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    console.log('[prerender] discovering product slugs from /pages/products/index ...')
    const productSlugs = await discoverSlugs(browser, '/pages/products/index', '.product-card[data-slug]')
    console.log(`[prerender]   ${productSlugs.length} products`)

    console.log('[prerender] discovering article slugs from /pages/news/index ...')
    const newsSlugs = await discoverSlugs(browser, '/pages/news/index', '.card[data-slug]')
    console.log(`[prerender]   ${newsSlugs.length} articles`)

    const routes = [
      ...STATIC_ROUTES,
      ...productSlugs.map(slug => ({
        pretty: `/products/${slug}`,
        internal: `/pages/products/detail?slug=${encodeURIComponent(slug)}`,
      })),
      ...newsSlugs.map(slug => ({
        pretty: `/news/${slug}`,
        internal: `/pages/news/detail?slug=${encodeURIComponent(slug)}`,
      })),
    ]

    console.log(`[prerender] rendering ${routes.length} routes (concurrency ${CONCURRENCY})`)
    // 先把 HTML 全部跑出来缓存到内存，全部成功后再统一写盘，避免覆盖 index.html 后污染 SPA fallback
    const rendered = []
    let done = 0
    await pool(routes, CONCURRENCY, async (r) => {
      try {
        const html = await renderRoute(browser, r.internal)
        const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i)
        const title = titleMatch?.[1]?.trim() || undefined
        const finalHtml = injectMeta(html, {
          canonical: SITE_HOST ? `${SITE_HOST}${r.pretty}` : undefined,
          title,
        })
        rendered.push({ outPath: outputPath(r.pretty), html: finalHtml, pretty: r.pretty })
        done++
        process.stdout.write(`[prerender]   ✓ ${r.pretty}  (${done}/${routes.length})\n`)
      } catch (e) {
        process.stdout.write(`[prerender]   ✗ ${r.pretty}: ${e.message}\n`)
      }
    })

    console.log(`[prerender] writing ${rendered.length} files...`)
    for (const r of rendered) {
      await mkdir(dirname(r.outPath), { recursive: true })
      await writeFile(r.outPath, r.html, 'utf8')
    }
    console.log(`[prerender] done. ${rendered.length}/${routes.length} files written under ${DIST}`)
  } finally {
    await browser.close().catch(() => {})
    await new Promise(r => server.close(r))
  }
}

main().catch(e => {
  console.error('[prerender] fatal:', e)
  process.exit(1)
})
