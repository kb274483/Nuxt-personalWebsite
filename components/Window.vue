<template>
  <Transition name="window-minimize">
    <div
      v-show="!windowState.isMinimized"
      ref="windowRef"
      class="absolute flex flex-col bg-neo-bg dark:bg-black border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] overflow-hidden transition-shadow duration-150"
      :style="windowStyle"
      @mousedown="focusWindow"
      @contextmenu.stop=""
    >

      <!-- Title bar — light: yellow / dark: black -->
      <div
        ref="handleRef"
        class="h-10 bg-[#FFD93D] dark:bg-black border-b-4 border-black dark:border-white flex items-center px-3 gap-2 cursor-default select-none shrink-0"
      >
        <!-- Window controls — icons always visible, brighten on hover -->
        <div class="flex gap-1.5 group">
          <button
            aria-label="Close window"
            @click.stop="close"
            class="w-5 h-5 border-2 border-black dark:border-white flex items-center justify-center bg-[#FF6B6B] hover:bg-red-700 transition-none active:translate-x-[1px] active:translate-y-[1px]"
          >
            <CircleX class="w-3.5 h-3.5 stroke-[2.5px] text-black opacity-50 group-hover:opacity-100" />
          </button>
          <button
            aria-label="Minimize window"
            @click.stop="minimize"
            class="w-5 h-5 border-2 border-black dark:border-white flex items-center justify-center bg-white dark:bg-zinc-700 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-none active:translate-x-[1px] active:translate-y-[1px]"
          >
            <ArrowBigDown class="w-3.5 h-3.5 stroke-[2.5px] text-black dark:text-white opacity-50 group-hover:opacity-100" />
          </button>
          <button
            :aria-label="windowState.isMaximized ? 'Restore window' : 'Maximize window'"
            @click.stop="toggleMaximize"
            class="w-5 h-5 border-2 border-black dark:border-white flex items-center justify-center bg-white dark:bg-zinc-700 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-none active:translate-x-[1px] active:translate-y-[1px]"
          >
            <Minimize2 v-if="windowState.isMaximized" class="w-3.5 h-3.5 stroke-[2.5px] text-black dark:text-white opacity-50 group-hover:opacity-100" />
            <Maximize2 v-else class="w-3.5 h-3.5 stroke-[2.5px] text-black dark:text-white opacity-50 group-hover:opacity-100" />
          </button>
        </div>

        <!-- Title -->
        <div class="flex-1 text-center text-xs font-black uppercase tracking-widest text-black dark:text-white truncate px-2">
          {{ windowState.title }}
        </div>

        <!-- Spacer to balance controls -->
        <div class="w-[62px]"></div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-auto text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-900">
        <slot />
      </div>

      <!-- Resize handle -->
      <div
        v-if="!windowState.isMaximized"
        class="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-50 border-l-2 border-t-2 border-black dark:border-white bg-neo-secondary dark:bg-black"
        @mousedown.stop="startResize"
        aria-hidden="true"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Minimize2, Maximize2, CircleX, ArrowBigDown } from 'lucide-vue-next'
import { useTemplateRef } from 'vue'
import { useDraggable } from '@vueuse/core'
import { useWindowManager, type WindowState } from '~/stores/windowManager'
import { useBoundaryCheck } from '~/composables/useBoundaryCheck'
import { useIsMobile } from '~/composables/useIsMobile'
import { waapi, cubicBezier } from 'animejs'
import { delay } from '~/utils/common'

const props = defineProps<{
  windowState: WindowState
}>()

const { isMobile } = useIsMobile()

const store = useWindowManager()
const windowRef = useTemplateRef<HTMLElement>('windowRef')
const handleRef = useTemplateRef<HTMLElement>('handleRef')

const x = ref<number>(props.windowState.x)
const y = ref<number>(props.windowState.y)
const width = ref<number>(props.windowState.width)
const height = ref<number>(props.windowState.height)

const TOP_OFFSET = 48

const windowStyle = computed(() => {
  if ((props.windowState.isMaximized || isMobile.value) && typeof window !== 'undefined') {
    return {
      left: `0px`,
      top: `${TOP_OFFSET}px`,
      width: `${window.innerWidth}px`,
      height: `${Math.max(200, window.innerHeight - TOP_OFFSET)}px`,
      zIndex: props.windowState.zIndex,
      boxShadow: 'none',
    }
  }
  return {
    left: `${x.value}px`,
    top: `${y.value}px`,
    width: `${width.value}px`,
    height: `${height.value}px`,
    zIndex: props.windowState.zIndex,
  }
})

useDraggable(windowRef, {
  initialValue: { x: props.windowState.x, y: props.windowState.y },
  handle: handleRef,
  onMove: (position) => {
    if (props.windowState.isMaximized) return
    const { x: newX, y: newY } = useBoundaryCheck().checkBoundary(position.x, position.y, width.value, height.value)
    x.value = newX
    y.value = newY
  },
  onEnd: (position) => {
    if (props.windowState.isMaximized) return
    const { x: newX, y: newY } = useBoundaryCheck().checkBoundary(position.x, position.y, width.value, height.value)
    store.updateWindowPosition(props.windowState.id, newX, newY)
  },
  disabled: computed(() => props.windowState.isMaximized)
})

watch(() => props.windowState.x, (newX) => { if (!isResizing.value) x.value = newX })
watch(() => props.windowState.y, (newY) => { if (!isResizing.value) y.value = newY })
watch(() => props.windowState.width, (newW) => { if (!isResizing.value) width.value = newW })
watch(() => props.windowState.height, (newH) => { if (!isResizing.value) height.value = newH })

const focusWindow = () => store.focusWindow(props.windowState.id)

const close = async () => {
  waapi.animate(windowRef.value!, {
    opacity: [1, 0],
    scale: [1, 0.9],
    duration: 150,
    ease: cubicBezier(0.5, 0, 0.9, 0.3)
  })
  await delay(150)
  store.closeWindow(props.windowState.id)
}

const minimize = async () => store.toggleMinimize(props.windowState.id)
const toggleMaximize = () => store.toggleMaximize(props.windowState.id)

const isResizing = ref<boolean>(false)
const startResize = (e: MouseEvent) => {
  isResizing.value = true
  const startX = e.clientX
  const startY = e.clientY
  const startWidth = width.value
  const startHeight = height.value

  const onMouseMove = (e: MouseEvent) => {
    const newWidth = Math.max(300, startWidth + (e.clientX - startX))
    const newHeight = Math.max(200, startHeight + (e.clientY - startY))
    width.value = Math.min(newWidth, window.innerWidth - x.value)
    height.value = Math.min(newHeight, window.innerHeight - y.value)
  }

  const onMouseUp = () => {
    isResizing.value = false
    store.updateWindowSize(props.windowState.id, width.value, height.value)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}
</script>

<style scoped>
.window-minimize-enter-active,
.window-minimize-leave-active {
  transition: all 0.2s ease-out;
}
.window-minimize-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(12px);
}
.window-minimize-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(12px);
}
</style>
