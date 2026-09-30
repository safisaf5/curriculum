import type { CSSProperties } from 'react';
import type { Publication } from '../../data';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { formatYearMonth } from '../../lib/dates';
import { SmartLink } from '../ui/SmartLink';

interface PublicationListProps {
  publications: Publication[];
  className?: string;
}

/**
 * Posts published elsewhere (LinkedIn...). Most have no URL in the data,
 * so rows are plain text; a row only becomes a link when `url` exists.
 */
export const PublicationList = ({ publications, className }: PublicationListProps) => {
  const { lang, l } = useI18n();
  const t = useT('notes');

  return (
    <ol className={cn('border-t border-line', className)}>
      {publications.map((p, i) => {
        const title = (
          <h3 className="font-semiwide text-display-s font-semibold text-ink">
            {p.url ? (
              <SmartLink to={p.url} className="link">
                {l(p.title)}
              </SmartLink>
            ) : (
              l(p.title)
            )}
          </h3>
        );
        return (
          <li
            key={p.id}
            className="reveal grid grid-cols-[2.25rem_1fr] gap-x-4 border-b border-line py-8 md:grid-cols-[3.5rem_1fr_auto] md:gap-x-6 md:py-10"
            style={{ '--reveal-delay': `${i * 80}ms` } as CSSProperties}
          >
            <span aria-hidden="true" className="label tabular pt-1 text-accent-ink">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <p className="label mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                <time dateTime={p.date} className="tabular text-ink-2">
                  {formatYearMonth(p.date, lang)}
                </time>
                <span aria-hidden="true" className="md:hidden">
                  ·
                </span>
                <span className="md:hidden">{t.notesExternal(p.platform)}</span>
              </p>
              {title}
              <p className="mt-3 max-w-[58ch] text-ink-2">{l(p.summary)}</p>
            </div>
            <p className="label hidden pt-1 md:block">{t.notesExternal(p.platform)}</p>
          </li>
        );
      })}
    </ol>
  );
};
