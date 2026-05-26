import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'

const dataDir = resolve(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const dbPath = resolve(dataDir, 'app.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL DEFAULT '',
    subtitle TEXT DEFAULT '',
    button_text TEXT DEFAULT '',
    button_link TEXT DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price REAL DEFAULT 0,
    description TEXT DEFAULT '',
    specs_json TEXT DEFAULT '{}',
    images_json TEXT DEFAULT '[]',
    category TEXT DEFAULT '',
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    summary TEXT DEFAULT '',
    is_published INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    content TEXT DEFAULT '',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

const adminExists = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin')
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10)
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', hash)
  console.log('Admin user created: admin / admin123')
}

const bannerCount = (db.prepare('SELECT COUNT(*) as count FROM banners').get() as any).count
if (bannerCount === 0) {
  const insertBanner = db.prepare(
    'INSERT INTO banners (title, subtitle, button_text, button_link, image_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)'
  )
  insertBanner.run(
    '无框之美，尽在清透',
    '以极简设计重新定义视觉体验，让世界更清晰',
    '探索系列',
    '/products',
    'https://images.unsplash.com/photo-1574258495973-f7977603b6d2?w=1920&q=80',
    1
  )
  insertBanner.run(
    '轻盈无界',
    '钛合金材质，仅重 8 克，仿若无物',
    '了解更多',
    '/products',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1920&q=80',
    2
  )
  insertBanner.run(
    '匠心之作',
    '每一副眼镜，都是对完美的追求',
    '品牌故事',
    '/about',
    'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=1920&q=80',
    3
  )
  console.log('Sample banners inserted')
}

