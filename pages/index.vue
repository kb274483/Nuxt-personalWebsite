<template>
  <Desktop>
    <RightClickMenu
      ref="rightClickMenuRef"
      v-if="showRightClickMenu" 
      :x="rightClickMenu.x" 
      :y="rightClickMenu.y" 
    />
    <SystemBar />
    <div class="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none">
      <div class="flex-1 relative pointer-events-auto mt-8">
        <div class="absolute inset-0 w-full h-dvh bg-cover bg-center z-0 transition-all duration-500 p-4">
          <DeskItem
            class="w-12 h-12 m-2"
            v-for="app in apps"
            :key="app.id"
            :app="app"
          />
        </div>

        <Window
          v-for="window in store.windows"
          :key="window.id"
          :window-state="window"
        >
          <component :is="resolveComponent(window.component)" />
        </Window>
      </div>
    </div>
  </Desktop>
</template>

<script setup lang="ts">
import { Code, Image, Settings, FileUser  } from 'lucide-vue-next'
import { onMounted, onBeforeUnmount, computed, nextTick, ref } from 'vue'
import { useWindowManager } from '~/stores/windowManager'
import { useDesktopItemsManager } from '~/stores/desktopItemsManager'
import RightClickMenu from '~/components/apps/RightClickMenu.vue'

const store = useWindowManager()
const showRightClickMenu = ref(false)

const rightClickMenuRef = ref<InstanceType<typeof RightClickMenu> | null>(null)

const rightClickMenu = ref<{ x: number, y: number }>({ x: 0, y: 0 })

const apps = computed(() => useDesktopItemsManager().desktopItems)
const resolveComponent = (name: string) => {
  switch (name) {
    case 'Finder': return resolveComponent('AppsFinder')
    case 'Browser': return resolveComponent('AppsBrowser')
    case 'Photos': return resolveComponent('AppsPhotos')
    case 'Settings': return resolveComponent('AppsSettings')
    default: return resolveComponent(name)
  }
}

const catchMouseRightClick = async (e: MouseEvent) => {
  if (e.button === 2) {
    e.preventDefault()
    e.stopPropagation()
    
    showRightClickMenu.value = true
    rightClickMenu.value = { x: e.clientX, y: e.clientY }
    
    await nextTick()
    
    const menuEl = rightClickMenuRef.value?.$el as HTMLElement
    if (menuEl && menuEl.getBoundingClientRect) {
      const { width, height } = menuEl.getBoundingClientRect()
      const { innerWidth, innerHeight } = window
      
      let targetX = e.clientX
      let targetY = e.clientY
      if (targetX + width > innerWidth) {
        targetX -= width
      }
      if (targetY + height > innerHeight) {
        targetY -= height
      }

      rightClickMenu.value = { x: targetX, y: targetY }
    }
  }
}

const closeRightClickMenu = () => {
  showRightClickMenu.value = false
  rightClickMenu.value.x = 0
  rightClickMenu.value.y = 0
}

onMounted(() => {
  const appsDefault = [
    { id: 'resume', name: 'Resume', icon: FileUser , x: 10, y: 20, width: 48, height: 48, zIndex: 1 },
    { id: 'browser', name: 'Browser', icon: Code , x: 10, y: 100, width: 48, height: 48, zIndex: 1 },
    { id: 'photos', name: 'Photos', icon: Image , x: 10, y: 180, width: 48, height: 48, zIndex: 1 },
    { id: 'settings', name: 'Settings', icon: Settings , x: 10, y: 260, width: 48, height: 48, zIndex: 1 },
  ]
  useDesktopItemsManager().setupDesktopItems(appsDefault)
  window.addEventListener('contextmenu', catchMouseRightClick)
  window.addEventListener('click', closeRightClickMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('contextmenu', catchMouseRightClick)
  window.removeEventListener('click', closeRightClickMenu)
})
</script>
