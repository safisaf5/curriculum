import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/cn';

/**
 * Generated 16:9 "screen" for TV and video appearances. No thumbnail on
 * purpose: the CSP forbids third-party images and a drawn plate is lighter.
 *  - tv: 4:3 broadcast guides inside the 16:9 frame;
 *  - video: a scrub bar that fills on hover.
 * Purely visual: the wrapping link (or the text link next to it) carries the name.
 * Hover effects hang off a parent `group/plate`.
 */

const W = 320;
const H = 180;
const CX = W / 2;
const CY = H / 2;
const INSET = 9;
const ARM = 9;
/** Half width of a 4:3 picture that is 80 % of the frame height. */
const HALF_43 = (H * 0.8 * 4) / 3 / 2;

interface ScreenPlateProps {
  kind: 'tv' | 'video';
  outlet: string;
  typeLabel: string;
  linked: boolean;
  className?: string;
}

const Corner = ({ x, y, sx, sy }: { x: number; y: number; sx: 1 | -1; sy: 1 | -1 }) => (
  <path d={`M ${x} ${y + ARM * sy} V ${y} H ${x + ARM * sx}`} fill="none" vectorEffect="non-scaling-stroke" />
);

export const ScreenPlate = ({ kind, outlet, typeLabel, linked, className }: ScreenPlateProps) => (
  <div
    className={cn(
      'relative aspect-video w-full overflow-hidden border border-line bg-bg-2 transition-colors duration-500',
      linked && 'group-hover/plate:border-ink/40',
      className,
    )}
  >
    {/* Scanlines: crisp 1px lines whatever the plate size */}
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgb(var(--c-ink)/0.055)_0_1px,transparent_1px_3px)]"
    />

    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="absolute inset-0 h-full w-full">
      {/* Viewfinder corners */}
      <g className="stroke-ink-3" strokeWidth={1}>
        <Corner x={INSET} y={INSET} sx={1} sy={1} />
        <Corner x={W - INSET} y={INSET} sx={-1} sy={1} />
        <Corner x={INSET} y={H - INSET} sx={1} sy={-1} />
        <Corner x={W - INSET} y={H - INSET} sx={-1} sy={-1} />
      </g>

      {kind === 'tv' ? (
        <g fill="none" className="stroke-ink-3" strokeOpacity={0.5} strokeWidth={1}>
          <line x1={CX - HALF_43} y1={40} x2={CX - HALF_43} y2={H - 40} strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
          <line x1={CX + HALF_43} y1={40} x2={CX + HALF_43} y2={H - 40} strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
          <line x1={CX} y1={32} x2={CX} y2={42} vectorEffect="non-scaling-stroke" />
          <line x1={CX} y1={H - 42} x2={CX} y2={H - 32} vectorEffect="non-scaling-stroke" />
        </g>
      ) : (
        <g>
          <line x1={32} y1={148} x2={W - 60} y2={148} className="stroke-ink-3" strokeOpacity={0.5} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <line
            x1={32}
            y1={148}
            x2={W - 60}
            y2={148}
            className={cn(
              'stroke-accent transition-transform duration-[1400ms] ease-out-expo [transform:scaleX(0)]',
              linked && 'group-hover/plate:[transform:scaleX(1)]',
            )}
            style={{ transformOrigin: '32px 148px' }}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
          <rect x={29} y={145} width={6} height={6} className="fill-ink" />
        </g>
      )}

      {/* Play glyph */}
      <g
        className={cn('transition-transform duration-500 ease-out-expo', linked && 'group-hover/plate:scale-[1.08]')}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
      >
        <circle cx={CX} cy={CY} r={21} className="fill-bg stroke-ink/70" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <path
          d={`M ${CX - 6} ${CY - 9} L ${CX + 10} ${CY} L ${CX - 6} ${CY + 9} Z`}
          className={cn('fill-ink transition-colors duration-300', linked && 'group-hover/plate:fill-accent')}
        />
      </g>
    </svg>

    {/* Mono captions, inside the viewfinder corners */}
    <span className="absolute inset-x-5 top-[1.1rem] flex items-center justify-between gap-4">
      <span className="label min-w-0 truncate text-ink-2">{outlet}</span>
      {/* The type is already in the row meta: dropped where the plate is narrow (md → xl) */}
      <span className="label flex shrink-0 items-center gap-1.5 md:hidden xl:flex">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
        {typeLabel}
      </span>
    </span>
    {linked && (
      <ArrowUpRight
        aria-hidden="true"
        size={16}
        strokeWidth={1.6}
        className="absolute bottom-5 right-5 text-ink-2 transition-[transform,color] duration-500 ease-out-expo group-hover/plate:-translate-y-0.5 group-hover/plate:translate-x-0.5 group-hover/plate:text-accent-ink"
      />
    )}
  </div>
);
