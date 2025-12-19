<template>
  <div class="w-full h-12 bg-slate-400/70 dark:bg-stone-600/50 backdrop-blur-md text-gray-900 dark:text-white flex items-center justify-between px-4 text-xs font-medium select-none z-50 fixed top-0 left-0 border-b border-gray-200/50 dark:border-white/10 shadow-sm transition-colors duration-300">
    <div class="flex items-center space-x-4">
      <span 
        ref="titleRef" 
        class="font-bold text-base inline-block cursor-grab active:cursor-grabbing"
        :style="{ transform: `translate3d(${titleX}px, ${titleY}px, 0)` }"
      >
        Roy Space
      </span>
      <div class="flex items-center gap-4">
        <AnimationMenu 
          :items="socialLinks" 
          :gap="45"
          :auto-close="false"
          direction="right" 
          item-size="w-8 h-8"
        />
      </div>
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
        ref="themeBtnRef"
        @click="handleThemeChange($event)" 
        class="p-2 rounded-md hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        :style="{ transform: `translate3d(${btnX}px, ${btnY}px, 0)` }"
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
import AnimationMenu from '~/components/AnimationMenu.vue'
import type { AnimeMenuItem } from '~/types/animeMenu.type'
import { usePhysicsCalc } from '~/composables/usePhysicsCalc'
import { useDraggable } from '@vueuse/core'
import { useGravityManager } from '~/stores/gravityManager'

const isDark = useDark()
const toggleDark = useToggle(isDark)
const windowStore = useWindowManager()
const gravityManager = useGravityManager()

// Physics refs
const titleRef = ref<HTMLElement | null>(null)
const themeBtnRef = ref<HTMLElement | null>(null)


const { x: titleX, y: titleY, startDrag, moveDrag, endDrag } = usePhysicsCalc(titleRef)
const { x: btnX, y: btnY } = usePhysicsCalc(themeBtnRef)

const socialLinks: AnimeMenuItem[] = [
  {
    name: 'Github',
    icon: '/github-logo.png',
    href: 'https://github.com/kb274483',
    alt: 'GitHub Profile',
    bgColor: 'bg-white/70 dark:bg-white/50'
  },
  {
    name: 'Notion',
    icon: '/notion-logo.png',
    href: 'https://delirious-workshop-239.notion.site/Roy-s-Front-end-experience-note-151d63554ba44572b9c114a4bb9b1628?source=copy_link',
    alt: 'Notion Notes',
    bgColor: 'bg-white/70 dark:bg-white/50'
  },
  {
    name: 'Instagram',
    icon: '/instagram-logo.png',
    href: 'https://www.instagram.com/royphotospace?igsh=MXJxbDFjemhmYnNmaA%3D%3D&utm_source=qr',
    alt: 'Instagram',
    bgColor: 'bg-white/70 dark:bg-white/50'
  }
];

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

// 設定拖曳
useDraggable(titleRef, {
  initialValue: { x: 0, y: 0 },
  handle: titleRef,
  disabled: computed(() => !gravityManager.isGravityEnabled),
  onStart: (_, event: PointerEvent) => {
    if(gravityManager.isGravityEnabled) {
      startDrag(event.clientX, event.clientY)
    }
  },
  onMove: (_, event: PointerEvent) => {
    if(gravityManager.isGravityEnabled) {
      moveDrag(event.clientX, event.clientY)
    }
  },
  onEnd: () => {
    if (gravityManager.isGravityEnabled) {
      endDrag()
    }
  }
})
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
