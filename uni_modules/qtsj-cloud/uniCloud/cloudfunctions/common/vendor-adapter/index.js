// 三云差异抽象层：fileID URL、cloudPath、cron、上传凭证
// 所有业务云对象只通过本模块访问云存储/定时器相关 API，便于切换云厂商。

const VENDOR = process.env.UNICLOUD_PROVIDER || detectVendor()

function detectVendor () {
  if (typeof uniCloud === 'undefined') return 'aliyun'
  const space = (typeof uniCloud.getCurrentCloudInfos === 'function' && uniCloud.getCurrentCloudInfos())
  if (space && space[0] && space[0].provider) return space[0].provider
  return 'aliyun'
}

// 把云存储 fileID 转成可直接 <img src> 用的 HTTPS URL。
// aliyun 直返；tcb/alipay 需要 getTempFileURL。
async function resolveFileURL (fileIDOrList) {
  const list = Array.isArray(fileIDOrList) ? fileIDOrList : [fileIDOrList]
  if (VENDOR === 'aliyun') {
    return Array.isArray(fileIDOrList) ? list : list[0]
  }
  const res = await uniCloud.getTempFileURL({ fileList: list })
  const urls = (res.fileList || []).map(f => f.tempFileURL || f.fileID)
  return Array.isArray(fileIDOrList) ? urls : urls[0]
}

// 统一构造云存储 cloudPath。aliyun 需要 cloudPathAsRealPath 才支持目录前缀。
function buildCloudPath (folder, filename) {
  const safeFolder = (folder || '').replace(/^\/+|\/+$/g, '')
  const safeName = filename.replace(/^\/+/, '')
  return safeFolder ? `${safeFolder}/${safeName}` : safeName
}

// 把 5/6/7 位 cron 规范化为各云能识别的形式。
// 调用方传 6 位标准 cron（秒 分 时 日 月 周）。
function normalizeCron (expr) {
  const parts = String(expr).trim().split(/\s+/)
  if (parts.length === 5) parts.unshift('0')       // 补秒
  if (parts.length === 6 && VENDOR === 'tcb') parts.push('*') // tcb 7 位（追加年）
  if (parts.length === 7 && VENDOR !== 'tcb') parts.pop()     // 非 tcb 去掉年
  return parts.join(' ')
}

// 上传图片到云存储（云函数侧）
async function uploadFile ({ cloudPath, fileBuffer, contentType }) {
  const params = { cloudPath, fileContent: fileBuffer }
  if (contentType) params.contentType = contentType
  if (VENDOR === 'aliyun') params.cloudPathAsRealPath = true
  const res = await uniCloud.uploadFile(params)
  return {
    fileID: res.fileID,
    url: await resolveFileURL(res.fileID),
  }
}

// 删除云存储对象
async function deleteFiles (fileIDs) {
  if (!fileIDs || fileIDs.length === 0) return
  await uniCloud.deleteFile({ fileList: Array.isArray(fileIDs) ? fileIDs : [fileIDs] })
}

// 拼接图片处理参数（缩放）
function buildImageProcessURL (url, { width, quality = 80 } = {}) {
  if (!url) return url
  if (VENDOR === 'tcb') {
    return `${url}${url.includes('?') ? '&' : '?'}imageMogr2/thumbnail/${width || ''}x/quality/${quality}`
  }
  // aliyun OSS / alipay 共用 x-oss-process
  return `${url}${url.includes('?') ? '&' : '?'}x-oss-process=image/resize,w_${width || 1920}/quality,Q_${quality}`
}

module.exports = {
  VENDOR,
  resolveFileURL,
  buildCloudPath,
  normalizeCron,
  uploadFile,
  deleteFiles,
  buildImageProcessURL,
}
