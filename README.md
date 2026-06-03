# 清透视界 — 完整功能需求清单

> 本文档是站点的"复刻级"需求规格说明。底层技术栈可替换（当前为 Nuxt 4 + better-sqlite3 + Tailwind），但下列功能、字段、交互、约束必须 1:1 保留。

---

## 0. 总体定位

一个面向"无框眼镜"品牌的官网 + 内容管理系统（CMS），分两套界面：

1. **前台**（公开访问，SSR 渲染、SEO 友好）：首页 / 产品中心 / 产品详情 / 新闻列表 / 新闻详情 / 关于我们 / 联系我们。
2. **后台**（隐藏入口，需登录）：仪表盘 / 首页编排 / 轮播 / 产品 / 文章 / 留言 / 素材库 / 内容管理 / 站点设置（含账号管理）。

整站的**几乎所有可视文案、颜色、布局参数、菜单、品牌名**都从一个键值表 `site_content` 中读取，方便完全在后台改造，无需改代码。

---

## 1. 技术性总体约束

- **SSR**：所有前台页面必须服务端渲染，含 `<title>` / `<meta description>`，搜索引擎可索引。
- **响应式**：所有前台页面在桌面（lg ≥1024）、平板（md ≥768）、手机（< 768）三档下都需可用；移动端需独立汉堡菜单。
- **品牌色变量**：Tailwind 中定义 4 个语义色：`primary`（深主色 / 深灰）、`accent`（强调色 / 暖金）、`secondary`（次要文字 / 中灰）、`surface`（浅底 / 米白）。
- **字体**：标题 `Inter` + `Noto Sans SC`，全局 weight 300/400/500 为主，体现"极简"。
- **图片**：上传后统一转为 `.webp`，最大宽 1920px，质量 80；视频原格式保存（mp4/webm/mov）。
- **静态资源**：`/uploads/**` 目录下的所有文件在 HTTP 层支持 `Range`（视频拖动）+ 1 年强缓存（`Cache-Control: public, max-age=31536000, immutable`）。
- **安全**：所有写操作（POST/PUT/DELETE）默认必须带 `Authorization: Bearer <JWT>`，仅 `/api/auth/login` 与 `/api/contact` 例外；JWT 有效期 7 天；密码 bcrypt 哈希（cost=10）。
- **路径安全**：素材相关接口必须做路径规范化与越界检查（`..`、绝对路径、特殊字符），防止越出 `public/uploads/` 根目录。
- **前台加载策略**：所有公共站点设置（品牌名、导航、Logo、Footer、联系信息、价格显示开关、缩略图背景、Lightbox 箭头、轮播间隔、关于页图片/覆盖层/正文、社交链接、Admin 菜单、首页区块、产品分类列表与排序等）必须在 app 启动时通过**一次性 bootstrap 接口** `GET /api/site/bootstrap` 加载，并以 `useState('site-settings')` 缓存——整个会话不再重复请求。每个 `useXxx()` composable 必须**同步**从该 state 读取（不再各自 `useFetch`），SSR 时由插件 await bootstrap 写入 payload，CSR 切换路由零额外公共设置请求。
- **前台路由不阻塞**：所有公开页面（首页/产品列表/产品详情/新闻列表/新闻详情/关于/联系）的"业务数据" `useFetch`（产品/文章/Banner 列表）必须设 `lazy: true`，使 Nuxt Suspense 不再阻塞客户端路由切换；`pending` 阶段必须渲染骨架占位（与最终内容同高），避免白屏与布局抖动。SSR 首屏仍预取业务数据写入 payload，保留 SEO。
- **页面过渡**：`nuxt.config.ts` 必须配置 `app.pageTransition: { name: 'page', mode: 'out-in' }`，CSS 提供 ~150ms 淡入淡出，让导航体感"瞬间"。

---

## 2. 数据模型（必备字段）

> 字段名仅作参考，含义不能省。`created_at` / `updated_at` 默认 `CURRENT_TIMESTAMP`。所有 id 自增。

### 2.1 `admin_users` 后台账号
- `id` PK
- `username` 唯一，长度 ≥ 2
- `password_hash` bcrypt
- `created_at`

### 2.2 `banners` 轮播
- `id`
- `title`、`subtitle`、`button_text`、`button_link`
- `image_url`（可为图片或视频）
- `video_poster`（视频封面，仅当 `image_url` 是视频时使用）
- `sort_order` 整数，升序展示
- `is_active` 0/1
- `created_at` / `updated_at`

### 2.3 `products` 产品
- `id`
- `name`、`slug`（唯一，URL 用）
- `price` 数值
- `description` HTML 富文本
- `specs_json` JSON 字符串（参数键值对，如 `{"材质":"钛","重量":"8g"}`）
- `images_json` JSON 数组（每项为 `/uploads/...` 或外链；图片+视频混排有序）
- `category`、`sub_category`
- `is_featured` 0/1（首页"甄选系列"用）
- `is_active` 0/1（前台是否展示）
- `sort_order` 整数
- `created_at` / `updated_at`

### 2.4 `articles` 文章
- `id`
- `title`、`slug` 唯一
- `content` HTML 富文本
- `cover_image` 16:10 封面图 URL
- `summary` 摘要
- `is_published` 0/1
- `created_at` / `updated_at`

### 2.5 `contact_messages` 留言
- `id`
- `name`、`email`、`phone`、`message`
- `is_read` 0/1
- `created_at`

### 2.6 `site_content` 键值内容表
- `id`
- `key` 唯一（如 `homepage_sections`、`nav_items`、`brand_name_primary` 等，见 §10）
- `content` 文本（字符串或 JSON 字符串）
- `updated_at`

---

## 3. 公开前台页面

### 3.1 全局头部 `SiteHeader`

