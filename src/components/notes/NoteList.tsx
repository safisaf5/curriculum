import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { formatYearMonth } from '../../lib/dates';
import { typo } from '../../lib/text';
import type { NoteMeta } from '../../lib/notes';
import { SmartLink } from '../ui/SmartLink';

interface NoteListProps {
  notes: NoteMeta[];
  /** h2 on /notes, h3 inside the home teaser. */
  headingLevel?: 'h2' | 'h3';
  /** Compact rows (home teaser): no tags, smaller title. */
  compact?: boolean;
  className?: string;
}

/**
 * Editorial rows linking to /notes/<slug>: date in the margin, title and
 * description, reading time and tags. Hover: the text block indents 8px,
 * an accent marker appears next to the date and the arrow moves 4px.
 */
export const NoteList = ({ notes, headingLevel: Heading = 'h2', compact, className }: NoteListProps) => {
  const { lang } = useI18n();
  const t = useT('notes');

  return (
    <ol className={cn('border-t border-line', className)}>
      {notes.map((note, i) => (
        <li key={note.slug} className="reveal border-b border-line" style={{ '--reveal-delay': `${i * 70}ms` } as CSSProperties}>
          <SmartLink
            to={`/notes/${note.slug}`}
            lang={note.lang !== lang ? note.lang : undefined}
            className={cn(
              'group grid grid-cols-[1fr_auto] gap-x-6 gap-y-3 md:grid-cols-12 md:items-baseline',
              compact ? 'py-6 md:py-7' : 'py-8 md:py-10',
            )}
          >
            <p className="label relative col-span-2 flex flex-wrap items-center gap-x-2 md:col-span-2">
              <span
                aria-hidden="true"
                className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 scale-0 bg-accent transition-transform duration-500 ease-out-expo group-hover:scale-100 group-focus-visible:scale-100"
              />
              <time
                dateTime={note.date}
                className="tabular transition-transform duration-500 ease-out-expo group-hover:translate-x-4 group-focus-visible:translate-x-4"
              >
                {formatYearMonth(note.date, lang)}
              </time>
              <span className="md:hidden" aria-hidden="true">·</span>
              <span className="md:hidden">{t.notesReadingTime(note.readingMinutes)}</span>
            </p>

            <div className="col-span-1 transition-transform duration-500 ease-out-expo group-hover:translate-x-2 group-focus-visible:translate-x-2 md:col-span-7">
              <Heading
                className={cn(
                  'font-semiwide font-semibold text-ink',
                  compact ? 'text-[clamp(1.25rem,1.8vw,1.6rem)] leading-[1.15] tracking-[-0.015em]' : 'text-display-s',
                )}
              >
                {typo(note.title, note.lang)}
              </Heading>
              {note.description && (
                <p className={cn('mt-3 max-w-[60ch] text-ink-2', compact && 'line-clamp-2')}>{typo(note.description, note.lang)}</p>
              )}
              {!compact && note.tags.length > 0 && (
                <p className="mt-5 flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </p>
              )}
            </div>

            <p className="label col-span-1 flex items-center justify-end gap-4 self-start md:col-span-3 md:self-baseline">
              <span className="hidden md:inline">{t.notesReadingTime(note.readingMinutes)}</span>
              <ArrowRight
                aria-hidden="true"
                size={17}
                strokeWidth={1.6}
                className="shrink-0 text-ink-2 transition-[transform,color] duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-accent-ink group-focus-visible:translate-x-1 group-focus-visible:text-accent-ink"
              />
            </p>
          </SmartLink>
        </li>
      ))}
    </ol>
  );
};
