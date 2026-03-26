<template>
  <div
    class="absolute inset-0 w-full h-dvh z-0 transition-all duration-500"
    :class="{ 'neo-grid-bg': !wallpaper }"
    :style="wallpaper ? wallpaperStyle : undefined"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useWallpaper } from '~/composables/useWallpaper'
const { wallpaper, wallpaperStyle } = useWallpaper()
</script>