- 固定置顶（fixed），初始透明，**滚动 > 50px 后切到 glass 效果**（半透明白底+模糊+轻阴影）。
- 左侧：Logo 二选一显示——
  - 如果"站点 Logo 设置"中 `show=true` 且有 `url`：显示图片，高度由设置 `height`（20–80px）决定。
  - 否则显示文字：`<品牌主色名><品牌强调名>`，两段分别用 primary 和 accent 色。
- 中间（≥md）：横向导航。导航项来源于设置中的 `nav_items` JSON，按 `sort_order` 升序，只展示 `is_active=true` 的项；每项显示 `label`；hover 有下划线动画。
- 右侧（< md）：汉堡按钮，点击展开下拉菜单（同样使用导航数据，点击后自动收起）。

### 3.2 全局底部 `SiteFooter`

四栏（手机 1 列）：
1. **品牌区**：品牌名（`primary` + `accent`） + 设置中的 `footer_tagline_line1` / `line2` 两行 slogan。
2. **产品系列**：列出所有非空 `category`，按"分类排序设置"排序；点击跳到 `/products?category=<分类>`。
3. **关于品牌**：三个链接（关于 / 新闻 / 联系），label 取自导航设置中对应路径的 `label`，否则用默认。
4. **联系方式**：取设置中 `contact_info.items` 的前 3 项。

底部右下角：`© <当前年> <品牌名>. All rights reserved.` + 两个占位链接（隐私政策 / 使用条款）。

### 3.3 首页 `/`

完全由 `site_content.homepage_sections` 这个 JSON 数组驱动，每项是一个"区块"：

```ts
type Block = {
  id: string
  type: 'banner'|'products'|'image_text'|'news'|'cta'|'richtext'
  visible: boolean
  sort_order: number
  // 类型相关字段（下文）
}
```

页面按 `sort_order` 升序渲染 `visible !== false` 的区块。后台可任意新增、删除、隐藏、排序、复制。

**区块类型与字段：**

| 类型 | 必填字段 | 行为 |
|---|---|---|
| `banner` | (无额外字段，全局唯一推荐 1 个) | 拉取 `is_active=1` 的所有 banner 渲染轮播 |
| `products` | `title`、`subtitle`、`perRow`（2-5）、`rows`（行数） | 拉取 `is_featured=1` 且 `is_active=1` 的产品，最多 `rows × perRow` 件，按 `sort_order` 升序 |
| `image_text` | `label`、`heading`（支持 `\n` 换行→`<br>`）、`description`、`image`、`link_text`、`link_url`、`image_position`（left/right）、`bg_color`（white/surface） | 左图右文或反之，带 ScrollReveal 动画 |
| `news` | `title`、`subtitle`、`limit`（默认 3） | 拉取 `is_published=1` 文章按时间倒序，最多 `limit` 篇，3 列网格 |
| `cta` | `heading`、`subtitle`、`link_text`、`link_url`、`bg_color` | 居中大标题 + CTA 按钮 |
| `richtext` | `title`、`content`（HTML）、`bg_color` | 一段富文本，最大宽 4xl |

#### 3.3.1 子组件 `HomeBanner`（轮播）

- 全屏高（`h-screen`），左侧渐变白色蒙版，使文字可读。
- 自动轮播间隔 = 设置 `banner_interval`（秒，默认 5）。
- 媒体识别：URL 后缀为 `.mp4 / .webm / .mov` 视为视频；视频元素属性 `autoplay muted loop playsinline`，并在 `video_poster` 上做首屏底图防黑屏。
- 切换动画：旧帧淡出 + 新帧淡入（1s），文字组上下滑入（0.6s）。
- 左右翻页按钮（多于 1 条才显示） + 底部圆点指示器；触摸支持左右滑动；切换后自动重置计时器。
- 预加载：进入页面后用 `requestIdleCallback` 依次预加载后续轮播的图片/视频。

#### 3.3.2 子组件 `HomeProducts` / `HomeNews` / `HomeImageText` / `HomeCta` / `HomeRichtext`

- 统一使用 `ScrollReveal`（@vueuse/motion）：进入视口时 40px 上移 + 透明度 0→1，duration 600ms，按 index × 100ms 错峰。
- `SectionTitle`：居中标题 + 副标题 + 12px 横线分割。

### 3.4 产品列表 `/products`

- 顶部 Hero：标题/副标题 = 导航设置中 `/products` 的 `label / subtitle`，否则默认。
- **分类筛选条**：胶囊按钮组，第一项固定为"全部"。分类来源于当前所有产品的 `category` 去重，按设置 `product_category_order` 自定义顺序拼在前面，未在排序列表中的追加在后。
- **二级分类筛选条**：在选中具体一级分类时出现。来源同上，使用 `product_subcategory_order`（`{[category]: [sub,...]}` 结构）。
- **网格**：每行列数 = 设置 `products_per_row`（2-5），手机始终 1 列，平板 2 列，pc 按设置。
- **状态保持**：
  - URL `?category=xxx` 优先（SSR 安全）。
  - 客户端再回退到 `sessionStorage` 中的 `products-category` / `products-subcategory`。
  - 切换分类时 sessionStorage 同步更新；二级分类在切一级时被重置为"全部"。
- 空结果显示"暂无相关产品"。

### 3.5 产品详情 `/products/[slug]`

- 顶部面包屑：首页 / 产品中心 / 当前产品名。
- **左侧媒体区**：
  - 主预览 1:1 容器，背景色 = 设置 `product_thumb_bg`（颜色 + 透明度 0–100）。
  - 支持图片、视频混排；视频显示前用首张图片作 poster（找不到则显示加载占位）。
  - 主图下方一行缩略图按钮（多于 1 时），当前项有 accent 边框；视频缩略图用 play 图标占位。
  - 点击主图打开**全屏 Lightbox**：背景黑 90%、Esc 关闭、← → 键翻页、左右滑动手势、循环、底部 `index/total` 计数；左右翻页按钮的颜色/底色来自设置 `lightbox_arrow_style`；视频带 `controls`。
  - 主图区支持触摸左右滑切换缩略图。
