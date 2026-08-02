import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    minify: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),

      },
      output: {
        entryFileNames: () => `scripts/[name].js`
      }
    }
  },
  resolve: {
    alias: {
      "src": path.resolve(__dirname, "src"),
      "@": path.resolve(__dirname, "../rewards/src"),
    },
  },
  server: {
    fs: {
      allow: [".."], // if ../rewards is outside the project root
    },
  },
})