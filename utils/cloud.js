// uniCloud 业务对象的客户端封装：
// - 统一把 token 注入到请求（uni-id-co 自带）
// - 统一错误提示
// - 所有云对象通过 cloud.<name>.<method>(...) 调用，避免散落的 importObject

const importedCache = {}

function obj (name) {
  if (!importedCache[name]) {
    importedCache[name] = uniCloud.importObject(name, {
      customUI: true,
      // 让 errCode != 0 的响应直接抛出，业务侧 try/catch
      // 同时屏蔽 uni-app 自带的弹窗，由调用方决定如何提示
    })
  }
  return importedCache[name]
}

export const cloud = new Proxy({}, {
  get (_, name) {
    return obj(name)
  },
})

export function ensureLogin (page = '/pages/admin/login/index') {
  const token = uni.getStorageSync('uni_id_token')
  if (!token) {
    uni.reLaunch({ url: page })
    return false
  }
  return true
}

export function logout (redirect = '/pages/admin/login/index') {
  try {
    uni.removeStorageSync('uni_id_token')
    uni.removeStorageSync('uni_id_token_expired')
    uni.removeStorageSync('uni-id-pages-userInfo')
  } catch (e) {}
  uni.reLaunch({ url: redirect })
}

export function showErr (e, fallback = '操作失败') {
  const msg = e?.errMsg || e?.message || fallback
  uni.showToast({ icon: 'none', title: String(msg).slice(0, 80) })
}
