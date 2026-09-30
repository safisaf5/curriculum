import type { ReactNode } from 'react';
import { useReveal } from '../../hooks';
import { cn } from '../../lib/cn';
import { SECTIONS, type SectionId } from '../../site';

/** "04" for the 4th home section. Keeps numbering right if sections move. */
export const sectionNumber = (id: SectionId) =>
  String(SECTIONS.findIndex((s) => s.id === id) + 1).padStart(2, '0');

interface SectionHeaderProps {
  id: SectionId;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Right-aligned slot on large screens (filters, counters...). */
  aside?: ReactNode;
  /** 'split': title left, intro right. 'stack': intro under the title. */
  layout?: 'split' | 'stack';
  titleAs?: 'h2' | 'h1';
  /** id on the heading, for the section's aria-labelledby. */
  titleId?: string;
  className?: string;
  titleClassName?: string;
}

/**
 * Editorial section opener: hairline rule, mono index + label, big title.
 * Used by most sections, but each section is free to compose its own.
 */
export const SectionHeader = ({
  id,
  label,
  title,
  intro,
  aside,
  layout = 'split',
  titleAs: Title = 'h2',
  titleId,
  className,
  titleClassName,
}: SectionHeaderProps) => {
  const lineRef = useReveal<HTMLDivElement>();
  const titleRef = useReveal<HTMLDivElement>();
  return (
    <header className={cn('mb-12 md:mb-20', className)}>
      <div ref={lineRef} className="reveal-line h-px w-full bg-line" aria-hidden="true" />
      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="label flex items-center gap-3">
          <span className="tabular text-accent-ink">{sectionNumber(id)}</span>
          <span aria-hidden="true" className="h-px w-6 bg-ink-3/60" />
          <span>{label}</span>
        </p>
        {aside && <div className="hidden md:block">{aside}</div>}
      </div>
      <div
        ref={titleRef}
        className={cn(
          'reveal mt-8 grid gap-6 md:mt-10',
          layout === 'split' && intro ? 'lg:grid-cols-12 lg:items-end' : '',
        )}
      >
        <Title
          id={titleId}
          className={cn(
            'font-semiwide text-display-l font-semibold text-ink',
            layout === 'split' && intro ? 'lg:col-span-7' : 'max-w-[18ch]',
            titleClassName,
          )}
        >
          {title}
        </Title>
        {intro && (
          <div
            className={cn(
              'max-w-prose text-lead text-ink-2',
              layout === 'split' ? 'lg:col-span-4 lg:col-start-9 lg:pb-2' : '',
            )}
          >
            {intro}
          </div>
        )}
      </div>
      {aside && <div className="mt-8 md:hidden">{aside}</div>}
    </header>
  );
};
