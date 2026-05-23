import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: { host: true },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      },
      manifest: {
        id: 'com.exambrain.app',
        name: 'ExamBrain — AI Exam Prep',
        short_name: 'ExamBrain',
        description: 'Turn your lecture notes into AI-powered quizzes, flashcards and score reports. Study smarter.',
        theme_color: '#4f6ef7',
        background_color: '#020617',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'en',
        dir: 'ltr',
        categories: ['education', 'productivity', 'utilities'],
        iarc_rating_id: 'e84b072d-71b3-4d3e-86ae-31a8ce4e53b7',
        prefer_related_applications: false,
        icons: [
          {
            src: '/icon-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshot-1.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'ExamBrain — Upload Notes & Generate Exam Prep'
          },
          {
            src: '/screenshot-2.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'ExamBrain — AI Quiz with Difficulty Levels'
          }
        ],
        shortcuts: [
          {
            name: 'Start Quiz',
            short_name: 'Quiz',
            description: 'Jump straight to the quiz',
            url: '/?tab=quiz',
            icons: [{ src: '/icon-96.png', sizes: '96x96', type: 'image/png' }]
          },
          {
            name: 'Flashcards',
            short_name: 'Cards',
            description: 'Study with flashcards',
            url: '/?tab=flashcards',
            icons: [{ src: '/icon-96.png', sizes: '96x96', type: 'image/png' }]
          }
        ],
        share_target: {
          action: '/',
          method: 'GET',
          params: { title: 'title', text: 'text' }
        }
      }
    })
  ]
})
