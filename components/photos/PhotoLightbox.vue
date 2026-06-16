<template>
  <div
    class="absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-[#1e1e1e]/95 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    lightbox
  </div>

</template>

<script setup lang="ts">
import type { Photo } from '~/types/photo.type';

type Props = {
  photo: Photo
  photos: Photo[]
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
  ngvigate: [direction: 'prev' | 'next']
}>()

</script>