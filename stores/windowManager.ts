import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface WindowState {
    id: string
    title: string
    component: string
    props?: any
    x: number
    y: number
    width: number
    height: number
    zIndex: number
    isMinimized: boolean
    isMaximized: boolean
}

export const useWindowManager = defineStore('windowManager', () => {
    const windows = ref<WindowState[]>([])
    const activeWindowId = ref<string | null>(null)
    const zIndexCounter = ref(100)

    const openWindow = (id: string, title: string, component: string, props: any = {}) => {
        const existing = windows.value.find(w => w.id === id)
        if (existing) {
            focusWindow(id)
            if (existing.isMinimized) existing.isMinimized = false
            return
        }

        const isMobile = window.innerWidth < 768

        windows.value.push({
            id,
            title,
            component,
            props,
            x: isMobile ? 0 : 100 + (windows.value.length * 30),
            y: isMobile ? 0 : 100 + (windows.value.length * 30),
            width: isMobile ? window.innerWidth : 800,
            height: isMobile ? window.innerHeight : 600,
            zIndex: ++zIndexCounter.value,
            isMinimized: false,
            isMaximized: isMobile
        })
        activeWindowId.value = id
    }

    const closeWindow = (id: string) => {
        windows.value = windows.value.filter(w => w.id !== id)
        if (activeWindowId.value === id) {
            activeWindowId.value = null
        }
    }

    const focusWindow = (id: string) => {
        const win = windows.value.find(w => w.id === id)
        if (win) {
            win.zIndex = ++zIndexCounter.value
            activeWindowId.value = id
        }
    }

    const toggleMinimize = (id: string) => {
        const win = windows.value.find(w => w.id === id)
        if (win) {
            win.isMinimized = !win.isMinimized
            if (!win.isMinimized) focusWindow(id)
        }
    }

    const toggleMaximize = (id: string) => {
        const win = windows.value.find(w => w.id === id)
        if (win) {
            win.isMaximized = !win.isMaximized
            focusWindow(id)
        }
    }

    const updateWindowPosition = (id: string, x: number, y: number) => {
        const win = windows.value.find(w => w.id === id)
        if (win) {
            win.x = x
            win.y = y
        }
    }

    const updateWindowSize = (id: string, width: number, height: number) => {
        const win = windows.value.find(w => w.id === id)
        if (win) {
            win.width = width
            win.height = height
        }
    }

    if (import.meta.client) {
        window.addEventListener('resize', () => {
            const isMobile = window.innerWidth < 768
            if (isMobile) {
                windows.value.forEach(w => {
                    if (w.isMaximized) {
                        w.width = window.innerWidth
                        w.height = window.innerHeight
                        w.x = 0
                        w.y = 0
                    }
                })
            }
        })
    }

    return {
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        focusWindow,
        toggleMinimize,
        toggleMaximize,
        updateWindowPosition,
        updateWindowSize
    }
})
