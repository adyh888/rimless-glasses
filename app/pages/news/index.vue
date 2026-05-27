<template>
  <div>
    <section class="pt-32 pb-16 bg-surface">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <h1 class="text-4xl md:text-5xl font-light tracking-tight text-primary">新闻动态</h1>
        <p class="mt-4 text-secondary">{{ pageSubtitle }}</p>
      </div>
    </section>

    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div v-if="articles.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ScrollReveal
            v-for="(article, idx) in articles"
            :key="article.id"
            :delay="idx * 80"
          >
            <NuxtLink :to="`/news/${article.slug}`" class="group block">
              <div class="overflow-hidden rounded-xl aspect-[16/10] bg-surface">
                <img
                  :src="article.cover_image || 'https://via.placeholder.com/600x375'"
                  :alt="article.title"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div class="mt-5">
                <p class="text-xs text-secondary">{{ formatDate(article.created_at) }}</p>
                <h3 class="mt-2 text-lg font-medium text-primary group-hover:text-accent transition-colors line-clamp-2">
                  {{ article.title }}
                </h3>
                <p class="mt-2 text-sm text-secondary line-clamp-2">{{ article.summary }}</p>
              </div>
            </NuxtLink>
          </ScrollReveal>
        </div>
        <div v-else class="text-center py-20 text-secondary">暂无文章</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { data } = await useFetch('/api/articles', { query: { published_only: 'true' } })
const articles = computed(() => (data.value as any)?.items || [])

const brandRef = await useBrandName()
const siteName = computed(() => brandRef.value.primary + brandRef.value.accent)

const navRef = await useNavItems()
const pageSubtitle = computed(() => {
  const item = navRef.value.find(n => n.path === '/news')
  return item?.subtitle || `了解${siteName.value}的最新资讯与行业洞察`
})

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

useHead({ title: computed(() => `新闻动态 - ${siteName.value}`) })
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
