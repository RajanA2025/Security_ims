import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,      // Development server port
    strictPort: true, // Don't try to find another port if 5173 is in use
    cors: true,       // Enable CORS for development
    proxy: {
      // Proxy API requests to avoid CORS issues
      '/api': {
        target: 'http://13.212.15.14:8008',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/api2': {
        target: 'http://13.212.15.14:8016',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api2/, '')
      }
    },
    hmr: {
      clientPort: 5173, // Explicitly set the client port to match the server port
      protocol: 'ws',
      host: 'localhost' // Use localhost for HMR
    }
  },
  // Clear the browser console on restart
  clearScreen: true
});
