/**
 * One-time image pipeline (not part of the build).
 * Generates responsive AVIF / WebP / JPEG variants of the portrait and a
 * small square version for the vCard and Open Graph images.
 *
 *   npm i --no-save sharp && node scripts/optimize-images.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = 'public/IMG_8964.JPG';
const OUT = 'public/images';
const WIDTHS = [480, 800, 1200];

await mkdir(OUT, { recursive: true });

for (const w of WIDTHS) {
  const img = sharp(SRC).rotate().resize({ width: w });
  await img.clone().avif({ quality: 52, effort: 6 }).toFile(`${OUT}/portrait-${w}.avif`);
  await img.clone().webp({ quality: 74 }).toFile(`${OUT}/portrait-${w}.webp`);
  await img.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(`${OUT}/portrait-${w}.jpg`);
}

// Square head-and-shoulders crop (vCard photo, OG images, business card)
await sharp(SRC)
  .rotate()
  .extract({ left: 240, top: 420, width: 1320, height: 1320 })
  .resize(600, 600)
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(`${OUT}/portrait-square-600.jpg`);

await sharp(SRC)
  .rotate()
  .extract({ left: 240, top: 420, width: 1320, height: 1320 })
  .resize(240, 240)
  .jpeg({ quality: 76, mozjpeg: true })
  .toFile(`${OUT}/portrait-square-240.jpg`);

console.log('images written to', OUT);
