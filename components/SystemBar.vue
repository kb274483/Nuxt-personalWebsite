<template>
  <div class="w-full h-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md text-gray-900 dark:text-white flex items-center justify-between px-4 text-xs font-medium select-none z-50 fixed top-0 left-0 border-b border-gray-200/50 dark:border-white/10 shadow-sm transition-colors duration-300">
    <div class="flex items-center space-x-4">
      <span class="font-bold text-base">Roy</span>
    </div>
    <div class="flex items-center space-x-3">
      <button 
        @click="handleThemeChange($event)" 
        class="p-2 rounded-md hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <component :is="isDark ? Sun : Moon" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'

const isDark = useDark()
const toggleDark = useToggle(isDark)

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