- **右侧信息区**：
  - 分类小标 `category · sub_category`（accent 色）。
  - 产品名 H1。
  - 价格（仅当全局开关 `show_product_price` ≠ "0" 时显示，默认显示）。
  - 富文本描述（`description`）。
  - **产品参数**：如果 `specs_json` 非空，渲染表格（左右两列、横线分隔）。
  - 主 CTA"咨询购买"按钮跳到 `/contact`。

### 3.6 新闻列表 `/news`

- 顶部 Hero 同产品列表。
- 拉取 `is_published=1` 文章，按 `created_at DESC`，3 列网格；每项：`cover_image`、日期（格式 `YYYY年MM月DD日`，Safari 安全：日期字符串 `-` 替换为 `/`）、标题（两行省略）、摘要（两行省略）。
- 空状态文案"暂无文章"。

### 3.7 新闻详情 `/news/[slug]`

- 面包屑 → 封面（最大高 480px）→ 标题（H1）→ 日期 → 富文本正文 → 底部"返回新闻列表"链接。

### 3.8 关于我们 `/about`

- Hero：`ABOUT US` 小标 + 标题 + 副标。
- **品牌图横幅**：50vh 高度，使用设置 `about_image`；上方叠加 `about_overlay`（颜色 + 透明度 0–100）。
- 正文区：渲染 `site_content.about_us` 的 HTML 富文本。
- **品牌价值**：3 个固定卡片（icon, title, desc，硬编码三组：极简美学 / 匠心工艺 / 科技创新），居中圆形图标 + 标题 + 描述。

### 3.9 联系我们 `/contact`

- Hero 同上。
- 主区两栏：

**左：留言表单**
- 字段：姓名*（必填）、邮箱、电话、留言内容*（必填）。**邮箱和电话至少填一项**。
- 失焦实时校验，提交前再校验一次。
- 字符计数：右上角显示 `当前长度/最大长度`（按校验设置）。
- 校验规则全部来自 `site_content.contact_validation`（JSON，字段见 §10）：
  - `name.minLength`（默认 2）/ `maxLength`（默认 20）。
  - `email.enabled` + `email.pattern`（正则，默认 `^[^\s@]+@[^\s@]+\.[^\s@]+$`）。
  - `phone.enabled` + `phone.pattern`（默认 `^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$`） + `minLength/maxLength`（按数字位数）。
  - `message.minLength`（默认 10）/ `maxLength`（默认 500）。
  - `rateLimit.enabled` + `interval`（秒，默认 60）。
- 提交成功显示绿色 toast 文案（来自后端）+ 清空表单；失败显示红色错误。
- 服务端会再次执行同样校验，并对入参做反 XSS sanitize（去掉控制字符、`<>'"\\/`、`..`）+ 按字符数截断。

**右：联系信息**
- 渲染 `contact_info.items`（label + value）整列。
- **社交媒体**：渲染 `social_links` 中 `is_active=true` 的，每条显示图标（emoji 或 `/uploads/` 图标）、label、value、二维码图（点击放大预览，支持 ESC 关闭、半透明黑背景）。
- 营业时间卡片：渲染 `contact_info.hours` 字符串数组。

---

## 4. 后台总体

### 4.1 访问入口（隐藏）

- 路径：`/admin/login`。
- **访问密钥门控**：
  - `site_content.admin_access_key` 若为非空：必须 URL 带 `?key=<密钥>` 才能进入；不匹配则进入后页面应"看上去像是不存在"或 404。
  - 第一次成功访问后写 Cookie `admin_access_granted`（值=密钥），后续直接放行。
  - 后台"账号安全"中可一键生成 16 位随机密钥，并预览完整登录链接（域名/admin/login?key=…）。

### 4.2 登录

- 表单：用户名、密码。
- **验证码**：使用 svg-captcha（4 位、ignore `0o1ilI`、彩色、`#f3f4f6` 背景）。仅在以下任一情况下显示：
  - 后台 GET `/api/auth/login-status` 返回 `captchaRequired=true`；
  - 上次登录失败后服务端响应 `data.captchaRequired=true`；
- **失败计数与锁定（基于 IP，内存表）**：
  - 失败 ≥ 3 次：强制要求验证码。
  - 失败 ≥ 8 次：锁定 5 分钟，期间返回 429 + 剩余秒数。
  - 失败窗口 15 分钟。
  - 成功登录清空该 IP 的计数。
- 登录成功：服务端签发 JWT（7 天有效），前端写入 Cookie `admin_token`（7 天）。

### 4.3 鉴权与中间件

- 客户端：路由中间件——访问 `/admin/**`（除登录）若无 `admin_token` 则跳登录页；访问登录页若无 `admin_access_granted` 但 URL 带 `?key=` 则保存 Cookie 后放行。
- 服务端：所有 `/api/**` 的 POST/PUT/DELETE（除 `/api/auth/login` 与 `/api/contact`）都需 `Authorization: Bearer <JWT>`，否则 401。

### 4.4 布局

左侧固定 `w-64` 侧栏（白底、右细线）：
- 顶部 Logo / 品牌名（与前台同源，Logo 高度上限 40px）。
- 中间菜单：来自设置 `admin_menu_items`，可在后台改 label / path / icon / 排序 / 启用。默认菜单（如下）会自动补齐缺失项：
  - 📊 仪表盘 `/admin`
  - 🏠 首页管理 `/admin/homepage`
  - 🎠 轮播管理 `/admin/banners`
  - 📦 产品管理 `/admin/products`
  - 📝 文章管理 `/admin/articles`
  - ✉️ 留言管理 `/admin/messages`
  - 🖼️ 素材库 `/admin/media`
  - 📄 内容管理 `/admin/content`
  - ⚙️ 站点设置 `/admin/settings`
- 图标支持 emoji 或 `/uploads/` 图片 URL（`DynamicIcon` 自动判断）。
- 底部"← 返回前台"。
- 右上：当前 `username` + "退出登录"按钮（清 token 跳登录页）。

