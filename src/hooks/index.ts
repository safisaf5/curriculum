import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

/** useLayoutEffect on the client, useEffect on the server (no SSR warning). */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Media query, false during SSR and the first client render (hydration-safe). */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
};

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/** Desktop with a real mouse: the only place for pointer effects. */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)');

/** True once mounted on the client. Use to render client-only details. */
export const useMounted = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
};

/** Window scrolled past `offset` px (rAF throttled). */
export const useScrolled = (offset = 24) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > offset);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [offset]);
  return scrolled;
};

// ── Scroll reveal ──────────────────────────────────────────────────────────
// One shared IntersectionObserver for the whole page. Elements get the
// `is-in` class once, then are unobserved. CSS (.reveal / .reveal-line)
// handles the motion and the no-JS / reduced-motion fallbacks.

let sharedObserver: IntersectionObserver | null = null;
const getObserver = () => {
  if (sharedObserver || typeof IntersectionObserver === 'undefined') return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          sharedObserver?.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  return sharedObserver;
};

/**
 * Attach to any element with the `reveal` (or `reveal-line`) class.
 * `const ref = useReveal<HTMLDivElement>()` then `<div ref={ref} className="reveal">`.
 */
export const useReveal = <T extends Element>(): RefObject<T> => {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = getObserver();
    if (!io) {
      el.classList.add('is-in');
      return;
    }
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  return ref;
};

/**
 * Reveal every `.reveal` / `.reveal-line` descendant of a container.
 * Handy for lists: one ref on the parent instead of one per item.
 */
export const useRevealChildren = <T extends Element>(deps: unknown[] = []): RefObject<T> => {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = getObserver();
    const targets = root.querySelectorAll('.reveal:not(.is-in), .reveal-line:not(.is-in)');
    if (!io) {
      targets.forEach((t) => t.classList.add('is-in'));
      return;
    }
    targets.forEach((t) => io.observe(t));
    return () => targets.forEach((t) => io.unobserve(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
};

// ── Active section (for the nav) ───────────────────────────────────────────

export const useActiveSection = (ids: readonly string[], enabled = true) => {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
        let best: string | null = null;
        let bestRatio = 0;
        visible.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        });
        setActive(best);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.01, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids, enabled]);
  return active;
};

// ── Live Geneva clock (client only) ────────────────────────────────────────

export interface ClockTime {
  h: number;
  m: number;
  s: number;
  label: string;
  zone: string;
}

const readZonedTime = (timeZone: string): ClockTime => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  const h = Number(get('hour')) % 24;
  const m = Number(get('minute'));
  const s = Number(get('second'));
  const zone = get('timeZoneName').replace('GMT+1', 'CET').replace('GMT+2', 'CEST');
  return { h, m, s, zone, label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` };
};

/** Current time in a time zone, updated every second. null during SSR / first render. */
export const useZonedClock = (timeZone: string, enabled = true): ClockTime | null => {
  const [time, setTime] = useState<ClockTime | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    const tick = () => {
      setTime(readZonedTime(timeZone));
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [timeZone, enabled]);
  return time;
};

/** Run a callback when a click happens outside of `ref`, or Escape is pressed. */
export const useDismiss = (ref: RefObject<HTMLElement>, onDismiss: () => void, active: boolean) => {
  useEffect(() => {
    if (!active) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, onDismiss, active]);
};
