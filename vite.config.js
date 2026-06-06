import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32.png', 'apple-touch-icon.png', 'icon-*.png'],
      manifest: {
        name: 'ExamBrain — AI Exam Prep',
        short_name: 'ExamBrain',
        description: 'Turn your notes into quizzes, flashcards & score reports with AI',
        theme_color: '#92400E',
        background_color: '#FFFDF2',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icon-72.png',  sizes: '72x72',   type: 'image/png' },
          { src: 'icon-96.png',  sizes: '96x96',   type: 'image/png' },
          { src: 'icon-128.png', sizes: '128x128', type: 'image/png' },
          { src: 'icon-144.png', sizes: '144x144', type: 'image/png' },
          { src: 'icon-152.png', sizes: '152x152', type: 'image/png' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.groq\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/.*supabase\.co\/.*/i,
            handler: 'NetworkOnly',
          },
        ]
      }
    })
  ],
  server: { host: true }
})
