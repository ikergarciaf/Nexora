import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          recharts: ['recharts'],
          jspdf: ['jspdf', 'jspdf-autotable'],
          motion: ['motion'],
          icons: ['lucide-react'],
        },
      },
    },
    target: 'es2022',
    minify: 'esbuild',
    cssMinify: true,
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
