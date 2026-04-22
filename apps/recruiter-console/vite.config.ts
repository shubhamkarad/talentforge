import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'node:path';

export default defineConfig({
  // Single source of truth for env — .env.local lives at the repo root.
  envDir: '../../',

  plugins: [
    TanStackRouterVite({
      target: 'react',
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '~': path.resolve(import.meta.dirname, './src'),
    },
  },

  server: {
    port: 5173,
  },

  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          query: ['@tanstack/react-query'],
          ui: ['framer-motion', 'lucide-react', 'sonner'],
        },
      },
    },
  },
});
