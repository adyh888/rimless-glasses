<template>
  <div class="min-h-screen bg-surface flex items-center justify-center">
    <div class="w-full max-w-sm mx-4">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-light tracking-wider text-primary">{{ brand.primary }}<span class="text-accent">{{ brand.accent }}</span></h1>
        <p class="mt-2 text-sm text-secondary">管理后台</p>
      </div>

      <form @submit.prevent="handleLogin" class="bg-white rounded-2xl shadow-sm p-8 space-y-5">
        <div>
          <label class="block text-xs text-secondary mb-1.5">用户名</label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none transition-colors"
            placeholder="请输入用户名"
          />
        </div>
        <div>
          <label class="block text-xs text-secondary mb-1.5">密码</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none transition-colors"
            placeholder="请输入密码"
          />
        </div>
        <p v-if="error" class="text-red-500 text-xs">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const brandRef = await useBrandName()
const brand = computed(() => brandRef.value)

const { login } = useAuth()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await login(username.value, password.value)
    navigateTo('/admin')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
