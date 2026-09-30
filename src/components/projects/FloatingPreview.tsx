import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import type { Project } from '../../data';
import { cn } from '../../lib/cn';
import { ProjectCover } from '../ui/ProjectCover';

const W = 320;
const H = 200;
const OFFSET = 32;
const EDGE = 16;

interface FloatingPreviewProps {
  /** Container of the rows. Each row carries `data-row="<slug>"` (and `data-open` while its panel is open). */
  listRef: RefObject<HTMLElement>;
  projects: Project[];
  /** Reduced motion: no cursor follow, the preview sits still next to the hovered row. */
  still: boolean;
}

/**
 * Cover preview that trails the cursor over the project index (desktop, mouse
 * only; mounted after hydration). Position is written straight to the DOM in a
 * rAF lerp that stops as soon as it settles; React only re-renders when the
 * hovered row changes. Covers are drawn the first time their row is hovered.
 */
export const FloatingPreview = ({ listRef, projects, still }: FloatingPreviewProps) => {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setHost(document.body), []);

  useEffect(() => {
    const list = listRef.current;
    const box = boxRef.current;
    if (!host || !list || !box) return;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let frame = 0;
    let px = -1;
    let py = -1;
    let placed = false;
    let current: HTMLElement | null = null;

    const apply = () => {
      box.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    };
    apply();
    const loop = () => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      apply();
      frame = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    const aim = (x: number, y: number) => {
      let nx = x + OFFSET;
      if (nx + W > window.innerWidth - EDGE) nx = x - OFFSET - W;
      tx = nx;
      ty = Math.min(Math.max(y - H / 2, EDGE), window.innerHeight - H - EDGE);
      if (!placed) {
        cx = tx;
        cy = ty;
        placed = true;
        apply();
      } else if (!frame) frame = requestAnimationFrame(loop);
    };
    /** Reduced motion: vertically centred on the row, over the "in short" column. */
    const alignTo = (row: HTMLElement) => {
      const r = row.getBoundingClientRect();
      const lr = list.getBoundingClientRect();
      cx = tx = lr.left + (lr.width * 5) / 12;
      cy = ty = r.top + r.height / 2 - H / 2;
      placed = true;
      apply();
    };
    const setRow = (row: HTMLElement | null) => {
      if (row === current) return;
      current = row;
      const slug = row?.dataset.row ?? null;
      setActive(slug);
      if (slug) setSeen((s) => (s.includes(slug) ? s : [...s, slug]));
      if (!row) placed = false;
      else if (still) alignTo(row);
    };
    // Rows whose panel is open already show their cover: no preview for them
    const rowOf = (el: Element | null) => {
      const row = el && list.contains(el) ? el.closest<HTMLElement>('[data-row]') : null;
      return row && !row.dataset.open ? row : null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX;
      py = e.clientY;
      const row = rowOf(e.target as Element);
      setRow(row);
      if (row && !still) aim(px, py);
    };
    const onLeave = () => {
      px = -1;
      setRow(null);
    };
    // Content scrolls under a resting cursor: re-evaluate the row below it
    const onScroll = () => {
      if (px < 0) return;
      const row = rowOf(document.elementFromPoint(px, py));
      setRow(row);
      if (row) {
        if (still) alignTo(row);
        else aim(px, py);
      }
    };

    // A panel opened or closed under the cursor: re-check once React has rendered
    const onClick = () => {
      if (px >= 0) requestAnimationFrame(onScroll);
    };

    list.addEventListener('pointermove', onMove, { passive: true });
    list.addEventListener('pointerleave', onLeave);
    list.addEventListener('click', onClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      list.removeEventListener('pointermove', onMove);
      list.removeEventListener('pointerleave', onLeave);
      list.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [host, listRef, still]);

  if (!host) return null;

  return createPortal(
    <div
      ref={boxRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-30 will-change-transform"
      style={{ width: W, height: H, transform: 'translate3d(-200vw, 0, 0)' }}
    >
      <div
        className={cn(
          'relative h-full w-full overflow-hidden border border-line bg-bg-2 transition-[opacity,transform] duration-500 ease-out-expo',
          active ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-0',
        )}
      >
        {projects
          .filter((p) => seen.includes(p.slug))
          .map((p) => (
            <div
              key={p.slug}
              className={cn('absolute inset-0 transition-opacity duration-300', p.slug === active ? 'opacity-100' : 'opacity-0')}
            >
              <ProjectCover project={p} aspect="wide" ratio="h-full w-full" decorative />
            </div>
          ))}
      </div>
    </div>,
    host,
  );
};
