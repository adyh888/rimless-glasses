import type { Ref } from 'vue'

interface SwipeOptions {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  threshold?: number
}

export function useSwipe(el: Ref<HTMLElement | undefined>, options: SwipeOptions) {
  const threshold = options.threshold ?? 50
  let startX = 0
  let startY = 0
  let tracking = false

  function onPointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement
    if (target.closest('button, a, input, select, textarea, [role="button"]')) return
    startX = e.clientX
    startY = e.clientY
    tracking = true
  }

  function onPointerUp(e: PointerEvent) {
    if (!tracking) return
    tracking = false
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY
    if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        options.onSwipeLeft()
      } else {
        options.onSwipeRight()
      }
    }
  }

  function onPointerCancel() {
    tracking = false
  }

  function attach() {
    const element = el.value
    if (!element) return
    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointerup', onPointerUp)
    element.addEventListener('pointercancel', onPointerCancel)
  }

  function detach() {
    const element = el.value
    if (!element) return
    element.removeEventListener('pointerdown', onPointerDown)
    element.removeEventListener('pointerup', onPointerUp)
    element.removeEventListener('pointercancel', onPointerCancel)
  }

  if (getCurrentInstance()) {
    onMounted(attach)
    onUnmounted(detach)
  } else {
    attach()
  }

  return { attach, detach }
}
