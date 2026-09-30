import { useMemo, type CSSProperties, type RefObject } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import type { TimelineYear } from '../../data';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { pad2 } from '../../lib/text';
import { Odometer } from './Odometer';
import { rulerMarks } from './timelineLayout';

interface TimelineHudProps {
  years: TimelineYear[];
  active: number;
  pinned: boolean;
  barRef: RefObject<HTMLDivElement>;
  onGo: (index: number) => void;
}

/** CSS variables for a position that differs between md and lg widths. */
const at = (md: number, lg: number) => ({ '--x-md': `${md}%`, '--x-lg': `${lg}%` }) as CSSProperties;
const POS = 'left-[var(--x-md)] lg:left-[var(--x-lg)]';

/**
 * Instrument panel of the timeline (tablet and up): the current year on a
 * rolling counter, prev / next, and a ruler that is a scale map of the track.
 * Each year mark sits where its column starts, each small tick is one entry,
 * and the accent line fills with the scroll progress.
 */
export const TimelineHud = ({ years, active, pinned, barRef, onGo }: TimelineHudProps) => {
  const t = useT('journey');
  const { l } = useI18n();
  const marks = useMemo(() => rulerMarks(years), [years]);
  const last = years.length - 1;

  const arrow =
    'inline-flex h-11 w-11 items-center justify-center border border-line text-ink transition-colors duration-300 hover:border-ink disabled:pointer-events-none disabled:text-ink-3/40';

  return (
    <div className="container-site hidden md:block">
      <div className="grid grid-cols-12 items-end gap-x-6 gap-y-6">
        <div className="col-span-6 lg:col-span-2">
          <p className="label flex items-center gap-3">
            <span className="tabular text-accent-ink">{pad2(active + 1)}</span>
            <span aria-hidden="true" className="h-px w-5 bg-ink-3/60" />
            <span className="tabular">{pad2(years.length)}</span>
          </p>
          <Odometer
            value={years[active].year}
            className="mt-3 font-wide text-[clamp(2.75rem,4.4vw,4.25rem)] font-extrabold tracking-[-0.045em] text-ink lg:[@media(max-height:760px)]:text-[3rem]"
          />
        </div>

        <div className="col-span-6 flex flex-col items-end gap-3 lg:order-last lg:col-span-2">
          {pinned && (
            <p
              aria-hidden="true"
              className={cn(
                'label flex items-center gap-2 whitespace-nowrap transition-opacity duration-500',
                active < last ? 'opacity-100' : 'opacity-0',
              )}
            >
              {t.timelineHint}
              <ArrowDown size={12} strokeWidth={1.6} />
            </p>
          )}
          <div className="flex gap-1.5">
            <button type="button" className={arrow} aria-label={t.timelinePrev} disabled={active === 0} onClick={() => onGo(active - 1)}>
              <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.6} />
            </button>
            <button type="button" className={arrow} aria-label={t.timelineNext} disabled={active === last} onClick={() => onGo(active + 1)}>
              <ArrowRight aria-hidden="true" size={16} strokeWidth={1.6} />
            </button>
          </div>
        </div>

        <div className="col-span-12 pb-1 lg:col-span-8">
          <div role="group" aria-label={t.timelineIndex} className="relative h-11">
            {years.map((y, i) => (
              <button
                key={y.year}
                type="button"
                onClick={() => onGo(i)}
                aria-label={`${y.year}, ${l(y.title)}`}
                aria-current={active === i ? 'step' : undefined}
                style={at(marks[i].md, marks[i].lg)}
                className={cn(
                  'tabular absolute bottom-0 -ml-1 flex h-11 items-end px-1 pb-2 font-mono text-[0.6875rem] font-medium tracking-[0.04em] transition-colors duration-300',
                  POS,
                  active === i ? 'text-accent-ink' : 'text-ink-3 hover:text-ink',
                )}
              >
                {y.year}
              </button>
            ))}
          </div>

          <div aria-hidden="true" className="relative h-3.5">
            <span className="absolute inset-x-0 top-0 h-px bg-line" />
            {years.map((y, i) => (
              <span key={y.year}>
                <span
                  style={at(marks[i].md, marks[i].lg)}
                  className={cn('absolute top-0 h-3.5 w-px transition-colors duration-300', POS, active === i ? 'bg-accent' : 'bg-ink/50')}
                />
                {y.items.map((e, j) => {
                  const f = ((j + 1) / (y.items.length + 1)) * 0.9;
                  return (
                    <span
                      key={e.id}
                      style={at(marks[i].md + marks[i].mdWidth * f, marks[i].lg + marks[i].lgWidth * f)}
                      className={cn('absolute top-0 h-1.5 w-px bg-ink-3/45', POS)}
                    />
                  );
                })}
              </span>
            ))}
            <div ref={barRef} className="absolute left-0 top-0 h-[2px] w-full origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
