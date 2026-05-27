<template>
  <div class="relative" :class="containerClass">
    <canvas ref="canvasRef" class="w-full h-full object-cover rounded" :class="canvasClass" />
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg class="w-6 h-6 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
    </div>
    <video ref="videoRef" :src="src" class="hidden" muted preload="metadata" @loadeddata="captureFrame" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  src: string
  containerClass?: string
  canvasClass?: string
}>()

const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()

function captureFrame() {
  const video = videoRef.value
  const canvas = canvasRef.value
  if (!video || !canvas) return
  video.currentTime = 1
}

onMounted(() => {
  const video = videoRef.value
  if (!video) return
  video.addEventListener('seeked', drawFrame, { once: true })
})

function drawFrame() {
  const video = videoRef.value
  const canvas = canvasRef.value
  if (!video || !canvas) return
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  }
}
</script>
