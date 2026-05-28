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
            <p class="text-xs text-secondary mb-2">从素材库选择图标</p>
            <p class="text-[10px] text-gray-400 mb-2">建议正方形图片，选择后可裁剪为 1:1 比例</p>
            <div v-if="isImage" class="flex items-center gap-3 mb-2">
              <img :src="modelValue" class="w-8 h-8 object-contain rounded border border-gray-100" alt="" />
              <button type="button" @click="openCropper(modelValue)" class="text-xs text-accent hover:underline">裁剪</button>
              <button type="button" @click="clearImage" class="text-xs text-red-500 hover:underline">移除</button>
            </div>
            <button
              type="button"
              @click="showLibrary = true"
              class="text-xs text-accent hover:underline"
            >{{ isImage ? '重新选择' : '选择图片' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <MediaLibrary v-model="showLibrary" @select="onLibrarySelect" />
    <ImageCropper
      v-model:show="cropperShow"
      :image-src="cropperSrc"
      :aspect-ratio="1"
      @cropped="onCropped"
    />
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
const showLibrary = ref(false)
const cropperShow = ref(false)
const cropperSrc = ref('')

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

function onLibrarySelect(urls: string[]) {
  if (urls.length > 0) {
    emit('update:modelValue', urls[0])
    isOpen.value = false
  }
}

function openCropper(src: string) {
  cropperSrc.value = src
  cropperShow.value = true
}

function onCropped(url: string) {
  emit('update:modelValue', url)
  isOpen.value = false
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
