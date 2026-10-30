import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    sourcemap: false,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // Content changes far more often than the framework. Separate chunks keep the
        // vendor bundle cached across question-bank updates and keep each file small.
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
          if (id.includes('/src/data/')) return 'content';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
