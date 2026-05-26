<template>
  <div>
    <section class="pt-32 pb-16 bg-surface">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <ScrollReveal>
          <p class="text-accent text-sm tracking-widest uppercase mb-4">ABOUT US</p>
          <h1 class="text-4xl md:text-5xl font-light tracking-tight text-primary">关于{{ siteName }}</h1>
          <p class="mt-4 text-secondary">以极简设计重新定义视觉体验</p>
        </ScrollReveal>
      </div>
    </section>

    <!-- Brand Image -->
    <section class="relative h-[50vh] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=1920&q=80"
        :alt="siteName"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black/20" />
    </section>

    <!-- Content -->
    <section class="py-24 bg-white">
      <div class="max-w-3xl mx-auto px-6">
        <ScrollReveal>
          <div class="prose-content" v-html="content" />
        </ScrollReveal>
      </div>
    </section>

    <!-- Values -->
    <section class="py-24 bg-surface">
      <div class="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <SectionTitle title="品牌价值" />
        </ScrollReveal>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <ScrollReveal v-for="(v, idx) in values" :key="idx" :delay="idx * 100">
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                <span class="text-2xl">{{ v.icon }}</span>
              </div>
              <h3 class="text-lg font-medium text-primary">{{ v.title }}</h3>
              <p class="mt-2 text-sm text-secondary leading-relaxed">{{ v.desc }}</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { data } = await useFetch('/api/content/about_us')
const content = computed(() => (data.value as any)?.content || '')

const brandRef = await useBrandName()
const siteName = computed(() => brandRef.value.primary + brandRef.value.accent)

const values = [
  { icon: '✦', title: '极简美学', desc: '摒弃一切多余的装饰，让设计回归本质。无框，即是最好的框。' },
  { icon: '◇', title: '匠心工艺', desc: '48道手工工序，每一副眼镜都是匠人心血的结晶。精益求精，不做妥协。' },
  { icon: '○', title: '科技创新', desc: '12项专利技术，航空级材料应用。以科技之力，实现极致轻盈。' },
]

useHead({ title: computed(() => `关于我们 - ${siteName.value}`) })
</script>
