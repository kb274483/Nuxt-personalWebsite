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
            <img src="/cat_sprite_amei.webp" alt="Avatar" class="relative w-24 h-24 rounded-full bg-white dark:bg-stone-800 p-1 object-contain shadow-lg border border-slate-100 dark:border-stone-700" />
          </div>
  
          <div>
            <h1 class="mt-6 text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              李浩銓 Roy Lee
            </h1>
            <p class="text-lg text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Front-End Engineer
            </p>
          </div>
        </div>
        
        <p class="max-w-2xl mx-auto mt-6 text-slate-600 text-start dark:text-slate-400 leading-relaxed text-base">
          我畢業於資訊工程系，起初並未在程式開發中找到熱情，因此投入其他產業工作多年。<br class="hidden md:block" />
          然而在重拾學習程式的過程中，我逐漸發現解決問題與構建產品的樂趣，並轉職成為前端工程師。
          目前專注於 Vue 3 為核心的網頁開發，熟悉 Tailwind CSS、Firebase 與 AWS 相關服務，
          也持續透過 Side Project 學習 Golang、Node.js 與更完整的前後端架構。
        </p>
        
        <div class="flex justify-center gap-6 mt-8">
          <a href="mailto:kb274483@gmail.com" class="link-hover">Email</a>
          <a href="https://github.com/kb274483" target="_blank" class="link-hover">Github</a>
          <!-- <a href="https://www.cake.me/resumes/kb274483" target="_blank" class="link-hover">CakeResume</a> -->
        </div>
      </header>

      <div class="max-w-3xl mx-auto space-y-32 pb-20">
        
        <section class="space-y-8 scroll-reveal">
          <h2 class="section-title">Tech Stack</h2>
          <div class="grid grid-cols-1 gap-6">
            <div
              v-for="stack in techStacks"
              :key="stack.title"
              class="minimal-card"
            >
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100">
                  {{ stack.title }}
                </h3>
              </div>
              <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
                {{ stack.items.join('、') }}
              </p>
            </div>
          </div>
        </section>

        <section class="space-y-8 scroll-reveal">
          <h2 class="section-title">Experience</h2>
          <div class="relative border-l border-slate-300 dark:border-stone-700 ml-3 space-y-16">
            
            <div
              v-for="(job, index) in experiences"
              :key="job.company"
              class="relative pl-10"
            >
              <span
                class="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-stone-900"
                :class="index === 0 ? 'bg-slate-800 dark:bg-slate-200' : 'bg-slate-400 dark:bg-stone-600'"
              ></span>
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {{ job.company }}
                  </h3>
                  <p class="text-sm text-slate-500 dark:text-slate-500 mt-1">
                    {{ job.role }}
                  </p>
                </div>
                <span class="text-sm font-mono text-slate-500 dark:text-slate-500 mt-1 sm:mt-0">
                  {{ job.period }}
                </span>
              </div>
              <ul class="space-y-3 text-slate-600 dark:text-slate-400 list-disc pl-4 marker:text-slate-400">
                <li v-for="item in job.items" :key="item">
                  {{ item }}
                </li>
              </ul>
            </div>

          </div>
        </section>

        <section class="space-y-8 scroll-reveal">
          <h2 class="section-title">Project Highlights</h2>
          <div class="grid grid-cols-1 gap-6">
            <div
              v-for="project in projectHighlights"
              :key="project.title"
              class="minimal-card"
            >
              <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">
                {{ project.title }}
              </h3>
              <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
                {{ project.description }}
              </p>
            </div>
          </div>
        </section>

        <!-- Side Projects -->
        <section class="space-y-10 scroll-reveal">
          <h2 class="section-title">Side Projects</h2>
          <div
            v-for="project in sideProjects"
            :key="project.name"
            class="minimal-card"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100">
                {{ project.name }}
              </h3>
            </div>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              {{ project.description }}
            </p>
            <p class="mt-3 text-xs font-mono text-slate-500 dark:text-slate-500">
              {{ project.stack }}
            </p>
          </div>
          <div class="minimal-card cursor-pointer" @click="store.openWindow('browser', 'Code Works', 'Code Works')">
            <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100">
              Open All Side Projects
            </h3>
          </div>
        </section>

        <section class="space-y-8 scroll-reveal">
          <h2 class="section-title">Education</h2>
          <div class="minimal-card">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100">
                  淡江大學
                </h3>
                <p class="text-slate-600 dark:text-slate-400 mt-1">
                  資訊工程學系
                </p>
              </div>
              <span class="text-sm font-mono text-slate-500 dark:text-slate-500 mt-2 sm:mt-0">
                2010.09 ~ 2014.06
              </span>
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

