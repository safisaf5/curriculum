import { memo } from 'react';
import { cn } from '../../lib/cn';

/**
 * Watch dial in the language of the hero's EcosystemDial: minute track,
 * square-capped ink hands, vermilion seconds hand with a round tip.
 * Pure function of its props (integer rotations only), so the server and
 * the client always produce the same markup.
 *
 *  - variant "full": 60 ticks, wordmark at 12, optional caption at 6 (404 page);
 *  - variant "mini": 12 ticks, no text (inline clock on the business card).
 */

const SIZE = 200;
const C = SIZE / 2;

interface WatchDialProps {
  h: number;
  m: number;
  /** Seconds; null hides the seconds hand (reduced motion). */
  s: number | null;
  variant?: 'full' | 'mini';
  /** Small mono text above 6 o'clock (full variant only). */
  caption?: string;
  className?: string;
}

const Ticks = memo(function Ticks({ variant }: { variant: 'full' | 'mini' }) {
  const count = variant === 'full' ? 60 : 12;
  const step = 360 / count;
  return (
    <g stroke="currentColor" className="text-ink-3">
      {Array.from({ length: count }, (_, i) => {
        const deg = i * step;
        const hour = deg % 30 === 0;
        const quarter = deg % 90 === 0;
        const inner = variant === 'mini' ? (quarter ? 20 : 26) : quarter ? 22 : hour ? 26 : 30;
        return (
          <line
            key={i}
            x1={C}
            y1={variant === 'mini' ? 10 : 14}
            x2={C}
            y2={inner}
            transform={`rotate(${deg} ${C} ${C})`}
            strokeWidth={variant === 'mini' ? (quarter ? 9 : 6) : quarter ? 3.2 : hour ? 2.2 : 1}
            strokeOpacity={hour ? 0.9 : 0.45}
          />
        );
      })}
    </g>
  );
});

export const WatchDial = ({ h, m, s, variant = 'full', caption, className }: WatchDialProps) => {
  const mini = variant === 'mini';
  // Degrees, rounded to a tenth: deterministic strings on server and client
  const round = (v: number) => Math.round(v * 10) / 10;
  const hourDeg = round(((h % 12) + m / 60) * 30);
  const minDeg = round((m + (s ?? 0) / 60) * 6);
  const secDeg = s === null ? 0 : s * 6;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true" focusable="false" className={cn('h-auto w-full overflow-visible', className)}>
      <circle cx={C} cy={C} r={mini ? 96 : 98} fill="none" className="stroke-ink" strokeOpacity={mini ? 0.9 : 0.22} strokeWidth={mini ? 7 : 1} />
      <Ticks variant={variant} />

      {!mini && (
        <>
          <circle cx={C} cy={C} r={46} fill="none" className="stroke-ink-3" strokeOpacity={0.35} strokeWidth={1} strokeDasharray="1.5 4.5" />
          <text
            x={C}
            y={137}
            textAnchor="middle"
            className="fill-ink font-wide text-[10.5px] font-extrabold uppercase tracking-[-0.02em]"
          >
            Safwan<tspan className="fill-accent">.</tspan>
          </text>
          {caption && (
            <text
              x={C}
              y={151}
              textAnchor="middle"
              className="fill-ink-3 font-mono text-[6.5px] font-medium uppercase tracking-[0.18em]"
            >
              {caption}
            </text>
          )}
        </>
      )}

      {/* Hour */}
      <line
        x1={C}
        y1={C + (mini ? 10 : 9)}
        x2={C}
        y2={C - (mini ? 50 : 46)}
        transform={`rotate(${hourDeg} ${C} ${C})`}
        className="stroke-ink"
        strokeWidth={mini ? 14 : 5.5}
        strokeLinecap="square"
      />
      {/* Minute */}
      <line
        x1={C}
        y1={C + (mini ? 12 : 12)}
        x2={C}
        y2={C - (mini ? 74 : 70)}
        transform={`rotate(${minDeg} ${C} ${C})`}
        className="stroke-ink"
        strokeWidth={mini ? 9 : 3.2}
        strokeLinecap="square"
      />
      {/* Seconds */}
      {s !== null && (
        <g transform={`rotate(${secDeg} ${C} ${C})`}>
          <line x1={C} y1={C + (mini ? 22 : 22)} x2={C} y2={C - (mini ? 70 : 66)} className="stroke-accent" strokeWidth={mini ? 5 : 1.4} />
          {!mini && <circle cx={C} cy={C - 72} r={4.5} className="fill-accent" />}
        </g>
      )}
      <circle cx={C} cy={C} r={mini ? 9 : 4} className="fill-bg stroke-ink" strokeWidth={mini ? 5 : 1.6} />
    </svg>
  );
};
