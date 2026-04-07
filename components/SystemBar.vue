<template>
  <div class="w-full h-12 bg-neo-bg dark:bg-black border-b-4 border-black dark:border-white text-black dark:text-white flex items-center justify-between px-3 select-none z-50 fixed top-0 left-0 transition-colors duration-300">

    <!-- LEFT: Logo + Social Links -->
    <div class="flex items-center gap-3">
      <!-- Logo sticker -->
      <span
        ref="titleRef"
        class="inline-flex items-center h-8 px-3 bg-[#FFD93D] dark:bg-white border-2 border-black font-black text-sm uppercase tracking-widest text-black cursor-grab active:cursor-grabbing shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] select-none"
        :style="{ transform: `translate3d(${titleX}px, ${titleY}px, 0)` }"
      >
        ROY SPACE
      </span>

      <!-- Social Links -->
      <AnimationMenu
        :items="socialLinks"
        :gap="45"
        :auto-close="false"
        direction="right"
        item-size="w-8 h-8"
      />
    </div>

    <!-- RIGHT: Minimized windows + Theme toggle -->
    <div class="flex items-center gap-2">

      <!-- Minimized window count -->
      <div class="relative">
        <button
          @click="isMinWindowsList = !isMinWindowsList"
          :aria-label="`Show ${minWindows.length} minimized windows`"
          class="w-9 h-9 border-2 border-black dark:border-white font-black text-sm flex items-center justify-center shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-neo-accent hover:border-black transition-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <Transition name="slide-up" mode="out-in">
            <span :key="minWindows.length" class="absolute font-black font-mono">
              {{ minWindows.length }}
            </span>
          </Transition>
        </button>

        <!-- Minimized windows list -->
        <div
          v-if="isMinWindowsList && minWindows.length > 0"
          class="absolute top-full right-0 mt-2 w-52 bg-neo-bg dark:bg-black border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] overflow-hidden"
        >
          <button
            v-for="window in minWindows"
            :key="window.id"
            @click="openMinWindow(window.id)"
            :aria-label="'Open minimized window: ' + window.title"
            class="w-full px-4 py-2 text-sm font-bold uppercase tracking-wide text-left flex items-center gap-2 border-b-2 border-black dark:border-white last:border-b-0 hover:bg-neo-secondary dark:hover:bg-neo-secondary dark:hover:text-black transition-none"
          >
            <AppWindow class="w-4 h-4 shrink-0" />
            <span class="truncate">{{ window.title }}</span>
          </button>
        </div>
      </div>

      <!-- Theme toggle -->
      <button
        ref="themeBtnRef"
        @click="handleThemeChange($event)"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        :aria-label="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        class="w-9 h-9 border-2 border-black dark:border-white flex items-center justify-center shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-neo-muted hover:border-black transition-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        :style="{ transform: `translate3d(${btnX}px, ${btnY}px, 0)` }"
      >
        <Sun v-show="isDark"  class="w-5 h-5 stroke-[2.5px]" />
        <Moon v-show="!isDark" class="w-5 h-5 stroke-[2.5px]" />
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

const titleRef = ref<HTMLElement | null>(null)
const themeBtnRef = ref<HTMLElement | null>(null)

const { x: titleX, y: titleY, startDrag, moveDrag, endDrag } = usePhysicsCalc(titleRef)
const { x: btnX, y: btnY } = usePhysicsCalc(themeBtnRef)

const socialLinks: AnimeMenuItem[] = [
  {
    name: 'Github',
    icon: '/github-logo.svg',
    href: 'https://github.com/kb274483',
    alt: 'GitHub Profile',
    bgColor: 'bg-white border-2 border-black'
  },
  {
    name: 'Notion',
    icon: '/notion-logo.svg',
    href: 'https://delirious-workshop-239.notion.site/Roy-s-Front-end-experience-note-151d63554ba44572b9c114a4bb9b1628?source=copy_link',
    alt: 'Notion Notes',
    bgColor: 'bg-white border-2 border-black'
  },
  {
    name: 'Instagram',
    icon: '/instagram-logo.svg',
    href: 'https://www.instagram.com/royphotospace?igsh=MXJxbDFjemhmYnNmaA%3D%3D&utm_source=qr',
    alt: 'Instagram',
    bgColor: 'bg-white border-2 border-black'
  }
]

const minWindows = computed(() => windowStore.windows.filter(w => w.isMinimized))
const isMinWindowsList = ref<boolean>(false)

const openMinWindow = (id: string) => {
  windowStore.toggleMinimize(id)
  isMinWindowsList.value = false
}

const handleThemeChange = (event: MouseEvent) => {
  const transitionCheck =
    'startViewTransition' in document &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!transitionCheck) {
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

useDraggable(titleRef, {
  initialValue: { x: 0, y: 0 },
  handle: titleRef,
  disabled: computed(() => !gravityManager.isGravityEnabled),
  onStart: (_, event: PointerEvent) => {
    if (gravityManager.isGravityEnabled) startDrag(event.clientX, event.clientY)
  },
  onMove: (_, event: PointerEvent) => {
    if (gravityManager.isGravityEnabled) moveDrag(event.clientX, event.clientY)
  },
  onEnd: () => {
    if (gravityManager.isGravityEnabled) endDrag()
  }
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.15s ease-out;
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
