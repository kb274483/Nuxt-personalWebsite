<template>
  <div class="w-full h-12 bg-slate-400/70 dark:bg-stone-600/50 backdrop-blur-md text-gray-900 dark:text-white flex items-center justify-between px-4 text-xs font-medium select-none z-50 fixed top-0 left-0 border-b border-gray-200/50 dark:border-white/10 shadow-sm transition-colors duration-300">
    <div class="flex items-center space-x-4">
      <span class="font-bold text-base">Roy Space</span>
    </div>
    <div class="flex items-center space-x-3">
      <div class="relative group">
        <!-- 最小化視窗數量 -->
        <div @click="isMinWindowsList = !isMinWindowsList"
          class="flex items-center justify-center w-8 h-8 bg-gray-200/50 dark:bg-white/10 rounded-md cursor-pointer overflow-hidden relative">
          <Transition name="slide-up" mode="out-in">
            <span :key="minWindows.length" class="absolute font-bold font-mono">
              {{ minWindows.length }}
            </span>
          </Transition>
        </div>

        <!-- 最小化視窗選單  -->
        <div v-if="isMinWindowsList && minWindows.length > 0"
          class="absolute top-full right-0 mt-2 w-48 bg-white/90 dark:bg-stone-800/90 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden p-1">
          <div 
            v-for="window in minWindows" 
            :key="window.id"
            @click="openMinWindow(window.id)"
            class="px-4 py-2 text-sm rounded hover:bg-stone-300/50 hover:text-black dark:hover:text-white cursor-pointer transition-colors truncate flex items-center gap-2"
          >
            <AppWindow class="w-4 h-4" />
            {{ window.title }}
          </div>
        </div>
      </div>
      <button 
        @click="handleThemeChange($event)" 
        class="p-2 rounded-md hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <Sun v-show="isDark" class="w-8 h-8" />
        <Moon v-show="!isDark" class="w-8 h-8" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon, AppWindow } from 'lucide-vue-next'
import { useWindowManager } from '~/stores/windowManager'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const windowStore = useWindowManager()

// 取得縮小視窗的數量 
const minWindows = computed(() => windowStore.windows.filter(w => w.isMinimized))
const isMinWindowsList = ref<boolean>(false)

// 開啟最小化視窗
const openMinWindow = (id: string) => {
  windowStore.toggleMinimize(id)
  isMinWindowsList.value = false
}

// 切換主題
const handleThemeChange = (event: MouseEvent)=>{
  const transitionCheck = 
    'startViewTransition' in document && 
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if(!transitionCheck){
    toggleDark()
    return
  }

  const x = (event.clientX / window.innerWidth) * 100
  const y = (event.clientY / window.innerHeight) * 100
  const root = document.documentElement
  root.style.setProperty('--pointer-x', `${x}%`)
  root.style.setProperty('--pointer-y', `${y}%`)

  document.startViewTransition(async () => {
    toggleDark()
    await nextTick()
  })

}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
