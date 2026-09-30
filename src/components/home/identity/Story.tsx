import { useEffect, useRef, useState } from 'react';
import { profile } from '../../../data';
import { useReveal } from '../../../hooks';
import { useL, useT } from '../../../i18n';
import { cn } from '../../../lib/cn';
import { pad2 } from '../../../lib/text';
import { SmartLink } from '../../ui/SmartLink';
import { EvidenceLinks } from './EvidenceLinks';

const chapterId = (id: string) => `about-story-${id}`;

/**
 * "D'abord réparer. Ensuite construire." Four chapters read as a scroll.
 * Desktop: a sticky panel (big number, title, 4-step progress) follows the
 * chapter crossing the middle of the viewport. Smaller screens: stacked
 * chapters on a hairline rail. SSR renders chapter 1 as active.
 */
export const Story = () => {
  const l = useL();
  const t = useT('home');
  const chapters = profile.story;
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const headRef = useReveal<HTMLDivElement>();

  // The chapter crossing a thin band at mid-height becomes the active one.
  useEffect(() => {
    const root = listRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const items = [...root.querySelectorAll<HTMLElement>('[data-chapter]')];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.chapter));
        }
      },
      { rootMargin: '-45% 0px -54% 0px', threshold: 0 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const swap = (i: number) =>
    cn(
      'col-start-1 row-start-1 transition-[transform,opacity] duration-700 ease-out-expo motion-reduce:transition-none',
      i === active ? 'translate-y-0 opacity-100' : i < active ? '-translate-y-8 opacity-0' : 'translate-y-8 opacity-0',
    );

  return (
    <div className="mt-24 md:mt-32 lg:mt-section">
      <div ref={headRef} className="reveal border-t border-line pt-4">
        <p className="label flex items-center gap-3">
          <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
          {t.storyLabel}
        </p>
        <h3
          id="about-story-title"
          className="mt-8 max-w-[16ch] font-semiwide text-[clamp(2.1rem,4.8vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-ink md:mt-10"
        >
          {l(t.storyTitle)}
        </h3>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-x-10 md:mt-20 lg:grid-cols-12">
        {/* Sticky panel (desktop) */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-[max(calc(var(--nav-h)+1.5rem),calc(50vh-13rem))]">
            <p className="label tabular flex items-center gap-3 border-b border-line pb-3">
              <span className="text-accent-ink">{pad2(active + 1)}</span>
              <span aria-hidden="true" className="h-px w-6 bg-ink-3/60" />
              <span>{pad2(chapters.length)}</span>
            </p>

            <div aria-hidden="true" className="mt-10 grid overflow-hidden">
              {chapters.map((c, i) => (
                <span
                  key={c.id}
                  className={cn(
                    'tabular pb-[0.06em] font-wide text-[clamp(7rem,12.5vw,12rem)] font-extrabold leading-[0.8] tracking-[-0.06em] text-ink',
                    swap(i),
                  )}
                >
                  {pad2(i + 1)}
                  <span className="text-accent">.</span>
                </span>
              ))}
            </div>

            <div aria-hidden="true" className="mt-5 grid overflow-hidden">
              {chapters.map((c, i) => (
                <span
                  key={c.id}
                  className={cn(
                    'font-semiwide text-display-m font-semibold text-ink [transition-delay:60ms]',
                    swap(i),
                  )}
                >
                  {l(c.title)}
                </span>
              ))}
            </div>

            <nav aria-label={t.storyNav} className="mt-14 max-w-[26rem]">
              <ol className="grid grid-cols-4 gap-2">
                {chapters.map((c, i) => (
                  <li key={c.id}>
                    <SmartLink
                      to={`/#${chapterId(c.id)}`}
                      aria-label={t.storyStep(i + 1, l(c.title))}
                      aria-current={i === active ? 'step' : undefined}
                      className="group flex min-h-11 flex-col justify-center gap-3"
                    >
                      <span aria-hidden="true" className="relative block h-[2px] w-full overflow-hidden bg-line">
                        <span
                          className={cn(
                            'absolute inset-0 origin-left transition-[transform,background-color] duration-700 ease-out-expo',
                            i <= active ? 'scale-x-100' : 'scale-x-0',
                            i === active ? 'bg-accent' : 'bg-ink',
                          )}
                        />
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'label tabular transition-colors duration-300',
                          i === active ? 'text-ink' : 'group-hover:text-ink',
                        )}
                      >
                        {pad2(i + 1)}
                      </span>
                    </SmartLink>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>

        {/* Chapters */}
        <ol ref={listRef} className="lg:col-span-6 lg:col-start-7">
          {chapters.map((c, i) => {
            const on = i === active;
            return (
              <li
                key={c.id}
                id={chapterId(c.id)}
                data-chapter={i}
                className="relative border-l border-line pb-16 pl-7 last:pb-2 sm:pl-10 lg:flex lg:min-h-[64vh] lg:flex-col lg:justify-center lg:pb-0 lg:pl-14 lg:last:pb-0"
              >
                {/* Rail: a diamond node on small screens, an accent segment on desktop */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -left-[5px] top-[0.9rem] h-[9px] w-[9px] rotate-45 transition-colors duration-500 lg:hidden',
                    on ? 'bg-accent' : 'bg-ink',
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -left-px top-0 hidden h-full w-[2px] origin-top bg-accent transition-transform duration-700 ease-out-expo lg:block',
                    on ? 'scale-y-100' : 'scale-y-0',
                  )}
                />

                <div className="flex items-baseline gap-4">
                  <span
                    aria-hidden="true"
                    className="tabular font-wide text-[2.6rem] font-extrabold leading-none tracking-[-0.05em] text-ink lg:hidden"
                  >
                    {pad2(i + 1)}
                  </span>
                  <p className="label tabular text-accent-ink">{c.period}</p>
                </div>
                <h4
                  className={cn(
                    'mt-3 font-semiwide text-display-s font-semibold transition-colors duration-500 lg:mt-4',
                    on ? 'text-ink' : 'text-ink lg:text-ink-3',
                  )}
                >
                  {l(c.title)}
                </h4>
                <p
                  className={cn(
                    'mt-4 max-w-[46ch] text-[1.0625rem] leading-relaxed transition-colors duration-500 md:text-lead',
                    on ? 'text-ink-2' : 'text-ink-2 lg:text-ink-3',
                  )}
                >
                  {l(c.body)}
                </p>
                <EvidenceLinks ids={c.evidence} label={t.identityProof} from="story" className="mt-6 lg:mt-8" />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
