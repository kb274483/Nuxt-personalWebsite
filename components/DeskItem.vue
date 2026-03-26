<template>
  <div 
    v-bind="$attrs"
    ref="deskItemRef"
    class="absolute desk-item z-10"
    :data-id="app.id"
    :data-app-type="app.app_type"
    :style="{
      transform: `translate3d(${baseX + physicsX}px, ${baseY + physicsY}px, 0)`,
      width: `${width}px`,
      height: `${height}px`,
    }"
    @dblclick="openApp()"
    @touchstart="openApp()"
    @click="handleClick"
  >
    <button
      class="group relative flex flex-col items-center justify-center w-12 h-12 bg-neo-bg dark:bg-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] transition-all duration-150 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] dark:hover:shadow-[6px_6px_0px_0px_#fff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      :aria-label="'Open ' + app.name"
    >
      <component :is="app.icon" class="w-6 h-6 text-black dark:text-white stroke-[2.5px]" />
    </button>
    <input
      type="text"
      v-if="props.app.editStatus"
      v-model="app.name"
      @blur="useDesktopItemsManager().renameFile(app.id, app.name)"
      class="bg-neo-secondary border-b-2 border-black dark:border-white text-xs text-black font-bold outline-none text-center w-full px-1"
    />
    <p v-else
      class="text-[10px] text-center text-black dark:text-white font-bold uppercase tracking-wide leading-tight mt-0.5 max-w-[56px] truncate"
    >{{ app.name }}</p>
  </div>
  <div
    class="absolute opacity-0"
    :id="app.id + '-shadow'"
    :style="{
      transform: `translate3d(${baseX + physicsX}px, ${baseY + physicsY}px, 0)`,
      width: `${width}px`,
      height: `${height}px`,
    }"
    aria-hidden="true"
  >
    <button
      class="relative flex flex-col items-center justify-center w-12 h-12 bg-neo-secondary border-4 border-black"
      tabindex="-1"
    >
      <component :is="app.icon" class="w-6 h-6 text-black stroke-[2.5px]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, ref, watch, computed } from 'vue'
import { useWindowManager } from '~/stores/windowManager'
import { useDesktopItemsManager } from '~/stores/desktopItemsManager'
import { useDraggable } from '@vueuse/core'
import type { AppItem, AppItemPosition } from '~/types/appItem.type'
import { useBoundaryCheck } from '~/composables/useBoundaryCheck'
import { useIsMobile } from '~/composables/useIsMobile'
import { waapi, cubicBezier } from 'animejs'
import { delay } from '~/utils/common'
import { useGravityManager } from '~/stores/gravityManager'
import { usePhysicsCalc } from '~/composables/usePhysicsCalc'

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
// Pinia Store
const store = useWindowManager()
// 桌面 ITEM DOM
const deskItemRef = useTemplateRef<HTMLElement>('deskItemRef')
// 重力開關 and State
const gravityManager = useGravityManager()

// 物理計算相關
const { x: physicsX, y: physicsY, startDrag, moveDrag, endDrag } = usePhysicsCalc(deskItemRef)

const baseX = ref<number>(props.app.x)
const baseY = ref<number>(props.app.y)
const width = ref<number | undefined>(props.app.width)
const height = ref<number | undefined>(props.app.height)

watch(() => props.app.x, (newX) => { baseX.value = newX })
watch(() => props.app.y, (newY) => { baseY.value = newY })

useDraggable(deskItemRef, {
  initialValue: { x: props.app.x, y: props.app.y },
  handle: deskItemRef,
  disabled: computed(() => isMobile.value),

  onStart: (_, event: PointerEvent) => {
    if(gravityManager.isGravityEnabled) {
      startDrag(event.clientX, event.clientY)
    }
  },
  onMove: (position, event: PointerEvent) => {
    const { x: newX, y: newY } = useBoundaryCheck().checkBoundary(
      position.x, position.y,
      (width.value as number) , (height.value as number)
    )

    if(gravityManager.isGravityEnabled) {
      moveDrag(event.clientX, event.clientY)
    } else {
      baseX.value = newX - ((width.value as number) / 2)
      baseY.value = newY - ((height.value as number))
    }
  },
  onEnd: () => {
    if (gravityManager.isGravityEnabled) {
      endDrag()
    } else {
      if (!deskItemRef.value) return
      useDesktopItemsManager().updateDesktopItemPosition(props.app.id, baseX.value, baseY.value)
    }
  }
})

const openAnimation = (id: string) => {
  const el = document.getElementById(id + '-shadow') as HTMLElement
  if(!el) return

  const targetX = window.innerWidth / 2
  const targetY = window.innerHeight / 2
  waapi.animate(el, {
    x: [baseX.value, targetX],
    y: [baseY.value, targetY],
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
