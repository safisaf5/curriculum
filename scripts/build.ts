/**
 * Production build: `npm run build` (also what Netlify runs).
 *
 *  0. check     → content references, translations, house style
 *  1. generate  → CV PDFs, vCard, Open Graph images (from /src/data)
 *  2. client    → Vite bundle in dist/
 *  3. server    → prerender bundle in .ssr/
 *  4. prerender → one static HTML file per route + sitemap.xml + llms.txt + _redirects
 */
import { build } from 'vite';
import { rm } from 'node:fs/promises';

process.env.SITE_BUILD_DATE ||= new Date().toISOString();
const t0 = Date.now();
const step = (name: string) => console.log(`\n▸ ${name}`);

step('Checking content');
const { execFileSync } = await import('node:child_process');
execFileSync(process.execPath, ['--import', 'tsx', 'scripts/check-content.ts'], { stdio: 'inherit' });

if (process.env.SKIP_GENERATE) {
  step('Skipping asset generation (SKIP_GENERATE set)');
} else {
  step('Generating assets from data');
  const { generateAll } = await import('./generate');
  await generateAll();
}

step('Building client bundle');
await build({ logLevel: 'warn', build: { outDir: 'dist', emptyOutDir: true } });

step('Building prerender bundle');
await build({
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.tsx', outDir: '.ssr', emptyOutDir: true, minify: false },
});

step('Prerendering routes');
const { prerender } = await import('./prerender');
await prerender();

await rm('.ssr', { recursive: true, force: true });
console.log(`\n✓ Build complete in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
