import { Suspense, type ReactNode } from 'react';
import { isHydrating } from '../../lib/hydration';

/**
 * Progressive hydration for long pages.
 *
 * The prerendered HTML of a section is shown (and indexable, searchable,
 * readable by screen readers, with working links) from the first paint.
 * React only attaches to it when the section approaches the viewport, or
 * when the browser is idle a few seconds after load. This keeps the main
 * thread free while the page loads on phones.
 *
 * How: during the initial hydration, <Gate> suspends until the section is
 * near the viewport. React keeps the server HTML of a suspended boundary in
 * place and hydrates it when the promise resolves. On the server and on
 * client-side navigations it renders its children immediately.
 */

interface Pending {
  promise: Promise<void>;
  done: boolean;
}

const pending = new Map<string, Pending>();
let idleScheduled = false;

const releaseAll = () => {
  pending.forEach((entry) => {
    if (!entry.done) (entry as Pending & { release?: () => void }).release?.();
  });
};

/** After load, hydrate what is left when the browser has nothing better to do. */
const scheduleIdle = () => {
  if (idleScheduled) return;
  idleScheduled = true;
  const run = () => {
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    if (ric) ric(releaseAll, { timeout: 4000 });
    else window.setTimeout(releaseAll, 200);
  };
  const later = () => window.setTimeout(run, 6000);
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later, { once: true });
  // Any interaction means the visitor is here: hydrate everything
  const now = () => releaseAll();
  window.addEventListener('keydown', now, { once: true, capture: true });
};

const wait = (id: string): Pending => {
  let entry = pending.get(id);
  if (entry) return entry;
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  const e: Pending & { release?: () => void } = { promise, done: false };
  e.release = () => {
    if (e.done) return;
    e.done = true;
    resolve();
  };
  entry = e;
  pending.set(id, entry);

  const el = document.querySelector(`[data-hydrate="${id}"]`);
  if (!el || typeof IntersectionObserver === 'undefined') {
    e.release();
  } else {
    const io = new IntersectionObserver(
      (records) => {
        if (records.some((r) => r.isIntersecting)) {
          io.disconnect();
          e.release?.();
        }
      },
      { rootMargin: '900px 0px' },
    );
    io.observe(el);
    promise.then(() => io.disconnect());
    scheduleIdle();
  }
  return entry;
};

const Gate = ({ id, children }: { id: string; children: ReactNode }) => {
  if (typeof window !== 'undefined' && isHydrating()) {
    const entry = wait(id);
    if (!entry.done) throw entry.promise;
  }
  return <>{children}</>;
};

export const HydrateOnVisible = ({ id, children }: { id: string; children: ReactNode }) => (
  <div data-hydrate={id}>
    <Suspense fallback={null}>
      <Gate id={id}>{children}</Gate>
    </Suspense>
  </div>
);
