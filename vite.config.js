const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react-swc');
const path = require('path');

// https://vite.dev/config/
module.exports = defineConfig({
  plugins: [
    react()
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host: true,
    open: true,
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    },
    watch: {
      usePolling: true
    },
    cors: true,
    fs: {
      strict: false,
    }
  },

  preview: {
    port: 5173,
    strictPort: true,
  },

  // ------------------------------------------------------
  // ✅ Vitest Configuration + Coverage Report
  // ------------------------------------------------------
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.jsx",
    css: false,

    coverage: {
      provider: "v8",                // or "istanbul"
      reporter: ["text", "html","lcov"],    // show text + generate HTML report
      reportsDirectory: "./coverage" // output folder
    }
  }
});
