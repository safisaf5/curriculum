import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  /** e.g. "4+", "5", "100%" — leading number is animated, the rest kept as suffix */
  value: string;
  duration?: number;
  className?: string;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Counts up to the numeric part of `value` once it scrolls into view. */
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 1400, className }) => {
  const match = value.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
  const prefix = match?.[1] ?? '';
  const target = match ? parseFloat(match[2].replace(',', '.')) : 0;
  const suffix = match?.[3] ?? '';

  const [display, setDisplay] = useState(match ? 0 : null);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!match) return;
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      setDisplay(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [match, target, duration]);

  if (!match) return <span className={className}>{value}</span>;

  const isInt = Number.isInteger(target);
  const shown = display === null ? value : isInt ? Math.round(display) : display.toFixed(1);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
