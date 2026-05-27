<template>
  <div class="relative inline-block">
    <button
      ref="triggerRef"
      type="button"
      @click.stop="isOpen = !isOpen"
      class="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:border-accent transition-colors bg-white overflow-hidden"
      title="点击编辑图标"
    >
      <DynamicIcon :icon="modelValue || '📄'" icon-class="text-lg w-6 h-6" />
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="panelRef"
        class="fixed z-[9999] w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
        :style="panelStyle"
      >
        <div class="p-4 space-y-4">
          <div>
            <p class="text-xs text-secondary mb-2">输入文字 / Emoji</p>
            <div class="flex gap-2">
              <input
                :value="isImage ? '' : modelValue"
                @input="onTextInput"
                type="text"
                placeholder="如 📊 或文字"
                class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <button
                v-for="e in commonEmojis"
                :key="e"
                type="button"
                @click="selectEmoji(e)"
                class="w-8 h-8 flex items-center justify-center rounded-md text-base hover:bg-gray-50 transition-colors"
                :class="modelValue === e ? 'ring-2 ring-accent bg-accent/5' : ''"
              >{{ e }}</button>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-3">
            <p class="text-xs text-secondary mb-2">或上传图标图片</p>
            <div v-if="isImage" class="flex items-center gap-3 mb-2">
              <img :src="modelValue" class="w-8 h-8 object-contain rounded border border-gray-100" alt="" />
              <button type="button" @click="clearImage" class="text-xs text-red-500 hover:underline">移除</button>
            </div>
            <button
              type="button"
              @click="triggerUpload"
              class="text-xs text-accent hover:underline"
            >{{ isImage ? '重新上传' : '选择图片' }}</button>
            <input ref="fileRef" type="file" accept="image/*" class="hidden" @change="onFileChange" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const triggerRef = ref<HTMLButtonElement>()
const panelRef = ref<HTMLElement>()
const fileRef = ref<HTMLInputElement>()

const isImage = computed(() =>
  !!props.modelValue && (props.modelValue.startsWith('/uploads/') || props.modelValue.startsWith('http'))
)

const commonEmojis = [
  '📊', '🏠', '📦', '📝', '✉️', '📄', '⚙️', '🎠',
  '💬', '📢', '🌐', '📕', '🎵', '🔗', '🛍️', '📰',
  '❤️', '⭐', '🔔', '👤', '📷', '🎬', '💡', '🎯',
  '📱', '💻', '🔒', '🔑', '📞', '🏪', '💰', '🎁',
]

const panelStyle = ref<Record<string, string>>({})

watch(isOpen, (val) => {
  if (val) nextTick(updatePosition)
})

function updatePosition() {
  const el = triggerRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const top = spaceBelow > 340 ? rect.bottom + 6 : rect.top - 340
  panelStyle.value = {
    top: `${Math.max(8, top)}px`,
    left: `${Math.max(8, Math.min(rect.left, window.innerWidth - 272))}px`,
  }
}

function onTextInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

function selectEmoji(e: string) {
  emit('update:modelValue', e)
  isOpen.value = false
}

function clearImage() {
  emit('update:modelValue', '')
}

function triggerUpload() {
  fileRef.value?.click()
}

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body: formData })
    emit('update:modelValue', res.url)
    isOpen.value = false
  } catch (err: any) {
    alert(err?.data?.statusMessage || '上传失败')
  }
  ;(e.target as HTMLInputElement).value = ''
}

function onDocClick(e: Event) {
  if (!isOpen.value) return
  const target = e.target as Node
  if (triggerRef.value?.contains(target)) return
  if (panelRef.value?.contains(target)) return
  isOpen.value = false
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))
</script>
