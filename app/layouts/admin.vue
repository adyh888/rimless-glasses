<template>
  <div class="min-h-screen bg-gray-50 flex">
    <AdminSidebar />
    <div class="flex-1 ml-64">
      <header class="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
        <h2 class="text-sm text-secondary">管理后台</h2>
        <button @click="logout()" class="text-sm text-secondary hover:text-primary transition-colors">
          退出登录
        </button>
      </header>
      <main class="p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { logout } = useAuth()
</script>
