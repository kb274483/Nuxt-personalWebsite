import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppItem, AppItemPosition } from '~/types/appItem.type'
import { FileText } from 'lucide-vue-next'

type DesktopItem = AppItem & AppItemPosition

export const useDesktopItemsManager = defineStore('desktopItemsManager', () => {
  // 顯示在桌面的項目
  const desktopItems = ref<DesktopItem[]>([])
  let defaultApps: DesktopItem[] = []

  const setupDesktopItems = (defaultItems: DesktopItem[]) => {
    defaultApps = defaultItems
    
    // 取得預設項目在localStorage中的座標
    const storedPositionsStr = localStorage.getItem('desktopItemPositions')
    let storedPositions: Record<string, { x: number, y: number }> = {}

    if (storedPositionsStr) {
      try {
        storedPositions = JSON.parse(storedPositionsStr)
      } catch (e) {
        console.error('Failed to parse stored positions', e)
      }
    }
    // 取得用戶自行建立的檔案
    const storedFilesStr = localStorage.getItem('userCreatedFiles')
    let storedFiles: DesktopItem[] = []
    if(storedFilesStr){
      try {
        storedFiles = JSON.parse(storedFilesStr)
      } catch (e) {
        console.error('Failed to parse stored files', e)
      }
    } 

    const mergedItems = [...defaultApps, ...storedFiles]

    desktopItems.value = mergedItems.map(item => {
      const stored = storedPositions[item.id]
      const icon = item.app_type === 'file' ? FileText : item.icon

      return {
        ...item,
        icon,
        x: stored ? stored.x : item.x,
        y: stored ? stored.y : item.y,
      }
    })
  }

  const updateDesktopItemPosition = (id: string, x: number, y: number) => {
    const item = desktopItems.value.find(item => item.id === id)
    if (item) {
      item.x = x
      item.y = y
      
      const positions = desktopItems.value.reduce((acc, curr) => {
        acc[curr.id] = { x: curr.x, y: curr.y }
        return acc
      }, {} as Record<string, { x: number, y: number }>)
      
      localStorage.setItem('desktopItemPositions', JSON.stringify(positions))
    }
  }

  const addDesktopItem = (name: string, content: string = '') => {
    const newItem: DesktopItem = {
      id: `file-${Date.now()}`,
      name,
      icon: FileText,
      content,
      component: 'TextEditor',
      app_type: 'file',
      x: 50,
      y: 50,
      width: 48,
      height: 48,
      zIndex: 1,
    }

    desktopItems.value.push(newItem)
    saveUserCreated()
  }

  // 更新文字檔案內容
  const updateFileContent = (id: string, content: string) => {
    const item = desktopItems.value.find(i => i.id === id)
    if (item && item.app_type === 'file') {
      item.content = content
      saveUserCreated()
    }
  }

  // 設定可重新命名狀態
  const setEditStatus = (id: string, status: boolean) => {
    const item = desktopItems.value.find(i => i.id === id)
    if (item && item.app_type === 'file') {
      item.editStatus = status
    }
  }

  // 重新命名檔案
  const renameFile = (id: string, name: string) => {
    const item = desktopItems.value.find(i => i.id === id)
    if (item && item.app_type === 'file') {
      item.name = name
      setEditStatus(id, false)
      saveUserCreated()
    }
  }

  // 刪除檔案
  const removeDesktopItem = (id: string) => {
    desktopItems.value = desktopItems.value.filter(item => item.id !== id)
    saveUserCreated()
  }

  const saveUserCreated = () => {
    const userCreated = desktopItems.value.filter(item => item.app_type === 'file')
    localStorage.setItem('userCreatedFiles', JSON.stringify(userCreated))
  }

  // 排列整齊
  const arrangeDesktopItems = () => {
    desktopItems.value.forEach((item) => {
      item.x = roundTo10(item.x)
      item.y = roundTo10(item.y)
      updateDesktopItemPosition(item.id, item.x, item.y)
    })
  }

  const roundTo10 = (num: number) => {
    return Math.round(num / 10) * 10;
  }

  return {
    desktopItems,
    setupDesktopItems,
    updateDesktopItemPosition,
    addDesktopItem,
    removeDesktopItem,
    updateFileContent,
    saveUserCreated,
    renameFile,
    setEditStatus,
    arrangeDesktopItems
  }
})