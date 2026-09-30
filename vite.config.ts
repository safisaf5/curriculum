import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Shared build date for the client bundle, the prerender and the generators.
const BUILD_DATE = process.env.SITE_BUILD_DATE || new Date().toISOString();

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  define: {
    __BUILD_DATE__: JSON.stringify(BUILD_DATE),
  },
  build: {
    target: 'es2020',
    // Fonts always stay as files (cacheable, preloadable, allowed by the CSP font-src 'self')
    assetsInlineLimit: (file: string) => (/\.(woff2?|ttf)$/.test(file) ? false : undefined),
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            // Stable vendor chunk: cached across content-only deploys
            manualChunks: (id: string) =>
              /node_modules\/(react|react-dom|scheduler|react-router|react-router-dom|@remix-run)\//.test(id)
                ? 'vendor'
                : undefined,
          },
        },
  },
}));
