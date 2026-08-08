import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    minify: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.ts'),
      },
      output: {
        entryFileNames: (chunk) => 'scripts/[name].js'
      }
    }
  },
  resolve: {
    alias: {
      // Points to the current root (src)
      '@': resolve(__dirname, 'src'), 
    },
  }
})