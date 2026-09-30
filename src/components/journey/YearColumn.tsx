import { memo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import type { EntityInfo, TimelineYear } from '../../data';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { pad2 } from '../../lib/text';
import { SmartLink } from '../ui/SmartLink';
import { KIND_KEY } from './shared';
import { COLUMNS_CLASS, WIDTH_CLASS, spanOf } from './timelineLayout';

const Entry = ({ entity }: { entity: EntityInfo }) => {
  const { l } = useI18n();
  const t = useT('journey');
  const Icon = entity.external ? ArrowUpRight : ArrowRight;
  return (
    <li className="break-inside-avoid">
      <SmartLink
        to={entity.href ?? '/#timeline'}
        className="group relative flex min-h-11 items-start gap-3 border-t border-line py-3 lg:[@media(max-height:760px)]:py-2.5"
      >
        {/* Accent marker revealed where the row indents */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-[1.2rem] h-1.5 w-1.5 scale-0 bg-accent transition-transform duration-500 ease-out-expo group-hover:scale-100 group-focus-visible:scale-100"
        />
        <span className="min-w-0 flex-1 transition-transform duration-500 ease-out-expo group-hover:translate-x-3.5 group-focus-visible:translate-x-3.5">
          <span className="label block">{t[KIND_KEY[entity.kind]]}</span>
          <span className="mt-1.5 block text-[0.95rem] font-medium leading-snug text-ink lg:line-clamp-2">{l(entity.title)}</span>
          {entity.subtitle && (
            <span className="mt-0.5 block text-[0.8125rem] leading-snug text-ink-3 md:truncate">{l(entity.subtitle)}</span>
          )}
        </span>
        <Icon
          aria-hidden="true"
          size={14}
          strokeWidth={1.6}
          className={cn(
            'mt-px shrink-0 text-ink-3 transition-[transform,color] duration-500 ease-out-expo group-hover:text-accent-ink group-focus-visible:text-accent-ink',
            entity.external ? 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5' : 'group-hover:translate-x-1',
          )}
        />
      </SmartLink>
    </li>
  );
};

interface YearColumnProps {
  year: TimelineYear;
  index: number;
  active: boolean;
  onFocusColumn?: (index: number, target: HTMLElement) => void;
}

/**
 * One chapter of the timeline. The same markup serves three layouts:
 *  - phones: a vertical rail, the year bar sticks under the nav while its entries scroll by;
 *  - tablets and reduced motion: a snap column in a horizontal carousel;
 *  - desktop: a column of the pinned horizontal track. Dense years are wider
 *    (up to four sub-columns of entries) and set their header on one line.
 */
export const YearColumn = memo(function YearColumn({ year, index, active, onFocusColumn }: YearColumnProps) {
  const { l } = useI18n();
  const t = useT('journey');
  const span = spanOf(year.items.length);
  const wide = span > 1;
  const headingId = `timeline-${year.year}`;
  const listId = `timeline-${year.year}-entries`;
  // Phones only: entries fold under the chapter so the decade stays scannable
  const [open, setOpen] = useState(false);

  return (
    <li
      aria-labelledby={headingId}
      onFocus={onFocusColumn ? (e) => onFocusColumn(index, e.target as HTMLElement) : undefined}
      className={cn(
        'relative flex flex-col border-l border-line pb-14 pl-6 last:pb-4',
        'md:shrink-0 md:snap-start md:pb-0 md:pr-8',
        WIDTH_CLASS[span],
      )}
    >
      {/* Active rule over the column edge (tablet and up) */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute -left-px inset-y-0 hidden w-px origin-top bg-accent transition-transform duration-700 ease-out-expo md:block',
          active ? 'scale-y-100' : 'scale-y-0',
        )}
      />

      {/* `contents` on phones keeps the sticky bar a direct child of the column */}
      <div className={cn('contents md:block', wide && 'lg:flex lg:items-end lg:gap-10')}>
        <h3
          id={headingId}
          className={cn(
            // Phones: compact chapter bar
            'sticky top-[3.75rem] z-10 -ml-6 flex items-baseline gap-4 bg-bg py-3 pl-6',
            // Tablet and up: stacked, oversized numeral
            'md:static md:ml-0 md:block md:bg-transparent md:p-0 lg:shrink-0',
          )}
        >
          <span aria-hidden="true" className="absolute left-[-4.5px] top-[1.35rem] h-2 w-2 bg-ink md:hidden" />
          <span
            className={cn(
              'tabular block shrink-0 font-wide font-extrabold leading-[0.8] tracking-[-0.045em] transition-colors duration-500',
              'text-[2.5rem] text-ink md:text-[5rem] lg:text-[clamp(3.75rem,min(7.5vw,11.5vh),6.75rem)]',
              active ? 'md:text-ink' : 'md:text-ink-3',
            )}
          >
            {year.year}
          </span>
          <span className="block font-semiwide text-[1.15rem] font-semibold leading-tight tracking-[-0.01em] text-ink md:mt-6 md:text-[1.35rem] lg:[@media(max-height:760px)]:mt-4">
            {l(year.title)}
          </span>
        </h3>
        <p
          className={cn(
            'mt-3 max-w-[40ch] text-[0.975rem] leading-relaxed text-ink-2 md:max-w-[36ch]',
            wide && 'lg:mt-0 lg:max-w-[38ch] lg:pb-px',
          )}
        >
          {l(year.body)}
        </p>
      </div>

      {/* Tablet and up: index and count above the numeral */}
      <p className="label order-first mb-5 hidden items-center gap-3 md:flex lg:[@media(max-height:760px)]:hidden">
        <span className={cn('tabular transition-colors duration-500', active && 'text-accent-ink')}>{pad2(index + 1)}</span>
        <span aria-hidden="true" className="h-px w-5 bg-ink-3/60" />
        <span>{t.timelineCount(year.items.length)}</span>
      </p>

      {/* Phones: the count is the toggle for the entries */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="label mt-4 flex min-h-11 w-full items-center gap-3 border-t border-line text-left md:hidden"
      >
        <span className="tabular">{pad2(index + 1)}</span>
        <span aria-hidden="true" className="h-px w-5 bg-ink-3/60" />
        <span className="flex-1 text-ink-2">{t.timelineCount(year.items.length)}</span>
        <Plus
          aria-hidden="true"
          size={15}
          strokeWidth={1.6}
          className={cn('text-ink transition-transform duration-500 ease-out-expo', open && 'rotate-45')}
        />
      </button>

      <ul
        id={listId}
        className={cn('gap-x-6 md:mt-7 md:block lg:[@media(max-height:760px)]:mt-5', COLUMNS_CLASS[span], open ? 'animate-fade-up' : 'max-md:hidden')}
      >
        {year.items.map((e) => (
          <Entry key={e.id} entity={e} />
        ))}
      </ul>
    </li>
  );
});
