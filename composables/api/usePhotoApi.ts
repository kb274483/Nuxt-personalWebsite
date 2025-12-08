import type { Photo, PhotoCache } from '~/types/photo.type'

export const usePhotoApi = ()=>{
  const { $supabase } = useNuxtApp()

  // 緩存設定
  const CACHE_DURATION = 1000 * 60 * 60 * 24
  const CACHE_KEY = 'photos_cache_v1.0.1'
  // Storage 名稱
  const BUCKET_NAME = 'Gallery' 
  
  // 取得照片
  const getPhotos = async ()=>{
    return useAsyncData('get_all_photos', async () => {
      // 檢查客戶端是否有 Cache
      if(import.meta.client){
        const cached = localStorage.getItem(CACHE_KEY)
        if(cached){
          const parsed: PhotoCache = JSON.parse(cached)
          const now = Date.now()
          if(now - parsed.timestamp < CACHE_DURATION){
            return parsed.data
          }
        }
      }
      // 取得Supabase
      const { data, error } = await $supabase
        .from('photos')
        .select('*')
        .order('shoot_date', { ascending: false })
      if(error){
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch photos',
          data: error,
        })
      }
      const processedData: Photo[] = data?.map((item:any)=>{
        const {data: publicUrlData } = $supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(item.file_path)
        
        const { data: thumbnailUrlData } = $supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(item.file_path, {
            transform: {
              width: 400,
              height: 400,
              resize: 'contain',
              quality: 80,
            },
          })
        return {
          ...item,
          src: publicUrlData.publicUrl,
          thumbnail: thumbnailUrlData.publicUrl,
        }
      })

      if (import.meta.client) {
        const cacheData: PhotoCache = {
          timestamp: Date.now(),
          data: processedData,
        }
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
      }

      return processedData
    })
  }

  return {
    getPhotos,
  }
}