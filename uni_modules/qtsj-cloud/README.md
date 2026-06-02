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

## 后续阶段

业务云对象（products / articles / banners / messages / content / media / folders / upload / contact / stats）会陆续在 `cloudfunctions/` 下追加，每个对应原 Nuxt 项目中的一个 `server/api/<模块>/` 子目录。
