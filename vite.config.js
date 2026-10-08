import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Libraries change rarely, so keep them in their own files that browsers can cache between releases
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\/]node_modules[\/](react|react-dom|react-router|react-router-dom|scheduler|@remix-run)[\/]/.test(id)) return 'react';
          if (id.includes('framer-motion')) return 'motion';
          return undefined;
        },
      },
    },
  },
})
