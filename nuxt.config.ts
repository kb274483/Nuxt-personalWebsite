// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: "zh-TW",
      },
      meta: [
        {
          name: "description",
          content:
            "Roy's Personal Website | developer portfolio, photography gallery, and travel map.",
        },
      ],
      title: "Roy's Personal Website",
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "preload", as: "image", href: "/cat_sprite_ban.webp" },
        { rel: "preload", as: "image", href: "/cat_sprite_yahoo.webp" },
        { rel: "preload", as: "image", href: "/cat_sprite_amei.webp" },
      ],
    },
  },
  devServer: {
    host: "0.0.0.0",
    port: 5533,
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  srcDir: ".",
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "@vueuse/nuxt",
    [
      "@nuxtjs/google-fonts",
      {
        families: { "Space Grotesk": [400, 500, 700, 900] },
        display: "swap",
        preload: true,
      },
    ],
  ],
  css: ["~/assets/css/main.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.VITE_SUPABASE_URL,
      supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
    },
  },
});
