import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || (id.includes('react') && !id.includes('react-router'))) {
              return 'vendor-react'
            }
            if (id.includes('react-router') || id.includes('@remix-run')) {
              return 'vendor-router'
            }
            if (id.includes('motion')) {
              return 'vendor-motion'
            }
          }
        },
      },
    },
  },
})
