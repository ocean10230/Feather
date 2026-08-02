import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    minify: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/background.ts'),
        
      },
      output: {
        entryFileNames: (chunk) => 'scripts/[name].js'
      }
    }
  },
  resolve: {
    alias: {
      // Points to the current root (src)
      '@': path.resolve(__dirname, 'src'), 
    },
  },
})