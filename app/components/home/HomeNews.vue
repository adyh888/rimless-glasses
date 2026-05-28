<template>
  <section class="py-24 md:py-32 bg-white">
    <div class="max-w-7xl mx-auto px-6">
      <ScrollReveal>
        <SectionTitle :title="displayTitle" :subtitle="displaySubtitle" />
      </ScrollReveal>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ScrollReveal
          v-for="(article, idx) in latestArticles"
          :key="article.id"
          :delay="idx * 100"
        >
          <NuxtLink :to="`/news/${article.slug}`" class="group block">
            <div class="overflow-hidden rounded-xl aspect-[16/10]">
              <img
                :src="article.cover_image || 'https://via.placeholder.com/600x375'"
                :alt="article.title"
                loading="lazy"
                decoding="async"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div class="mt-4">
              <p class="text-xs text-secondary">{{ formatDate(article.created_at) }}</p>
              <h3 class="mt-1 text-base font-medium text-primary group-hover:text-accent transition-colors line-clamp-2">
                {{ article.title }}
              </h3>
              <p class="mt-2 text-sm text-secondary line-clamp-2">{{ article.summary }}</p>
            </div>
          </NuxtLink>
        </ScrollReveal>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  subtitle: string
  limit: number
}>(), {
  title: '',
  subtitle: '',
  limit: 3,
})

const { data: articlesData } = await useFetch('/api/articles', {
  query: { published_only: 'true', limit: props.limit },
})
const latestArticles = computed(() => (articlesData.value as any)?.items || [])

const navRef = await useNavItems()
const brandRef = await useBrandName()
const siteName = computed(() => brandRef.value.primary + brandRef.value.accent)

const displayTitle = computed(() => {
  if (props.title) return props.title
  return navRef.value.find(n => n.path === '/news')?.label || '新闻动态'
})
const displaySubtitle = computed(() => {
  if (props.subtitle) return props.subtitle
  return navRef.value.find(n => n.path === '/news')?.subtitle || `了解${siteName.value}的最新资讯`
})

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
