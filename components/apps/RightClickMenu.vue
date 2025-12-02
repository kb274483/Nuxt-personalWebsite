<template>
  <div class="absolute z-50 bg-slate-100 dark:bg-stone-800 rounded-md shadow-md p-1 border border-slate-500 dark:border-slate-500 w-48"
  :style="{
      left: `${props.x}px`,
      top: `${props.y}px`,
    }"
  >
    <div class="flex flex-col gap-2">
      <div 
        v-for="(item, index) in menuItems" 
        :key="index"
        class="h-10 px-3 rounded hover:bg-gray-800/90 hover:text-white cursor-pointer flex items-center transition-colors"
        @click="handleClick(item)"
      >
        <span class="text-sm">{{ item.label }}</span>
      </div>
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