# qtsj-cloud

清透视界 - uniCloud 业务模块。同一份代码支持阿里云 / 腾讯云 / 支付宝云三家服务空间。

## 目录结构

```
uni_modules/qtsj-cloud/
├── package.json                     # uni_modules 清单，声明三云通用
└── uniCloud/
    ├── cloudfunctions/
    │   ├── common/                  # 公共模块（被各云对象 require）
    │   │   ├── vendor-adapter/      # 三云差异抽象（fileID/cloudPath/cron/上传）
    │   │   ├── db-helpers/          # JQL 分页/排序/软删除
    │   │   └── auth-guard/          # uni-id token 校验
    │   └── hello/                   # 阶段 0 冒烟云对象
    └── database/                    # 业务 schema.json（阶段 1 起填入）
```

## 关联服务空间（HBuilderX）

1. 用 HBuilderX 打开本项目根目录。
2. 分别右键 `uniCloud-aliyun/` / `uniCloud-tcb/` / `uniCloud-alipay/` → 关联服务空间 / 创建服务空间。
3. HBuilderX 会自动把 `uni_modules/qtsj-cloud/uniCloud/cloudfunctions/*` 虚拟引用到上述三个目录中——一份代码，三处生效。

## 阶段 0 验收

```
右键 uni_modules/qtsj-cloud/uniCloud/cloudfunctions/hello → 上传到所有云空间
右键 hello → URL 化 → 拷贝得到三个域名前缀
```

浏览器（或 curl）分别请求三个域名下的 `/hello/ping`，应得到：

```json
{ "errCode": 0, "data": { "ok": true, "vendor": "aliyun", "ts": 1717..." } }
```

`vendor` 字段会因不同云空间返回 `aliyun` / `tcb` / `alipay`。

## 认证接入（uni-id）

登录 / 注册 / Token 校验 / 改密 / 验证码 / 失败锁定 全部交给 DCloud 官方的 `uni-id-co` 和 `uni-id-common`，不自行实现。

### 一次性安装

1. 在 HBuilderX 插件市场分别安装：
   - `uni-id-co`（云对象，提供 `login` / `register` / `updatePwd` 等 HTTP 接口）
   - `uni-id-common`（公共模块，提供 `checkToken` / `createToken` 等服务端 API）
   - `uni-config-center`（公共模块，被前两个依赖）
2. 上述插件会写入 `uni_modules/uni-id-co`、`uni_modules/uni-id-common`、`uni_modules/uni-config-center`，与本模块并列。
3. 把 `uni_modules/uni-id-co/uniCloud/cloudfunctions/uni-id-co` 上传到 3 个云空间并 URL 化；前端通过 `uniCloud.importObject('uni-id-co')` 调用。

### 配置

本模块提供了一份 uni-id 配置模板：

```
uni_modules/qtsj-cloud/uniCloud/cloudfunctions/common/uni-config-center/uni-id/config.json
```

**部署前必须改 `passwordSecret` 和 `tokenSecret`**（占位符以 `qtsj-CHANGE-ME-` 开头）。三朵云的 config 可不同，但同一云内 admin / messages / 其它云对象共用同一份。

### admin 云对象

本模块的 `cloudfunctions/admin/` 处理 uni-id 不直接覆盖的"后台账号"业务：

| 方法 | 作用 | 对应原 API |
|---|---|---|
| `listAdmins()` | 拉取 role=admin 的账号列表 | `GET /api/auth/users` |
| `createAdmin({username,password})` | 新建管理员 | `POST /api/auth/users` |
| `removeAdmin(id)` | 删除指定管理员（保留至少 1 个、不能删自己） | `DELETE /api/auth/users/[id]` |
| `updateAccount({currentPassword,newUsername,newPassword})` | 改自己用户名 / 密码 | `PUT /api/auth/account` |

普通的登录用 `uniCloud.importObject('uni-id-co').login({...})`，无需再写。

### 首个管理员怎么来

