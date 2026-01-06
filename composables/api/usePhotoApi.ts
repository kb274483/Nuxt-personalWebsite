import type { Photo, PhotoCache } from '~/types/photo.type'

export const usePhotoApi = ()=>{
  const { $supabase } = useNuxtApp()

  // 緩存設定
  const CACHE_DURATION = 1000 * 60 * 60 * 24
  const CACHE_KEY = 'photos_cache_v1.0.3'
  
  // Storage 名稱
  const BUCKET_NAME = 'Gallery' 
  const THUMB_PREFIX = 'thumb/'
  const normalize = (p: string) => p.replace(/^\/+/, '')
  const stripBucket = (p: string) => normalize(p).replace(new RegExp(`^${BUCKET_NAME}/`), '')
  const basename = (p: string) => stripBucket(p).split('/').pop() || ''
  
  // 取得照片
  const getPhotos = async ()=>{
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
      const originalPath = stripBucket(item.file_path)
      const {data: publicUrlData } = $supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(originalPath)
      
      // 縮圖：Gallery/thumb/<filename>
      const thumbPath = `${THUMB_PREFIX}${basename(originalPath)}`
      const { data: thumbnailUrlData } = $supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(thumbPath)
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
  }

  return {
    getPhotos,
  }
}