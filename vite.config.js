import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allows access from LAN IP or domain
    port: 5173,       // You can change the port if needed
    hmr: {
      protocol: 'ws',
      host: 'imsserver.com', // Replace with your live hostname or IP
    },
    strictPort: true, // Optional: avoid port auto-switching
    cors: true        // Optional: allows cross-origin if needed
  }
});
