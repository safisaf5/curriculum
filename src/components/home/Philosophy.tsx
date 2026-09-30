import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks';
import { useL, useT } from '../../i18n';
import { SectionHeader } from '../ui/SectionHeader';

/**
 * Philosophy: the brand line "Build. Learn. Improve." set as three words,
 * each with a short first-person paragraph.
 *
 * Scroll effect: a word is drawn in outline (ink-3) until its centre crosses
 * the middle of the viewport, then solid ink fills it from the left (a clip
 * window made of two opposite translations: transform only). The state lives
 * in a `data-lit` attribute toggled by an IntersectionObserver, so React never
 * re-renders on scroll. The outline state only exists when JS runs and motion
 * is allowed: without JS, or with reduced motion, the words are simply solid.
 */

// The "off" state is written as `motion-safe:[.js_[data-philo]:not([data-lit])>&]:...`:
// scoped to <html class="js"> and prefers-reduced-motion: no-preference.
// (Class names stay literal so Tailwind can find them.)

const WORD =
  'font-wide text-[clamp(2.6rem,14.8vw,5.5rem)] font-extrabold uppercase leading-[0.84] tracking-[-0.045em] md:text-[clamp(5rem,12.4vw,7.5rem)] lg:text-[clamp(5rem,9.4vw,9.5rem)]';

export default function Philosophy() {
  const t = useT('offer');
  const l = useL();
  const listRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();

  const rows = [
    { key: 'build', word: t.philosophyWordBuild, body: t.philosophyBuild },
    { key: 'learn', word: t.philosophyWordLearn, body: t.philosophyLearn },
    { key: 'improve', word: t.philosophyWordImprove, body: t.philosophyImprove },
  ];

  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const words = [...root.querySelectorAll<HTMLElement>('[data-philo]')];
    if (reduced || typeof IntersectionObserver === 'undefined') {
      words.forEach((w) => w.setAttribute('data-lit', ''));
      return;
    }
    // Root zone = everything above the middle line of the viewport (huge top margin), so a jump
    // (anchor link, reload, End key) still crosses a threshold. Lit = centre above the middle.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const middle = e.rootBounds ? e.rootBounds.bottom : window.innerHeight / 2;
          const r = e.boundingClientRect;
          e.target.toggleAttribute('data-lit', r.top + r.height / 2 <= middle);
        }
      },
      { rootMargin: '100000px 0px -50% 0px', threshold: [0, 0.5, 1] },
    );
    words.forEach((w) => io.observe(w));
    return () => io.disconnect();
  }, [reduced]);

  return (
    <section id="philosophy" aria-labelledby="philosophy-title" className="relative overflow-hidden py-section">
      <div className="container-site">
        <SectionHeader
          id="philosophy"
          label={t.philosophyLabel}
          title={
            <span id="philosophy-title" lang="en">
              {t.philosophyTitle}
            </span>
          }
          titleClassName="sr-only"
          className="!mb-6 md:!mb-10"
        />

        <ol ref={listRef} className="border-b border-line">
          {rows.map((row) => (
            <li
              key={row.key}
              className="grid gap-y-6 border-t border-line py-10 first:border-t-0 first:pt-2 md:py-14 md:first:pt-4 lg:grid-cols-12 lg:items-end lg:gap-x-10 lg:py-16 lg:first:pt-6"
            >
              <div className="lg:col-span-8">
                <h3 data-philo lang="en" className={`relative w-fit whitespace-nowrap ${WORD}`}>
                  {/* Outline (the readable text). Hidden once the solid ink has covered it. */}
                  <span
                    className="block text-transparent opacity-0 transition-opacity delay-[900ms] duration-500 [-webkit-text-stroke:1px_rgb(var(--c-ink-3))] md:[-webkit-text-stroke-width:1.5px] motion-safe:[.js_[data-philo]:not([data-lit])>&]:opacity-100 motion-safe:[.js_[data-philo]:not([data-lit])>&]:delay-0"
                  >
                    {row.word}.
                  </span>
                  {/* Solid ink, revealed by a sliding clip window (padded so tracking never clips the last glyph) */}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-[0.1em] -right-[0.2em] -top-[0.1em] left-0 overflow-hidden pt-[0.1em] transition-transform duration-[1300ms] ease-out-expo motion-safe:[.js_[data-philo]:not([data-lit])>&]:-translate-x-full"
                  >
                    <span
                      className="block text-ink transition-transform duration-[1300ms] ease-out-expo motion-safe:[.js_[data-philo]:not([data-lit])>*>&]:translate-x-full"
                    >
                      {row.word}
                      <span className="text-accent">.</span>
                    </span>
                  </span>
                </h3>
              </div>
              <p className="ml-[14%] max-w-[36ch] text-lead text-ink-2 sm:ml-[34%] md:max-w-[40ch] lg:col-span-4 lg:ml-0 lg:max-w-[36ch] lg:pb-[0.35rem]">
                {l(row.body)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
