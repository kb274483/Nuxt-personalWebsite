<template>
  <div class="h-screen w-screen overflow-hidden bg-stone-100 dark:bg-stone-900 text-gray-900 dark:text-white font-sans select-none relative transition-colors duration-300"
    :style="wallpaper && isMounted ? { 
      backgroundImage: `url(${wallpaper})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    } : {}"
  >
    <div v-if="wallpaper" class="absolute inset-0 dark:bg-black/30 bg-white/30 pointer-events-none"></div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useWallpaper } from '~/composables/useWallpaper'
const { wallpaper } = useWallpaper()

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

</script>