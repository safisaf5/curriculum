/**
 * Asset generators, all driven by /src/data:
 *   public/files/safwan-abdirahman.vcf       vCard (contact card)
 *   public/files/Safwan-Abdirahman-CV-*.pdf  CV in French and English
 *   public/og/*.png                          Open Graph images (site + each project)
 *
 * Run alone with `npm run generate`. Each generator is independent and
 * non-fatal: if one fails, the previously committed file is kept and the
 * build continues with a loud warning.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { buildVcard } from '../src/lib/vcard';

const safe = async (name: string, fn: () => Promise<void>) => {
  const t0 = Date.now();
  try {
    await fn();
    console.log(`  ✓ ${name} (${Date.now() - t0} ms)`);
  } catch (err) {
    console.warn(`  ⚠ ${name} failed, keeping the existing files.\n`, err);
  }
};

const generateVcard = async () => {
  await mkdir('public/files', { recursive: true });
  const photo = await readFile('public/images/portrait-square-240.jpg').then(
    (b) => b.toString('base64'),
    () => undefined,
  );
  await writeFile('public/files/safwan-abdirahman.vcf', buildVcard(photo));
};

export const generateAll = async () => {
  await safe('vCard', generateVcard);
  await safe('CV PDF (fr, en)', async () => {
    const { generateCvPdfs } = await import('./lib/cv-pdf');
    await generateCvPdfs();
  });
  await safe('Open Graph images', async () => {
    const { generateOgImages } = await import('./lib/og');
    await generateOgImages();
  });
};

// `npm run generate`
if (process.argv[1]?.endsWith('generate.ts')) {
  process.env.SITE_BUILD_DATE ||= new Date().toISOString();
  await generateAll();
}
