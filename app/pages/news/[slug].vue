<template>
  <div v-if="article">
    <section class="pt-28 bg-white">
      <div class="max-w-3xl mx-auto px-6">
        <nav class="text-sm text-secondary mb-8">
          <NuxtLink to="/" class="hover:text-primary">首页</NuxtLink>
          <span class="mx-2">/</span>
          <NuxtLink to="/news" class="hover:text-primary">新闻动态</NuxtLink>
          <span class="mx-2">/</span>
          <span class="text-primary">{{ article.title }}</span>
        </nav>
      </div>
    </section>

    <!-- Cover -->
    <section v-if="article.cover_image" class="pb-8 bg-white">
      <div class="max-w-4xl mx-auto px-6">
        <img
          :src="article.cover_image"
          :alt="article.title"
          class="w-full rounded-2xl object-cover max-h-[480px]"
        />
      </div>
    </section>

    <!-- Article Content -->
    <section class="py-12 bg-white">
      <div class="max-w-3xl mx-auto px-6">
        <h1 class="text-3xl md:text-4xl font-light tracking-tight text-primary leading-snug">
          {{ article.title }}
        </h1>
        <p class="mt-4 text-sm text-secondary">{{ formatDate(article.created_at) }}</p>
        <div class="mt-10 prose-content" v-html="article.content" />

        <div class="mt-16 pt-8 border-t border-gray-100">
          <NuxtLink
            to="/news"
            class="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            返回新闻列表
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data } = await useFetch('/api/articles', {
  query: { slug: route.params.slug },
})
const article = computed(() => data.value as any)

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

useHead({
  title: computed(() => article.value ? `${article.value.title} - 清透视界` : '新闻详情 - 清透视界'),
})
</script>
