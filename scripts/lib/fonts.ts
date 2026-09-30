/**
 * Fonts shared by the generators (PDF CV, Open Graph images, favicons).
 *
 * Text faces come from @fontsource (static WOFF, Latin subset). The site's
 * display cuts use the width axis of Archivo (font-wide = 125%,
 * font-semiwide = 112%), which static files do not have, so two static
 * instances of the variable font are vendored in scripts/lib/fonts/:
 *
 *   archivo-wide-800.woff      wght 800, wdth 125 (names, project titles, favicon)
 *   archivo-semiwide-500.woff  wght 500, wdth 112 (headlines)
 *
 * Regenerate them with fontTools (pip install fonttools brotli):
 *   from fontTools.ttLib import TTFont
 *   from fontTools.varLib import instancer
 *   f = TTFont('node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2')
 *   i = instancer.instantiateVariableFont(f, dict(wght=800, wdth=125), updateFontNames=False)
 *   i.flavor = 'woff'; i.save('scripts/lib/fonts/archivo-wide-800.woff')
 * Archivo is licensed under the SIL Open Font License 1.1.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const fontsource = (pkg: string, file: string) => fileURLToPath(new URL(`../../node_modules/@fontsource/${pkg}/files/${file}`, import.meta.url));
const vendored = (file: string) => fileURLToPath(new URL(`./fonts/${file}`, import.meta.url));

export const FONT_FILES = {
  archivo: {
    400: fontsource('archivo', 'archivo-latin-400-normal.woff'),
    500: fontsource('archivo', 'archivo-latin-500-normal.woff'),
    600: fontsource('archivo', 'archivo-latin-600-normal.woff'),
    700: fontsource('archivo', 'archivo-latin-700-normal.woff'),
    800: fontsource('archivo', 'archivo-latin-800-normal.woff'),
  },
  mono: {
    400: fontsource('jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'),
    500: fontsource('jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'),
  },
  wide800: vendored('archivo-wide-800.woff'),
  semiwide500: vendored('archivo-semiwide-500.woff'),
} as const;

/** Family names used by both renderers. */
export const FAMILY = {
  sans: 'Archivo',
  mono: 'JetBrains Mono',
  wide: 'Archivo Wide',
  semiwide: 'Archivo SemiWide',
} as const;

/**
 * Characters every face above can draw (Latin subset). Anything else would
 * render as a ".notdef" box, so text is checked before rendering.
 */
const SAFE_RANGES: [number, number][] = [
  [0x20, 0x7e],
  [0xa0, 0xff],
  [0x131, 0x131],
  [0x152, 0x153],
  [0x2018, 0x201a],
  [0x201c, 0x201e],
  [0x2022, 0x2022],
  [0x2026, 0x2026],
  [0x2032, 0x2033],
  [0x2039, 0x203a],
  [0x20ac, 0x20ac],
  [0x2122, 0x2122],
  [0x2212, 0x2212],
];
const isSafe = (cp: number) => SAFE_RANGES.some(([a, b]) => cp >= a && cp <= b);
const NARROW_NBSP = String.fromCharCode(0x202f);
const NBSP = String.fromCharCode(0xa0);

/**
 * Prepare a string for the embedded fonts: the narrow no-break space that
 * localize() inserts in French is missing from the subset, so it becomes a
 * regular no-break space. Throws on any other glyph the fonts cannot draw.
 */
