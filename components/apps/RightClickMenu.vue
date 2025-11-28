<template>
  <div class="absolute z-50 bg-slate-100 dark:bg-slate-900 rounded-md shadow-md p-1 border border-slate-500 dark:border-slate-500 w-48"
  :style="{
      left: `${props.x}px`,
      top: `${props.y}px`,
    }"
  >
    <div class="flex flex-col gap-2">
      <div class="h-10 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center">
        <span class="text-sm text-slate-500 dark:text-slate-400">
          Add to Desktop
        </span>
      </div>
      <div class="h-10 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center">
        <span class="text-sm text-slate-500 dark:text-slate-400">
          Display Settings
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    x: number
    y: number
  }>()
</script>