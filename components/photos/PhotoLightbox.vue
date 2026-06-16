<template>
  <div
    class="absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-[#1e1e1e]/95 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div 
      v-if="selectedPhoto" 
      class="absolute inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div class="flex flex-col md:flex-row w-full h-full max-w-8xl p-4 gap-4">
        <div class="flex-1 flex items-center justify-center relative overflow-hidden rounded bg-transparent"
          @mouseenter="controlBtnShow(true)"
          @mouseleave="controlBtnShow(false)"
        >
          <div
            class="absolute inset-0 w-full h-full flex items-center justify-between rounded-lg transition-opacity duration-500 ease-in-out z-50 pointer-events-none"
            :class="{ 'opacity-100': isControlBtnShow, 'opacity-0': !isControlBtnShow }"
          >
            <button @click="emit('navigate', 'prev')" class="pointer-events-auto rounded-full focus:outline-none" aria-label="Previous photo">
              <ArrowBigLeftDash
                class="w-8 h-8 cursor-pointer rounded-full p-2 bg-white/50 dark:bg-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all duration-200 hover:scale-110"
                :class="{
                  'opacity-50': !isMobile,
                  'opacity-30': isMobile
                }"
              />
            </button>
            <button @click="emit('navigate', 'next')" class="pointer-events-auto rounded-full focus:outline-none" aria-label="Next photo">
              <ArrowBigRightDash 
                class="w-8 h-8 cursor-pointer rounded-full p-2 bg-white/50 dark:bg-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all duration-200 hover:scale-110" 
                :class="{
                  'opacity-50': !isMobile,
                  'opacity-30': isMobile
                }"
              />
            </button>
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

        <div class="relative w-full md:w-64 flex-none bg-gray-50 dark:bg-[#252525] rounded-lg rounded-tr-3xl p-5 flex flex-col gap-4 overflow-y-auto border border-gray-200 dark:border-gray-700"
          :class="{ 'mb-12': isMobile }"
        >
          <button 
            class="absolute top-0 right-0 p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-50"
            @click="emit('close')"
            aria-label="Close lightbox"
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
  </div>

</template>

<script setup lang="ts">
import { X, LoaderCircle, ArrowBigRightDash, ArrowBigLeftDash } from 'lucide-vue-next'
import { useIsMobile } from '~/composables/useIsMobile'
import { formatDate } from '~/utils/common'
import type { Photo } from '~/types/photo.type'

type Props = {
  selectedPhoto: Photo
  photos: Photo[]
}

defineProps<Props>()
const emit = defineEmits<{
  close: []
  navigate: [direction: 'prev' | 'next']
}>()

const { isMobile } = useIsMobile()

// 燈箱控制按鈕 state
const isControlBtnShow = ref<boolean>(false)
const controlBtnShow = (status: boolean) => {
  if (!isMobile.value) {
    isControlBtnShow.value = status
  }
}

// Image Loading
const imageLoaded = ref<boolean>(false)
const handleImageLoad = () => {
  console.log('image loaded')
  imageLoaded.value = true
}

</script>