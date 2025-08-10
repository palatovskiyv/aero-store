export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  srcDir: './src',
  serverDir: './server',
  css: [
    './src/assets/styles/main.scss',
  ],
  modules: ['@pinia/nuxt', '@nuxt/image', '@nuxtjs/sitemap'],
  app: {
    head: {
      meta: [
        { name: 'robots', content: 'index, follow' }
      ],
      link: [
        {
          rel: 'canonical', href: 'https://aerostore.tech' 
        },
        {
          rel: 'preload',
          as: 'font',
          href: '/assets/fonts/Montserrat-Thin.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          href: '/assets/fonts/Montserrat-ExtraLight.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          href: '/assets/fonts/Montserrat-Light.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          href: '/assets/fonts/Montserrat-Regular.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          href: '/assets/fonts/Montserrat-Medium.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          href: '/assets/fonts/Montserrat-SemiBold.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          href: '/assets/fonts/Montserrat-Bold.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          href: '/assets/fonts/Unbounded-Light.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          href: '/assets/fonts/Unbounded-Regular.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          href: '/assets/fonts/Unbounded-Medium.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          href: '/assets/fonts/Unbounded-Bold.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
      ],
    },
  },

  nitro: {
    routeRules: {
      '/assets/fonts/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    },
  },
})
