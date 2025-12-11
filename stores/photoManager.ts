import { defineStore } from 'pinia'
import { usePhotoApi } from '~/composables/api/usePhotoApi'
import type { Photo } from '~/types/photo.type'
import { ref } from 'vue'

export const usePhotoManager = defineStore('photoManager', () => {
  const photos = ref<Photo[]>([])
  // 載入狀態
  const loading = ref<boolean>(true)
  const onLoaded = ref<boolean>(false)
  
  const initialize = async () => {
    if(onLoaded.value) return

    try{
      loading.value = true
      const resPhotos = await usePhotoApi().getPhotos()
      photos.value = resPhotos || []
    }
    catch(error){
      console.error('Failed to load photos', error)
    }
    finally{
      onLoaded.value = true
      loading.value = false
    }
  }

  const refreshPhotos = async () => {
    onLoaded.value = false
    await initialize()
  }

  // 根據國家篩選照片
  const getPhotosByCountry = (countryName: string) => {
    return photos.value.filter(photo => 
      photo.country?.toLowerCase().includes(countryName.toLowerCase())
    )
  }

  // 根據城市篩選照片
  const getPhotosByCity = (cityName: string) => {
    return photos.value.filter(photo => 
      photo.city?.toLowerCase().includes(cityName.toLowerCase())
    )
  }

  return {
    loaded: readonly(onLoaded),
    loading: readonly(loading),
    photos,
    initialize,
    refreshPhotos,
    getPhotosByCountry,
    getPhotosByCity
  }
})