<template>
  <div 
    ref="deskItemRef"
    class="absolute desk-item"
    :style="{
      transform: `translate3d(${x}px, ${y}px, 0)`,
      width: `${width}px`,
      height: `${height}px`,
    }"
    @dblclick="openApp(app.name)"
  >
    <button 
      class="group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/30 shadow-sm active:scale-95 hover:rotate-2 hover:scale-110"
    >
      <component :is="app.icon" class="w-8 h-8 text-gray-800 dark:text-white drop-shadow-md" />
    </button>
    <p class="text-xs text-center text-gray-900 dark:text-white font-medium">{{ app.name }}</p>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useWindowManager } from '~/stores/windowManager'
import { useDesktopItemsManager } from '~/stores/desktopItemsManager'
import { useDraggable } from '@vueuse/core'
import type { AppItem, AppItemPosition } from '~/types/appItem.type'
import { useBoundaryCheck } from '~/composables/useBoundaryCheck'

const props = defineProps<{
  app: AppItem & AppItemPosition
}>()

const store = useWindowManager()
const deskItemRef = useTemplateRef<HTMLElement>('deskItemRef')

const x = ref(props.app.x)
const y = ref(props.app.y)
const width = ref(props.app.width)
const height = ref(props.app.height)

watch(() => props.app.x, (newX) => { x.value = newX })
watch(() => props.app.y, (newY) => { y.value = newY })

useDraggable(deskItemRef, {
  initialValue: { x: props.app.x, y: props.app.y },
  handle: deskItemRef,

  onMove: (position) => {
    const { x: newX, y: newY } = useBoundaryCheck().checkBoundary(position.x, position.y, width.value, height.value)
    x.value = newX - (width.value / 2)
    y.value = newY - height.value
  },
  onEnd: () => {
    if (!deskItemRef.value) return
    useDesktopItemsManager().updateDesktopItemPosition(props.app.id, x.value, y.value)
  }
})

const openApp = (name: string) => {
  store.openWindow(props.app.name, props.app.name, props.app.name)
}

</script>

<style scoped>
.shadow-glow {
  box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.5);
}
</style>
