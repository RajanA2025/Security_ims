import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all network interfaces
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173, // Force WebSocket port to match the server port
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    },
    watch: {
      usePolling: true
    },
    cors: true
  },
  preview: {
    port: 5173,
    strictPort: true,
  }
});
