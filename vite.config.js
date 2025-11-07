const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');

// https://vite.dev/config/
module.exports = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Listen on all network interfaces
    open: true, // Open the browser on server start
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
    cors: true,
    // Serve static files from the public directory
    fs: {
      strict: false,
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
  }
});
