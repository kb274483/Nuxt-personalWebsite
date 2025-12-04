<template>
  <div class="relative h-full flex flex-col bg-gray-50 dark:bg-stone-800/80 text-gray-900 dark:text-gray-100 transition-colors duration-300">
     <div class="p-4 flex flex-col flex-1 overflow-hidden pb-14">
        <h2 class="text-lg font-bold mb-4 flex-shrink-0">System Settings</h2>

        <div class="bg-white dark:bg-stone-700 rounded-lg shadow p-4 mb-4 transition-colors duration-300 flex-shrink-0">
            <h3 class="font-semibold mb-2 text-sm text-gray-500 dark:text-gray-400 uppercase">Appearance</h3>
            <div class="flex items-center justify-between py-2 border-b dark:border-gray-600 last:border-0">
                <span>Dark Mode</span>
                <div class="flex items-center space-x-2">
                    <button 
                        class="w-16 h-10 rounded relative cursor-pointer transition-all duration-500 focus:outline-none" 
                        :class="!isDark ? 'bg-green-500' : 'bg-gray-300/50'"
                        @click="toggleDark()"
                    >
                        <Sun class="w-6 h-6 mx-auto" />
                    </button>
                    <button 
                        class="w-16 h-10 rounded relative cursor-pointer transition-all duration-500 focus:outline-none" 
                        :class="isDark ? 'bg-green-500' : 'bg-gray-300/50'"
                        @click="toggleDark()"
                    >
                        <Moon class="w-6 h-6 mx-auto" />
                    </button>
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-stone-700 rounded-lg shadow p-4 mb-4 transition-colors duration-300 flex-shrink-0">
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
        <div class="photos-container bg-white dark:bg-stone-700 rounded-lg shadow p-4 mb-4 transition-colors duration-300 flex-1 min-h-0 flex flex-col">
            <h3 class="font-semibold mb-2 text-sm text-gray-500 dark:text-gray-400 uppercase">
                Desktop background
            </h3>

            <div class="custom-scrollbar overflow-y-auto">
                <div v-if="loading" class="py-4 text-center text-sm text-gray-500">Loading photos...</div>
                <div v-else class="photos-grid grid gap-2">
                    <button 
                        @click="setWallpaper(null)"
                        class="aspect-square relative rounded-lg border-2 transition-all p-4"
                        :class="wallpaper === null ? 'border-green-500 ring-2 ring-green-500/20' : 'border-transparent hover:border-gray-300'"
                    >
                        <div class="w-full h-full bg-black/20 flex items-center justify-center rounded-lg">
                            <span class="text-white text-sm">None</span>
                        </div>
                    </button>
                    <button 
                        v-for="photo in photos" 
                        :key="photo.id"
                        @click="setWallpaper(photo.src)"
                        class="aspect-square relative rounded-lg border-2 transition-all p-4"
                        :class="wallpaper === photo.src ? 'border-green-500 ring-2 ring-green-500/20' : 'border-transparent hover:border-gray-300'"
                    >
                        <img 
                            :src="photo.thumbnail" 
                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 rounded-lg"
                            loading="lazy"
                        />
                        <div v-if="wallpaper === photo.src" class="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Check class="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                    </button>
                </div>
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
import { useTemplateRef, onMounted } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'
import { useWallpaper } from '~/composables/useWallpaper'
import { usePhotoApi } from '~/composables/api/usePhotoApi'
import type { Photo } from '~/types/photo.type'

// 桌布狀態
const { wallpaper, setWallpaper } = useWallpaper()
// 取得照片
const { getPhotos } = usePhotoApi()
const photos = ref<Photo[]>([])
const loading = ref(true)

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

onMounted(async () => {
    try {
        loading.value = true
        const { data } = await getPhotos()
        photos.value = data?.value || []
    } catch (e) {
        console.error('Load photos failed', e)
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.5);
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(156, 163, 175, 0.8);
    }

    .photos-container {
        container-type: inline-size;
        container-name: photos-container;
    }

    @container photos-container (min-width: 320px) {
        .photos-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    @container photos-container (min-width: 480px) {
        .photos-grid {
            grid-template-columns: repeat(4, 1fr);
        }
    }

    @container photos-container (min-width: 768px) {
        .photos-grid {
            grid-template-columns: repeat(5, 1fr);
        }
    }

    @container photos-container (min-width: 1024px) {
        .photos-grid {
            grid-template-columns: repeat(6, 1fr);
        }
    }
</style>