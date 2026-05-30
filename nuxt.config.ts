export default defineNuxtConfig({
  modules: ['@nuxt/ui', 'pinia'],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },
  ui: {
    colors: {
      primary: 'slate'
    }
  },
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        resolveJsonModule: true
      }
    }
  },
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/']
    }
  },
  app: {
    head: {
      title: 'Life Portfolio',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A personal operating system for life management' }
      ]
    }
  }
})