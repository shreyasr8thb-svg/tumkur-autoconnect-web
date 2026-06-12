import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      // @capacitor-firebase/authentication is a native Android plugin.
      // It is loaded at runtime inside the Capacitor WebView, NOT bundled by Vite.
      // Marking it external prevents "failed to resolve import" build errors.
      external: ['@capacitor-firebase/authentication'],
    },
    chunkSizeWarningLimit: 1000,
  },
})
