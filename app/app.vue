<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const favicon = useFavicon()

useHead(computed(() => {
  if (!favicon.value) return {}
  return {
    link: [{ rel: 'icon', href: favicon.value }],
  }
}))
</script>
