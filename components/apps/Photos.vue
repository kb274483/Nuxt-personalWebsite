<template>
  <div class="photos-container relative h-full flex flex-col bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
    
    <div class="flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/80 dark:bg-[#282828]/90 backdrop-blur-md z-10">
    </div>

    <!-- 網格區域 -->
    <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
      <div v-if="loading" class="photos-grid grid gap-2 sm:gap-4">
        <PhotoSkeletonTile
          v-for="index in skeletonCount"
          :key="index"
        />
      </div>

      <div v-else 
        class="photos-grid grid gap-2 sm:gap-4"
      >
        <button 
          v-for="photo in photos" 
          :key="photo.id"
          class="group relative aspect-square cursor-pointer overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 text-left"
          @click="openLightbox(photo)"
          :aria-label="'View photo: ' + (photo.title || 'Untitled')"
        >
          <!-- 縮圖 -->
          <img 
            :src="photo.thumbnail || '/photo-thumb-placeholder.svg'" 
            :alt="photo.title || 'Untitled'"
            class="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
            :class="isImageLoaded(photo.id) ? 'opacity-100' : 'opacity-0'"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            @load="markImageLoaded(photo.id)"
            @error="(event) => handleGridImageError(event, photo.id)"
          />

          <Transition
            leave-active-class="transition-opacity duration-300"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <PhotoSkeletonTile
              v-if="!isImageLoaded(photo.id)"
              class="absolute inset-0 z-10"
              overlay
            />
          </Transition>
          
          <!-- Hover 遮罩 -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
            <p class="text-white text-xs font-medium truncate">
              {{ photo.title || 'Untitled' }}</p>
            <p v-if="photo.shoot_date" class="text-gray-300 text-[10px]">
              {{ formatDate(photo.shoot_date) }}</p>
          </div>
        </button>
      </div>
      <div class="h-10"></div>
    </div>

    <!-- Lightbox -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-75"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-75"
    >
      <PhotoLightbox
        v-if="selectedPhoto"
        :selectedPhoto="selectedPhoto"
        :photos="photos"
        @close="closeLightbox"
        @navigate="lightboxControl"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Photo } from '~/types/photo.type'
import { usePhotoManager } from '~/stores/photoManager'
import { formatDate } from '~/utils/common'
import PhotoSkeletonTile from '~/components/photos/PhotoSkeleton.vue'
import PhotoLightbox from '../photos/PhotoLightbox.vue'
import { useImageFallback } from '~/composables/useImageFallback'

// Lightbox State
const selectedPhoto = ref<Photo | null>(null)
const openLightbox = (photo: Photo) => {
  selectedPhoto.value = photo
}
const closeLightbox = () => {
  selectedPhoto.value = null
}

// 照片資料
const photos = computed(() => usePhotoManager().photos)
const loading = computed(() => usePhotoManager().loading)
// 預設骨架數量
const skeletonCount = 18

// Photos 骨架效果相關
const loadedImageIDs = ref(new Set<Photo['id']>())
const markImageLoaded = (photoId: Photo['id'])=>{
  loadedImageIDs.value.add(photoId)
}
const isImageLoaded = (photoId: Photo['id'])=>{
  return loadedImageIDs.value.has(photoId)
}


const lightboxControl = (direction: 'prev' | 'next') => {
  const currentIndex = photos.value.findIndex(photo => photo.id === selectedPhoto.value?.id)
  let targetIndex = 0
  if (direction === 'prev') {
    targetIndex = currentIndex - 1
    if (targetIndex < 0) {
      targetIndex = photos.value.length - 1
    }
  } else if (direction === 'next') {
    targetIndex = currentIndex + 1
    if (targetIndex >= photos.value.length) {
      targetIndex = 0
    }
  }
  selectedPhoto.value = photos.value[targetIndex] as Photo
}

const { applyImageFallback } = useImageFallback()
const handleGridImageError = (event: Event, photoId: Photo['id']) => {
  applyImageFallback(event, {
    onFallbackError: () => markImageLoaded(photoId),
  })
}

onMounted(async () => {
  if(!usePhotoManager().loaded) {
    await usePhotoManager().initialize()
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
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

@container photos-container (min-width: 1200px) {
  .photos-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
