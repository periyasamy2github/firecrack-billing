import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The app is served from https://<user>.github.io/firecrack-billing/ on GitHub Pages.
  base: '/firecrack-billing/',
})
