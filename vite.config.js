import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    host: true,
    port: process.env.PORT || 3000, // Render için port ayarı
    strictPort: true,
  },
  preview: {
    host: true,
    port: process.env.PORT || 3000, // Render için port ayarı
    strictPort: true,
  }
})
