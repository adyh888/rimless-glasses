export function useAuth() {
  const token = useCookie('admin_token', { maxAge: 60 * 60 * 24 * 7 })
  const user = useState<any>('auth_user', () => null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(username: string, password: string, captcha?: string) {
    const res = await $fetch<any>('/api/auth/login', {
      method: 'POST',
      body: { username, password, captcha },
    })
    token.value = res.token
    user.value = res.user
    return res
  }

  function logout() {
    token.value = null
    user.value = null
    navigateTo('/admin/login')
  }

  function authHeaders() {
    return { Authorization: `Bearer ${token.value}` }
  }

  async function authFetch<T = any>(url: string, opts: any = {}): Promise<T> {
    return $fetch<T>(url, {
      ...opts,
      headers: { ...opts.headers, ...authHeaders() },
    })
  }

  return { token, user, isAuthenticated, login, logout, authFetch, authHeaders }
}
