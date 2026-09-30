import type { ReactNode } from 'react';
import type { ExperienceType, Period, ProjectStatus } from '../../data';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { formatPeriod } from '../../lib/dates';
import { pad2 } from '../../lib/text';

/**
 * Building blocks of the web CV: section shell, period label, inline list,
 * show more / show less toggle. Class names prefixed `cv-` are hooks for the
 * print stylesheet (see printCss.ts).
 */

/** 'https://www.youtube.com/watch?v=x' → 'youtube.com/watch?v=x'. Long URLs keep their host only. */
export const printUrl = (url: string) => {
  const clean = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  return clean.length > 44 ? clean.split('/')[0] : clean;
};

/** Small square marker. Accent when `on`, otherwise a quiet hairline square. */
export const Marker = ({ on = true, className }: { on?: boolean; className?: string }) => (
  <span
    aria-hidden="true"
    className={cn('inline-block h-[5px] w-[5px] shrink-0', on ? 'bg-accent' : 'border border-ink-3/70', className)}
  />
);

interface CvSectionProps {
  id: string;
  title: string;
  /** Number of entries, shown as a quiet index on the right. */
  count?: number;
  children: ReactNode;
  className?: string;
}

/** Section shell: ink rule, accent marker, title, entry count. */
export const CvSection = ({ id, title, count, children, className }: CvSectionProps) => (
  <section id={id} aria-labelledby={`${id}-title`} className={cn('cv-section', className)}>
    <div className="cv-section-head flex items-center justify-between gap-4 border-t border-ink pt-3">
      <h2
        id={`${id}-title`}
        className="cv-h2 flex items-center gap-2.5 font-semiwide text-[1.2rem] font-semibold leading-tight tracking-[-0.015em] text-ink"
      >
        <Marker />
        {title}
      </h2>
      {count !== undefined && (
        <span aria-hidden="true" className="label tabular">
          {pad2(count)}
        </span>
      )}
    </div>
    <div className="cv-section-body mt-6">{children}</div>
  </section>
);

/**
 * Period as a mono label. `stacked`: start and end on two lines from the sm
 * breakpoint (date column of the wide entries), otherwise on one line. The
 * optional precise detail ("30 oct.") follows on its own line.
 */
export const PeriodLabel = ({
  period,
  ongoing,
  stacked,
  className,
}: {
  period: Period;
  ongoing?: boolean;
  stacked?: boolean;
  className?: string;
}) => {
  const { l, lang } = useI18n();
  const [start, end] = formatPeriod(period, lang).split(' → ');
  return (
    <span className={cn('flex flex-col', className)}>
      <span
        className={cn(
          'flex flex-wrap items-center gap-x-1.5 text-ink-2',
          stacked && 'sm:flex-col sm:flex-nowrap sm:items-start sm:gap-y-0.5',
        )}
      >
        <span className="flex items-center gap-2">
          {ongoing && <Marker />}
          {start}
        </span>
        {end && <span className="whitespace-nowrap">→ {end}</span>}
      </span>
      {period.detail && <span className="mt-0.5 text-ink-3">{l(period.detail)}</span>}
    </span>
  );
};

/** Words separated by a middle dot, wrapping cleanly (never a dot at the start of a line). */
export const InlineList = ({ items, className }: { items: string[]; className?: string }) => (
  <ul className={cn('cv-inline', className)}>
    {items.map((item, i) => (
      <li key={`${item}-${i}`} className="inline">
        {item}
        {i < items.length - 1 && (
          <>
            <span aria-hidden="true" className="text-ink-3">
              {' ·'}
            </span>{' '}
          </>
        )}
      </li>
    ))}
  </ul>
);

/**
 * Disclosure button placed right after the first entries; the extra entries
 * follow it. Hidden in print, where everything is expanded.
 */
export const CvToggle = ({
  expanded,
  onToggle,
  controls,
  shown,
  total,
}: {
  expanded: boolean;
  onToggle: () => void;
  controls: string;
  shown: number;
  total: number;
}) => {
  const t = useT('common');
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onToggle}
      className="cv-noprint group flex min-h-12 w-full items-center justify-between gap-4 border-y border-line text-left text-[0.9rem] font-medium text-ink-2 transition-colors duration-300 hover:text-ink print:hidden"
    >
      <span className="flex items-center gap-3 transition-transform duration-500 ease-out-expo group-hover:translate-x-1">
        <svg aria-hidden="true" viewBox="0 0 14 14" className="h-3.5 w-3.5 text-accent-ink">
          <path d="M1 7h12" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M7 1v12"
            stroke="currentColor"
            strokeWidth="1.5"
            className={cn('origin-center transition-transform duration-500 ease-out-expo', expanded && 'scale-y-0')}
          />
        </svg>
        {expanded ? t.showLess : t.showAll(total)}
      </span>
      <span aria-hidden="true" className="label tabular">
        <span className="text-ink">{pad2(expanded ? total : shown)}</span> / {pad2(total)}
      </span>
    </button>
  );
};

/** Localised label of an experience type. */
export const useTypeLabel = () => {
  const t = useT('cv');
  const labels: Record<ExperienceType, string> = {
    founder: t.cvTypeFounder,
    work: t.cvTypeWork,
    military: t.cvTypeMilitary,
    internship: t.cvTypeInternship,
  };
  return (type: ExperienceType) => labels[type];
};

/** Localised label of a project status. */
export const useStatusLabel = () => {
  const t = useT('cv');
  const labels: Record<ProjectStatus, string> = {
    active: t.cvStatusActive,
    completed: t.cvStatusCompleted,
    ongoing: t.cvStatusOngoing,
    acquired: t.cvStatusAcquired,
  };
  return (status: ProjectStatus) => labels[status];
};
