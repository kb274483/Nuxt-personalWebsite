<template>
  <div 
    class="relative z-50 inline-flex items-center justify-center"
    :class="containerSizeClass"
    @mouseenter="cancelAutoClose"
    @mouseleave="startAutoClose"
  >
    <!-- 選單開關 -->
    <button
      class="relative z-50 flex items-center justify-center rounded-full shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95 bg-white/90 backdrop-blur-sm dark:bg-stone-800/90"
      :class="[itemSizeClass, mainButtonColor]"
      @click="toggleMenu"
    >
      <transition name="fade" mode="out-in">
        <!-- 一.選單開啟時，顯示 X -->
        <div v-if="isOpen" 
          class="flex items-center justify-center"
        >
          <X class="w-2/3 h-2/3" />
        </div>

        <!-- 二: 選單關閉 -->
        <div v-else class="w-full h-full flex items-center justify-center">
          <!-- 自訂封面 -->
          <img 
            v-if="menuIcon" 
            :src="menuIcon" 
            class="w-full h-full object-cover rounded-full p-1"
            alt="Menu"
          />
          <!-- 預設封面 -->
          <div v-else class="flex items-center justify-center w-full h-full">
            <Menu class="w-2/3 h-2/3" />
          </div>
        </div>
      </transition>
    </button>

    <div class="absolute inset-0 flex items-center justify-center -z-10">
      <div
        v-for="(item, index) in items"
        :key="item.name"
        :ref="(el) => { if(el) menuItemsRef[index] = el as HTMLElement }"
        class="absolute flex items-center justify-center opacity-0 pointer-events-none"
        :class="itemSizeClass"
      >
        <a
          :href="item.href"
          target="_blank"
          class="w-full h-full flex items-center justify-center rounded-full shadow-md border border-white/20 dark:border-none transition-transform duration-300 hover:scale-125"
          :class="item.bgColor || 'bg-white'"
          @click="isOpen = false" 
        >
          <img :src="item.icon" :alt="item.alt || item.name" 
            class="w-full h-full object-cover rounded-full p-1"
          >
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { AnimeMenuItem, MenuDirection } from '@/types/animeMenu.type';
import { Menu, X } from 'lucide-vue-next';
import { animate, stagger, createTimeline, spring } from 'animejs';

interface Props {
  items: AnimeMenuItem[];
  direction?: MenuDirection;
  gap?: number;
  itemSize?: string;
  autoClose?: boolean;
  menuIcon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'right',
  gap: 50,
  itemSize: 'w-10 h-10',
  autoClose: true,
  menuIcon: undefined
});

const isOpen = ref(false);
const menuItemsRef = ref<HTMLElement[]>([]);
let closeTimer: ReturnType<typeof setTimeout> | null = null;

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

// 樣式設定
const containerSizeClass = computed(() => props.itemSize);
const itemSizeClass = computed(() => props.itemSize);
const mainButtonColor = 'bg-white/90 backdrop-blur-sm';

// 啟動自動關閉-計時
const startAutoClose = () => {
  if (props.autoClose && isOpen.value) {
    closeTimer = setTimeout(() => {
      isOpen.value = false;
    }, 600);
  }
};
// 取消自動關閉
const cancelAutoClose = () => {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
};

const getTargetPosition = (index: number) => {
  const distance = (index + 1) * props.gap;
  switch (props.direction) {
    case 'right': return { x: distance, y: 0 };
    case 'left': return { x: -distance, y: 0 };
    case 'down': return { x: 0, y: distance };
    case 'up': return { x: 0, y: -distance };
    default: return { x: distance, y: 0 };
  }
};

watch(isOpen, (newVal) => {
  // 清除正在進行的動畫
  const timeline = createTimeline().sync()
  timeline.remove(menuItemsRef.value);

  if (newVal) {
    animate(menuItemsRef.value, {
      // @ts-ignore
      translateX: (_el, i:number) => getTargetPosition(i).x,
      // @ts-ignore
      translateY: (_el, i:number) => getTargetPosition(i).y,
      rotate: '2turn',
      scale: [0, 1],
      opacity: [0, 1],
      ease: spring({ 
        bounce: .5,
        duration: 350,
      }),
      delay: stagger(100),
      begin: () => {
        menuItemsRef.value.forEach(el => el.style.pointerEvents = 'auto');
      }
    });
  } else {
    // === 關閉動畫 ===
    animate(menuItemsRef.value,{
      translateX: 0,
      translateY: 0,
      scale: 0.5,
      opacity: 0,
      rotate: '0turn',
      ease: spring({ 
        bounce: .25,
        duration: 350,
      }),
      delay: stagger(100),
      complete: () => {
        menuItemsRef.value.forEach(el => el.style.pointerEvents = 'none');
      }
    });
  }
});
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: scale(0.8);
  }
</style>