uni-id 没有内置"初始管理员"。第一次部署后：

1. 上传 `admin` 云对象并 URL 化（HBuilderX 操作）。
2. 在 uniCloud Web 控制台→「数据库」→ `uni-id-users` 表，手动 insert 一条文档：
   ```json
   { "username": "root", "password": "...uni-id 哈希后的值...",
     "password_secret": "...", "role": ["admin"],
     "register_date": 1717000000000 }
   ```
   *或者* 临时把 `admin.createAdmin` 顶部的 `await requireAdmin(this)` 注释掉，调一次，再把守卫加回来。

## 后续阶段

业务云对象（products / articles / banners / messages / content / media / folders / upload / contact / stats）会陆续在 `cloudfunctions/` 下追加，每个对应原 Nuxt 项目中的一个 `server/api/<模块>/` 子目录。

## 本地联调（HBuilderX 本地云函数）

> 验证范围：**products + articles 的读写路径**。一次性验证整条调用链路是否打通。

HBuilderX 自带"本地云函数运行环境"，可以在本地起一个 Node 进程加载 `cloudfunctions/*`，前端通过 `uniCloud.importObject()` 直接调用，无需上传。

### 一、前置检查

1. 已按"关联服务空间"步骤完成与至少一个云空间的关联（即便不上传，也需要服务空间作为本地运行的 DB 来源）。
2. HBuilderX → 工具栏 → 设置 → 运行配置 → 勾选 **"运行本地云函数 / 云对象时使用云端数据库"**。
3. 项目根目录已用 HBuilderX 打开（不能只通过命令行 / VSCode，本地云函数运行依赖 HBuilderX 内置 Node）。

### 二、上传一次依赖（不会经常变）

第一次联调前，先把 3 个公共模块上传到云端（本地云函数运行时仍需 cloud-side 镜像）：

1. 右键 `uni_modules/qtsj-cloud/uniCloud/cloudfunctions/common/db-helpers` → 上传公共模块。
2. 同上：`common/vendor-adapter`、`common/auth-guard`。
3. 同上：`uni_modules/uni-id-common`（如已安装）。

### 三、启动本地云对象

右键以下每个云对象目录 → **"运行 → 本地云对象"**：

- `cloudfunctions/dev-seed`（仅本地，不要上传到生产）
- `cloudfunctions/products`
- `cloudfunctions/articles`

HBuilderX 控制台会显示 `本地云函数运行环境启动成功`，并打印每个对象的本地 endpoint。

### 四、前端冒烟页

项目自带 `pages/dev-smoke/index.vue`，已注册到 `pages.json`。

1. HBuilderX → 运行 → 运行到浏览器（H5）。
2. 浏览器访问 `/#/pages/dev-smoke/index`。
3. 顺序点击：
   - **"1. seed 写入测试数据"** → 调 `dev-seed.seed()`，写 1 条 products + 1 条 articles + 1 条 banners + 1 条 site_content（都带 `_seed: true`）。
   - **"2. verify 计数"** → 调 `dev-seed.verify()`，应返回各集合 `_seed: true` 的条数。
   - **"3. products.list"** → 调 `products.list({ page:1, limit:5 })`，应能在 items 里看到 seed 产品。
   - **"4. articles.list"** → 同上。
   - **"清理种子"** → `dev-seed.clean()`，把 `_seed: true` 的全删了，方便重跑。

每一步的请求 / 响应都会在页面下方 JSON 显示。

### 五、常见问题

- **"未找到云对象"**：本地云对象未启动，重新右键 → 运行。
- **"AUTH_REQUIRED"**：调到了需 admin 的方法，但当前没 token。开发期可以临时在云对象顶部注释掉 `await requireAdmin(this)`，验证完再加回。
- **schema 字段类型不匹配**：HBuilderX 第一次跑某集合时如果云端无此表，会自动按 `database/<name>.schema.json` 创建；改了 schema 要在 uniCloud Web 控制台手动同步一次。
- **本地改了云对象代码不生效**：HBuilderX 默认热重载；若没生效，右键云对象 → 重启本地云对象。

