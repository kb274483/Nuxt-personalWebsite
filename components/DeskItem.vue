<template>
  <div 
    ref="deskItemRef"
    class="absolute desk-item z-10"
    :data-id="app.id"
    :data-app-type="app.app_type"
    :style="{
      transform: `translate3d(${x}px, ${y}px, 0)`,
      width: `${width}px`,
      height: `${height}px`,
    }"
    @dblclick="openApp()"
    @click="handleClick"
  >
    <button 
      class="group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/30 shadow-sm active:scale-95 hover:rotate-2 hover:scale-110"
    >
      <component :is="app.icon" class="w-8 h-8 text-gray-800 dark:text-white drop-shadow-md" />
    </button>
    <input type="text" 
      v-if="props.app.editStatus" 
      v-model="app.name" 
      @blur="useDesktopItemsManager().renameFile(app.id, app.name)"
      class="bg-transparent text-xs text-gray-900 dark:text-white font-medium border-b-2 border-gray-900 dark:border-white outline-none"
    />
    <p v-else
      class="text-xs text-center text-gray-900 dark:text-white font-medium">{{ app.name }}
    </p>
  </div>
  <div
    class="absolute opacity-0"
    :id="app.id + '-shadow'"
    :style="{
      transform: `translate3d(${x}px, ${y}px, 0)`,
      width: `${width}px`,
      height: `${height}px`,
    }"
  >
    <button 
      class="group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/30 shadow-sm active:scale-95 hover:rotate-2 hover:scale-110"
    >
      <component :is="app.icon" class="w-8 h-8 text-gray-800 dark:text-white drop-shadow-md" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useWindowManager } from '~/stores/windowManager'
import { useDesktopItemsManager } from '~/stores/desktopItemsManager'
import { useDraggable } from '@vueuse/core'
import type { AppItem, AppItemPosition } from '~/types/appItem.type'
import { useBoundaryCheck } from '~/composables/useBoundaryCheck'
import { useIsMobile } from '~/composables/useIsMobile'
import { waapi, cubicBezier } from 'animejs'
import { delay } from '~/utils/common'

const props = defineProps<{
  app: AppItem & AppItemPosition,
}>()

// 判斷是否為手機
const { isMobile } = useIsMobile()
const handleClick = () => {
  if (isMobile.value) {
    openApp()
  }
}
// 
const store = useWindowManager()
const deskItemRef = useTemplateRef<HTMLElement>('deskItemRef')

const x = ref<number>(props.app.x)
const y = ref<number>(props.app.y)
const width = ref<number | undefined>(props.app.width)
const height = ref<number | undefined>(props.app.height)

watch(() => props.app.x, (newX) => { x.value = newX })
watch(() => props.app.y, (newY) => { y.value = newY })

useDraggable(deskItemRef, {
  initialValue: { x: props.app.x, y: props.app.y },
  handle: deskItemRef,
  disabled: computed(() => isMobile.value),

  onMove: (position) => {
    const { x: newX, y: newY } = useBoundaryCheck().checkBoundary(position.x, position.y, (width.value as number) , (height.value as number))
    x.value = newX - ((width.value as number) / 2)
    y.value = newY - (height.value as number)
  },
  onEnd: () => {
    if (!deskItemRef.value) return
    useDesktopItemsManager().updateDesktopItemPosition(props.app.id, x.value, y.value)
  }
})

const openAnimation = (id: string) => {
  const el = document.getElementById(id + '-shadow') as HTMLElement
  if(!el) return

  const targetX = window.innerWidth / 2
  const targetY = window.innerHeight / 2
  waapi.animate(el, {
    x: [x.value, targetX],
    y: [y.value, targetY],
    opacity: [0, 1, 0],
    scale: [0.5, 1.5, 1],
    duration: 300,
    ease: cubicBezier(0.5,0,0.9,0.3)
  })
}

const openApp = async () => {
  const componentName = props.app.component || props.app.name
  openAnimation(props.app.id)
  await delay(300)
  // 檔案類型，傳入 fileId
  const windowProps = props.app.app_type === 'file' 
    ? { fileId: props.app.id } 
    : {}

  // 開啟視窗
  store.openWindow(
    props.app.id,
    props.app.name,
    componentName,
    windowProps
  )
}

</script>

<style scoped>
  .shadow-glow {
    box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.5);
  }
</style>