---

## 5. 后台模块详述

### 5.1 仪表盘 `/admin`

- 4 张统计卡片：产品数 / 文章数 / 轮播数 / 未读留言数（统计 `is_read=0`）。
- 快捷入口卡片：跳转到几个常用页（新建产品、新建文章、轮播管理、查看留言等）。

### 5.2 首页管理 `/admin/homepage`

按区块编辑 `site_content.homepage_sections`：

- 上方"添加区块"按钮组：6 种类型各一颗按钮。
- 列表中每个区块卡片有：
  - 抓手（drag handle）：拖拽改顺序。
  - 上移 / 下移按钮（兜底键盘可达）。
  - 显示/隐藏开关（`visible`）。
  - "复制"按钮：克隆一份追加到末尾。
  - 删除按钮（确认）。
  - "展开/收起"切换该区块的详细编辑表单（不同 `type` 对应不同字段，见 §3.3 表格）。
  - 编辑器中的图片字段使用 `ImageUploader`；富文本字段使用 `RichTextEditor`。
- 底部 **sticky 保存条**：显示"未保存"标记，点击"保存"才把整个数组 PUT 到 `/api/content/homepage_sections`。

### 5.3 轮播管理

- 列表 `/admin/banners`：表格，列：拖拽抓手、媒体缩略图（图片或视频帧）、title、`sort_order`（可拖拽改）、`is_active`（点击切换）、操作（编辑 / 删除）。
- 拖动结束后批量 PUT 更新顺序（每条 sort_order = 索引）。
- 编辑 `/admin/banners/[id]`：
  - 字段：title / subtitle / button_text / button_link / `image_url`（图片或视频，使用 `ImageUploader`） / 当上传的是视频时显示 `video_poster` 图片字段 / sort_order / is_active。

### 5.4 产品管理

#### 5.4.1 列表 `/admin/products`

- 顶部工具栏：
  - 搜索框（按 name 模糊，防抖 300ms）。
  - 状态筛选：全部 / 上架 / 下架。
  - "新建产品"按钮。
- **分类区**：可拖拽排序的胶囊按钮组；含"全部"；拖动结束后保存 `product_category_order`（数组）。
- **二级分类区**：选定一级分类后出现，可拖拽排序；保存 `product_subcategory_order[当前一级] = [...]`。
- 列表（表格）：
  - 列：复选框、缩略图、name（点击进入编辑）、category/sub_category、price（行内编辑）、`sort_order`（行内编辑）、`is_featured`（星标切换）、`is_active`（胶囊切换）、操作（编辑/复制/删除）。
  - 行拖拽：拖动顺序 → POST `/api/products/reorder`（按整页 id 数组重置 sort_order）。
  - 复制：克隆一条新产品（slug 自动加时间戳）。
- **批量操作条**（勾选后出现）：
  - 上架 / 下架（`set_active` / `set_inactive`）。
  - 设置价格（`set_price`，弹框输入）。
  - 设置分类（`set_category`，弹框输入"分类/子分类"格式）。
  - 删除（确认）。
- **分页**：page、limit；列表的搜索/状态/页码/分类 全部持久化到 `localStorage`，刷新或回退后状态不丢。

#### 5.4.2 编辑 `/admin/products/[id]`

字段：
- `name`、`slug`（留空时后端按 `product-<时间戳>` 自动生成）。
- `category` / `sub_category`（输入框，带"已有值自动补全"下拉）。
- `price` 数值。
- `sort_order` 数值。
- `is_featured` / `is_active` 开关。
- **图片+视频**（`images_json`）：使用 `ImageUploaderMultiple`，可拖拽排序、删除、单条裁剪、上传时自动塞进 `images_json`。
- **描述**（`description`）：`RichTextEditor`（TipTap，支持加粗/斜体/标题/列表/图片/视频/链接/从素材库选）。
- **参数**（`specs_json`）：动态行编辑（"键 / 值"两栏 + 增减按钮）；键可使用现有产品的常见参数键作为自动补全。

### 5.5 文章管理

#### 5.5.1 列表 `/admin/articles`

- 表格：复选框、title、`created_at` 日期、状态胶囊（点击切换发布/草稿）、操作（编辑 / 删除）。
- 批量：发布 / 取消发布 / 删除。
- 新建按钮 + "从链接导入"按钮（弹框输入 URL → 调 `/api/articles/import` → 自动填入 title 与 content 并创建新文章）。

#### 5.5.2 编辑 `/admin/articles/[id]`

字段：
- `title`、`slug`（留空自动 `article-<时间戳>`）。
- `summary`。
- `cover_image`：使用 `ImageUploader`，强制 **16:10 裁剪**，上传到 `文章内容/<时间戳>` 子目录。
- `content`：`RichTextEditor`。
- `is_published` 开关。
- 内置按钮"从链接导入"：输入一个 URL，后端抓取并按白名单标签清洗后注入正文，且把页面里的远程图片/视频下载到本地 `/uploads/文章内容/<时间戳>/` 并替换 src。

#### 5.5.3 链接导入实现要点（必须等价）

- 入参：`url`。
- 抓取限时 15s，UA 标识为 `ArticleImporter/1.0`。
- 标题提取顺序：`<meta og:title>` → `<title>` → `<h1>`。
- 正文提取顺序：`<article>` → `<main>` → `<body>`，再剥掉 `<script><style><nav><header><footer><aside>` 与注释。
- **标签白名单**：`p h1-h6 ul ol li blockquote img a strong em b i br hr figure figcaption table thead tbody tr th td video source`。
- `<div><section><span>` 等容器直接去掉但保留内容。
- `<img>` 只保留 `src`、`alt`；`<a>` 只保留 `href`；`<video>` 强制带 `controls`。
- 远程媒体下载：单文件上限 50MB，根据 Content-Type 或扩展名识别为 `.jpg/.png/.webp/.gif/.svg/.mp4/.webm/.mov`，文件名 UUID + 扩展名；失败的素材跳过不抛错。