const techStacks = [
  {
    title: 'Front-end',
    items: ['HTML', 'CSS / SCSS', 'JavaScript', 'TypeScript', 'Vue 2 / Vue 3', 'Nuxt', 'Tailwind CSS', 'Pinia', 'Quasar', 'Qwik']
  },
  {
    title: 'Back-end & Services',
    items: ['Firebase', 'Supabase', 'Golang', 'Node.js', 'WebSocket']
  },
  {
    title: 'Infrastructure',
    items: ['AWS EC2', 'S3', 'VPC', 'NAT', 'Security Group', 'Nginx', 'SSL', 'Reverse Proxy', 'Semi-automated Deployment']
  }
]

const experiences = [
  {
    company: '霍普金斯生醫有限公司',
    role: '前端工程師',
    period: '2022.04 ~ Present',
    items: [
      '與 UI 設計師、後端工程師協作，負責 API 串接、RWD 版面與前端功能開發，並能從需求溝通、規格規劃到實作。',
      '從 0 開發診所掛號預約平台，協助優化櫃台、客服與診所管理流程。',
      '開發集團旗下品牌官網與活動頁面，包含 Nuxt SSR、Vue SPA、切版與資料串接。',
      '維護與改善舊 PHP 系統，以 JavaScript 強化資料視覺化與客服作業流程，例如 Google Map 區域資訊呈現與客服面板功能。',
      '與資料科學團隊合作，將模型與資料轉換為可操作的互動式網頁儀表板。',
      '參與 AWS EC2、VPC、NAT、Security Group、Nginx、SSL 與反向代理設定，並協助建立半自動部署流程。'
    ]
  },
  {
    company: '翼游數位有限公司',
    role: '前端工程師',
    period: '2021.08 ~ 2022.02',
    items: [
      '開發運動賽事直播平台，負責 WebSocket 即時資料串接、互動畫面與 RWD 樣式。',
      '使用 Vue-element-admin 開發後台系統，與後端工程師協作串接 API 與管理功能。',
      '參與多個 Vue 2 SPA 專案，處理 i18n 多國語系、版面切版與使用者互動。'
    ]
  }
]

const projectHighlights = [
  {
    title: '診所掛號預約平台',
    description: '以 Vue 3 與 PHP Laravel 為主要技術，從需求討論、流程規劃、畫面實作到前端架構建立皆有參與，協助內部掛號與客服作業數位化。'
  },
  {
    title: '客服與資料視覺化工具',
    description: '將既有 PHP 後台功能逐步改善為更直覺的操作介面，包含客服面板、Google Map 區域資訊呈現，以及資料儀表板互動化。'
  },
  {
    title: '品牌官網與活動頁',
    description: '使用 Nuxt、Vue、Tailwind CSS 製作集團品牌網站、活動頁與互動頁面，兼顧 RWD、效能與後端資料串接。'
  }
]

const sideProjects = [
  {
    name: 'Track Expenses',
    description: '個人記帳與團體分帳工具，支援圖表分析與 PWA 使用情境。',
    stack: 'Vue / Quasar / Tailwind CSS / Firebase'
  },
  {
    name: 'Brief URL',
    description: '短網址服務，從前端、Golang API、Google OAuth 到 AWS EC2 / Nginx 部署皆自行實作。',
    stack: 'Vue / Golang / AWS EC2 / Nginx / DynamoDB'
  },
  {
    name: 'MeowLog',
    description: '寵物健康日誌，記錄日常照護、健康狀態與提醒流程。',
    stack: 'Vue / Quasar / Firebase / Tailwind CSS'
  }
]

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
    if (relativeTop < containerHeight - 50) { 
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
