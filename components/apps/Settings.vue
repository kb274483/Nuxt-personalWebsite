<template>
  <div ref="settingWindowRef"
    class="relative h-full flex flex-col bg-gray-50 dark:bg-stone-800/80 text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <div class="p-4 flex flex-col flex-1 overflow-hidden pb-14">
        <h2 class="text-lg font-bold mb-2 flex-shrink-0">System Settings</h2>

        <div class="bg-white dark:bg-stone-700 rounded-lg shadow px-4 py-2 mb-4 transition-colors duration-300 flex-shrink-0">
            <h3 class="font-semibold mb-2 text-sm text-gray-500 dark:text-gray-400 uppercase">
                Do Not Touch This Button
            </h3>
            <div class="flex items-center justify-between py-2 border-b dark:border-gray-600 last:border-0">
                <span>IS DANGEROUS</span>
                <button ref="tricksyButtonRef"
                    @click="handleGravity()"
                    @mouseenter="tricksyButton()"
                    class="group w-16 h-10 rounded relative cursor-pointer transition-all duration-300 ease-in-out focus:outline-none p-2 hover:bg-red-500/70 dark:hover:bg-red-500/70 active:scale-95 z-50"
                    :class="useGravityManager().isGravityEnabled ?
                        'bg-red-500/70 dark:bg-red-500/70' :
                        'bg-gray-200 dark:bg-stone-500'"
                    :style="tricksyButtonStyle"
                >
                    <Skull class="w-6 h-6 mx-auto group-hover:animate-bounce " ref="toggleGravityRef" />
                </button>
            </div>
        </div>

        <div class="bg-white dark:bg-stone-700 rounded-lg shadow px-4 py-2 mb-4 transition-colors duration-300 flex-shrink-0">
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
        <div class="bg-white dark:bg-stone-700 rounded-lg shadow px-4 py-2 mb-4 transition-colors duration-300 flex-shrink-0">
            <h3 class="font-semibold mb-2 text-sm text-gray-500 dark:text-gray-400 uppercase">Desktop Items</h3>

            <div class="flex items-center justify-between py-2 border-b dark:border-gray-600 last:border-0">
                <span>Reset</span>
                <button @click="resetDesktopItems()"
                    class="w-16 h-10 rounded relative cursor-pointer transition-colors duration-200 focus:outline-none bg-gray-200 dark:bg-stone-500 p-2 hover:bg-gray-300 dark:hover:bg-stone-600 active:scale-95"
                >
                    <RotateCw class="w-6 h-6 mx-auto" ref="resetDesktopItemsRef" />
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
                        class="aspect-square relative rounded-lg border-2 transition-all p-1 sm:p-4"
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
import { RotateCw, FileUser, Code, Image, Settings, Plane, Skull, Check } from 'lucide-vue-next'
import { useTemplateRef, onMounted } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'
import { useWallpaper } from '~/composables/useWallpaper'
import { usePhotoManager } from '~/stores/photoManager'
import { useGravityManager } from '~/stores/gravityManager'

// 桌布狀態
const { wallpaper, setWallpaper } = useWallpaper()
// 取得照片

const photos = computed(() => usePhotoManager().photos)
const loading = computed(() => usePhotoManager().loading)

const isDark = useDark()
const toggleDark = useToggle(isDark)

// 不能按的按鈕
const tricksyRunCount = ref(0)
const tricksyButtonStyle = ref({})
const currentTransform = ref({ x: 0, y: 0 })

const settingWindowRef = useTemplateRef<HTMLDivElement>('settingWindowRef')
const tricksyButtonRef = useTemplateRef<HTMLButtonElement>('tricksyButtonRef')
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
        { id: 'travel', name: 'Travel Path', icon: Plane, disabled_delete: true, x: 10, y: 340, width: 48, height: 48, zIndex: 1 },
    ]
    useDesktopItemsManager().setupDesktopItems(appsDefault)
}

const tricksyButton = () => {
    if (tricksyRunCount.value >= 7) return // 追七次就好
    const container = settingWindowRef.value
    const button = tricksyButtonRef.value
    if (!container || !button) return

    const containerRect = container.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    
    // 當前相對於容器的左上角位置
    const currentLeft = buttonRect.left - containerRect.left
    const currentTop = buttonRect.top - containerRect.top
    
    // 隨機移動距離
    const moveRange = 150
    let nextTx = 0
    let nextTy = 0
    let safe = false
    let attempts = 0

    const originalLeft = currentLeft - currentTransform.value.x
    const originalTop = currentTop - currentTransform.value.y

    while (!safe && attempts < 10) {
        const deltaX = (Math.random() - 0.5) * moveRange * 2
        const deltaY = (Math.random() - 0.5) * moveRange * 2
        
        // 先計算位移量
        const potentialTx = currentTransform.value.x + deltaX
        const potentialTy = currentTransform.value.y + deltaY
        
        // 加上位移量後，實際在容器中的位置
        const potentialLeft = originalLeft + potentialTx
        const potentialTop = originalTop + potentialTy
        
        // 檢查邊界，保留 20px padding
        const padding = 20
        const maxLeft = containerRect.width - buttonRect.width - padding
        const maxTop = containerRect.height - buttonRect.height - padding
        
        if (potentialLeft > padding && potentialLeft < maxLeft &&
            potentialTop > padding && potentialTop < maxTop)
        {
            nextTx = potentialTx
            nextTy = potentialTy
            safe = true
        }
        attempts++
    }

    if (safe) {
        currentTransform.value = { x: nextTx, y: nextTy }
        tricksyButtonStyle.value = {
            transform: `translate3d(${nextTx}px, ${nextTy}px, 0)`
        }
        tricksyRunCount.value++
    } else {
        const resetTx = (Math.random() - 0.5) * 150
        const resetTy = (Math.random() - 0.5) * 150
        currentTransform.value = { x: resetTx, y: resetTy }
        tricksyButtonStyle.value = {
             transform: `translate3d(${resetTx}px, ${resetTy}px, 0)`
        }
    }
}

const handleGravity = ()=>{
    useGravityManager().toggleGravity()
    tricksyRunCount.value = 0
    currentTransform.value = { x: 0, y: 0 }
    tricksyButtonStyle.value = {
        transform: `translate3d(0, 0, 0)`
    }
}

onMounted(async () => {
    if(!usePhotoManager().loaded) {
        await usePhotoManager().initialize()
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