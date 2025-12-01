import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppItem, AppItemPosition } from '~/types/appItem.type'

type DesktopItem = AppItem & AppItemPosition

export const useDesktopItemsManager = defineStore('desktopItemsManager', () => {
  const desktopItems = ref<DesktopItem[]>([])

  const setupDesktopItems = (defaultItems: DesktopItem[]) => {
    const storedPositionsStr = localStorage.getItem('desktopItemPositions')
    let storedPositions: Record<string, { x: number, y: number }> = {}

    if (storedPositionsStr) {
      try {
        storedPositions = JSON.parse(storedPositionsStr)
      } catch (e) {
        console.error('Failed to parse stored positions', e)
      }
    }

    desktopItems.value = defaultItems.map(item => {
      const stored = storedPositions[item.id]
      return {
        ...item,
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

  const addDesktopItem = (item: DesktopItem) => {
    desktopItems.value.push(item)
  }

  const removeDesktopItem = (id: string) => {
    desktopItems.value = desktopItems.value.filter(item => item.id !== id)
  }

  return {
    desktopItems,
    setupDesktopItems,
    updateDesktopItemPosition,
    addDesktopItem,
    removeDesktopItem,
  }
})