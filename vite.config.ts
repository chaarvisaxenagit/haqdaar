/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// App settings. The PWA part saves the whole app on the phone on first visit,
// so it keeps working with no internet.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      workbox: {
        // Save every built file for offline use.
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json,webmanifest}'],
      },
      manifest: {
        name: 'Haqdaar हक़दार',
        short_name: 'Haqdaar',
        description: 'Haqdaar: which farm schemes you may get, and why. Works offline.',
        lang: 'hi',
        display: 'standalone',
        start_url: './',
        scope: './',
        theme_color: '#15803d',
        background_color: '#ffffff',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