### 5.6 留言管理 `/admin/messages`

- 表格：复选框、未读状态点（蓝色高亮整行）、name、email、phone、message（截断）、`created_at`，操作（详情 / 删除）。
- 点击一行：弹出详情弹框，展示完整字段；打开后**自动标记已读**。
- 批量：标记已读 / 删除。
- 顶部按钮"一键全部已读"（调用 `action=mark_all_read`）。
- 分页。

### 5.7 素材库 `/admin/media`

完整文件系统级 CMS。所有素材落在 `public/uploads/` 目录下，子文件夹任意层级。

**视图区**
- 顶部：当前路径面包屑（"根目录 > a > b"），点击任一层可跳回。
- 类型筛选：全部 / 图片 / 视频。
- 全局搜索框：输入即时搜索；搜索 / 类型筛选不等于"all" 时会递归遍历整个 `uploads/` 目录，结果含匹配文件夹（按 name 含搜索词）和文件（按文件名或路径含）。
- 视图模式：网格（默认）+ 缩略图懒加载。
- 视频缩略图：组件 `VideoThumbnail` 在客户端用 `<video>` 取 1s 帧画到 canvas，叠加播放图标。

**文件操作**
- 上传：
  - 点击 / 拖拽 / 粘贴；支持多文件；支持整文件夹拖入（`webkitGetAsEntry`），保留子目录层级。
  - "上传文件夹"按钮使用 `<input webkitdirectory>`。
  - 视频校验：格式（来自设置 `video_allowed_formats`，默认 `mp4,webm`）+ 大小上限（`video_max_size`，默认 50MB）。
  - 图片：sharp 转 webp + 限宽 1920 + 质量 80；大小上限来自 `upload_max_size`（默认 5MB）。
  - URL 形式 `/uploads/<folder>/<uuid>.webp` 或 `/uploads/<folder>/<uuid>.<ext>`。
- 文件夹：
  - "新建文件夹"弹框：输入名称（校验：不含 `/`、`\`、不以 `.` 开头、不含 `<>:"|?*` 与控制字符、≤255）。
  - 重命名（文件夹和文件均支持，文件可同时换目录 = 移动）。
  - 删除：默认非空文件夹拒绝；UI 二次确认后传 `force=true` 强制递归删除。
- 选择 / 剪贴板：
  - 鼠标点击勾选；多选 checkbox；Ctrl/Cmd+C 复制选中、Ctrl/Cmd+X 剪切、Ctrl/Cmd+V 粘贴到当前目录；同名自动去重为 `<名>_copy[_n]<ext>`。
  - 顶栏显示"已复制 N 个 / 已剪切 N 个"状态。
- 预览：双击图片/视频打开 Lightbox（含左右翻、键盘 ← → / Esc）。
- 分页：localStorage 记忆 page size。

**接口**
- 全部接口见 §8。

### 5.8 内容管理 `/admin/content`

最简版：当前仅作为"关于我们 / 品牌故事"富文本编辑器（直接挂在 `site_content.about_us`）。

### 5.9 站点设置 `/admin/settings`

含 5 个 Tab：基本 / 内容 / 上传 / 联系 / 系统。每个 Tab 独立保存，每条设置对应一个 `site_content.<key>` 行。

#### 5.9.1 基本
- **品牌名**：`brand_name_primary`（默认"清透"） + `brand_name_accent`（默认"视界"）。
- **站点 Logo** `site_logo`（JSON）：`{ url, show, height }`，`height` 范围 20–80。
- **导航项** `nav_items`（JSON 数组）：每项 `{ label, path, subtitle, sort_order, is_active }`。可增删改、拖拽排序、隐藏（不删除）。
- **底部 slogan**：`footer_tagline_line1`、`footer_tagline_line2`。
- **轮播间隔**：`banner_interval`（秒，正整数，默认 5）。

#### 5.9.2 内容
- **是否显示产品价格** `show_product_price`：`"1"`/`"0"`，默认显示。
- **产品每行数量** `products_per_row`：2–5，默认 3。
- **产品缩略图背景** `product_thumb_bg`（JSON）：`{ color: "#rrggbb", opacity: 0-100 }`，默认 `#ffffff` / 100。
- **Lightbox 翻页按钮样式** `lightbox_arrow_style`（JSON）：`{ arrowColor, arrowBgColor }`。
- **关于页主图** `about_image`：URL（支持 `ImageUploader` + 3.2:1 裁剪）。
- **关于页主图蒙版** `about_overlay`（JSON）：`{ color, opacity 0-100 }`。
- **关于页正文** `about_us`：富文本（也在"内容管理"页编辑）。

#### 5.9.3 上传
- **图片上传上限 MB** `upload_max_size`（默认 5）。
- **视频允许格式** `video_allowed_formats`：用 `,` 分隔的扩展名（默认 `mp4,webm`，可选 `mp4,webm,mov`）。
- **视频上限 MB** `video_max_size`（默认 50）。

#### 5.9.4 联系
- **联系信息** `contact_info`（JSON）：
  ```json
  { "items": [{ "label": "客服热线", "value": "400-..." }, ...], "hours": ["周一至周五 ...", ...] }
  ```
- **留言校验** `contact_validation`（JSON）：完整结构示例：
  ```json
  {
    "name":   { "minLength": 2,  "maxLength": 20 },
    "email":  { "enabled": true, "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
    "phone":  { "enabled": true, "pattern": "^1[3-9]\\d{9}$|^0\\d{2,3}-?\\d{7,8}$", "minLength": 7,  "maxLength": 20 },
    "message":{ "minLength": 10, "maxLength": 500 },
    "rateLimit": { "enabled": true, "interval": 60 }
  }
  ```
- **社交媒体** `social_links`（JSON 数组）：每项 `{ platform, label, icon, value, qrcode, is_active }`；`icon` 可 emoji 或 `/uploads/` 图片；`qrcode` 是上传的二维码图片 URL。默认含 5 个平台：wechat / wechat_official / weibo / xiaohongshu / douyin。

