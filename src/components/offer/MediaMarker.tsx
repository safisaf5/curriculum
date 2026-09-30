import { memo } from 'react';
import type { Lang, MediaType } from '../../data';
import { cn } from '../../lib/cn';

/**
 * Typographic marker for appearances without a screen (stage, workshop,
 * article, civic). Decorative only (aria-hidden): the row's type label says
 * the same thing in words. Deterministic: variations come from a hash of the
 * item id, so server and client render the same SVG.
 * A parent `group/row` lights one accent detail on hover.
 */

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/** mulberry32: tiny seeded PRNG. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const S = 112;
/** Two decimals: identical output in every JS engine (no hydration drift). */
const round = (n: number) => Math.round(n * 100) / 100;
const ACCENT_ON_HOVER = 'transition-colors duration-500 group-hover/row:fill-accent';

/** Workshop: a seating plan, one seat (the facilitator) filled. */
const Workshop = ({ seed }: { seed: string }) => {
  const cols = 6;
  const rows = 4;
  const size = 11;
  const gap = 6;
  const pick = hash(seed) % (cols * rows);
  const x0 = (S - (cols * size + (cols - 1) * gap)) / 2;
  const y0 = (S - (rows * size + (rows - 1) * gap)) / 2;
  return (
    <g>
      {Array.from({ length: cols * rows }, (_, i) => {
        const x = x0 + (i % cols) * (size + gap);
        const y = y0 + Math.floor(i / cols) * (size + gap);
        const on = i === pick;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={size}
            height={size}
            strokeWidth={1}
            className={on ? cn('fill-ink stroke-none', ACCENT_ON_HOVER) : 'fill-none stroke-ink-3'}
          />
        );
      })}
    </g>
  );
};

/** Article: a column of text, headline first. */
const Article = ({ seed }: { seed: string }) => {
  const rand = seeded(hash(seed));
  const left = 16;
  const width = S - 32;
  const lines = Array.from({ length: 6 }, (_, i) => (i === 5 ? 0.42 : 0.72 + rand() * 0.28));
  return (
    <g strokeLinecap="butt">
      <line x1={left} y1={24} x2={left + width * 0.78} y2={24} strokeWidth={5} className={cn('stroke-ink', 'transition-colors duration-500 group-hover/row:stroke-accent')} />
      <line x1={left} y1={36} x2={left + width * 0.5} y2={36} strokeWidth={5} className="stroke-ink" />
      {lines.map((w, i) => (
        <line key={i} x1={left} y1={54 + i * 8.5} x2={round(left + width * w)} y2={54 + i * 8.5} strokeWidth={1.5} className="stroke-ink-3" />
      ))}
    </g>
  );
};

/** Civic: a hemicycle of seats, one of them lit on hover. */
const Civic = ({ seed }: { seed: string }) => {
  const rings = [
    { r: 24, n: 7 },
    { r: 36, n: 10 },
    { r: 48, n: 13 },
  ];
  const cx = S / 2;
  const cy = 84;
  const total = rings.reduce((a, b) => a + b.n, 0);
  const pick = hash(seed) % total;
  let k = -1;
  return (
    <g>
      {rings.flatMap(({ r, n }) =>
        Array.from({ length: n }, (_, i) => {
          k += 1;
          const a = Math.PI + (i / (n - 1)) * Math.PI;
          const on = k === pick;
          return (
            <circle
              key={`${r}-${i}`}
              cx={round(cx + r * Math.cos(a))}
              cy={round(cy + r * Math.sin(a))}
              r={3.2}
              className={on ? cn('fill-ink', ACCENT_ON_HOVER) : 'fill-ink-3/70'}
            />
          );
        }),
      )}
      <line x1={cx - 56} y1={cy + 10} x2={cx + 56} y2={cy + 10} strokeWidth={1} className="stroke-ink-3/60" />
    </g>
  );
};

interface MediaMarkerProps {
  type: Exclude<MediaType, 'tv' | 'video'>;
  seed: string;
  lang: Lang;
  className?: string;
}

export const MediaMarker = memo(function MediaMarker({ type, seed, lang, className }: MediaMarkerProps) {
  if (type === 'stage') {
    // Quotation mark in the page's own typography
    return (
      <span
        aria-hidden="true"
        className={cn(
          'block select-none font-wide text-[7rem] font-extrabold leading-[0.8] tracking-[-0.06em] text-ink-3/35 transition-colors duration-500 group-hover/row:text-accent',
          className,
        )}
      >
        {lang === 'fr' ? '«' : '“'}
      </span>
    );
  }
  return (
    <svg viewBox={`0 0 ${S} ${S}`} aria-hidden="true" className={cn('h-auto w-24', className)}>
      {type === 'workshop' && <Workshop seed={seed} />}
      {type === 'article' && <Article seed={seed} />}
      {type === 'civic' && <Civic seed={seed} />}
    </svg>
  );
});
