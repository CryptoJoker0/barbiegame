import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const port = Number(process.env.PORT || 5173);
const basePath = process.env.BASE_PATH || '/';

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(import.meta.dirname, 'attached_assets'),
      '@workspace/api-client-react': path.resolve(
        import.meta.dirname,
        'lib/api-client-react/src',
      ),
      // Polyfill Node.js Buffer for ethers.js in the browser
      // Trailing slash forces Vite to use the npm package, not Node built-in
      buffer: 'buffer/',
    },
    dedupe: ['react', 'react-dom'],
  },
  define: {
    // Polyfill for ethers.js / WalletConnect buffer usage in browser
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
