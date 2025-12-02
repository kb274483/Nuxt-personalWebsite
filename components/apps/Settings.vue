<template>
  <div class="relative h-full flex flex-col bg-gray-50 dark:bg-stone-800/80 text-gray-900 dark:text-gray-100 transition-colors duration-300">
     <div class="p-4">
        <h2 class="text-lg font-bold mb-4">System Settings</h2>
        <div class="bg-white dark:bg-stone-700 rounded-lg shadow p-4 mb-4 transition-colors duration-300">
            <h3 class="font-semibold mb-2 text-sm text-gray-500 dark:text-gray-400 uppercase">Appearance</h3>
            <div class="flex items-center justify-between py-2 border-b dark:border-gray-600 last:border-0">
                <span>Dark Mode</span>
                <button 
                    class="w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 focus:outline-none" 
                    :class="isDark ? 'bg-green-500' : 'bg-gray-300'"
                    @click="toggleDark()"
                >
                    <div 
                        class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                        :class="{ 'translate-x-5': isDark }"
                    ></div>
                </button>
            </div>
        </div>
        <div class="bg-white dark:bg-stone-700 rounded-lg shadow p-4 mb-4 transition-colors duration-300">
            <h3 class="font-semibold mb-2 text-sm text-gray-500 dark:text-gray-400 uppercase">Desktop Items</h3>
            <div class="flex items-center justify-between py-2 border-b dark:border-gray-600 last:border-0">
                <span>Reset</span>
                <button @click="resetDesktopItems()"
                    class="w-12 h-8 rounded relative cursor-pointer transition-colors duration-200 focus:outline-none bg-gray-200 dark:bg-stone-500 p-2 hover:bg-gray-300 dark:hover:bg-stone-600 active:scale-95"
                >
                    <RotateCw class="w-full h-full" ref="resetDesktopItemsRef" />
                </button>
            </div>
        </div>
     </div>
     <div class="absolute bottom-0 left-0 w-full h-12 bg-gray-50 dark:bg-stone-800/80 flex items-center justify-center">
        <p class="text-xs text-center text-gray-500 dark:text-gray-400">
            Roy Space v1.0.0 Developed by Roy
        </p>
     </div>
  </div>
</template>

<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { RotateCw, FileUser, Code, Image, Settings } from 'lucide-vue-next'
import { useTemplateRef } from 'vue'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const resetDesktopItemsRef = useTemplateRef<HTMLButtonElement>('resetDesktopItemsRef')
const resetDesktopItems = () => {
    resetDesktopItemsRef.value?.classList.add('animate-spin')
    setTimeout(() => {
        resetDesktopItemsRef.value?.classList.remove('animate-spin')
    }, 1000)

    localStorage.removeItem('desktopItemPositions')
    const appsDefault = [
        { id: 'resume', name: 'Resume', icon: FileUser, disabled_delete: true, x: 10, y: 30, width: 48, height: 48, zIndex: 1 },
        { id: 'browser', name: 'Code Works', icon: Code, disabled_delete: true, x: 10, y: 110, width: 48, height: 48, zIndex: 1 },
        { id: 'photos', name: 'Gallery', icon: Image, disabled_delete: true, x: 10, y: 190, width: 48, height: 48, zIndex: 1 },
        { id: 'settings', name: 'Settings', icon: Settings, disabled_delete: true, x: 10, y: 270, width: 48, height: 48, zIndex: 1 },
    ]
    useDesktopItemsManager().setupDesktopItems(appsDefault)
}
</script>
