<template>
  <div>
    <template v-for="block in sections" :key="block.id">
      <HomeBanner v-if="block.type === 'banner'" />
      <HomeProducts
        v-else-if="block.type === 'products'"
        :title="block.title || '甄选系列'"
        :subtitle="block.subtitle || '每一副，都是对极简美学的致敬'"
        :limit="block.limit || 4"
      />
      <HomeImageText
        v-else-if="block.type === 'image_text'"
        :label="block.label || ''"
        :heading="block.heading || ''"
        :description="block.description || ''"
        :image="block.image || ''"
        :link-text="block.link_text || ''"
        :link-url="block.link_url || ''"
        :image-position="block.image_position || 'left'"
        :bg-color="block.bg_color || 'white'"
      />
      <HomeNews
        v-else-if="block.type === 'news'"
        :title="block.title || ''"
        :subtitle="block.subtitle || ''"
        :limit="block.limit || 3"
      />
      <HomeCta
        v-else-if="block.type === 'cta'"
        :heading="block.heading || ''"
        :subtitle="block.subtitle || ''"
        :link-text="block.link_text || ''"
        :link-url="block.link_url || ''"
        :bg-color="block.bg_color || 'surface'"
      />
      <HomeRichtext
        v-else-if="block.type === 'richtext'"
        :title="block.title || ''"
        :content="block.content || ''"
        :bg-color="block.bg_color || 'white'"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
const sectionsRef = await useHomepageSections()
const sections = computed(() => sectionsRef.value)

const brandRef = await useBrandName()
const siteName = computed(() => brandRef.value.primary + brandRef.value.accent)

useHead({ title: computed(() => siteName.value) })
</script>
