import { useEffect, useRef } from 'react';

const DURATION = 1200;
const easeOutCubic = (p: number) => 1 - (1 - p) ** 3;

interface CountUpProps {
  value: number;
  /** Count from this number instead of 0. */
  from?: number;
  /** false = always render the final value (e.g. a year). */
  animate?: boolean;
  className?: string;
}

/**
 * A number that counts up the first time it scrolls into view.
 * The server (and the first client render) always shows the final value.
 * After mount, only a figure still below the viewport is reset and animated,
 * so nothing the reader has already seen ever changes. Reduced motion: static.
 * The animated text is aria-hidden; screen readers get the final value.
 */
export const CountUp = ({ value, from = 0, animate = true, className }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const node = el?.firstChild;
    if (!el || !animate || !(node instanceof Text) || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    // Write straight to React's own text node: no re-render per frame.
    const write = (n: number) => {
      node.nodeValue = String(n);
    };
    write(from);
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / DURATION);
          write(Math.round(from + (value - from) * easeOutCubic(p)));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      write(value);
    };
  }, [value, from, animate]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ display: 'inline-block', minWidth: `${String(value).length}ch` }}
    >
      {value}
    </span>
  );
};
