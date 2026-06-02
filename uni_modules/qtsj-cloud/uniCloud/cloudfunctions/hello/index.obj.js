// 阶段 0 验收用云对象。
// 在 HBuilderX 把本目录所在的 uni_modules 关联到三家服务空间后，
// 分别 URL 化后访问：POST {域名}/hello/ping
// 预期返回 { ok: true, vendor, ts }

const { VENDOR } = require('vendor-adapter')

module.exports = {
  async ping () {
    return { ok: true, vendor: VENDOR, ts: Date.now() }
  },

  async echo (payload) {
    return { ok: true, vendor: VENDOR, payload }
  },
}