const productCount = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count
if (productCount === 0) {
  const insertProduct = db.prepare(
    `INSERT INTO products (name, slug, price, description, specs_json, images_json, category, is_featured, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
  )
  const products = [
    {
      name: '清风系列·极简',
      slug: 'qingfeng-minimal',
      price: 2980,
      description: '<p>清风系列·极简，采用日本进口β钛材质，极致轻盈仅重8.5克。无框设计搭配隐形铰链，佩戴如无物。适合追求简约美学的都市精英。</p><p>镜片采用蔡司臻锐系列，1.74超薄折射率，防蓝光+防紫外线双重防护，为您的双眼提供全方位呵护。</p>',
      specs: { '材质': 'β钛合金', '重量': '8.5g', '镜片': '蔡司臻锐 1.74', '适合脸型': '椭圆/方形', '颜色': '银色/金色/黑色' },
      images: [
        'https://images.unsplash.com/photo-1574258495973-f7977603b6d2?w=800&q=80',
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      ],
      category: '经典系列',
      is_featured: 1,
      sort_order: 1,
    },
    {
      name: '云隐系列·商务',
      slug: 'yunyin-business',
      price: 3580,
      description: '<p>云隐系列·商务，专为职场精英打造。纯钛镜腿搭配无框镜片，既有商务的稳重，又不失时尚的灵动。</p><p>记忆金属铰链，耐久不变形，历经万次折叠依然如新。</p>',
      specs: { '材质': '纯钛', '重量': '9.2g', '镜片': '蔡司驾驶型', '适合脸型': '方形/长形', '颜色': '枪色/黑色' },
      images: [
        'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80',
        'https://images.unsplash.com/photo-1574258495973-f7977603b6d2?w=800&q=80',
      ],
      category: '商务系列',
      is_featured: 1,
      sort_order: 2,
    },
    {
      name: '月影系列·文艺',
      slug: 'yueying-art',
      price: 2680,
      description: '<p>月影系列·文艺，圆形镜片搭配超细镜腿，复古与现代的完美融合。适合热爱文艺、追求个性的你。</p>',
      specs: { '材质': 'β钛合金', '重量': '7.8g', '镜片': '依视路钻晶', '适合脸型': '圆形/心形', '颜色': '玫瑰金/银色' },
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
      ],
      category: '经典系列',
      is_featured: 1,
      sort_order: 3,
    },
    {
      name: '星辰系列·运动',
      slug: 'xingchen-sport',
      price: 3280,
      description: '<p>星辰系列·运动，专为活跃生活方式设计。弹性钛鼻托+防滑镜腿，运动时也能稳固佩戴。</p>',
      specs: { '材质': '弹性钛合金', '重量': '10.2g', '镜片': '偏光镜片', '适合脸型': '所有脸型', '颜色': '黑色/蓝色' },
      images: [
        'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80',
      ],
      category: '运动系列',
      is_featured: 0,
      sort_order: 4,
    },
    {
      name: '幽兰系列·女士',
      slug: 'youlan-lady',
      price: 3180,
      description: '<p>幽兰系列·女士，专为女性面部轮廓优化设计。纤细镜腿搭配蝶形镜片，优雅大方。镜腿末端点缀施华洛世奇水晶。</p>',
      specs: { '材质': 'β钛合金', '重量': '7.2g', '镜片': '蔡司佳锐冰蓝', '适合脸型': '椭圆/心形', '颜色': '玫瑰金/紫色' },
      images: [
        'https://images.unsplash.com/photo-1574258495973-f7977603b6d2?w=800&q=80',
      ],
      category: '经典系列',
      is_featured: 0,
      sort_order: 5,
    },
    {
      name: '御风系列·旗舰',
      slug: 'yufeng-flagship',
      price: 5980,
      description: '<p>御风系列·旗舰，品牌巅峰之作。航空级钛合金一体成型，手工抛光48道工序。搭载蔡司智锐系列镜片，AI优化视觉体验。</p><p>附赠意大利手工皮革眼镜盒及专属清洁套装。</p>',
      specs: { '材质': '航空级钛合金', '重量': '8.0g', '镜片': '蔡司智锐', '适合脸型': '所有脸型', '颜色': '铂金/玫瑰金' },
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
        'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80',
      ],
      category: '商务系列',
      is_featured: 1,
      sort_order: 6,
    },
  ]

  for (const p of products) {
    insertProduct.run(
      p.name, p.slug, p.price, p.description,
      JSON.stringify(p.specs), JSON.stringify(p.images),
      p.category, p.is_featured, p.sort_order
    )
  }
  console.log('Sample products inserted')
}

const articleCount = (db.prepare('SELECT COUNT(*) as count FROM articles').get() as any).count
if (articleCount === 0) {
  const insertArticle = db.prepare(
    `INSERT INTO articles (title, slug, content, cover_image, summary, is_published) VALUES (?, ?, ?, ?, ?, 1)`
  )

  insertArticle.run(
    '无框眼镜：2026年度设计趋势解读',
    'rimless-design-trends-2026',
    '<h2>极简主义的回归</h2><p>2026年，无框眼镜设计延续了极简美学的核心理念，同时融入了更多科技元素。超轻材质、隐形铰链、一体成型技术成为新一代无框眼镜的标配。</p><h2>材质革新</h2><p>航空级β钛合金的广泛应用，使得镜架重量突破了8克大关。同时，记忆金属的改良让镜架具备了更强的柔韧性和耐用性。</p><h2>智能融合</h2><p>部分高端无框眼镜开始集成蓝牙音频和健康监测功能，在保持极简外观的同时实现了科技赋能。</p>',
    'https://images.unsplash.com/photo-1574258495973-f7977603b6d2?w=800&q=80',
    '从材质革新到智能融合，解读2026年无框眼镜设计的四大趋势。'
  )

  insertArticle.run(
    '如何选择适合自己脸型的无框眼镜',
    'choose-rimless-glasses-for-face-shape',
    '<h2>了解你的脸型</h2><p>选择无框眼镜的第一步是了解自己的脸型。常见的脸型包括：圆形、椭圆形、方形、长形和心形。</p><h2>圆形脸</h2><p>建议选择方形或矩形镜片，可以增加面部的线条感。避免过圆的镜片造型。</p><h2>方形脸</h2><p>适合圆形或椭圆形镜片，柔化面部的棱角。清透视界的云隐系列非常适合方形脸。</p><h2>椭圆形脸</h2><p>椭圆形脸是最理想的脸型，几乎适合所有镜片形状。建议选择与脸部最宽处同宽或略宽的镜片。</p>',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    '从脸型分析到镜片选择，一文教你找到最适合的无框眼镜。'
  )

  insertArticle.run(
    '清透视界品牌故事：从工坊到世界',
    'brand-story-workshop-to-world',
    '<h2>起源</h2><p>2018年，在深圳一间不到50平方米的工坊里，清透视界的创始人开始了他的梦想——打造世界上最轻、最美的无框眼镜。</p><h2>匠心</h2><p>每一副清透视界眼镜都经过48道手工工序打磨。我们坚信，真正的奢华不在于繁复的装饰，而在于对细节的极致追求。</p><h2>未来</h2><p>今天，清透视界已服务超过50万用户，产品远销全球26个国家和地区。但我们始终不忘初心——让每个人都能享受到无框眼镜带来的清透视界。</p>',
    'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&q=80',
    '从深圳的小工坊到服务全球50万用户，清透视界的创业历程。'
  )

  insertArticle.run(
    '无框眼镜的日常保养指南',
    'rimless-glasses-care-guide',
    '<h2>清洁方法</h2><p>使用专业眼镜清洁液或中性洗洁精，配合柔软的超细纤维布擦拭。切勿使用纸巾或衣物直接擦拭镜片，以免造成划痕。</p><h2>存放建议</h2><p>不佩戴时请放入眼镜盒中保存。无框眼镜的镜片裸露面积较大，更需要注意保护。建议使用硬壳眼镜盒。</p><h2>定期检查</h2><p>建议每3个月到专业门店进行一次镜架调整和螺丝紧固检查。无框眼镜的螺丝较为精细，定期维护可以大大延长使用寿命。</p>',
    'https://images.unsplash.com/photo-1574258495973-f7977603b6d2?w=800&q=80',
    '学会正确保养你的无框眼镜，让它陪伴你更长久。'
  )

  console.log('Sample articles inserted')
}

const contentExists = db.prepare('SELECT id FROM site_content WHERE key = ?').get('about_us')
if (!contentExists) {
  db.prepare('INSERT INTO site_content (key, content) VALUES (?, ?)').run(
    'about_us',
    `<h2>关于清透视界</h2>
<p>清透视界创立于2018年，是一家专注于无框眼镜设计与制造的高端品牌。我们相信，好的设计应该是无形的——正如我们的无框眼镜，让框架消失，让世界更清晰。</p>

<h2>品牌理念</h2>
<p>「清透」代表我们对视觉纯净的追求，「视界」代表我们想要为每一位用户打开的全新视野。我们将极简美学与先进材料科学相结合，创造出兼具美感与舒适度的无框眼镜。</p>

<h2>匠心工艺</h2>
<p>每一副清透视界眼镜都经过48道手工工序精心打磨。从选材到成品，我们对每一个环节都保持着近乎苛刻的品质要求。我们使用航空级β钛合金，确保镜架在极致轻盈的同时具备出色的强度和弹性。</p>

<h2>技术创新</h2>
<p>我们拥有12项专利技术，包括隐形铰链、一体成型镜腿、微弧面镜片切割等。这些技术创新让我们的无框眼镜在外观上实现真正的"无框"效果，同时保证了结构的稳定性和佩戴的舒适性。</p>

<h2>全球视野</h2>
<p>目前，清透视界已服务超过50万用户，产品远销全球26个国家和地区。我们在深圳设有研发中心和制造基地，在上海、北京、广州设有旗舰体验店。</p>`
  )
  console.log('About us content inserted')
}

db.close()
console.log('Seed completed successfully!')
