<template>
  <div class="relative h-full w-full overflow-hidden bg-white dark:bg-stone-900 text-slate-800 dark:text-slate-200">
    <div 
      class="absolute inset-0 pointer-events-none z-0 opacity-10 dark:opacity-5"
      :style="{ transform: `translateY(${scrollY * 0.5}px)` }"
    >
      <div class="absolute inset-0" 
           style="background-image: radial-gradient(circle, #64748b 1px, transparent 1px); background-size: 40px 40px;">
      </div>
    </div>

    <div 
      class="absolute inset-0 pointer-events-none z-0"
      :style="{ transform: `translateY(${scrollY * 0.2}px)` }"
    >
      <div class="absolute top-10 right-10 w-64 h-64 bg-slate-200 dark:bg-stone-700 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-2xl opacity-50"></div>
      <div class="absolute top-[40%] left-[-5%] w-48 h-48 bg-slate-300 dark:bg-stone-600 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-2xl opacity-40"></div>
      <div class="absolute bottom-20 right-[10%] w-80 h-80 bg-slate-100 dark:bg-stone-800 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl opacity-60"></div>
    </div>

    <div 
      ref="scrollContainer" 
      @scroll="handleScroll"
      class="relative h-full w-full overflow-y-auto overflow-x-hidden z-10 scroll-smooth p-6 md:p-12"
    >
      <header class="relative mb-12 pt-16 text-center">
        <div class="flex justify-between items-center max-w-2xl mx-auto">
          <div class="relative inline-block group">
            <div class="absolute inset-0 bg-slate-200 dark:bg-stone-700 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
            <img src="/cat_sprite_amei.png" alt="Avatar" class="relative w-24 h-24 rounded-full bg-white dark:bg-stone-800 p-1 object-contain shadow-lg border border-slate-100 dark:border-stone-700" />
          </div>
  
          <div>
            <h1 class="mt-6 text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              李浩銓 Roy Lee
            </h1>
            <p class="text-lg text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Front-End Engineer（熱愛攝影與旅遊的前端工程師。）
            </p>
          </div>
        </div>
        
        <p class="max-w-2xl mx-auto mt-6 text-slate-600 text-start dark:text-slate-400 leading-relaxed text-base">
          我畢業於資訊工程系，起初並未在程式開發中找到熱情，因此投入其他產業工作多年。<br class="hidden md:block" />
          然而在重拾學習程式的過程中，我逐漸發現解決問題與構建產品的樂趣。
        </p>
        
        <div class="flex justify-center gap-6 mt-8">
          <a href="mailto:kb274483@gmail.com" class="link-hover">Email</a>
          <a href="https://github.com/kb274483" target="_blank" class="link-hover">Github</a>
          <a href="https://www.cake.me/resumes/kb274483" target="_blank" class="link-hover">CakeResume</a>
        </div>
      </header>

      <div class="max-w-3xl mx-auto space-y-32 pb-20">
        
        <section class="space-y-8 scroll-reveal">
          <h2 class="section-title">Tech Stack</h2>
          <div class="grid grid-cols-1 gap-6">
            <div class="minimal-card">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100">Front-end</h3>
              </div>
              <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
                HTML, CSS (SCSS), JavaScript, <strong class="text-slate-800 dark:text-slate-200">Vue.js (Vue 2/3)</strong>, Nuxt, TailwindCSS, Quasar, Qwik
              </p>
            </div>
            
            <div class="minimal-card">
               <div class="flex items-start justify-between mb-2">
                <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100">Others</h3>
              </div>
              <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
                AWS (EC2, S3, Lambda), Firebase, Nginx, Golang (Basic)
              </p>
            </div>
          </div>
        </section>

        <section class="space-y-8 scroll-reveal">
          <h2 class="section-title">Experience</h2>
          <div class="relative border-l border-slate-300 dark:border-stone-700 ml-3 space-y-16">
            
            <div class="relative pl-10">
              <span class="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-slate-800 dark:bg-slate-200 ring-4 ring-white dark:ring-stone-900"></span>
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">霍普金斯生醫有限公司</h3>
                <span class="text-sm font-mono text-slate-500 dark:text-slate-500 mt-1 sm:mt-0">2022.04 ~ Present</span>
              </div>
              <ul class="space-y-3 text-slate-600 dark:text-slate-400 list-disc pl-4 marker:text-slate-400">
                <li>開發集團品牌官網與活動頁面，負責切版與 API 串接。</li>
                <li>開發診所掛號預約平台，優化管理流程。</li>
                <li>舊專案維護與功能優化、新增</li>
                <li>與資料科學團隊合作，開發互動式數據儀表板。</li>
                <li>AWS EC2 環境建置、Nginx 設定與資安規則維護。</li>
              </ul>
            </div>

            <div class="relative pl-10">
              <span class="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-stone-600 ring-4 ring-white dark:ring-stone-900"></span>
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">翼游數位有限公司</h3>
                <span class="text-sm font-mono text-slate-500 dark:text-slate-500 mt-1 sm:mt-0">2021.08 ~ 2022.02</span>
              </div>
              <ul class="space-y-3 text-slate-600 dark:text-slate-400 list-disc pl-4 marker:text-slate-400">
                <li>運動賽事直播平台開發 (WebSocket 即時資料)。</li>
                <li>Vue-element-admin 後台系統開發。</li>
                <li>SPA 網站開發 (Vue 2)</li>
                <li>多國語言 (i18n) 與 RWD 響應式設計。</li>
              </ul>
            </div>

          </div>
        </section>

        <!-- Side Projects -->
        <section class="space-y-10 scroll-reveal">
          <h2 class="section-title">Side Projects</h2>
          <div class="minimal-card cursor-pointer" @click="store.openWindow('browser', 'Code Works', 'Code Works')">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100">
                Open My Side Projects
              </h3>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWindowManager } from '~/stores/windowManager'

const store = useWindowManager()

// 視差捲動邏輯
const scrollContainer = ref<HTMLElement | null>(null)
const scrollY = ref(0)

const handleScroll = () => {
  if (scrollContainer.value) {
    scrollY.value = scrollContainer.value.scrollTop
    checkReveal()
  }
}

const checkReveal = () => {
  const reveals = document.querySelectorAll('.scroll-reveal')
  if (!scrollContainer.value) return
  
  const containerHeight = scrollContainer.value.clientHeight
  
  reveals.forEach((reveal) => {
    // 使用 getBoundingClientRect 取得元素相對於 viewport 的位置
    const elementTop = (reveal as HTMLElement).getBoundingClientRect().top
    const containerTop = scrollContainer.value!.getBoundingClientRect().top
    const relativeTop = elementTop - containerTop
    
    // 當元素進入視窗下方 100px時觸發
    if (relativeTop < containerHeight - 100) { 
      reveal.classList.add('active')
    }
  })
}
</script>

<style scoped>
.section-title {
  @apply text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4;
}

.link-hover {
  @apply text-slate-600 dark:text-slate-100 hover:text-slate-900 dark:hover:text-slate-100 
  transition-colors text-sm font-medium border-b border-transparent hover:border-slate-400 pb-0.5 hover:scale-105;
}

.minimal-card {
  @apply bg-slate-50 dark:bg-stone-800/50 p-6 rounded-lg border border-slate-100 dark:border-stone-700/50 
  transition-all duration-500 hover:border-slate-300 dark:hover:border-stone-600;
}

.scroll-reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.scroll-reveal.active {
  opacity: 1;
  transform: translateY(0);
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style>
