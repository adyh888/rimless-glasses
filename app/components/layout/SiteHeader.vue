<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
    :class="scrolled ? 'glass shadow-sm' : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2 text-xl font-light tracking-wider">
        <img v-if="logo.show && logo.url" :src="logo.url" alt="Logo" class="h-8 w-auto object-contain" />
        <template v-else>
          <span class="text-primary">{{ brand.primary }}</span><span class="text-accent">{{ brand.accent }}</span>
        </template>
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-8">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="text-sm tracking-wide text-secondary hover:text-primary link-underline transition-colors duration-300"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <button class="md:hidden p-2" @click="mobileOpen = !mobileOpen">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <Transition name="slide-down">
      <div v-if="mobileOpen" class="md:hidden glass border-t border-white/10">
        <nav class="px-6 py-4 flex flex-col gap-4">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="text-sm tracking-wide text-secondary hover:text-primary transition-colors"
            @click="mobileOpen = false"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const brandRef = await useBrandName()
const brand = computed(() => brandRef.value)

const logoRef = await useSiteLogo()
const logo = computed(() => logoRef.value)

const navItemsRef = await useNavItems()
const navItems = computed(() => navItemsRef.value.filter(item => item.is_active))

const scrolled = ref(false)
const mobileOpen = ref(false)

onMounted(() => {
  window.addEventListener('scroll', () => {
    scrolled.value = window.scrollY > 50
  })
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
