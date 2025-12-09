// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Roy\'s Personal Website',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' } 
      ]
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: '.',
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.VITE_SUPABASE_URL,
      supabaseKey: process.env.VITE_SUPABASE_ANON_KEY
    }
  }
})
