// 联调种子数据。仅本地/开发环境用，不要上传到生产服务空间。
// 调用 seed() 一次即可填入 1 条 products + 1 条 articles + 1 条 banners + 1 条 site_content。
// 重复调用会清空已 seed 的标记数据，再重新插入（_seed: true 用于过滤）。

const crypto = require('crypto')
const { db, dbCmd, nowFields } = require('db-helpers')

const COLLECTIONS = ['products', 'articles', 'banners', 'site_content']

module.exports = {
  _before () {},

  async seed () {
    // 1. 清空旧种子
    for (const col of COLLECTIONS) {
      await db.collection(col).where({ _seed: true }).remove()
    }

    // 2. 插入新种子
    const now = nowFields(true)

    const productRes = await db.collection('products').add({
      _seed: true,
      name: '雷朋 RB3025 飞行员太阳镜（联调样品）',
      slug: `seed-product-${Date.now()}`,
      price: 1499,
      description: '联调用，验证 list / getById / 分类筛选。',
      specs_json: JSON.stringify({ 材质: '金属', 镜片: 'G15' }),
      images_json: JSON.stringify(['https://example.com/seed-glasses-1.webp']),
      category: '太阳镜',
      sub_category: '飞行员',
      is_featured: 1,
      is_active: 1,
      sort_order: 1,
      ...now,
    })

    const articleRes = await db.collection('articles').add({
      _seed: true,
      title: '如何挑选适合脸型的镜框（联调）',
      slug: `seed-article-${Date.now()}`,
      content: '<p>这是联调种子文章内容。</p>',
      cover_image: 'https://example.com/seed-cover.webp',
      summary: '联调用，验证已发布筛选。',
      is_published: 1,
      ...now,
    })

    const bannerRes = await db.collection('banners').add({
      _seed: true,
      title: '联调用首页轮播',
      subtitle: '验证 banners.list',
      button_text: '了解更多',
      button_link: '/pages/dev-smoke/index',
      image_url: 'https://example.com/seed-banner.webp',
      video_poster: '',
      sort_order: 1,
      is_active: 1,
      ...now,
    })

    const contentRes = await db.collection('site_content').add({
      _seed: true,
      key: `seed_key_${Date.now()}`,
      content: '联调用 site_content 记录',
      ...now,
    })

    return {
      success: true,
      message: 'seed 完成',
      created: {
        product: productRes.id,
        article: articleRes.id,
        banner: bannerRes.id,
        content: contentRes.id,
      },
    }
  },

  // 一并查询 4 个集合的种子条数，验证读写一致
  async verify () {
    const result = {}
    for (const col of COLLECTIONS) {
      const c = await db.collection(col).where({ _seed: true }).count()
      result[col] = c.total || 0
    }
    return result
  },

  // 创建 / 重置后台管理员账号（uni-id-users 集合）
  // 用法：dev-seed.seedAdmin()  默认 admin / admin123
  //      dev-seed.seedAdmin({ username: 'xxx', password: 'yyy' })
  async seedAdmin ({ username = 'admin', password = 'admin123' } = {}) {
    let passwordSecret = ''
    let secretVersion = 1
    try {
      const createConfig = require('uni-config-center')
      const cfg = createConfig({ pluginId: 'uni-id' }).config()
      const raw = cfg && cfg.passwordSecret
      if (Array.isArray(raw)) {
        secretVersion = raw.length
        passwordSecret = raw[raw.length - 1]
      } else {
        passwordSecret = raw
      }
    } catch (e) {
      throw { errCode: 'NO_CONFIG', errMsg: '读取 uni-id 配置失败：' + (e.message || String(e)) }
    }
    if (!passwordSecret) {
      throw { errCode: 'NO_SECRET', errMsg: 'uni-id config.json 缺少 passwordSecret' }
    }

    const hash = crypto.createHmac('sha1', String(passwordSecret)).update(String(password)).digest('hex')
    const userCol = 'uni-id-users'

    const existing = await db.collection(userCol).where({ username }).limit(1).get()
    if (existing.data && existing.data.length) {
      const id = existing.data[0]._id
      await db.collection(userCol).doc(id).update({
        password: hash,
        password_secret_version: secretVersion,
        role: ['admin'],
        status: 0,
        password_error_count: 0,
        password_error_limit_time: 0,
      })
      return { success: true, action: 'updated', id, username }
    }

    const res = await db.collection(userCol).add({
      username,
      password: hash,
      password_secret_version: secretVersion,
      role: ['admin'],
      status: 0,
      register_date: Date.now(),
      register_ip: '',
      last_login_date: 0,
      last_login_ip: '',
      password_error_count: 0,
      password_error_limit_time: 0,
    })
    return { success: true, action: 'created', id: res.id, username }
  },

  // 清掉种子，避免污染线上 / 测试环境
  async clean () {
    let removed = 0
    for (const col of COLLECTIONS) {
      const r = await db.collection(col).where({ _seed: true }).remove()
      removed += r.deleted || 0
    }
    return { success: true, removed }
  },
}
