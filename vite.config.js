import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  build: {
    lib: {
      entry: './src/main.jsx',
      name: 'LanyardApp',
      formats: ['iife'],
      fileName: () => 'lanyard.bundle.js',
    },
    outDir: '.',
    emptyOutDir: false,
    copyPublicDir: false,
    rollupOptions: {
      output: {
        // keep asset names stable so we can commit them
        assetFileNames: 'lanyard.[ext]',
      },
    },
  },
});
