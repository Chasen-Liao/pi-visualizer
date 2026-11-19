import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('node_modules/react') || normalized.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          if (normalized.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (normalized.includes('/src/data/chapters/ch01_02')) {
            return 'data-ch01-02';
          }
          if (normalized.includes('/src/data/chapters/ch03_04')) {
            return 'data-ch03-04';
          }
          if (normalized.includes('/src/data/chapters/ch05_06')) {
            return 'data-ch05-06';
          }
          if (normalized.includes('/src/data/cheatsheet')) {
            return 'data-cheatsheet';
          }
          return undefined;
        },
      },
    },
  },
});
