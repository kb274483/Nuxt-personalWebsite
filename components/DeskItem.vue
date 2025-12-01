<template>
  <div 
    ref="deskItemRef"
    class="absolute desk-item"
    :data-id="app.id"
    :data-app-type="app.app_type"
    :style="{
      transform: `translate3d(${x}px, ${y}px, 0)`,
      width: `${width}px`,
      height: `${height}px`,
    }"
    @dblclick="openApp()"
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
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useWindowManager } from '~/stores/windowManager'
import { useDesktopItemsManager } from '~/stores/desktopItemsManager'
import { useDraggable } from '@vueuse/core'
import type { AppItem, AppItemPosition } from '~/types/appItem.type'
import { useBoundaryCheck } from '~/composables/useBoundaryCheck'

const props = defineProps<{
  app: AppItem & AppItemPosition,
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
    const { x: newX, y: newY } = useBoundaryCheck().checkBoundary(position.x, position.y, (width.value as number) , (height.value as number))
    x.value = newX - ((width.value as number) / 2)
    y.value = newY - (height.value as number)
  },
  onEnd: () => {
    if (!deskItemRef.value) return
    useDesktopItemsManager().updateDesktopItemPosition(props.app.id, x.value, y.value)
  }
})

const openApp = () => {
  const componentName = props.app.component || props.app.name

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
