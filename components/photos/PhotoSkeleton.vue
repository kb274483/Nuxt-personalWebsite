<template>
  <div
    :class="[
      'overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800',
      overlay ? 'absolute inset-0 h-full w-full' : 'relative aspect-square',
    ]"
    aria-hidden="true"
  >
    <div class="absolute inset-0 animate-pulse bg-gray-300 dark:bg-slate-700" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  overlay?: boolean
}>()
</script>