### 六、上线前清单

- ✅ `cloudfunctions/dev-seed` **不要**上传到生产服务空间（仅本地用）
- ✅ `common/uni-config-center/uni-id/config.json` 把 `qtsj-CHANGE-ME-` 占位符改成真实 secret
- ✅ 生产环境跑一次 `dev-seed.clean()` 清掉所有 `_seed: true` 的记录（如果不小心调到了）



迁移完成后，原 Nuxt server API 与云对象方法的对应关系如下。前端调用形式：

```js
const co = uniCloud.importObject('<对象名>')
const data = await co.<方法>(...)
```

### products

| 原 API | 云对象方法 | 备注 |
|---|---|---|
| `GET /api/products?slug=...` | `products.list({ slug })` | slug 命中直接返回单条 |
| `GET /api/products?...` | `products.list({ page, limit, category, sub_category, search, ... })` | 分页 / 排序 / 模糊搜索 |
| `GET /api/products/[id]` | `products.getById(id)` | id 是 uniCloud `_id`（字符串） |
| `POST /api/products` | `products.create(body)` | 需 admin |
| `PUT /api/products/[id]` | `products.update(id, body)` | 需 admin |
| `DELETE /api/products/[id]` | `products.remove(id)` | 需 admin |
| `POST /api/products/batch` | `products.batch({ ids, action, value })` | delete / set_active / set_inactive / set_price / set_category |
| `POST /api/products/reorder` | `products.reorder({ ids })` | 按下标写回 sort_order |

### articles

| 原 API | 云对象方法 | 备注 |
|---|---|---|
| `GET /api/articles?slug=...` | `articles.list({ slug })` | 仅返回已发布的 |
| `GET /api/articles?...` | `articles.list({ page, limit, published_only })` |  |
| `GET /api/articles/[id]` | `articles.getById(id)` |  |
| `POST /api/articles` | `articles.create(body)` | 需 admin |
| `PUT /api/articles/[id]` | `articles.update(id, body)` | 需 admin |
| `DELETE /api/articles/[id]` | `articles.remove(id)` | 需 admin |
| `POST /api/articles/batch` | `articles.batch({ ids, action })` | delete / publish / unpublish |
| `POST /api/articles/import` | `articles.import({ url })` | 远程抓取，媒体落入云存储 |

### banners

| 原 API | 云对象方法 | 备注 |
|---|---|---|
| `GET /api/banners?active_only=true` | `banners.list({ active_only })` | 不分页（条数少） |
| `GET /api/banners/[id]` | `banners.getById(id)` |  |
| `POST /api/banners` | `banners.create(body)` | 需 admin |
| `PUT /api/banners/[id]` | `banners.update(id, body)` | 需 admin |
| `DELETE /api/banners/[id]` | `banners.remove(id)` | 需 admin |

### content

| 原 API | 云对象方法 | 备注 |
|---|---|---|
| `GET /api/content/[key]` | `content.get(key)` | 缺失时返回 `{ key, content: '' }` |
| `PUT /api/content/[key]` | `content.set(key, { content })` | upsert，需 admin |

### messages / contact

| 原 API | 云对象方法 | 备注 |
|---|---|---|
| `POST /api/contact` | `messages.submit(body)` | 匿名；带 IP 限流 + 字段校验 |
| `GET /api/messages` | `messages.list({ page, limit })` | 需 admin |
| `PUT /api/messages/[id]` | `messages.markRead(id, { is_read })` | 需 admin |
| `DELETE /api/messages/[id]` | `messages.remove(id)` | 需 admin |
| `DELETE /api/messages/batch` | `messages.batchDelete({ ids })` | 需 admin |
| `PUT /api/messages/batch` | `messages.batchMarkRead({ ids, action })` | mark_read / mark_all_read |

