import { useRef, type KeyboardEvent } from 'react';
import { projectCategories, type ProjectCategory } from '../../data';
import { useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { pad2 } from '../../lib/text';
import { categoryLabel } from './labels';

export type ProjectFilter = 'all' | ProjectCategory;

export const FILTERS: ProjectFilter[] = ['all', ...projectCategories];

interface FilterBarProps {
  value: ProjectFilter;
  counts: Record<ProjectFilter, number>;
  onSelect: (filter: ProjectFilter) => void;
  className?: string;
}

/**
 * Toggle buttons (aria-pressed) with per-category counts. Arrow keys, Home and
 * End move between them. On phones the row scrolls sideways, edge to edge,
 * inside its own scroller (never the page).
 */
export const FilterBar = ({ value, counts, onSelect, className }: FilterBarProps) => {
  const t = useT('projects');
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = refs.current.findIndex((b) => b === document.activeElement);
    if (i < 0) return;
    const last = FILTERS.length - 1;
    const next =
      e.key === 'ArrowRight' ? (i + 1) % FILTERS.length
      : e.key === 'ArrowLeft' ? (i - 1 + FILTERS.length) % FILTERS.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : -1;
    if (next < 0) return;
    e.preventDefault();
    refs.current[next]?.focus();
  };

  return (
    <div
      role="group"
      aria-label={t.filterLabel}
      onKeyDown={onKeyDown}
      className={cn('-mx-[var(--gutter)] border-b border-line md:mx-0', className)}
    >
      <div className="no-scrollbar overflow-x-auto overscroll-x-contain px-[calc(var(--gutter)-0.75rem)] md:-mx-3 md:px-0">
        <ul className="flex w-max md:w-auto md:flex-wrap">
          {FILTERS.map((f, i) => {
            const on = value === f;
            const label = f === 'all' ? t.filterAll : categoryLabel(t, f);
            return (
              <li key={f}>
                <button
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onSelect(f)}
                  className={cn(
                    'group relative flex min-h-12 items-center gap-2 whitespace-nowrap px-3 font-mono text-[0.75rem] font-medium uppercase tracking-[0.08em] transition-colors duration-300',
                    on ? 'text-ink' : 'text-ink-3 hover:text-ink',
                  )}
                >
                  <span>{label}</span>
                  <sup aria-hidden="true" className={cn('tabular top-[-0.45em] text-[0.625rem]', on ? 'text-accent-ink' : 'text-ink-3')}>
                    {pad2(counts[f])}
                  </sup>
                  <span className="sr-only">, {t.projectCount(counts[f])}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-3 bottom-0 h-[2px] origin-left transition-transform duration-500 ease-out-expo',
                      on ? 'scale-x-100 bg-accent' : 'scale-x-0 bg-ink/40 group-hover:scale-x-100',
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
