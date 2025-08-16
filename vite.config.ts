import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['jszip', 'pako'],
    force: true,
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
