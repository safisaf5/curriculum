/**
 * Local preview of the production build with Netlify-like behaviour:
 * clean URLs (/cv → cv.html), `_redirects` rewrites, real 404 with 404.html,
 * and the security headers from netlify.toml (CSP included) so problems
 * show up locally. Usage: npm run build && npm run preview
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';

const ROOT = 'dist';
const PORT = Number(process.env.PORT ?? 4173);

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.vcf': 'text/vcard; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const exists = async (p: string) => (await stat(p).then((s) => s.isFile()).catch(() => false)) as boolean;

const readHeaders = async (): Promise<Record<string, string>> => {
  const toml = await readFile('netlify.toml', 'utf8').catch(() => '');
  const block = toml.split('[[headers]]').find((b) => b.includes('for = "/*"')) ?? '';
  const out: Record<string, string> = {};
  for (const m of block.matchAll(/^\s*([A-Za-z-]+)\s*=\s*"([^"]*)"/gm)) {
    if (m[1] !== 'for') out[m[1]] = m[2];
  }
  delete out['Strict-Transport-Security'];
  if (out['Content-Security-Policy']) out['Content-Security-Policy'] = out['Content-Security-Policy'].replace('upgrade-insecure-requests', '');
  return out;
};

const rewrites = new Map<string, string>();
const loadRewrites = async () => {
  const file = await readFile(join(ROOT, '_redirects'), 'utf8').catch(() => '');
  for (const line of file.split('\n')) {
    const [from, to, status] = line.trim().split(/\s+/);
    if (from && !from.startsWith('#') && status === '200') rewrites.set(from, to);
  }
};

const headers = await readHeaders();
await loadRewrites();

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let path = decodeURIComponent(url.pathname);
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  const safe = normalize(path).replace(/^(\.\.[/\\])+/, '');

  const candidates = [rewrites.get(safe), safe, `${safe}.html`, join(safe, 'index.html')].filter(Boolean) as string[];
  let file: string | null = null;
  for (const c of candidates) {
    const full = join(ROOT, c);
    if (await exists(full)) {
      file = full;
      break;
    }
  }
  const status = file ? 200 : 404;
  file ??= join(ROOT, '404.html');
  let body: Buffer = await readFile(file);
  const type = TYPES[extname(file)] ?? 'application/octet-stream';
  const extra: Record<string, string> = {};
  // Like Netlify: compress text responses, cache fingerprinted assets forever
  if (/text|javascript|json|xml|svg|manifest/.test(type) && body.length > 1024) {
    const accept = String(req.headers['accept-encoding'] ?? '');
    if (accept.includes('br')) {
      body = brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } });
      extra['Content-Encoding'] = 'br';
    } else if (accept.includes('gzip')) {
      body = gzipSync(body, { level: 9 });
      extra['Content-Encoding'] = 'gzip';
    }
    extra['Vary'] = 'Accept-Encoding';
  }
  if (path.startsWith('/assets/')) extra['Cache-Control'] = 'public, max-age=31536000, immutable';
  res.writeHead(status, { 'Content-Type': type, ...headers, ...extra });
  res.end(body);
}).listen(PORT, () => console.log(`Preview on http://localhost:${PORT}`));
