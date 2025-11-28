<template>
  <Desktop>
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
import { Folder, Compass, Image, Settings } from 'lucide-vue-next'
import { onMounted, onBeforeUnmount, computed } from 'vue'
import { useWindowManager } from '~/stores/windowManager'
import { useDesktopItemsManager } from '~/stores/desktopItemsManager'

const store = useWindowManager()

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

const catchMouseRightClick = (e: MouseEvent) => {
  if (e.button === 2) {
    e.preventDefault()
    e.stopPropagation()
    console.log('Mouse right click caught')
  }
}

onMounted(() => {
  const appsDefault = [
    { id: 'finder', name: 'Finder', icon: Folder , x: 10, y: 20, width: 48, height: 48, zIndex: 1 },
    { id: 'browser', name: 'Browser', icon: Compass , x: 10, y: 100, width: 48, height: 48, zIndex: 1 },
    { id: 'photos', name: 'Photos', icon: Image , x: 10, y: 180, width: 48, height: 48, zIndex: 1 },
    { id: 'settings', name: 'Settings', icon: Settings , x: 10, y: 260, width: 48, height: 48, zIndex: 1 },
  ]
  useDesktopItemsManager().setupDesktopItems(appsDefault)
  window.addEventListener('contextmenu', catchMouseRightClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('contextmenu', catchMouseRightClick)
})
</script>
