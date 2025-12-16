<template>
  <Transition name="window-minimize">
    <div
      v-show="!windowState.isMinimized"
      ref="windowRef"
      class="absolute flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden border border-white/30 dark:border-white/10 transition-shadow duration-200"
      :style="{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: windowState.zIndex,
      }"
      :class="{ 'inset-0 !w-full !h-full !left-0 !top-12 rounded-none': windowState.isMaximized || isMobile }"
      @mousedown="focusWindow"
      @contextmenu.stop=""
    >
  
      <div
        ref="handleRef"
        class="h-8 bg-gray-200/50 dark:bg-white/5 flex items-center px-3 space-x-2 cursor-default select-none border-b border-gray-300/30 dark:border-white/5 shrink-0"
      >
        <div class="flex space-x-2 group">
          <button @click.stop="close" class="w-5 h-5 rounded border dark:border-white border-black flex items-center justify-center text-[8px] dark:text-white text-black opacity-100 transition-colors">
            <CircleX class="w-full h-hull hidden group-hover:block" />
          </button>
          <button @click.stop="minimize" class="w-5 h-5 rounded border dark:border-white border-black flex items-center justify-center text-[8px] dark:text-white text-black opacity-100 transition-colors">
            <ArrowBigDown class="w-full h-hull hidden group-hover:block" />
          </button>
          <button @click.stop="toggleMaximize" class="w-5 h-5 rounded border dark:border-white border-black flex items-center justify-center text-[8px] dark:text-white text-black opacity-100 transition-colors">
            <Minimize2 v-if="windowState.isMaximized" 
              class="w-full h-hull hidden group-hover:block" 
            />
            <Maximize2 v-else class="w-full h-hull hidden group-hover:block" />
          </button>
        </div>
        <div class="flex-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 truncate px-2">{{ windowState.title }}</div>
        <div class="w-14"></div>
      </div>
  
      <!-- Content -->
      <div class="flex-1 overflow-auto relativetext-gray-900 dark:text-gray-100 bg-white">
        <slot />
      </div>
  
      <div
        v-if="!windowState.isMaximized"
        class="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
        @mousedown.stop="startResize"
      >
        <svg viewBox="0 0 10 10" class="w-full h-full text-gray-400 opacity-50">
          <path d="M6 9 L9 6 M3 9 L9 3" stroke="currentColor" stroke-width="1" />
        </svg>
      </div>
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

// 判斷是否為手機
const { isMobile } = useIsMobile()

const store = useWindowManager()
const windowRef = useTemplateRef<HTMLElement>('windowRef')
const handleRef = useTemplateRef<HTMLElement>('handleRef')

const x = ref<number>(props.windowState.x)
const y = ref<number>(props.windowState.y)
const width = ref<number>(props.windowState.width)
const height = ref<number>(props.windowState.height)

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

watch(() => props.windowState.x, (newX) => { if(!isResizing.value) x.value = newX })
watch(() => props.windowState.y, (newY) => { if(!isResizing.value) y.value = newY })
watch(() => props.windowState.width, (newW) => { if(!isResizing.value) width.value = newW })
watch(() => props.windowState.height, (newH) => { if(!isResizing.value) height.value = newH })

const focusWindow = () => {
  store.focusWindow(props.windowState.id)
}

const close = async () => {
  waapi.animate(windowRef.value!, {
    opacity: [1, 0],
    scale: [1, 0],
    duration: 300,
    ease: cubicBezier(0.5,0,0.9,0.3)
  })
  await delay(300)
  store.closeWindow(props.windowState.id)  
}

const minimize = async () => {
  store.toggleMinimize(props.windowState.id)
}

const toggleMaximize = () => {
  store.toggleMaximize(props.windowState.id)
}

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
    
    const maxWidth = window.innerWidth - x.value
    const maxHeight = window.innerHeight - y.value
    
    width.value = Math.min(newWidth, maxWidth)
    height.value = Math.min(newHeight, maxHeight)
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
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.window-minimize-leave-to {
  opacity: 0.1;
  transform: scale(0) translateY(200px); 
}

.window-minimize-enter-from {
  opacity: 0.1;
  transform: scale(0) translateY(200px);
}
</style>