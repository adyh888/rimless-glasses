<template>
  <view v-if="accessDenied" class="not-found">
    <text class="nf-code">404</text>
    <text class="nf-text">页面不存在</text>
    <text class="nf-link" @tap="goHome">返回首页</text>
  </view>

  <view v-else class="login-page">
    <view class="login-shell">
      <view class="login-header">
        <text class="eyebrow">ADMIN</text>
        <view class="brand">
          <text class="brand-primary">{{ brand.primary }}</text><text class="brand-accent">{{ brand.accent }}</text>
        </view>
        <text class="subtitle">管理后台</text>
      </view>

      <view class="form">
        <view class="field">
          <text class="label">用户名</text>
          <input class="input" v-model="form.username" placeholder="请输入用户名" placeholder-class="ph" />
        </view>
        <view class="field">
          <text class="label">密码</text>
          <input class="input" v-model="form.password" password placeholder="请输入密码" placeholder-class="ph" />
        </view>
        <view v-if="captchaRequired" class="field">
          <text class="label">验证码</text>
          <view class="captcha-row">
            <input class="input captcha-input" v-model="form.captcha" maxlength="4" placeholder="请输入图中字符" placeholder-class="ph" />
            <image
              v-if="captchaSrc"
              class="captcha-img"
              :src="captchaSrc"
              mode="aspectFit"
              @tap="refreshCaptcha"
            />
            <view v-else class="captcha-placeholder" @tap="refreshCaptcha">点击加载</view>
          </view>
        </view>

        <text v-if="error" class="error">{{ error }}</text>

        <button class="submit" :disabled="loading" @tap="handleLogin">
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </view>

      <view class="login-footer">
        <text class="back-link" @tap="goHome">← 返回首页</text>
      </view>
    </view>

    <text class="copyright">© {{ year }} {{ brand.primary }}{{ brand.accent }}</text>
  </view>
</template>

<script>
import { cloud, showErr } from '@/utils/cloud.js'

