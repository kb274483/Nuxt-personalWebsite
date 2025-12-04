<template>
  <div class="photos-container relative h-full flex flex-col bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
    
    <div class="flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/80 dark:bg-[#282828]/90 backdrop-blur-md z-10">
    </div>

    <!-- 網格區域 -->
    <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
      <div v-if="loading" class="h-full flex items-center justify-center text-gray-400">
        <span class="animate-pulse">Loading...</span>
      </div>

      <div v-else 
        class="photos-grid grid gap-2 sm:gap-4"
      >
        <div 
          v-for="photo in photos" 
          :key="photo.id"
          class="group relative aspect-square cursor-pointer overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
          @click="openLightbox(photo)"
        >
          <!-- 縮圖 -->
          <img 
            :src="photo.thumbnail" 
            :alt="photo.title || 'Untitled'"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          <!-- Hover 遮罩 -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
            <p class="text-white text-xs font-medium truncate">
              {{ photo.title || 'Untitled' }}</p>
            <p v-if="photo.shoot_date" class="text-gray-300 text-[10px]">
              {{ formatDate(photo.shoot_date) }}</p>
          </div>
        </div>
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
      <div 
        v-if="selectedPhoto" 
        class="absolute inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-sm"
        @click.self="closeLightbox"
      >
        <div class="flex flex-col md:flex-row w-full h-full max-w-8xl p-4 gap-4">
          <!-- 照片 -->
          <div class="flex-1 flex items-center justify-center relative overflow-hidden rounded bg-transparent"
            @mouseenter="controlBtnShow(true)"
            @mouseleave="controlBtnShow(false)"
          >
            <div
              class="absolute inset-0 w-full h-full flex items-center justify-between rounded-lg transition-opacity duration-500 ease-in-out z-50"
              :class="{ 'opacity-100': isControlBtnShow, 'opacity-0': !isControlBtnShow }"
            >
              <ArrowBigLeftDash @click="lightboxControl('prev')"
                class="w-12 h-12 opacity-50 cursor-pointer bg-white/50 dark:bg-gray-700/50 rounded-full p-2 hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all duration-200 hover:scale-110"
              />
              <ArrowBigRightDash @click="lightboxControl('next')" 
                class="w-12 h-12 opacity-50 cursor-pointer bg-white/50 dark:bg-gray-700/50 rounded-full p-2 hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all duration-200 hover:scale-110" 
              />
            </div>
            <img
              @load="handleImageLoad"
              :src="selectedPhoto.src" 
              :alt="selectedPhoto.title || ''"
              class="max-w-full max-h-full object-contain shadow-2xl rounded
              transition-opacity duration-500 ease-in-out "
              :class="{ 'opacity-0': !imageLoaded, 'opacity-100': imageLoaded }"
            />
            <div
              class="absolute inset-0 flex items-center justify-center rounded-lg transition-opacity duration-500 ease-in-out"
              :class="{ 'opacity-0': imageLoaded, 'opacity-100': !imageLoaded }"
            >
              <LoaderCircle class="w-10 h-10 animate-spin" />
            </div>
          </div>

          <!-- 照片資訊 -->
          <div class="relative w-full md:w-64 flex-none bg-gray-50 dark:bg-[#252525] rounded-lg rounded-tr-3xl p-5 flex flex-col gap-4 overflow-y-auto border border-gray-200 dark:border-gray-700"
            :class="{ 'mb-12': isMobile }"
          >
            <button 
              class="absolute top-0 right-0 p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-50"
              @click="closeLightbox"
            >
              <X class="w-5 h-5" />
            </button>
            <div>
              <h3 class="text-lg font-bold mb-1">
                {{ selectedPhoto.title || 'Untitled' }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
                {{ selectedPhoto.description || 'No description...' }}
              </p>

              <div class="h-px bg-gray-200 dark:bg-gray-700 my-3"></div>

              <p class="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">Camera：{{ 
                  selectedPhoto.exif?.Model ? 
                  selectedPhoto.exif.Model : 'Unknown' 
                }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">Lens：{{ 
                  selectedPhoto.exif?.LensModel ? 
                  selectedPhoto.exif.LensModel : 'Unknown' 
                }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">ISO：{{ 
                  selectedPhoto.exif?.ISO ? 
                  selectedPhoto.exif.ISO : 'Unknown' 
                }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">Aperture：{{ 
                  selectedPhoto.exif?.FNumber ? 
                  selectedPhoto.exif.FNumber : 'Unknown' 
                }}
              </p>
            </div>
            
            <div class="h-px bg-gray-200 dark:bg-gray-700"></div>

            <div class="space-y-3 text-sm">
              <div v-if="selectedPhoto.shoot_date" class="flex flex-col">
                <span class="text-xs text-gray-400 uppercase">
                  Shoot Date
                </span>
                <span>{{ formatDate(selectedPhoto.shoot_date) }}</span>
              </div>
              
              <div v-if="selectedPhoto.country || selectedPhoto.city" class="flex flex-col">
                <span class="text-xs text-gray-400 uppercase">
                  Location
                </span>
                <span class="flex items-center gap-1">
                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                   {{ [selectedPhoto.city, selectedPhoto.country].filter(Boolean).join(', ') }}
                </span>
              </div>

              <div v-if="selectedPhoto.tags && selectedPhoto.tags.length" class="flex flex-col">
                <span class="text-xs text-gray-400 uppercase mb-1">
                  Tags
                </span>
                <div class="flex flex-wrap gap-1">
                  <span v-for="tag in selectedPhoto.tags" :key="tag" class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                    #{{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { usePhotoApi } from '~/composables/api/usePhotoApi'
import type { Photo } from '~/types/photo.type'
import { X, LoaderCircle, ArrowBigRightDash, ArrowBigLeftDash } from 'lucide-vue-next'
import { useIsMobile } from '~/composables/useIsMobile'

const { getPhotos } = usePhotoApi()
const photos = ref<Photo[]>([])
const loading = ref<boolean>(true)

// 判斷是否為手機
const { isMobile } = useIsMobile()
// Lightbox State
const selectedPhoto = ref<Photo | null>(null)
const openLightbox = (photo: Photo) => {
  selectedPhoto.value = photo
}
const closeLightbox = () => {
  selectedPhoto.value = null
  imageLoaded.value = false
}

// 燈箱控制按鈕 state
const isControlBtnShow = ref<boolean>(false)
const controlBtnShow = (status: boolean) => {
  if (!isMobile.value) {
    isControlBtnShow.value = status
  }
}

const lightboxControl = (direction: 'prev' | 'next') => {
  const currentIndex = photos.value.findIndex(photo => photo.id === selectedPhoto.value?.id)
  let targetIndex = 0
  imageLoaded.value = true
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
  if (selectedPhoto.value) {
    imageLoaded.value = false
  }
}

// Image Loading
const imageLoaded = ref<boolean>(false)
const handleImageLoad = () => {
  console.log('image loaded')
  imageLoaded.value = true
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  try {
    loading.value = true
    const { data } = await getPhotos()
    photos.value = data?.value || []
  } catch (e) {
    console.error('Load photos failed', e)
  } finally {
    loading.value = false
  }
  if (isMobile.value) {
    isControlBtnShow.value = true
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