#### 5.9.5 系统
- **后台访问密钥** `admin_access_key`：文本，可一键随机生成 16 位（A-Za-z0-9）；同时显示完整登录 URL `<origin>/admin/login?key=<key>`，便于复制。
- **后台菜单项** `admin_menu_items`（JSON 数组）：项 `{ label, path, icon, sort_order, is_active }`；`path` 与系统内置一致即可被定位；`icon` 用 `IconPicker`（emoji 或图片）。
- **管理员账号**：列表（id / username / created_at），可：
  - 新增（用户名 ≥ 2，密码 ≥ 6）。
  - 删除（不能删自己，且系统至少保留 1 个）。
- **修改当前账号**：表单 `currentPassword`*（必填验证） + `newUsername?` + `newPassword?`（新密码 ≥ 6）；修改成功后返回新 JWT 并替换 Cookie。

---

## 6. 上传与媒体处理细则

- 所有上传走 `POST /api/upload?folder=<可选>`：
  - `multipart/form-data`，单文件字段。
  - 图片：仅接收 `image/jpeg|png|webp|gif`，统一 webp 化（width ≤ 1920、q=80）；超大小报错。
  - 视频：MIME 必须在设置允许的 mp4/webm/mov 中；超大小报错；原样保存。
- 返回 `{ url: "/uploads/..." }`。
- `safePath()`：所有按"路径"传入的接口都经过规范化和"必须在 UPLOAD_ROOT 之内"校验。
- 文件/文件夹命名校验 `validateName()`：不含 `/ \ ..`、不以 `.` 开头、不含 `< > : " | ? * \x00-\x1f`、长度 ≤ 255。

---

## 7. 富文本编辑器

- 基于 TipTap（StarterKit + Image + Link + Placeholder + 自定义 Video 节点）。
- 工具栏（最少需具备）：加粗 / 斜体 / 标题 / 列表 / 引用 / 链接 / **上传图片** / **上传视频** / **从素材库选**。
- 自定义 `<video>` 节点：渲染时强制 `controls playsinline preload=metadata`，最大宽 100%。
- 编辑区固定有上传 input（`accept` 包含图片与 mp4/webm/mov）；上传走通用 `/api/upload`。
- 素材库选择支持多选并按顺序插入。
- 内容产物为 HTML 字符串，前台用 `v-html` 渲染，统一套 `.prose-content` 样式（标题、段落、图片、视频圆角、表格等）。

---

## 8. API 规范

> 全部前缀 `/api`。"需鉴权"指 POST/PUT/DELETE 需 Bearer token。下列接口的入参与返回字段需严格一致（细节字段已在前文给出）。

### 8.1 鉴权与账号
- `GET /auth/captcha` → SVG 图（同时下发 `captcha_id` HttpOnly cookie，TTL 5 分钟）
- `GET /auth/login-status` → `{ captchaRequired, locked, lockedSeconds }`
- `POST /auth/login` → `{ token, user }`；失败时 `data.captchaRequired` 可能为 true
- `GET /auth/me` → 当前用户（401 表示未登录）
- `PUT /auth/account` → 改用户名/密码（必填当前密码）
- `GET /auth/users` → 账号列表
- `POST /auth/users` → 新建
- `DELETE /auth/users/:id` → 删除（不能删自己，至少保留 1 个）
- `GET /admin/verify-key?key=…` → `{ valid: bool }`（密钥为空时恒 true）

### 8.2 产品
- `GET /products?slug=…` → 单条（必须 `is_active=1`）
- `GET /products?active_only=&featured=&category=&sub_category=&search=&is_active=&order_by=&order_dir=&page=&limit=` → `{ items, total, page, limit }`
  - `order_by` 允许 `sort_order / is_active / created_at / price`
  - 按 `is_active` 排序时附加 `sort_order ASC`
- `GET /products/:id` → 单条（含未发布的）
- `POST /products` → `{ id }`
- `PUT /products/:id`
- `DELETE /products/:id`
- `POST /products/batch` body: `{ ids, action: 'delete'|'set_active'|'set_inactive'|'set_price'|'set_category', value? }`
  - `set_category` 的 value 用 `分类/子分类` 字符串解析
- `POST /products/reorder` body: `{ ids: number[] }` → 按数组序重置 `sort_order`

### 8.3 文章
- `GET /articles?slug=…` → 单条（`is_published=1`）
- `GET /articles?published_only=&page=&limit=` → 列表
- `POST /articles` / `PUT /articles/:id` / `DELETE /articles/:id`
- `POST /articles/batch` body: `{ ids, action: 'delete'|'publish'|'unpublish' }`
- `POST /articles/import` body: `{ url }` → `{ title, content }`

### 8.4 轮播
- `GET /banners?active_only=true` → 数组（按 `sort_order ASC`）
- `GET /banners/:id` / `POST /banners` / `PUT /banners/:id` / `DELETE /banners/:id`

### 8.5 留言
- `GET /messages?page=&limit=` → `{ items, total, page, limit }`
- `PUT /messages/:id` body `{ is_read }`
- `DELETE /messages/:id`
- `PUT /messages/batch` body：
  - `{ action: 'mark_all_read' }` 或
  - `{ ids, action: 'mark_read' }`
- `DELETE /messages/batch` body `{ ids }`

### 8.6 留言提交（公开）
- `POST /contact` body `{ name, email, phone, message }`
  - 服务端做 sanitize（去控制字符与 `<>'"\\/` 与 `..`、按 50/100/30/5000 截断）。
  - 服务端再按 `contact_validation` 全套校验。
  - 速率限制：默认每 IP 60s 一次。
  - 成功返回 `{ success, message }`。

### 8.7 内容键值
- `GET /content/:key` → `{ key, content }`（不存在则 `content: ''`）
- `PUT /content/:key` body `{ content }`（字符串/JSON 字符串均可）

