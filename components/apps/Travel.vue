<template>
  <div class="md:flex h-full w-full bg-black text-white overflow-hidden relative select-none">
    <!-- 3D 地球容器 -->
    <div ref="globeContainer" class="flex-1 h-1/2 md:h-full relative cursor-move bg-black overflow-hidden"></div>

    <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-30">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      <span class="mt-3 text-sm text-gray-400">Initializing 3D World...</span>
    </div>

    <Transition name="bubble">
      <div @click="()=>{console.log(places[activeIndex])}"
        v-if="currentPhoto && showPhotoBubble" 
        class="absolute top-2 left-2 z-40 md:top-20 md:left-20"
      >
        <div class="bg-white/10 border border-white/30 rounded-xl p-2 shadow-2xl transform -rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-105">
          <div class="relative w-48 h-32 md:w-64 md:h-48 overflow-hidden rounded-lg bg-gray-800">
            <img 
              :src="currentPhoto" 
              class="w-full h-full object-cover" 
              alt="Travel photo"
            />
          </div>
          <div class="mt-2 px-1 flex justify-between items-center">
            <span class="text-xs font-bold text-white shadow-black drop-shadow-xl/50">
              {{ places[activeIndex]!.name }}
            </span>
            <span class="text-[10px] text-white shadow-black drop-shadow-xl/50">
              {{ places[activeIndex]!.date }}
            </span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 右側國家列表 -->
    <div 
      class="md:w-64 w-full h-1/2 md:h-full flex flex-col z-20 transition-transform duration-300 md:pb-0 pb-16"
      :style="{ 
        backgroundImage: `url(${starry})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay',
        backdropFilter:'blur(50px)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      }"
    >
      <div class="p-4 border-b border-white/10 shrink-0">
        <h2 class="text-lg font-bold flex items-center gap-2">
          My Journey Path
        </h2>
        <p class="text-xs text-gray-400 mt-1">Scroll or click to explore</p>
      </div>
      
      <div 
        class="flex-1 overflow-y-auto custom-scrollbar"
        @wheel="handleWheel"
      >
        <div 
          v-for="(place, index) in places" 
          :key="place.name"
					:id="place.name"
          @click="flyTo(index)"
          class="p-4 cursor-pointer transition-all duration-200 border-l-4 hover:bg-white/5"
          :class="[
            activeIndex === index 
              ? 'border-blue-500 bg-white/10' 
              : 'border-transparent text-gray-500'
          ]"
        >
          <div class="flex justify-between items-baseline mb-1">
            <span class="font-bold text-base" :class="activeIndex === index ? 'text-white' : 'text-gray-400'">
              {{ place.name }}
            </span>
            <span class="text-xs font-mono opacity-60">{{ place.date }}</span>
          </div>
          <p class="text-sm text-gray-400 line-clamp-2" :class="{ 'text-gray-300': activeIndex === index }">
            {{ place.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import starryImg from '@/public/starry.avif'
import { places } from '~/types/place.type' // 旅行紀錄-地點資料
import type { Place } from '~/types/place.type'
import { usePhotoManager } from '~/stores/photoManager'
import { delay } from '~/utils/common'
import * as THREE from 'three'

// 星空背景
const starry = starryImg

// 3D 地球容器
const globeContainer = ref<HTMLElement | null>(null)
const loading = ref(true)
const isTransitioning = ref(false) 
// 當前選中的地點索引
const activeIndex = ref(0)

// Photo State
const currentPhoto = ref<string | null>(null)
const showPhotoBubble = ref<boolean>(false)
const photoManager = usePhotoManager()


let globe: any = null
let wheelTimeout: NodeJS.Timeout | null = null

// 飛到指定地點
const flyTo = async (index: number) => {
  if (isTransitioning.value) return // 避免連續、快速滾動
  
  isTransitioning.value = true
  activeIndex.value = index
  const place = places[index]
  
  // 隱藏舊照片
  showPhotoBubble.value = false

  if (globe) {
    globe.pointOfView({
      altitude: 2.5
    }, 1000)
    await delay(500)
    globe.pointOfView({
      lat: place!.lat,
      lng: place!.lng,
      altitude: 0.8
    }, 1000)

    globe.htmlElementsData([place])
    globe.ringsData([place])
				.ringColor(() => '#ffffffaa')
				.ringMaxRadius(2)
				.ringPropagationSpeed(4)
				.ringRepeatPeriod(800)

    showPlacePhoto(place!)

    // 動畫結束後解鎖滾動
    setTimeout(() => {
      isTransitioning.value = false 
    }, 1000)
  }
}

// 顯示該地點的照片
const showPlacePhoto = (place: Place) => {
  showPhotoBubble.value = false
  
  setTimeout(() => {
    let targetPhotos = photoManager.getPhotosByCity(place.city)
    if (targetPhotos.length === 0) {
			targetPhotos = photoManager.getPhotosByCountry(place.country)
    }
    
    if (targetPhotos.length > 0) {
      const randomPhoto = targetPhotos[Math.floor(Math.random() * targetPhotos.length)]
      currentPhoto.value = randomPhoto!.thumbnail || randomPhoto!.src
      showPhotoBubble.value = true
    } else {
      currentPhoto.value = null
    }
  }, 1000)
}

// 滾輪切換邏輯
const handleWheel = (e: WheelEvent) => {
  e.stopPropagation()
  e.preventDefault()
  
  if (isTransitioning.value) return
  if (wheelTimeout) clearTimeout(wheelTimeout)
  
  wheelTimeout = setTimeout(() => {
    if (e.deltaY > 0 && activeIndex.value < places.length - 1) {
			const nextPlace = document.getElementById(places[activeIndex.value + 1]!.name)
			if (nextPlace) {
				nextPlace.scrollIntoView({ behavior: 'smooth' })
			}
      flyTo(activeIndex.value + 1)
    } else if (e.deltaY < 0 && activeIndex.value > 0) {
			const prevPlace = document.getElementById(places[activeIndex.value - 1]!.name)
			if (prevPlace) {
				prevPlace.scrollIntoView({ behavior: 'smooth' })
			}
      flyTo(activeIndex.value - 1)
    }
  }, 150)
}

onMounted(async () => {
  if (typeof window !== 'undefined' && globeContainer.value) {
    try {
      const Globe = (await import('globe.gl')).default
      const containerWidth = globeContainer.value.clientWidth || window.innerWidth
      const containerHeight = globeContainer.value.clientHeight || (window.innerHeight/2)

      // 載入貼圖
      const textureLoader = new THREE.TextureLoader()
      const pixelTexture = textureLoader.load('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      pixelTexture.magFilter = THREE.NearestFilter
      pixelTexture.minFilter = THREE.NearestFilter

      globe = new Globe(globeContainer.value)
      
      globe
        .globeMaterial(new THREE.MeshPhongMaterial({ 
          map: pixelTexture,
          bumpScale: 0.05,
          specular: new THREE.Color('grey'),
          shininess: 5
        }))
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .width(containerWidth)
        .height(containerHeight)
        .htmlElementsData([places[0]])
				.htmlLat((d: any) => d.lat)
				.htmlLng((d: any) => d.lng)
				.htmlElement((d: any) => {
					const el = document.createElement('div');
					el.innerHTML = d.name;
					el.style.color = '#fff';
					el.style.fontSize = '14px';
					el.style.fontWeight = 'bold';
					el.style.fontFamily = 'sans-serif';
					el.style.textShadow = '0 0 3px rgba(0,0,0,0.8), 0 0 5px black'; 
					el.style.pointerEvents = 'none';
					return el;
				})

      // 地球控制選項 
      const controls = globe.controls()
      if (controls) {
        controls.enableZoom = false  // 禁止縮放
        controls.enableRotate = false // 禁止旋轉 (拖曳)
        controls.autoRotate = false  // 自動旋轉關閉
      }

      // 監聽容器大小變化
      const resizeObserver = new ResizeObserver(entries => {
        if (!globe) return
        for (let entry of entries) {
          const { width, height } = entry.contentRect
          globe.width(width)
          globe.height(height)
        }
      })
      resizeObserver.observe(globeContainer.value)

      // 初始位置
      setTimeout(() => {
        flyTo(0)
        loading.value = false
      }, 500)

    } catch (error) {
      console.error('Failed to load globe:', error)
      loading.value = false
    }
  }
})

onBeforeUnmount(() => {
  if (globe) globe._destructor && globe._destructor()
})
</script>


<style scoped>
  /* 氣泡動畫 */
  .bubble-enter-active,
  .bubble-leave-active {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .bubble-enter-from,
  .bubble-leave-to {
    opacity: 0;
    transform: scale(0.5) translateY(20px) rotate(-10deg);
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(156, 163, 175, 0.3);
		border-radius: 3px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(156, 163, 175, 0.5);
	}
</style>