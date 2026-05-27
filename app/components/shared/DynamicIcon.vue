<template>
  <img v-if="isImage" :src="icon" :class="iconClass" class="object-contain" alt="" />
  <span v-else :class="iconClass">{{ icon }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  icon: string
  iconClass?: string
}>()

const isImage = computed(() =>
  !!props.icon && (props.icon.startsWith('/uploads/') || props.icon.startsWith('http'))
)
</script>
