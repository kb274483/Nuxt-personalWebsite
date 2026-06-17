<template>
  <div 
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
          :class="{ 'opacity-100': shouldShowControls, 'opacity-0': !shouldShowControls }"
        >
          <button @click="emit('navigate', 'prev')" class="pointer-events-auto rounded-full focus:outline-none" aria-label="Previous photo">
            <ArrowBigLeft
              class="w-8 h-8 cursor-pointer rounded-full p-2 bg-white/50 dark:bg-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all duration-200 hover:scale-110 opacity-50"
            />
          </button>
          <button @click="emit('navigate', 'next')" class="pointer-events-auto rounded-full focus:outline-none" aria-label="Next photo">
            <ArrowBigRight
              class="w-8 h-8 cursor-pointer rounded-full p-2 bg-white/50 dark:bg-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-700/90 transition-all duration-200 hover:scale-110 opacity-50" 
            />
          </button>
        </div>
        <img
          draggable="false"
          @dragstart.prevent
          @load="handleImageLoad"
          @pointerdown="startDrag"
          @pointermove="dragImage"
          @pointerup="stopDrag"
          @pointercancel="stopDrag"
          :style="imageStyle"
          :src="selectedPhoto.src"
          :alt="selectedPhoto.title || ''"
          :class="[
            { 'opacity-0': !imageLoaded, 'opacity-100': imageLoaded },
            scale > MIN_SCALE ? (
              onDragging ? 
                'cursor-grabbing transition-none' :
                'cursor-grab transition-transform duration-200 ease-out'
              ) : 
            'cursor-zoom-in transition-transform duration-200 ease-out'
          ]"
          class="max-w-full max-h-full select-none touch-none object-contain shadow-2xl rounded"
        />
        <div v-if="!imageLoaded"
          class="absolute inset-0 flex items-center justify-center rounded-lg transition-opacity duration-500 ease-in-out"
          :class="{ 'opacity-0': imageLoaded, 'opacity-100': !imageLoaded }"
        >
          <LoaderCircle class="w-10 h-10 animate-spin" />
        </div>
      </div>

      <div class="absolute bottom-2 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/10 px-2 py-1 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/10">
        <button
          type="button"
          class="rounded-full p-2 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-700"
          :disabled="!canZoomOut"
          aria-label="Zoom out"
          @click="zoomOut"
        >
          <ZoomOut class="h-4 w-4" />
        </button>

        <button
          type="button"
          class="min-w-12 rounded-full px-2 py-1 text-center text-xs font-medium tabular-nums transition hover:bg-white/80 dark:hover:bg-gray-700"
          aria-label="Reset zoom"
          @click="imageViewReset"
        >
          {{ Math.round(scale * 100) }}%
        </button>

        <button
          type="button"
          class="rounded-full p-2 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-700"
          :disabled="!canZoomIn"
          aria-label="Zoom in"
          @click="zoomIn"
        >
          <ZoomIn class="h-4 w-4" />
        </button>
      </div>

      <div class="flex-none bg-gray-50 dark:bg-[#252525] dark:border-gray-700 border border-gray-200 
        transition-all duration-300 ease-out"
        :class="isInfoExpanded
          ? 'relative w-full flex-none rounded-lg rounded-tr-3xl p-4 pt-10 md:w-64'
          : 'absolute inset-x-4 bottom-4 z-50 rounded-lg p-3 md:left-auto md:right-4 md:w-96'
        "
      >
        <button
          @click="toggleInfoPanel()"
          class="absolute right-10 p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-50"
          :class="isInfoExpanded ? 'top-0' : 'top-2'"
          aria-label="Close photo description"
        >
          <Minimize2 v-if="isInfoExpanded" class="w-5 h-5" />
          <Maximize2 v-else class="w-5 h-5" />
        </button>
        <button 
          @click="emit('close')"
          class="absolute right-0 p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-50"
          :class="isInfoExpanded ? 'top-0' : 'top-2'"
          aria-label="Close lightbox"
        >
          <X class="w-5 h-5" />
        </button>
        <div class="pr-20">
          <h3 class="text-lg font-bold mb-1">
            {{ selectedPhoto.title || 'Untitled' }}
          </h3>
          <p v-show="isInfoExpanded"
            class="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap"
          >
            {{ selectedPhoto.description || 'No description...' }}
          </p>
        </div>
        <div v-show="isInfoExpanded">
          <div class="h-px bg-gray-200 dark:bg-gray-700 mb-2"></div>
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
          <div class="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>

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
import { watch, } from 'vue'
import { X,
  LoaderCircle,
  ArrowBigRight,
  ArrowBigLeft,
  Minimize2,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-vue-next'
import { useIsMobile } from '~/composables/useIsMobile'
import { formatDate } from '~/utils/common'
import type { Photo } from '~/types/photo.type'

type Props = {
  selectedPhoto: Photo
  photos: Photo[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  navigate: [direction: 'prev' | 'next']
}>()

const { isMobile } = useIsMobile()
// ZOOM 常數
const MIN_SCALE = 1
const MAX_SCALE = 4
const SCALE_STEP = 0.25

// ZOOM
const scale = ref<number>(1)
const canZoomIn = computed(()=> scale.value < MAX_SCALE)
const canZoomOut = computed(()=> scale.value > MIN_SCALE)

const zoomIn = ()=>{
  scale.value = Math.min(scale.value + SCALE_STEP, MAX_SCALE)
}
const zoomOut = ()=>{
  scale.value = Math.max(scale.value - SCALE_STEP, MIN_SCALE)
}
const zoomReset = ()=> scale.value = MIN_SCALE
const panReset = ()=> {
  position.value = {
    x: 0,
    y: 0,
  }
}
const imageViewReset = ()=>{
  zoomReset()
  panReset()
}

const imageStyle = computed(()=>{
  return {
    transform: `translate(${position.value.x}px, ${position.value.y}px) scale(${scale.value})`,
    transformOrigin: 'center center',
  }
})

const position = ref({
  x: 0,
  y: 0
})
// 相片放大後平移
const onDragging = ref<boolean>(false)
const dragStart = ref({
  pointerX: 0,
  pointerY: 0,
  imageX: 0,
  imageY: 0,
})

const startDrag = (event: PointerEvent) => {
  if(scale.value <= MIN_SCALE) return

  onDragging.value = true
  dragStart.value = {
    pointerX: event.clientX,
    pointerY: event.clientY,
    imageX: position.value.x,
    imageY: position.value.y,
  }
  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.setPointerCapture(event.pointerId)
  }
} 

const dragImage = (event: PointerEvent) => {
  if(!onDragging.value) return

  const deltaX = event.clientX - dragStart.value.pointerX
  const deltaY = event.clientY - dragStart.value.pointerY

  position.value = {
    x: dragStart.value.imageX + deltaX,
    y: dragStart.value.imageY + deltaY,
  }
}

const stopDrag = (event: PointerEvent) => {
  if(!onDragging.value) return
  onDragging.value = false

  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }
}

// Photo Description
const isInfoExpanded = ref<boolean>(true)
const toggleInfoPanel = () => isInfoExpanded.value = !isInfoExpanded.value

// 燈箱控制按鈕 state
const isControlBtnShow = ref<boolean>(false)
const controlBtnShow = (status: boolean) => {
  if (!isMobile.value) {
    isControlBtnShow.value = status
  }
}
// 行動裝置直接顯示左右箭頭
const shouldShowControls = computed(() => {
  return isMobile.value || isControlBtnShow.value
})

// Image Loading
const imageLoaded = ref<boolean>(false)
const handleImageLoad = () => {
  imageLoaded.value = true
}

watch(
  ()=> props.selectedPhoto.src,
  (newValue)=>{
    if(!newValue) return
    imageLoaded.value = false
    imageViewReset()
  }
)
</script>