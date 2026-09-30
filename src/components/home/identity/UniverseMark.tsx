import type { Universe } from '../../../data';
import { cn } from '../../../lib/cn';

/**
 * Four hairline circles, one per universe, overlapping in a single point.
 * Same clockwise order as the hero dial (tech, business, communication,
 * creative). The shared centre, in the accent colour, is the point of the
 * section: the value sits where the four meet.
 */
const CIRCLES: { id: Universe['id']; cx: number; cy: number }[] = [
  { id: 'tech', cx: 37, cy: 37 },
  { id: 'business', cx: 63, cy: 37 },
  { id: 'communication', cx: 63, cy: 63 },
  { id: 'creative', cx: 37, cy: 63 },
];

export const UniverseMark = ({ active, className }: { active: Universe['id'] | null; className?: string }) => (
  <svg viewBox="0 0 100 100" aria-hidden="true" className={cn('overflow-visible', className)} fill="none">
    {CIRCLES.map((c) => (
      <circle
        key={c.id}
        cx={c.cx}
        cy={c.cy}
        r={25}
        vectorEffect="non-scaling-stroke"
        strokeWidth={active === c.id ? 1.6 : 1.2}
        className={cn(
          'transition-[stroke,stroke-width] duration-500 ease-out-expo',
          active === c.id ? 'stroke-accent' : active ? 'stroke-ink-3' : 'stroke-ink',
        )}
      />
    ))}
    <line x1={50} y1={40} x2={50} y2={60} vectorEffect="non-scaling-stroke" strokeWidth={1} className="stroke-ink-3" />
    <line x1={40} y1={50} x2={60} y2={50} vectorEffect="non-scaling-stroke" strokeWidth={1} className="stroke-ink-3" />
    <circle cx={50} cy={50} r={3.2} className="fill-accent" />
  </svg>
);