export const fontSafe = (text: string): string => {
  const out = text.split(NARROW_NBSP).join(NBSP);
  const bad = [...new Set([...out].map((c) => c.codePointAt(0) ?? 0).filter((cp) => !isSafe(cp)))];
  if (bad.length) {
    const list = bad.map((cp) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`).join(', ');
    throw new Error(`Text uses characters missing from the fonts (${list}): "${out}"`);
  }
  return out;
};

// ── Advance widths, read straight from a WOFF file ─────────────────

export interface FontMetrics {
  /** Width of `text` in em (no kerning, so slightly generous). */
  width: (text: string, letterSpacingEm?: number) => number;
}

const readTables = (buf: Buffer) => {
  if (buf.toString('latin1', 0, 4) !== 'wOFF') throw new Error('Not a WOFF font');
  const numTables = buf.readUInt16BE(12);
  const tables = new Map<string, Buffer>();
  for (let i = 0; i < numTables; i++) {
    const o = 44 + i * 20;
    const tag = buf.toString('latin1', o, o + 4);
    const offset = buf.readUInt32BE(o + 4);
    const compLength = buf.readUInt32BE(o + 8);
    const origLength = buf.readUInt32BE(o + 12);
    const raw = buf.subarray(offset, offset + compLength);
    tables.set(tag, compLength < origLength ? inflateSync(raw) : raw);
  }
  return tables;
};

/** Unicode → glyph id, from the cmap format 4 subtable (BMP is enough here). */
const readCmap = (cmap: Buffer) => {
  const count = cmap.readUInt16BE(2);
  let sub = -1;
  for (let i = 0; i < count; i++) {
    const platform = cmap.readUInt16BE(4 + i * 8);
    const encoding = cmap.readUInt16BE(6 + i * 8);
    const offset = cmap.readUInt32BE(8 + i * 8);
    if ((platform === 3 && encoding === 1) || platform === 0) {
      if (cmap.readUInt16BE(offset) === 4) sub = offset;
    }
  }
  if (sub < 0) throw new Error('No cmap format 4 subtable');
  const segX2 = cmap.readUInt16BE(sub + 6);
  const ends = sub + 14;
  const starts = ends + segX2 + 2;
  const deltas = starts + segX2;
  const ranges = deltas + segX2;
  return (cp: number): number => {
    for (let s = 0; s < segX2; s += 2) {
      const end = cmap.readUInt16BE(ends + s);
      if (cp > end) continue;
      const start = cmap.readUInt16BE(starts + s);
      if (cp < start) return 0;
      const delta = cmap.readInt16BE(deltas + s);
      const rangeOffset = cmap.readUInt16BE(ranges + s);
      if (rangeOffset === 0) return (cp + delta) & 0xffff;
      const g = cmap.readUInt16BE(ranges + s + rangeOffset + (cp - start) * 2);
      return g === 0 ? 0 : (g + delta) & 0xffff;
    }
    return 0;
  };
};

const metricsCache = new Map<string, FontMetrics>();

export const fontMetrics = (file: string): FontMetrics => {
  const cached = metricsCache.get(file);
  if (cached) return cached;
  const tables = readTables(readFileSync(file));
  const head = tables.get('head');
  const hhea = tables.get('hhea');
  const hmtx = tables.get('hmtx');
  const cmap = tables.get('cmap');
  if (!head || !hhea || !hmtx || !cmap) throw new Error(`Incomplete font: ${file}`);
  const upm = head.readUInt16BE(18);
  const numH = hhea.readUInt16BE(34);
  const glyphOf = readCmap(cmap);
  const advance = (gid: number) => hmtx.readUInt16BE(4 * Math.min(gid, numH - 1));
  const metrics: FontMetrics = {
    width: (text, letterSpacingEm = 0) => {
      let units = 0;
      for (const ch of text) units += advance(glyphOf(ch.codePointAt(0) ?? 32));
      return units / upm + letterSpacingEm * [...text].length;
    },
  };
  metricsCache.set(file, metrics);
  return metrics;
};

/**
 * Greedy word wrap at a given size. Returns the lines, or null when a single
 * word is wider than the box.
 */
export const wrapWords = (text: string, metrics: FontMetrics, size: number, maxWidth: number, letterSpacingEm = 0) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (metrics.width(word, letterSpacingEm) * size > maxWidth) return null;
    const candidate = line ? `${line} ${word}` : word;
    if (metrics.width(candidate, letterSpacingEm) * size <= maxWidth) line = candidate;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
};

/** Largest size (step 2 px) at which `text` fits in `maxLines` lines of `maxWidth`. */
export const fitText = (
  text: string,
  metrics: FontMetrics,
  opts: { maxSize: number; minSize: number; maxWidth: number; maxLines: number; letterSpacingEm?: number },
) => {
  for (let size = opts.maxSize; size >= opts.minSize; size -= 2) {
    const lines = wrapWords(text, metrics, size, opts.maxWidth, opts.letterSpacingEm);
    if (lines && lines.length <= opts.maxLines) return { size, lines };
  }
  const size = opts.minSize;
  return { size, lines: wrapWords(text, metrics, size, opts.maxWidth, opts.letterSpacingEm) ?? [text] };
};
