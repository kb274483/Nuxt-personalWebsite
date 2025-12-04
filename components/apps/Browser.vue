<template>
  <div class="browser-container h-full flex flex-col bg-white">
    <!-- 導航列 -->
    <div class="h-10 bg-gray-100 border-b flex items-center px-4 space-x-4 shrink-0">
      <div class="flex space-x-2 text-gray-500">
        <button 
          @click="goBack" 
          :class="canGoBack ? 'hover:text-black text-gray-700' : 'text-gray-300 cursor-not-allowed'"
          :disabled="!canGoBack"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button 
          @click="goForward"
          :class="canGoForward ? 'hover:text-black text-gray-700' : 'text-gray-300 cursor-not-allowed'"
          :disabled="!canGoForward"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <button @click="goHome" class="hover:text-black text-gray-700 ml-2" title="Home">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </button>
      </div>

      <div class="flex-1 bg-white border border-gray-300 rounded px-3 py-1 text-sm text-gray-600 flex items-center shadow-sm focus-within:ring-2 focus-within:ring-blue-200 transition-all">
        <span v-if="isLoading" class="mr-2 animate-spin">
          <LoaderCircle class="w-4 h-4" />
        </span>
        <span v-else class="mr-2 text-gray-400">
          <Search class="w-4 h-4" />
        </span>
        <input 
          type="text" 
          :value="currentUrl" 
          readonly 
          class="w-full outline-none text-gray-600 cursor-default bg-transparent"
        >
      </div>
    </div>

    <div class="flex-1 relative bg-gray-50 dark:bg-stone-800/80 filter-blur overflow-hidden">  
      <!-- Demo 列表 -->
      <div v-if="!activeIframeUrl" 
        class="h-full w-full overflow-y-auto p-4 flex items-center"
      >
        <div class="text-center grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div v-for="value in demoArray" :key="value.id"
            class="browser-item flex flex-col bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 group"
            @click="navigateTo(value.url)"
          >
            <div class="relative overflow-hidden aspect-video border-b">
              <img :src="value.image" :alt="value.name" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
              
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <span class="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 px-4 py-1 rounded-full text-sm font-medium transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Visit {{ value.name }}
                </span>
              </div>
            </div>
            
            <div class="p-3 flex items-center justify-between bg-white">
              <p class="font-medium text-gray-700 truncate px-1">
                {{ value.name }}
              </p>
              <div class="flex gap-2" @click.stop>
                <a :href="value.github" target="_blank" class="hover:scale-110 transition-transform opacity-60 hover:opacity-100" title="View Source">
                  <img src="@/public/github-logo.png" alt="github" class="w-5 h-5">
                </a>
                <a v-if="value.github2" :href="value.github2" target="_blank" class="hover:scale-110 transition-transform opacity-60 hover:opacity-100">
                  <img src="@/public/github-logo.png" alt="github" class="w-5 h-5">
                </a>
                <a v-if="value.notion" :href="value.notion" target="_blank" class="hover:scale-110 transition-transform opacity-60 hover:opacity-100" title="View Docs">
                  <img src="@/public/notion-logo.png" alt="notion" class="w-5 h-5">
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Iframe -->
      <div v-else class="w-full h-full flex flex-col">
        <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
           <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mb-4"></div>
           <p class="text-gray-500">Loading {{ currentUrl }}...</p>
        </div>
        
        <iframe 
          :src="activeIframeUrl" 
          class="w-full h-full border-0 bg-white"
          @load="onIframeLoad"
        ></iframe>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, LoaderCircle } from 'lucide-vue-next'
import type { DemoItem } from '~/types/demoItem.type'

// State
const HOME_URL = 'https://roy.space/home'
const historyStack = ref<string[]>([HOME_URL])
const currentIndex = ref<number>(0)
const isLoading = ref<boolean>(false)

// 目前顯示的 URL
const currentUrl = computed(() => historyStack.value[currentIndex.value])

// Iframe 嵌入使用
const activeIframeUrl = computed(() => {
  const url = historyStack.value[currentIndex.value]
  return url === HOME_URL ? null : url
})

// 導航狀態
const canGoBack = computed(() => currentIndex.value > 0)
const canGoForward = computed(() => currentIndex.value < historyStack.value.length - 1)

// 導航 To New URL
const navigateTo = (url: string) => {
  if (url === currentUrl.value) return

  // 清除當前 index 之後的歷史紀錄
  if (currentIndex.value < historyStack.value.length - 1) {
    historyStack.value = historyStack.value.slice(0, currentIndex.value + 1)
  }

  // 加入新網址
  historyStack.value.push(url)
  currentIndex.value++

  isLoading.value = true
}

const goBack = () => {
  if (canGoBack.value) {
    currentIndex.value--
    if (activeIframeUrl.value) isLoading.value = true
  }
}

const goForward = () => {
  if (canGoForward.value) {
    currentIndex.value++
    if (activeIframeUrl.value) isLoading.value = true
  }
}

const goHome = () => {
  navigateTo(HOME_URL)
  onIframeLoad()
}

// Iframe 載入完成
const onIframeLoad = () => {
  isLoading.value = false
}

const demoArray = ref<DemoItem[]>([
  {
    id: '1',
    name: 'Track Expenses',
    url: 'https://trackexpenses-94bfd.web.app/',
    image: 'https://elasticbeanstalk-ap-northeast-3-320080014524.s3.ap-northeast-3.amazonaws.com/demo_cover/trackExpenese.png',
    github: 'https://github.com/kb274483/TrackExpenses',
    notion: 'https://www.notion.so/PWA-112993c5059a80f79ac1e947b53359eb'
  },
  {
    id: '2',
    name: 'Short Url',
    url: 'https://brief-url.link/',
    image: 'https://elasticbeanstalk-ap-northeast-3-320080014524.s3.ap-northeast-3.amazonaws.com/demo_cover/brief-url.png',
    github: 'https://github.com/kb274483/Quasar-ShortUrlWeb',
    github2: 'https://github.com/kb274483/Golang-ShortUrlServer',
    notion: 'https://delirious-workshop-239.notion.site/e28da6208afa4978babfcdc8c1627fc6?source=copy_link'
  },
  {
    id: '3',
    name: 'Turkiye Travel Memories',
    url: 'https://qwik-turkiye-travel-memories.vercel.app/',
    image: 'https://elasticbeanstalk-ap-northeast-3-320080014524.s3.ap-northeast-3.amazonaws.com/demo_cover/Turkiye+Photo.png',
    github: 'https://github.com/kb274483/Qwik-TurkiyeTravelMemories',
  },
  {
    id: '4',
    name: 'Waterfall Layouts',
    url: 'https://vue-waterfall-layouts-demo.vercel.app/',
    image: 'https://elasticbeanstalk-ap-northeast-3-320080014524.s3.ap-northeast-3.amazonaws.com/demo_cover/waterfall_layout.png',
    github: 'https://github.com/kb274483/Vue-WaterfallLayouts',
  },
])
</script>

<style scoped>
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }
  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1; 
  }
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #d1d5db; 
    border-radius: 4px;
  }
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #9ca3af; 
  }

  /* 根據容器寬度調整 */
  .browser-container {
    container-type: inline-size;
    container-name: browser-main;
  }
  
  @container browser-main (min-width:480px) {
    .browser-item {
      width: 100%; 
    }
  }
</style>