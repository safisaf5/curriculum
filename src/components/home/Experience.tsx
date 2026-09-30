import { useMemo, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { experience, type ExperienceType } from '../../data';
import { useReveal } from '../../hooks';
import { useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { pad2 } from '../../lib/text';
import { SectionHeader } from '../ui/SectionHeader';
import { ExperienceRow } from '../journey/ExperienceRow';
import { EXPERIENCE_TYPES, TYPE_KEY } from '../journey/shared';

type Filter = 'all' | ExperienceType;

const LIST_ID = 'experience-list';

/**
 * Every role, newest first, as a ruled list on the 12-column grid.
 * "All" opens on the highlighted roles; the others unfold in place, in date
 * order. A type filter shows every role of that type. All 20 roles are in the
 * server HTML (folded ones carry the hidden attribute).
 */
export default function Experience() {
  const t = useT('journey');
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const toolbarRef = useReveal<HTMLDivElement>();

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: experience.length, founder: 0, work: 0, military: 0, internship: 0 };
    experience.forEach((x) => (c[x.type] += 1));
    return c;
  }, []);
  const folded = useMemo(() => experience.filter((x) => !x.highlight).length, []);

  const collapsible = filter === 'all' && folded > 0;
  const isVisible = (x: (typeof experience)[number]) =>
    (filter === 'all' || x.type === filter) && (!collapsible || expanded || Boolean(x.highlight));
  const shown = experience.filter(isVisible).length;

  const chips: { id: Filter; label: string }[] = [
    { id: 'all', label: t.filterAll },
    ...EXPERIENCE_TYPES.map((id) => ({ id, label: t[TYPE_KEY[id]] })),
  ];

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (!next) {
      // Folding removes rows above the button: keep it under the reader's eyes
      requestAnimationFrame(() => {
        const btn = moreRef.current;
        if (!btn) return;
        const r = btn.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) btn.scrollIntoView({ block: 'center' });
      });
    }
  };

  let order = 0;

  return (
    <section id="experience" aria-labelledby="experience-title" className="py-section">
      <div className="container-site">
        <SectionHeader
          id="experience"
          label={t.experienceLabel}
          title={<span id="experience-title">{t.experienceTitle}</span>}
          intro={t.experienceIntro}
        />

        <div ref={toolbarRef} className="reveal mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div role="group" aria-label={t.filterLabel} className="flex flex-wrap gap-2">
            {chips.map((c) => {
              const on = filter === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(c.id)}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2.5 border px-4 font-mono text-[0.72rem] font-medium uppercase tracking-[0.06em] transition-colors duration-300',
                    on ? 'border-ink bg-ink text-bg' : 'border-line text-ink-2 hover:border-ink hover:text-ink',
                  )}
                >
                  {c.label}
                  <span className={cn('tabular', on ? 'text-bg/60' : 'text-ink-3')}>{pad2(counts[c.id])}</span>
                </button>
              );
            })}
          </div>
          <p className="label tabular shrink-0" aria-hidden="true">
            <span className="text-ink">{pad2(shown)}</span> / {pad2(experience.length)}
          </p>
          <p className="sr-only" aria-live="polite">
            {t.resultsCount(shown)}
          </p>
        </div>

        <ol id={LIST_ID} className="border-b border-line">
          {experience.map((x) => {
            const visible = isVisible(x);
            const delay = visible ? Math.min(order++, 8) * 45 : 0;
            return <ExperienceRow key={x.id} item={x} hidden={!visible} delay={delay} />;
          })}
        </ol>

        {collapsible && (
          <div className="pt-8">
            <button
              ref={moreRef}
              type="button"
              aria-expanded={expanded}
              aria-controls={LIST_ID}
              onClick={toggle}
              className="btn btn-outline w-full sm:w-auto"
            >
              <span>{expanded ? t.lessExperience : t.moreExperience(folded)}</span>
              <span aria-hidden="true" className={cn('transition-transform duration-500 ease-out-expo', expanded && 'rotate-180')}>
                <ArrowDown size={17} strokeWidth={1.6} className="btn-arrow btn-arrow-down" />
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
