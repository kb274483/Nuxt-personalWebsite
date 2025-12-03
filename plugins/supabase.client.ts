import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabaseKey

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key is missing in runtime config!')
    return
  }

  const supabase = createClient(supabaseUrl as string, supabaseKey as string)

  return {
    provide: {
      supabase
    }
  }
})
