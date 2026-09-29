import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  build: {
    minify: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background'),
      },
      output: {
        entryFileNames: 'scripts/[name].js',
      },
    },
  },

  define: {
    tabs: 'chrome.tabs',
    runtime: 'chrome.runtime',
  },
})
