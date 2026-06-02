<template>
  <site-layout>
    <view class="hero">
      <view class="hero-inner">
        <text class="page-title">{{ pageTitle }}</text>
        <text class="page-subtitle">{{ pageSubtitle }}</text>
      </view>
    </view>

    <view class="main">
      <view class="main-inner">
        <view class="grid">
          <!-- Form -->
          <view class="form-col">
            <text class="col-title">发送留言</text>
            <view class="field">
              <text class="label">姓名 *</text>
              <input
                class="input"
                :class="{ error: nameError }"
                v-model="form.name"
                placeholder="请输入您的姓名"
                @blur="validateName"
              />
              <text v-if="nameError" class="err">{{ nameError }}</text>
            </view>

            <view class="grid-2">
              <view class="field">
                <text class="label">邮箱<text class="hint">（邮箱和电话至少填一项）</text></text>
                <input
                  class="input"
                  :class="{ error: contactError || emailError }"
                  v-model="form.email"
                  placeholder="your@email.com"
                  @blur="validateEmail"
                />
                <text v-if="emailError" class="err">{{ emailError }}</text>
              </view>
              <view class="field">
                <text class="label">电话<text class="hint">（邮箱和电话至少填一项）</text></text>
                <input
                  class="input"
                  :class="{ error: contactError || phoneError }"
                  v-model="form.phone"
                  type="number"
                  placeholder="138-0000-0000"
                  @blur="validatePhone"
                />
                <text v-if="phoneError" class="err">{{ phoneError }}</text>
              </view>
            </view>
            <text v-if="contactError" class="err contact-err">请至少填写邮箱或电话其中一项</text>

            <view class="field">
              <view class="label-row">
                <text class="label">留言内容 *</text>
                <text class="counter">{{ form.message.length }} / {{ rules.message.maxLength }}</text>
              </view>
              <textarea
                class="textarea"
                :class="{ error: messageError }"
                v-model="form.message"
                placeholder="请输入您的留言..."
                @blur="validateMessage"
              />
              <text v-if="messageError" class="err">{{ messageError }}</text>
            </view>

            <button class="submit" :disabled="submitting" @tap="submitForm">{{ submitting ? '发送中...' : '发送留言' }}</button>
            <text v-if="submitSuccess" class="success">{{ submitSuccess }}</text>
            <text v-if="submitError" class="err">{{ submitError }}</text>
          </view>

          <!-- Contact info -->
          <view class="info-col">
            <text class="col-title">联系方式</text>
            <view v-for="info in contactInfo.items" :key="info.label" class="info-row">
              <text class="info-label">{{ info.label }}</text>
              <text class="info-value">{{ info.value }}</text>
            </view>

            <view v-if="activeSocialLinks.length" class="social">
              <text class="col-title small">社交媒体</text>
              <view v-for="link in activeSocialLinks" :key="link.platform" class="social-row">
                <view class="social-icon">
                  <text class="social-icon-text">{{ link.icon || '🔗' }}</text>
                </view>
                <view class="social-text">
                  <text class="social-label">{{ link.label }}</text>
                  <text v-if="link.value" class="social-value">{{ link.value }}</text>
                  <image
                    v-if="link.qrcode"
                    class="qr"
                    :src="link.qrcode"
                    mode="aspectFit"
                    @tap="openQrPreview(link.qrcode, link.label)"
                  />
                </view>
              </view>
            </view>

            <view v-if="contactInfo.hours.length" class="hours">
              <text class="col-title small">营业时间</text>
              <text v-for="(line, i) in contactInfo.hours" :key="i" class="hours-line">{{ line }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- QR preview -->
    <view v-if="qrPreview.show" class="lightbox" @tap="qrPreview.show = false">
      <text class="lb-close" @tap.stop="qrPreview.show = false">×</text>
      <view class="lb-content" @tap.stop>
        <image class="lb-img" :src="qrPreview.src" mode="aspectFit" />
        <text class="lb-label">{{ qrPreview.label }}</text>
      </view>
    </view>
  </site-layout>
</template>

<script>
import SiteLayout from '@/components/site-layout/site-layout.vue'
import { cloud } from '@/utils/cloud.js'
import {
  getContactInfo, getSocialLinks, getContactValidation,
  getNavItems, getBrandName,
} from '@/utils/site-settings.js'

export default {
  components: { SiteLayout },
  data () {
    return {
      form: { name: '', email: '', phone: '', message: '' },
      submitting: false,
      submitSuccess: '',
      submitError: '',
      formTouched: false,
      nameError: '',
      emailError: '',
      phoneError: '',
      messageError: '',
      rules: {
        name: { minLength: 2, maxLength: 20 },
        email: { enabled: true, pattern: '' },
        phone: { enabled: true, pattern: '', minLength: 7, maxLength: 20 },
        message: { minLength: 10, maxLength: 500 },
      },
      contactInfo: { items: [], hours: [] },
      socialLinks: [],
      navItems: [],
      brand: { primary: '清透', accent: '视界' },
      qrPreview: { show: false, src: '', label: '' },
    }
  },
  computed: {
    contactError () { return this.formTouched && !this.form.email && !this.form.phone },
    activeSocialLinks () { return (this.socialLinks || []).filter(l => l.is_active) },
    navItem () { return this.navItems.find(n => n.path === '/contact') },
    pageTitle () { return this.navItem?.label || '联系我们' },
    pageSubtitle () { return this.navItem?.subtitle || '期待与您的每一次对话' },
    siteName () { return this.brand.primary + this.brand.accent },
  },
  async onLoad () {
    const [info, links, rules, nav, brand] = await Promise.all([
      getContactInfo(), getSocialLinks(), getContactValidation(),
      getNavItems(), getBrandName(),
    ])
    this.contactInfo = info
    this.socialLinks = links
    this.rules = { ...this.rules, ...rules }
    this.navItems = nav
    this.brand = brand
    uni.setNavigationBarTitle({ title: `${this.pageTitle} - ${this.siteName}` })
  },
  methods: {
    validateName () {
      this.nameError = ''
      if (!this.form.name) return true
      const r = this.rules.name || {}
      const min = r.minLength ?? 2
      const max = r.maxLength ?? 20
      if (this.form.name.length < min) { this.nameError = `姓名至少需要 ${min} 个字符`; return false }
      if (this.form.name.length > max) { this.nameError = `姓名不能超过 ${max} 个字符`; return false }
      return true
    },
    validateEmail () {
      this.emailError = ''
      if (!this.form.email) return true
      if (this.rules.email?.enabled) {
        const pattern = this.rules.email.pattern || '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
        if (!new RegExp(pattern).test(this.form.email)) { this.emailError = '邮箱格式不正确'; return false }
      }
      return true
    },
    validatePhone () {
      this.phoneError = ''
      if (!this.form.phone) return true
      const p = this.rules.phone || {}
      if (p.enabled) {
        const pattern = p.pattern || '^1[3-9]\\d{9}$|^0\\d{2,3}-?\\d{7,8}$'
        if (!new RegExp(pattern).test(this.form.phone)) { this.phoneError = '电话格式不正确（支持手机号或固定电话）'; return false }
        const digits = this.form.phone.replace(/[^0-9]/g, '').length
        if (digits < (p.minLength ?? 7) || digits > (p.maxLength ?? 20)) {
          this.phoneError = `电话长度应在 ${p.minLength ?? 7} 到 ${p.maxLength ?? 20} 位之间`
          return false
        }
      }
      return true
    },
    validateMessage () {
      this.messageError = ''
      if (!this.form.message) return true
      const r = this.rules.message || {}
      if (this.form.message.length < (r.minLength ?? 10)) { this.messageError = `留言内容至少需要 ${r.minLength ?? 10} 个字符`; return false }
      if (this.form.message.length > (r.maxLength ?? 500)) { this.messageError = `留言内容不能超过 ${r.maxLength ?? 500} 个字符`; return false }
      return true
    },
    async submitForm () {
      this.formTouched = true
      this.nameError = this.emailError = this.phoneError = this.messageError = ''
      if (!this.form.email && !this.form.phone) return
      const ok = [this.validateName(), this.validateEmail(), this.validatePhone(), this.validateMessage()].every(Boolean)
      if (!this.form.name.trim()) { this.nameError = '姓名不能为空'; return }
      if (!this.form.message.trim()) { this.messageError = '留言内容不能为空'; return }
      if (!ok) return

      this.submitting = true
      this.submitSuccess = ''
      this.submitError = ''
      try {
        const res = await cloud.messages.submit({
          name: this.form.name,
          email: this.form.email,
          phone: this.form.phone,
          message: this.form.message,
        })
        this.submitSuccess = res?.message || '留言已提交，我们会尽快与您联系'
        this.form = { name: '', email: '', phone: '', message: '' }
        this.formTouched = false
      } catch (e) {
        this.submitError = e?.errMsg || e?.message || '发送失败，请稍后重试'
      } finally {
        this.submitting = false
      }
    },
    openQrPreview (src, label) {
      this.qrPreview = { show: true, src, label }
    },
  },
}
</script>

<style>
page { background: #fff; }

.hero { background: #f7f6f3; padding: 128px 0 64px; }
.hero-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; text-align: center; display: flex; flex-direction: column; gap: 16px; align-items: center; }
.page-title { font-size: 44px; font-weight: 300; letter-spacing: -0.5px; color: #1f2937; }
.page-subtitle { font-size: 14px; color: #6b7280; }

.main { padding: 64px 0; background: #fff; }
.main-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }

.col-title { font-size: 22px; font-weight: 300; color: #1f2937; margin-bottom: 32px; display: block; }
.col-title.small { font-size: 14px; font-weight: 500; margin-bottom: 16px; }

.field { margin-bottom: 24px; display: flex; flex-direction: column; }
.label-row { display: flex; justify-content: space-between; align-items: center; }
.label { font-size: 13px; color: #6b7280; margin-bottom: 8px; }
.hint { font-size: 11px; color: #9ca3af; }
.counter { font-size: 11px; color: #9ca3af; }
.input { width: 100%; padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: #fff; box-sizing: border-box; }
.input.error { border-color: #fca5a5; }
.textarea { width: 100%; min-height: 140px; padding: 14px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: #fff; box-sizing: border-box; }
.textarea.error { border-color: #fca5a5; }
.err { font-size: 12px; color: #dc2626; margin-top: 4px; }
.contact-err { margin-top: -16px; margin-bottom: 16px; }
.success { font-size: 13px; color: #16a34a; margin-top: 8px; display: block; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.submit { background: #1f2937; color: #fff; font-size: 13px; letter-spacing: 1.5px; height: 44px; line-height: 44px; padding: 0 32px; border-radius: 0; align-self: flex-start; display: inline-block; margin-top: 8px; }
.submit:disabled { opacity: 0.5; }

.info-col { display: flex; flex-direction: column; }
.info-row { margin-bottom: 24px; display: flex; flex-direction: column; gap: 4px; }
.info-label { font-size: 13px; font-weight: 500; color: #1f2937; }
.info-value { font-size: 14px; color: #6b7280; }

.social { margin-top: 32px; }
.social-row { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
.social-icon { width: 40px; height: 40px; border-radius: 50%; background: #f7f6f3; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.social-icon-text { font-size: 18px; }
.social-text { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.social-label { font-size: 13px; font-weight: 500; color: #1f2937; }
.social-value { font-size: 13px; color: #6b7280; }
.qr { width: 112px; height: 112px; border-radius: 8px; border: 1px solid #f3f4f6; background: #fff; margin-top: 8px; }

.hours { margin-top: 32px; padding: 32px; background: #f7f6f3; border-radius: 16px; }
.hours-line { display: block; font-size: 13px; color: #6b7280; line-height: 1.9; }

.lightbox { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; }
.lb-close { position: absolute; top: 16px; right: 16px; color: rgba(255,255,255,0.7); font-size: 32px; padding: 8px 16px; }
.lb-content { text-align: center; display: flex; flex-direction: column; align-items: center; }
.lb-img { max-width: 85vw; max-height: 75vh; border-radius: 8px; }
.lb-label { color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 16px; }

@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr; gap: 48px; }
  .grid-2 { grid-template-columns: 1fr; }
  .page-title { font-size: 28px; }
  .hero { padding: 96px 0 48px; }
}
</style>
