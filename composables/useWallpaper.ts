import { createSharedComposable, useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { WallpaperOptions } from '~/types/wallpaper.type'

const DEFAULT_OPTIONS: WallpaperOptions = {
  fit: 'cover',
  position: 'center',
  repeat: 'no-repeat'
}

export const useWallpaper = createSharedComposable(() => {
  const wallpaper = useLocalStorage<string | null>('user-wallpaper', null)
  const wallpaperOptions = useLocalStorage<WallpaperOptions>(
    'user-wallpaper-options',
    DEFAULT_OPTIONS
  )

  const setWallpaper = (url: string | null) => {
    wallpaper.value = url
  }

  const setWallpaperOptions = (patch: Partial<WallpaperOptions>) => {
    wallpaperOptions.value = {
      ...DEFAULT_OPTIONS,
      ...wallpaperOptions.value,
      ...patch
    }
  }

  const wallpaperStyle = computed(() => {
    if (!wallpaper.value) return {}
    const fit = wallpaperOptions.value.fit
    return {
      backgroundImage: `url(${wallpaper.value})`,
      backgroundSize: fit === 'stretch' ? '100% 100%' : fit,
      backgroundPosition: wallpaperOptions.value.position,
      backgroundRepeat: wallpaperOptions.value.repeat
    } as Record<string, string>
  })

  return {
    wallpaper,
    setWallpaper,
    wallpaperOptions,
    setWallpaperOptions,
    wallpaperStyle
  }
})