import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path is required for GitHub Pages project sites so that asset URLs resolve correctly
  // This assumes the repository name is "lab-form" and the site will be hosted at
  // https://<user>.github.io/lab-form/
  base: '/lab-form/',
})
