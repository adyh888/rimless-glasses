<template>
  <div>
    <section class="pt-32 pb-16 bg-surface">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <h1 class="text-4xl md:text-5xl font-light tracking-tight text-primary">联系我们</h1>
        <p class="mt-4 text-secondary">期待与您的每一次对话</p>
      </div>
    </section>

    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <!-- Form -->
          <ScrollReveal>
            <h2 class="text-2xl font-light text-primary mb-8">发送留言</h2>
            <form @submit.prevent="submitForm" class="space-y-6">
              <div>
                <label class="block text-sm text-secondary mb-2">姓名 *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-accent focus:outline-none transition-colors text-sm"
                  placeholder="请输入您的姓名"
                />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm text-secondary mb-2">邮箱 <span class="text-xs text-gray-400">（邮箱和电话至少填一项）</span></label>
                  <input
                    v-model="form.email"
                    type="email"
                    class="w-full px-4 py-3 border rounded-lg focus:border-accent focus:outline-none transition-colors text-sm"
                    :class="contactError ? 'border-red-300' : 'border-gray-200'"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label class="block text-sm text-secondary mb-2">电话 <span class="text-xs text-gray-400">（邮箱和电话至少填一项）</span></label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="w-full px-4 py-3 border rounded-lg focus:border-accent focus:outline-none transition-colors text-sm"
                    :class="contactError ? 'border-red-300' : 'border-gray-200'"
                    placeholder="138-0000-0000"
                  />
                </div>
              </div>
              <p v-if="contactError" class="text-red-500 text-xs -mt-4">请至少填写邮箱或电话其中一项</p>
              <div>
                <label class="block text-sm text-secondary mb-2">留言内容 *</label>
                <textarea
                  v-model="form.message"
                  required
                  rows="5"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-accent focus:outline-none transition-colors text-sm resize-none"
                  placeholder="请输入您的留言..."
                />
              </div>
              <button
                type="submit"
                :disabled="submitting"
                class="px-8 py-3 bg-primary text-white text-sm tracking-wider hover:bg-primary/90 transition-all duration-300 disabled:opacity-50"
              >
                {{ submitting ? '发送中...' : '发送留言' }}
              </button>
              <p v-if="submitSuccess" class="text-green-600 text-sm">{{ submitSuccess }}</p>
              <p v-if="submitError" class="text-red-600 text-sm">{{ submitError }}</p>
            </form>
          </ScrollReveal>

          <!-- Contact Info -->
          <ScrollReveal :delay="200">
            <h2 class="text-2xl font-light text-primary mb-8">联系方式</h2>
            <div class="space-y-8">
              <div v-for="info in contactInfo.items" :key="info.label">
                <h3 class="text-sm font-medium text-primary">{{ info.label }}</h3>
                <p class="mt-1 text-secondary">{{ info.value }}</p>
              </div>
            </div>

            <div v-if="contactInfo.hours.length" class="mt-12 p-8 bg-surface rounded-2xl">
              <h3 class="text-sm font-medium text-primary mb-2">营业时间</h3>
              <p v-for="(line, idx) in contactInfo.hours" :key="idx" class="text-secondary text-sm">
                {{ line }}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const form = reactive({ name: '', email: '', phone: '', message: '' })
const submitting = ref(false)
const submitSuccess = ref('')
const submitError = ref('')
const contactError = computed(() => !form.email && !form.phone && formTouched.value)
const formTouched = ref(false)

const contactInfoRef = await useContactInfo()
const contactInfo = computed(() => contactInfoRef.value)

const brandRef = await useBrandName()
const siteName = computed(() => brandRef.value.primary + brandRef.value.accent)

async function submitForm() {
  formTouched.value = true
  if (!form.email && !form.phone) return
  submitting.value = true
  submitSuccess.value = ''
  submitError.value = ''
  try {
    const res = await $fetch<any>('/api/contact', { method: 'POST', body: form })
    submitSuccess.value = res.message
    form.name = ''
    form.email = ''
    form.phone = ''
    form.message = ''
    formTouched.value = false
  } catch (e: any) {
    submitError.value = e?.data?.statusMessage || '发送失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

useHead({ title: computed(() => `联系我们 - ${siteName.value}`) })
</script>
