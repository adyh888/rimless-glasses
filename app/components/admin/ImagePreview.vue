<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
        @click.self="close"
        @keydown.esc="close"
        tabindex="0"
        ref="overlayRef"
      >
        <button
          type="button"
          @click="close"
          class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white text-3xl transition-colors"
        >
          &times;
        </button>
        <img
          :src="src"
          class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          @click.stop
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  src: string
}>()

const emit = defineEmits(['update:modelValue'])
const overlayRef = ref<HTMLElement>()

function close() {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden'
      nextTick(() => {
        overlayRef.value?.focus()
      })
    } else {
      document.body.style.overflow = ''
    }
  }
)

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
