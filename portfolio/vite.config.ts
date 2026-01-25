import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so it can be hosted from a subpath (GitHub Pages).
  base: './',
  plugins: [react()],
})
