<template>
  <div
    class="absolute z-50 bg-neo-bg dark:bg-black border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] w-52 overflow-hidden"
    :style="{ left: `${props.x}px`, top: `${props.y}px` }"
  >
    <div role="menu">
      <button
        v-for="(item, index) in menuItems"
        :key="index"
        class="w-full h-10 px-4 font-bold text-sm uppercase tracking-wide text-black dark:text-white text-left flex items-center border-b-2 border-black dark:border-white last:border-b-0 hover:bg-[#FFD93D] hover:text-black transition-none"
        @click="handleClick(item)"
        role="menuitem"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '~/types/menu.type'

const props = defineProps<{
  x: number
  y: number
  menuItems: MenuItem[]
}>()

const emit = defineEmits(['close'])
const handleClick = (item: MenuItem) => {
  item.action()
  emit('close')
}
</script>
