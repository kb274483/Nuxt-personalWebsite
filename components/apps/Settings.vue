<template>
  <div class="h-full flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
     <div class="p-4">
        <h2 class="text-lg font-bold mb-4">System Settings</h2>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 transition-colors duration-300">
            <h3 class="font-semibold mb-2 text-sm text-gray-500 dark:text-gray-400 uppercase">Appearance</h3>
            <div class="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0">
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
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-300">
            <h3 class="font-semibold mb-2 text-sm text-gray-500 dark:text-gray-400 uppercase">Wallpaper</h3>
            <div class="flex space-x-4 overflow-x-auto pb-2">
                <div class="w-24 h-16 bg-blue-500 rounded cursor-pointer border-2 border-blue-600 shadow-sm flex-shrink-0"></div>
                <div class="w-24 h-16 bg-purple-500 rounded cursor-pointer border-2 border-transparent hover:border-blue-400 flex-shrink-0"></div>
                <div class="w-24 h-16 bg-pink-500 rounded cursor-pointer border-2 border-transparent hover:border-blue-400 flex-shrink-0"></div>
            </div>
        </div>
     </div>
  </div>
</template>

<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>