### 8.8 上传
- `POST /upload?folder=<可选>` → `{ url }`

### 8.9 素材列表
- `GET /media?folder=&search=&type=all|image|video&page=&limit=` →
  ```ts
  { folders: [{name, path}], items: [{url, name, type, size, mtime, folderPath}], total, page, limit, currentFolder, globalSearch }
  ```
  - 当 `search` 非空或 `type !== 'all'` 时进入"全局递归"模式（结果含跨目录匹配）。
  - 否则只列当前目录的直接子项。
  - 返回项按 `mtime DESC` 排。

### 8.10 素材文件
- `PUT /media/<path>` body `{ newName?, folder? }` → 重命名或同时移动；返回新 URL
- `POST /media/copy` body `{ files: string[], targetFolder }` → 复制（自动去重命名）

### 8.11 文件夹
- `POST /folders` body `{ path }` → 新建（多级一次性创建）
- `PUT /folders/<path>` body `{ newName }` → 改名
- `DELETE /folders/<path>?force=true` → 删除（非空且无 force 则 409）

### 8.12 静态文件
- `GET /uploads/<path>` → 静态文件，视频支持 `Range`（206 部分响应），均带 1 年强缓存。
- `DELETE /uploads/<path>` → 删除单个文件（夹路径会被拒绝）。

### 8.13 仪表盘
- `GET /stats` → `{ products, articles, banners, messages }`（messages 仅未读数）

### 8.14 站点 bootstrap（公共，免鉴权）
- `GET /site/bootstrap` → 一次性返回前台所有公共设置，结构如下：
  ```ts
  {
    brand: { primary, accent },
    logo: { url, show, height },
    navItems: NavItem[],
    footerTagline: { line1, line2 },
    contactInfo: { items, hours },
    socialLinks: SocialLink[],
    showPrice: boolean,
    productsPerRow: number,                       // 2-5
    productThumbBg: { color, opacity },
    lightboxArrowStyle: { arrowColor, arrowBgColor },
    bannerInterval: number,                       // 秒
    aboutImage: string,
    aboutOverlay: { color, opacity },             // opacity 0-100
    aboutContent: string,                         // about_us HTML
    productCategories: string[],                  // 来自 SELECT DISTINCT category FROM products WHERE is_active=1
    productCategoryOrder: string[],
    productSubcategoryOrder: { [cat]: string[] },
    homepageSections: HomepageBlock[],            // 已 filter visible + sort
    adminMenuItems: AdminMenuItem[],              // 已合并默认 + filter is_active + sort
  }
  ```
  - 服务端一次 SQL：`SELECT key, content FROM site_content` + 一次 `SELECT DISTINCT category FROM products …`。
  - 每个字段的解析与默认值必须复用 `shared/site-settings.ts` 中导出的纯函数（`parseContact`/`parseNavItems`/`parseSocialLinks`/`parseAdminMenu`/`parseSiteLogo`/`parseProductThumbBg`/`parseLightboxArrowStyle`/`parseAboutOverlay`/`parseHomepageSections`/`parseStringArray`/`parseSubcategoryOrder`/`parseBannerInterval`/`parseProductsPerRow`），与 composable 共用一套默认值，避免漂移。
  - 前端 `app/plugins/site-settings.ts` 在 app 启动时 `$fetch('/api/site/bootstrap')` 一次，写入 `useState<SiteSettings>('site-settings')`；插件做 `if (state.value) return` 的幂等保护，hydration 阶段不重复 fetch。
  - 所有公开页面与 `SiteHeader` / `SiteFooter` / `AdminSidebar` 中的 `useBrandName / useNavItems / useSiteLogo / useContactInfo / useFooterTagline / useSocialLinks / useShowPrice / useProductThumbBg / useLightboxArrowStyle / useBannerInterval / useProductsPerRow / useAboutImage / useAboutOverlay / useAboutContent / useAdminMenu / useHomepageSections / useProductCategories / useProductCategoryOrder / useProductSubcategoryOrder` 必须**同步**从该 state 读取，不再发起任何 `/api/content/*` 请求（管理后台编辑表单除外）。

---

## 9. 交互与体验要求

- **加载状态**：所有提交按钮在 pending 时变灰 + 显示"…中"，禁用重复提交。
- **错误提示**：后端 `statusMessage` 直接展示给用户（中文），前端不要吞错。
- **乐观无障碍**：保存成功后短 toast 或绿色"已保存"标签，3s 自动消失。
- **拖拽**：所有可拖拽列表（菜单、分类、轮播、产品、首页区块）实时显示拖动占位，松开后立刻 PATCH 顺序；失败回滚。
- **键盘**：Lightbox / 弹框 Esc 关闭；列表 Lightbox ← → 翻页；表单 Enter 提交。
- **缓存策略**：
  - 素材库结果在浏览器内 5 分钟缓存，避免反复重读目录。
  - 列表页（产品/文章）使用 useFetch 的内置去重；同 query 不重复请求。
  - 公共站点设置整个会话只取一次（见 §1 前台加载策略 / §10 bootstrap 接口）；管理员后台修改 `site_content` 后，前台需刷新页面才能看到新值——这是预期行为。
- **CMS 默认值**：所有 `useXxx` composable 必须在键不存在或 JSON 解析失败时回退到合理默认（见 §10）。**默认值与解析函数必须放在 `shared/site-settings.ts`，前后端共用**，避免 bootstrap 接口与 composable 之间的默认值漂移。
- **路由切换体感**：从任意前台页跳转到产品列表 `/products`、新闻列表 `/news`、产品详情、新闻详情时，页面框架（标题、筛选条、骨架卡片）必须**立刻**渲染，业务数据进来后再填入；任何"等接口完成才出现页面"的行为都不允许。SiteHeader/SiteFooter 中**不得**包含阻塞 Suspense 的 await（设置全部来自 bootstrap），Footer 也**不得**再发起 `limit=9999` 的全量产品查询——其底部分类列表必须从 bootstrap 的 `productCategories` 字段读取。

