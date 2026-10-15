import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Canım v4 (one page, no server). Built into docs/yeni → canim.uzunyasa.com/yeni/
export default defineConfig({
  root: 'v4',
  plugins: [react()],
  base: './',
  build: { outDir: '../docs/yeni', emptyOutDir: true },
})
