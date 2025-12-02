<template>
  <Desktop>
    <Modal
      v-if="modalManager.showModal"
      :modal="modalManager.modalConfig"
    />
    <RightClickMenu
      ref="rightClickMenuRef"
      v-if="showRightClickMenu"
      :menu-items="currentMenuItems"
      :x="rightClickMenu.x" 
      :y="rightClickMenu.y" 
    />
    <SystemBar />
    <div class="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none">
      <div class="flex-1 relative pointer-events-auto mt-8">
        <div class="absolute inset-0 w-full h-dvh bg-cover bg-center z-0 transition-all duration-500 p-4">
          <DeskItem
            class="w-12 h-12 m-2"
            v-for="app in apps"
            :key="app.id"
            :app="app"
          />
        </div>

        <Window
          v-for="window in store.windows"
          :key="window.id"
          :window-state="window"
        >
          <component 
            :is="getComponent(window.component)"
            v-bind="window.props"
          />
        </Window>
      </div>
    </div>
  </Desktop>
</template>

<script setup lang="ts">
import { Code, Image, Settings, FileUser, Trash2, CircleAlert } from 'lucide-vue-next'
import { onMounted, onBeforeUnmount, computed, nextTick, ref, useTemplateRef } from 'vue'
import { useWindowManager } from '~/stores/windowManager'
import { useDesktopItemsManager } from '~/stores/desktopItemsManager'
import type { MenuItem } from '~/types/menu.type'
import { useModalManager } from '~/stores/modalManager'
import Modal from '~/components/Modal.vue'
import RightClickMenu from '~/components/apps/RightClickMenu.vue'
import TextEditor from '~/components/apps/TextEditor.vue' 

// 狀態新增：目前的選單內容
const currentMenuItems = ref<MenuItem[]>([])

// 定義不同的選單設定
const desktopMenu: MenuItem[] = [
  { label: 'New Text File', action: () => {

    // 取得用戶自行建立的檔案數量
    const createdLength = useDesktopItemsManager().desktopItems.filter(item => item.app_type === 'file').length
    
    // 建立預設名稱與內容
    useDesktopItemsManager().addDesktopItem(`
      New Text File (${createdLength + 1}).txt`,
      `This is a new text file created on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`
    )
  }},
  { label: 'Change Wallpaper', action: () => console.log('Change Wallpaper') },
]

const appMenu: MenuItem[] = [
  { label: 'Rename', action: () => {
    if(menuClickID.value){
      useDesktopItemsManager().setEditStatus(menuClickID.value, true)
      menuClickID.value = null
    }
  }},
  { label: 'Delete', action: () => {
    if(menuClickID.value){
      const targetID = menuClickID.value
      useModalManager().openModal({
        title: { label: 'Delete' },
        icon: Trash2,
        message: { label: 'Are you sure you want to delete this file?' },
        button: [
          { label: 'Confirm', action: () =>{
            useDesktopItemsManager().removeDesktopItem(targetID)
            useModalManager().closeModal()
          }},
          { label: 'Cancel', action: () => useModalManager().closeModal() }
        ]
      })
      menuClickID.value = null
      return
    }
    useModalManager().openModal({
      title: { label: 'Warning' },
      icon: CircleAlert,
      message: { label: 'This file is REALLY important! You cannot delete it.' },
      button: [
        { label: 'Confirm', action: () => useModalManager().closeModal()},
      ]
    })
  }},
]

// Modal state
const modalManager = useModalManager()

const store = useWindowManager()
const showRightClickMenu = ref(false)

const rightClickMenuRef = useTemplateRef<InstanceType<typeof RightClickMenu>>('rightClickMenuRef')
const rightClickMenu = ref<{ x: number, y: number }>({ x: 0, y: 0 })

const apps = computed(() => useDesktopItemsManager().desktopItems)
const getComponent = (name: string) => {
  switch (name) {
    case 'Finder': return resolveComponent('AppsFinder')
    case 'Browser': return resolveComponent('AppsBrowser')
    case 'Photos': return resolveComponent('AppsPhotos')
    case 'Settings': return resolveComponent('AppsSettings')
    case 'TextEditor': return TextEditor
    default: return resolveComponent(name)
  }
}

const menuClickID = ref<string | null>(null)
const handleContextMenu = async (e: MouseEvent) => {
  e.preventDefault()
  let items = desktopMenu
  
  const target = e.target as HTMLElement
  const deskItem = target.closest('.desk-item')
  
  if (deskItem) {
    const appType = (deskItem as HTMLElement).dataset.appType as string
    if (appType === 'file') {
      menuClickID.value = (deskItem as HTMLElement).dataset.id as string
    }
    items = appMenu
  }
  
  // 設定內容並顯示
  currentMenuItems.value = items
  showRightClickMenu.value = true
  rightClickMenu.value = { x: e.clientX, y: e.clientY }
  
  await nextTick()
  
  const menuEl = rightClickMenuRef.value?.$el as HTMLElement
  if (menuEl && menuEl.getBoundingClientRect) {
    const { width, height } = menuEl.getBoundingClientRect()
    const { innerWidth, innerHeight } = window
    
    let targetX = e.clientX
    let targetY = e.clientY
    if (targetX + width > innerWidth) {
      targetX -= width
    }
    if (targetY + height > innerHeight) {
      targetY -= height
    }

    rightClickMenu.value = { x: targetX, y: targetY }
  }
}

const closeRightClickMenu = () => {
  showRightClickMenu.value = false
  rightClickMenu.value.x = 0
  rightClickMenu.value.y = 0
}

onMounted(() => {
  const appsDefault = [
    { id: 'resume', name: 'Resume', icon: FileUser, disabled_delete: true, x: 10, y: 20, width: 48, height: 48, zIndex: 1 },
    { id: 'browser', name: 'Browser', icon: Code, disabled_delete: true, x: 10, y: 100, width: 48, height: 48, zIndex: 1 },
    { id: 'photos', name: 'Photos', icon: Image, disabled_delete: true, x: 10, y: 180, width: 48, height: 48, zIndex: 1 },
    { id: 'settings', name: 'Settings', icon: Settings, disabled_delete: true, x: 10, y: 260, width: 48, height: 48, zIndex: 1 },
  ]
  useDesktopItemsManager().setupDesktopItems(appsDefault)
  window.addEventListener('contextmenu', handleContextMenu)
  window.addEventListener('click', closeRightClickMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('contextmenu', handleContextMenu)
  window.removeEventListener('click', closeRightClickMenu)
})
</script>
