import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 9000
  },
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  }
})
