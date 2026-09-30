import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { getTimeline } from '../../data';
import { useIsomorphicLayoutEffect, useMediaQuery, useReducedMotion } from '../../hooks';
import { useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { SectionHeader } from '../ui/SectionHeader';
import { TimelineHud } from '../journey/TimelineHud';
import { YearColumn } from '../journey/YearColumn';
import { clamp01 } from '../journey/shared';

/**
 * Left and right padding that lines the track up with .container-site while
 * letting it bleed to the viewport edges. Also used as scroll padding, so a
 * snapped column starts exactly on the page grid.
 */
const BLEED = 'max(var(--gutter), calc((100% - 1520px) / 2 + var(--gutter)))';
const BLEED_STYLE: CSSProperties = { paddingInline: BLEED, scrollPaddingInline: BLEED };

/** Index of the column that contains `pos` (track coordinates). */
const indexAt = (offsets: number[], pos: number) => {
  let i = 0;
  while (i + 1 < offsets.length && offsets[i + 1] <= pos) i += 1;
  return i;
};

type Go = (index: number, behavior?: ScrollBehavior) => void;

/**
 * Timeline, 2017 → today.
 *  - Desktop with motion: the section pins under the nav and the vertical
 *    scroll drives a horizontal track of years (transform only, rAF).
 *  - Tablet, short screens or reduced motion: a native scroll-snap carousel
 *    with prev / next and a year index.
 *  - Phones: a vertical rail with sticky year bars.
 * The server renders every year and every entry; the pinned mode only starts
 * after hydration.
 */
export default function Timeline() {
  const t = useT('journey');
  const years = useMemo(() => getTimeline(), []);
  const reduced = useReducedMotion();
  const large = useMediaQuery('(min-width: 1024px) and (min-height: 640px)');
  const pinned = large && !reduced;

  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const pinRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const goRef = useRef<Go>(() => undefined);
  const revealRef = useRef<(index: number, target: HTMLElement) => void>(() => undefined);

  const select = useCallback((i: number) => {
    if (activeRef.current === i) return;
    activeRef.current = i;
    setActive(i);
  }, []);

  // ── Pinned horizontal track (desktop) ────────────────────────────────────
  useIsomorphicLayoutEffect(() => {
    if (!pinned) return;
    const pin = pinRef.current;
    const sticky = stickyRef.current;
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!pin || !sticky || !vp || !track) return;
    vp.scrollLeft = 0;

    const g = { offsets: [] as number[], widths: [] as number[], W: 0, inner: 0, maxX: 0, top: 0, h: 0 };
    let frame = 0;
    let listening = false;

    const measure = () => {
      const cs = getComputedStyle(vp);
      g.inner = vp.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const cols = Array.from(track.children) as HTMLElement[];
      g.offsets = cols.map((c) => c.offsetLeft);
      g.widths = cols.map((c) => c.offsetWidth);
      g.W = track.offsetWidth;
      g.maxX = Math.max(0, g.W - g.inner);
      g.top = parseFloat(getComputedStyle(sticky).top) || 0;
      g.h = sticky.offsetHeight;
      // Vertical room for the horizontal travel: 1px of scroll = 1px of track
      pin.style.height = `${Math.round(g.h + g.maxX)}px`;
    };

    const range = () => pin.offsetHeight - g.h;
    const progress = () => {
      const r = range();
      return r > 0 ? clamp01((g.top - pin.getBoundingClientRect().top) / r) : 0;
    };

    const update = () => {
      frame = 0;
      const p = progress();
      track.style.transform = `translate3d(${(-p * g.maxX).toFixed(1)}px, 0, 0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      // A reading head sweeps the track: first column active at the start, last at the end
      select(p >= 1 ? g.offsets.length - 1 : indexAt(g.offsets, p * g.W));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // Window scroll position where column i is active and fully in view
    const targetFor = (i: number) => {
      const o = g.offsets[i];
      const w = g.widths[i];
      const lo = Math.max(0, o / g.W, g.maxX ? (o + w - g.inner) / g.maxX : 0);
      const hi = Math.min(1, (o + w) / g.W - 1e-4, g.maxX ? o / g.maxX : 1);
      const p = lo <= hi ? (lo + hi) / 2 : Math.min(1, lo);
      const top = pin.getBoundingClientRect().top + window.scrollY;
      return Math.round(top - g.top + p * range());
    };

    goRef.current = (i, behavior = 'smooth') => {
      if (g.offsets[i] === undefined) return;
      window.scrollTo({ top: targetFor(i), behavior });
    };

    // Keyboard: focus moving into a column that is off screen brings it into
    // view (the whole column when it fits, at least the focused entry)
    revealRef.current = (i, el) => {
      requestAnimationFrame(() => {
        const x = progress() * g.maxX;
        const tr = track.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        const left = er.left - tr.left;
        const right = er.right - tr.left;
        const fits = g.widths[i] <= g.inner;
        const elIn = left - x >= -1 && right - x <= g.inner + 1;
        if (elIn && (!fits || activeRef.current === i)) return;
        let top = targetFor(i);
        const r = range();
        if (!fits && r > 0 && g.maxX > 0) {
          const pin0 = pin.getBoundingClientRect().top + window.scrollY - g.top;
          const xCol = ((top - pin0) / r) * g.maxX;
          const xEl = Math.min(Math.max(xCol, right - g.inner), left);
          top = Math.round(pin0 + clamp01(xEl / g.maxX) * r);
        }
        window.scrollTo({ top, behavior: 'auto' });
      });
    };

    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      if (on) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    };

    measure();
    update();
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(sticky);
    ro.observe(track);
    const io = new IntersectionObserver(([e]) => listen(e.isIntersecting), { rootMargin: '200px 0px' });
    io.observe(pin);

    return () => {
      io.disconnect();
      ro.disconnect();
      listen(false);
      if (frame) cancelAnimationFrame(frame);
      pin.style.height = '';
      track.style.transform = '';
      if (barRef.current) barRef.current.style.transform = 'scaleX(0)';
      goRef.current = () => undefined;
      revealRef.current = () => undefined;
    };
  }, [pinned, select]);

  // ── Scroll-snap carousel (tablet, reduced motion) ────────────────────────
  useEffect(() => {
    if (pinned) return;
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track) return;
    let offsets: number[] = [];
    let frame = 0;

    const measure = () => {
      offsets = (Array.from(track.children) as HTMLElement[]).map((c) => c.offsetLeft);
    };
    const update = () => {
      frame = 0;
      const max = vp.scrollWidth - vp.clientWidth;
      const x = vp.scrollLeft;
      if (barRef.current) barRef.current.style.transform = `scaleX(${(max > 0 ? clamp01(x / max) : 0).toFixed(4)})`;
      if (max > 0 && x >= max - 2) return select(offsets.length - 1);
      let best = 0;
      offsets.forEach((o, i) => {
        if (Math.abs(o - x) < Math.abs(offsets[best] - x)) best = i;
      });
      select(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    goRef.current = (i, behavior) => {
      if (offsets[i] === undefined) return;
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      vp.scrollTo({ left: Math.min(offsets[i], vp.scrollWidth - vp.clientWidth), behavior: behavior ?? (smooth ? 'smooth' : 'auto') });
    };

    measure();
    update();
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(track);
    vp.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      ro.disconnect();
      vp.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      goRef.current = () => undefined;
    };
  }, [pinned, select]);

  const go = useCallback((i: number) => goRef.current(Math.max(0, Math.min(years.length - 1, i))), [years.length]);
  const onFocusColumn = useCallback((i: number, el: HTMLElement) => revealRef.current(i, el), []);

  return (
    <section id="timeline" aria-labelledby="timeline-title" className={cn('pt-section', pinned ? 'pb-6' : 'pb-section')}>
      <div className="container-site">
        <SectionHeader
          id="timeline"
          label={t.timelineLabel}
          title={<span id="timeline-title">{t.timelineTitle}</span>}
          intro={t.timelineIntro}
          className="md:mb-14"
        />
      </div>

      <div ref={pinRef} className="relative">
        <div
          ref={stickyRef}
          className={cn(pinned && 'sticky top-[3.75rem] flex h-[calc(100svh-3.75rem)] flex-col justify-center overflow-clip py-6 lg:[@media(max-height:760px)]:py-4')}
        >
          <TimelineHud years={years} active={active} pinned={pinned} barRef={barRef} onGo={go} />

          <div
            ref={viewportRef}
            style={BLEED_STYLE}
            className={cn(
              'md:mt-10 lg:[@media(max-height:760px)]:mt-6',
              pinned
                ? 'min-h-0 overflow-clip'
                : 'no-scrollbar md:snap-x md:snap-mandatory md:overflow-x-auto md:overscroll-x-contain',
            )}
          >
            <ol ref={trackRef} className={cn('relative md:flex md:w-max md:items-start', pinned && 'will-change-transform')}>
              {years.map((y, i) => (
                <YearColumn
                  key={y.year}
                  year={y}
                  index={i}
                  active={active === i}
                  onFocusColumn={pinned ? onFocusColumn : undefined}
                />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