// 解析 JWT payload。仅取角色等公开信息，不做签名校验（签名校验在服务端）。
function decodeJwtPayload (token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const json = decodeURIComponent(
      atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    )
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

export default {
  data () {
    return {
      brand: { primary: '清透', accent: '视界' },
      form: { username: '', password: '', captcha: '' },
      captchaRequired: false,
      captchaSrc: '',
      captchaOptions: null,
      loading: false,
      error: '',
      accessDenied: false,
      year: new Date().getFullYear(),
    }
  },
  onLoad (query) {
    this.bootstrap(query)
  },
  methods: {
    async bootstrap (query) {
      const keyFromUrl = query?.key
      const stored = uni.getStorageSync('admin_access_granted')
      const key = keyFromUrl || stored || ''
      try {
        const res = await cloud.stats.verifyAccessKey(key)
        if (!res?.valid) {
          this.accessDenied = true
          return
        }
        if (keyFromUrl) {
          uni.setStorageSync('admin_access_granted', keyFromUrl)
        }
      } catch (e) {
        this.accessDenied = true
        return
      }
      if (uni.getStorageSync('uni_id_token')) {
        uni.reLaunch({ url: '/pages/admin/index/index' })
        return
      }
      // uni-id 配置 login: ["password:username"]，密码登录强制验证码，进页面就先拿一张
      this.captchaRequired = true
      this.refreshCaptcha()
    },

    async refreshCaptcha () {
      try {
        const co = uniCloud.importObject('uni-captcha-co', { customUI: true })
        const res = await co.getImageCaptcha({ scene: 'login-by-pwd' })
        this.captchaSrc = res.captchaBase64 || ''
      } catch (e) {
        showErr(e, '验证码加载失败')
      }
    },

    goHome () {
      uni.reLaunch({ url: '/pages/index/index' })
    },

    async handleLogin () {
      if (!this.form.username || !this.form.password) {
        this.error = '请填写用户名和密码'
        return
      }
      if (this.captchaRequired && !this.form.captcha) {
        this.error = '请输入图形验证码'
        return
      }
      this.loading = true
      this.error = ''
      try {
        const co = uniCloud.importObject('uni-id-co', { customUI: true })
        const params = {
          username: this.form.username,
          password: this.form.password,
        }
        if (this.captchaRequired) {
          params.captcha = this.form.captcha
        }
        const res = await co.login(params)
        const token = res?.newToken?.token || res?.token || ''
        const tokenExpired = res?.newToken?.tokenExpired || res?.tokenExpired || 0
        const payload = decodeJwtPayload(token)
        const roles = payload?.role || res?.userInfo?.role || []
        if (!roles.includes('admin')) {
          this.error = '该账号无后台访问权限'
          try {
            uni.removeStorageSync('uni_id_token')
            uni.removeStorageSync('uni_id_token_expired')
          } catch (e) {}
          return
        }
        if (token) {
          uni.setStorageSync('uni_id_token', token)
          uni.setStorageSync('uni_id_token_expired', tokenExpired)
        }
        uni.reLaunch({ url: '/pages/admin/index/index' })
      } catch (e) {
        const errMsg = String(e?.errMsg || e?.message || '')
        const errCode = String(e?.errCode || e?.code || '')
        const needCaptcha = e?.needCaptcha || /captcha|验证码/i.test(errMsg) || /captcha/i.test(errCode)
        if (needCaptcha) {
          this.captchaRequired = true
          this.form.captcha = ''
          this.refreshCaptcha()
        }
        this.error = errMsg || '登录失败'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style>
page { background: #f7f6f3; }

.login-page {
  min-height: 100vh;
  background: #f7f6f3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  position: relative;
}

.login-shell {
  width: 100%;
  max-width: 440px;
  background: #fff;
  padding: 64px 56px 48px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 8px 32px rgba(31, 41, 55, 0.04);
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 48px;
}
.eyebrow {
  font-size: 11px;
  color: #c8a464;
  letter-spacing: 4px;
  text-transform: uppercase;
}
.brand {
  display: flex;
  font-size: 34px;
  font-weight: 300;
  letter-spacing: -0.5px;
  line-height: 1.1;
}
.brand-primary { color: #1f2937; }
.brand-accent { color: #c8a464; }
.subtitle {
  font-size: 13px;
  color: #6b7280;
  letter-spacing: 2px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.field {
  display: flex;
  flex-direction: column;
}
.label {
  font-size: 12px;
  color: #6b7280;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}
.input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid #e5e7eb;
  border-radius: 2px;
  font-size: 14px;
  color: #1f2937;
  background: #fff;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.input:focus {
  border-color: #1f2937;
  outline: none;
}
.ph { color: #9ca3af; font-size: 14px; }

.captcha-row {
  display: flex;
  align-items: stretch;
  gap: 12px;
}
.captcha-input { flex: 1; }
.captcha-img,
.captcha-placeholder {
  width: 130px;
  height: 48px;
  border: 1px solid #e5e7eb;
  border-radius: 2px;
  background: #fafafa;
  flex-shrink: 0;
}
.captcha-placeholder {
  line-height: 48px;
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  letter-spacing: 1px;
}

.error {
  color: #dc2626;
  font-size: 12px;
  margin-top: -4px;
  letter-spacing: 0.5px;
}

.submit {
  margin-top: 12px;
  height: 52px;
  line-height: 52px;
  padding: 0;
  background: #1f2937;
  color: #fff;
  font-size: 13px;
  letter-spacing: 4px;
  border: none;
  border-radius: 0;
}
.submit:active { background: #111827; }
.submit[disabled] {
  background: #1f2937;
  opacity: 0.4;
  color: #fff;
}

.login-footer {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid #f3f4f6;
  text-align: center;
}
.back-link {
  font-size: 12px;
  color: #6b7280;
  letter-spacing: 1.5px;
}

.copyright {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 11px;
  color: #9ca3af;
  letter-spacing: 1.5px;
}

.not-found {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.nf-code { font-size: 64px; color: #d1d5db; font-weight: 300; }
.nf-text { color: #6b7280; font-size: 13px; margin-top: 16px; }
.nf-link { color: #c8a464; font-size: 13px; margin-top: 24px; letter-spacing: 1px; }

@media (max-width: 480px) {
  .login-shell { padding: 48px 32px 40px; }
  .brand { font-size: 28px; }
  .login-page { padding: 24px 16px; }
  .copyright { position: static; margin-top: 32px; }
}
</style>
