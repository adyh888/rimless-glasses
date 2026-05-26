<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: distance }"
    :visible-once="{ opacity: 1, y: 0, transition: { duration, delay } }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({
  distance: { type: Number, default: 40 },
  duration: { type: Number, default: 600 },
  delay: { type: Number, default: 0 },
})
</script>