---

## 10. `site_content` 键参考表

> 下表所有键都会通过 §8.14 `/api/site/bootstrap` 一次性返回到前端 `useState('site-settings')`，前台所有 composable 同步读取，不应再单独请求 `/api/content/<key>`。后台 `admin/settings.vue` 的读取与写入仍走 `/api/content/<key>`。


| Key | 类型 | 默认值 / 示例 | 说明 |
|---|---|---|---|
| `brand_name_primary` | string | `清透` | 品牌名前段（primary 色） |
| `brand_name_accent` | string | `视界` | 品牌名后段（accent 色） |
| `site_logo` | JSON | `{url:'',show:false,height:32}` | Logo 配置 |
| `nav_items` | JSON 数组 | 5 项（首页/产品/关于/新闻/联系） | 导航项 |
| `homepage_sections` | JSON 数组 | 默认 5 个区块（见 §3.3） | 首页编排 |
| `admin_menu_items` | JSON 数组 | 9 项内置菜单 | 后台菜单 |
| `admin_access_key` | string | `''` | 空=不校验 |
| `footer_tagline_line1` | string | `以极简设计重新定义视觉体验` | |
| `footer_tagline_line2` | string | `让框架消失，让世界更清晰` | |
| `banner_interval` | string | `5` | 轮播秒数 |
| `show_product_price` | string | `1` | `0` 隐藏价格 |
| `products_per_row` | string | `3` | 2-5 |
| `product_thumb_bg` | JSON | `{color:'#ffffff',opacity:100}` | |
| `lightbox_arrow_style` | JSON | `{arrowColor:'#fff',arrowBgColor:'rgba(0,0,0,0.3)'}` | |
| `product_category_order` | JSON 数组 | `[]` | 分类排序 |
| `product_subcategory_order` | JSON 对象 | `{}` | `{cat: [sub,...]}` |
| `about_image` | string | unsplash 占位 URL | |
| `about_overlay` | JSON | `{color:'#000000',opacity:20}` | |
| `about_us` | HTML 字符串 | `''` | 关于我们正文 |
| `contact_info` | JSON | 见 §3.9 / 默认 4 项 + 3 行营业时间 | |
| `contact_validation` | JSON | 见 §5.9.4 | |
| `social_links` | JSON 数组 | 5 项默认（全部 is_active=false） | |
| `upload_max_size` | string | `5` | MB |
| `video_allowed_formats` | string | `mp4,webm` | 逗号分隔 |
| `video_max_size` | string | `50` | MB |

---

## 11. 安全与边界约束

- JWT secret 不应在配置中硬编码（当前是 `qingtou-shijie-jwt-secret-2026`，复刻时改为环境变量或随机生成持久化）。
- 所有公开输入字段都需后端再次校验长度与格式，前端校验仅作 UX。
- 留言接口必须保留 IP 速率限制（默认 60s）。
- 登录接口必须保留：
  - 验证码触发（3 次失败）
  - 锁定（8 次失败 → 5 分钟）
  - 失败窗口 15 分钟自动归零
- 路径相关接口必须保留 `safePath` + `validateName` 的越权防御。
- 删除文件夹默认拒绝非空，前端二次确认后方可加 `?force=true`。
- 删除当前登录账号 / 删到剩 0 个均被拒。
- 文章导入功能必须保留：单文件 50MB、抓取 15s、下载 30s 超时；外链下载失败不应让整个导入失败。

---

## 12. SEO / 站点元数据

- 站点默认 title 模板：
  - 首页：`<品牌前+后>`
  - 产品详情：`<产品名> - <品牌>`
  - 新闻详情：`<文章标题> - <品牌>`
  - 其它页：`<页名> - <品牌>`
- 默认 meta description：站点描述。
- HTML 字符集 utf-8，viewport `width=device-width, initial-scale=1`。
- 资源静态压缩、字体预连接（Google Fonts 或等价 CDN）。

---

## 13. 数据初始化 / 种子（必须可重复执行）

复刻时需提供一个等价 `seed` 脚本，能在空库上：
1. 创建默认管理员（用户名/密码可参数化，密码至少 6 位、bcrypt）。
2. 插入默认 `site_content` 的关键键（至少品牌名、导航、首页区块、联系方式、留言校验、社交链接、后台菜单）。
3. （可选）插入若干示例 banner / product / article 便于演示。

---

## 14. 验收清单（自测路径）

- [ ] 公开页 6 个全部能在不登录情况下访问，SSR 出来的 HTML 含完整 title/meta 与正文。
- [ ] 首页所有 6 种区块类型都能正确渲染，且后台可拖拽排序、隐藏、复制、删除并保存。
- [ ] 产品列表分类/二级分类筛选、刷新后状态保持；URL 带 `?category=` 可直接定位。
- [ ] 产品详情图片+视频混排，缩略图、Lightbox 翻页、触屏滑动、Esc/键盘均工作。
- [ ] 留言表单按校验规则准确提示，速率限制生效；后台留言列表/详情/批量/全部已读工作。
- [ ] 后台访问密钥关闭/开启两种模式都符合预期，开启后 URL 必须带正确 key。
- [ ] 登录失败 3 次出现验证码；8 次锁定 5 分钟；成功登录清零。
- [ ] 素材库：上传单文件 / 多文件 / 整文件夹拖拽，创建/重命名/移动/删除文件夹，复制剪切粘贴，全局搜索，视频拖动播放（Range），缩略图懒加载。
- [ ] 文章"从链接导入"能抓取标题与正文、远程图片下载到本地并替换 src，恶意标签被清洗。
- [ ] 站点设置任一项改动保存后，前台对应表现立刻可见（无需改代码）。
- [ ] 管理员账号增/删/改密码、删自己被拒、剩 1 个被拒、改密码后旧 token 可继续生效到过期。

---

**完。** 复刻此文档所述的每一项即可获得与当前系统行为等价的产品。
