import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const packagesRoot = process.env.VITE_PACKAGES_PATH
  ? path.resolve(process.env.VITE_PACKAGES_PATH)
  : path.resolve(__dirname, '../../packages');

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@atlas/ui': path.join(packagesRoot, 'ui/src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 443,
      protocol: 'wss',
    },
    allowedHosts: ['admin.atlas.local'],
  },
});