### media / folders / upload

云存储没有"目录"概念，统一用 `media_files` / `media_folders` 两张元数据表。上传由前端直传，落库由 `media.register` 完成。

| 原 API | 云对象方法 | 备注 |
|---|---|---|
| `GET /api/media` | `media.list({ folder, page, limit, search, type })` | search/type 触发全局搜索 |
| `POST /api/upload` | `uniCloud.uploadFile()` + `media.register({ fileID, name, type, size, folderPath })` | 见下方"上传流程" |
| `PUT /api/media/[...path]` | `media.rename(id, { newName, targetFolder })` |  |
| `POST /api/media/copy` | `media.copy({ ids, targetFolder })` | 复制元数据记录，复用同一 fileID |
| —（原无） | `media.remove(id)` | 删除文件 + 按引用计数清理云存储 |
| `POST /api/folders` | `folders.create({ path })` | 自动建中间层 |
| `PUT /api/folders/[...path]` | `folders.rename(id, { newName })` | 级联更新子树和文件 folderPath |
| `DELETE /api/folders/[...path]?force=true` | `folders.remove(id, { force })` | 强制删除时递归 + 按引用计数清理 |

**上传流程**（前端三步走）：

```js
// 1. 浏览器端先做压缩 / 大小校验（参考 site_content.video_max_size）
const file = await compressImage(rawFile, { maxWidth: 1920, format: 'webp' })

// 2. 直传云存储，绕过云函数 body size 限制
const { fileID } = await uniCloud.uploadFile({
  cloudPath: `media/${folderPath ? folderPath + '/' : ''}${Date.now()}-${file.name}`,
  filePath: file,
})

// 3. 落库：让后端关联到 media_files
await uniCloud.importObject('media').register({
  fileID, name: file.name, type: 'image', size: file.size, folderPath,
})
```

**图片缩略图**：原本由 sharp 转 webp。云上改为按需用 `vendor-adapter.buildImageProcessURL(url, { width: 600 })` 生成处理后 URL，三朵云走各自的 image processing 服务。

### auth

| 原 API | 云对象方法 | 备注 |
|---|---|---|
| `POST /api/auth/login` | `uni-id-co.login({ username, password, captcha })` | 官方实现 |
| `GET /api/auth/captcha` | `uni-id-co.getImgCaptcha({ scene: 'login-by-pwd-username' })` | 官方实现 |
| `GET /api/auth/login-status` | —— | 由 uni-id 的密码错误次数自动控制 |
| `GET /api/auth/me` | `uni-id-co.checkToken()` | 客户端 token 自动注入到请求头 |
| `PUT /api/auth/account` | `admin.updateAccount({ currentPassword, newUsername, newPassword })` |  |
| `GET /api/auth/users` | `admin.listAdmins()` |  |
| `POST /api/auth/users` | `admin.createAdmin({ username, password })` |  |
| `DELETE /api/auth/users/[id]` | `admin.removeAdmin(id)` |  |

### stats / admin

| 原 API | 云对象方法 | 备注 |
|---|---|---|
| `GET /api/stats` | `stats.summary()` | 4 个集合并发计数 |
| `GET /api/admin/verify-key?key=...` | `stats.verifyAccessKey(key)` | 未配置入口 key 时永远返回 valid |

## 鉴权与请求头

所有"需 admin"的方法都通过 `cloudfunctions/common/auth-guard/index.js#requireAdmin(this)` 校验，由 `uni-id-common.checkToken()` 读取请求头 `uni-id-token` 解析。

前端只需在 manifest.json 配置好 uni-id，token 会自动注入：

```js
// pages.json 或运行时
uniCloud.importObject('products', {
  customUI: false,
  errorOptions: { type: 'toast' },
}).list(...)
```

`requireAdmin` 进一步要求 token 解出的 `role` 包含 `'admin'`，否则报 `AUTH_REQUIRED`。普通用户（如果以后引入）不会通过。

