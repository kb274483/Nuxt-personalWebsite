import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useIsMobile } from '~/composables/useIsMobile'
import { useBoundaryCheck } from '~/composables/useBoundaryCheck'

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
    const zIndexCounter = ref<number>(100)
    const { isMobile } = useIsMobile()

    const TOP_OFFSET = 48

    const getViewport = () => {
        if (!import.meta.client) {
            return { vw: 1200, vh: 900, top: TOP_OFFSET }
        }
        return { vw: window.innerWidth, vh: window.innerHeight, top: TOP_OFFSET }
    }

    const clampWindowInViewport = (w: WindowState) => {
        if (!import.meta.client) return

        const { vw, vh, top } = getViewport()

        w.width = Math.min(w.width, vw)
        w.height = Math.min(w.height, Math.max(200, vh - top))

        const { checkBoundary } = useBoundaryCheck()
        const pos = checkBoundary(w.x, w.y, w.width, w.height)
        w.x = pos.x
        w.y = pos.y
    }

    const openWindow = (id: string, title: string, component: string, props: any = {}) => {
        const existing = windows.value.find(w => w.id === id)
        if (existing) {
            focusWindow(id)
            if (existing.isMinimized) existing.isMinimized = false
            return
        }

        const { vw, vh, top } = getViewport()
        const baseWidth = isMobile.value ? vw : Math.min(1000, vw)
        const baseHeight = isMobile.value ? (vh - top) : Math.min(800, vh - top)

        const cascade = windows.value.length * 30
        const baseX = isMobile.value ? 0 : 100 + cascade
        const baseY = isMobile.value ? top : Math.max(top, 100 + cascade)

        const newWindow: WindowState = {
            id,
            title,
            component,
            props,
            x: baseX,
            y: baseY,
            width: Math.max(300, baseWidth),
            height: Math.max(200, baseHeight),
            zIndex: ++zIndexCounter.value,
            isMinimized: false,
            isMaximized: isMobile.value ? true : false
        }

        clampWindowInViewport(newWindow)
        windows.value.push(newWindow)
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
            // 螢幕尺寸改變，重新計算視窗位置
            windows.value.forEach(clampWindowInViewport)
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
