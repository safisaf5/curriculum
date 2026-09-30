import { cn } from '../../lib/cn';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** One rolling digit: a strip of 0 to 9 moved on Y (transform only). */
const Wheel = ({ digit }: { digit: number }) => (
  <span className="relative inline-block h-[1em] overflow-hidden">
    <span
      className="flex flex-col transition-transform duration-700 ease-out-expo"
      style={{ transform: `translate3d(0, ${-digit * 10}%, 0)` }}
    >
      {DIGITS.map((d) => (
        <span key={d} className="block h-[1em] leading-[1em]">
          {d}
        </span>
      ))}
    </span>
  </span>
);

/**
 * Mechanical counter for the current year. Only the digits that change roll;
 * the leading ones are plain text. Decorative: the year headings carry the
 * information for assistive technologies.
 */
export const Odometer = ({ value, rolling = 2, className }: { value: number; rolling?: number; className?: string }) => {
  const text = String(value);
  const fixed = text.slice(0, Math.max(0, text.length - rolling));
  const moving = text.slice(fixed.length).split('');
  return (
    <span aria-hidden="true" className={cn('tabular inline-flex h-[1em] leading-[1em]', className)}>
      {fixed && <span className="block">{fixed}</span>}
      {moving.map((c, i) => (
        <Wheel key={i} digit={Number(c)} />
      ))}
    </span>
  );
};
