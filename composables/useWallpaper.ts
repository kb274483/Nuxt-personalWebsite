import { createSharedComposable, useLocalStorage } from '@vueuse/core'

export const useWallpaper = createSharedComposable(() => {
  // 預設為 null
  const wallpaper = useLocalStorage<string | null>('user-wallpaper', null)

  const setWallpaper = (url: string | null) => {
    wallpaper.value = url
  }

  return {
    wallpaper,
    setWallpaper
  }
})
