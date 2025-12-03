<template>
  <div class="h-full flex flex-col bg-gray-50 dark:bg-stone-800/80 text-gray-900 dark:text-gray-100 transition-colors duration-300">
  </div>
</template>

<script setup lang="ts">
import { usePhotoApi } from '~/composables/api/usePhotoApi'
import type { Photo } from '~/types/photo.type'

const { getPhotos } = usePhotoApi()
const photos = ref<Photo[]>([])

onMounted(async () => {
  const { data } = await getPhotos()
  photos.value = data?.value || []
  console.log(photos.value)
})
</script>
