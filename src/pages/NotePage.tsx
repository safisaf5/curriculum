import { useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useI18n, useT } from '../i18n';
import { cn } from '../lib/cn';
import { formatYearMonth } from '../lib/dates';
import { Markdown } from '../lib/markdown';
import { getNote, getNotes, type NoteMeta } from '../lib/notes';
import { typo } from '../lib/text';
import { SmartLink } from '../components/ui/SmartLink';
import NotFoundPage from './NotFoundPage';

/** Link to the previous / next note, at the end of the article. */
const Sibling = ({ note, label, align }: { note: NoteMeta; label: string; align: 'start' | 'end' }) => {
  const { lang } = useI18n();
  return (
    <SmartLink
      to={`/notes/${note.slug}`}
      className={cn(
        'group flex min-h-[8rem] flex-col justify-between gap-6 border-line py-8',
        align === 'end' ? 'border-t md:col-start-2 md:border-l md:border-t-0 md:pl-8 md:text-right first:border-t-0' : 'md:pr-8',
      )}
    >
      <span className={cn('label flex items-center gap-2', align === 'end' && 'md:justify-end')}>
        {align === 'start' && (
          <ArrowLeft aria-hidden="true" size={14} strokeWidth={1.6} className="transition-transform duration-500 ease-out-expo group-hover:-translate-x-1" />
        )}
        {label}
        {align === 'end' && (
          <ArrowRight aria-hidden="true" size={14} strokeWidth={1.6} className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
        )}
      </span>
      <span
        lang={note.lang !== lang ? note.lang : undefined}
        className="font-semiwide text-[clamp(1.2rem,1.7vw,1.5rem)] font-semibold leading-[1.2] tracking-[-0.015em] text-ink transition-colors group-hover:text-accent-ink"
      >
        {typo(note.title, note.lang)}
      </span>
    </SmartLink>
  );
};

/**
 * /notes/:slug. Title and standfirst, metadata in the left margin (sticky
 * on desktop), Markdown body on a ~65ch measure, then previous / next.
 * Unknown slug: the 404 content with a note-specific message.
 */
export default function NotePage() {
  const { slug = '' } = useParams();
  const { lang } = useI18n();
  const t = useT('notes');
  const note = getNote(slug, lang);

  if (!note) return <NotFoundPage message={t.notesNotFound} />;

  const all = getNotes(lang);
  const index = all.findIndex((n) => n.slug === note.slug);
  const newer = index > 0 ? all[index - 1] : undefined;
  const older = index >= 0 ? all[index + 1] : undefined;
  const foreign = note.lang !== lang ? note.lang : undefined;

  return (
    <article aria-labelledby="note-title" className="pb-section">
      <div className="container-site pt-[4.5rem]">
        <div className="label flex items-center justify-between gap-4 border-b border-line">
          <SmartLink to="/notes" className="group -ml-1 inline-flex min-h-12 items-center gap-2 px-1 text-ink-2 transition-colors hover:text-ink">
            <ArrowLeft
              aria-hidden="true"
              size={14}
              strokeWidth={1.6}
              className="transition-transform duration-500 ease-out-expo group-hover:-translate-x-1"
            />
            {t.notesBack}
          </SmartLink>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
            {t.notesTitle}
          </span>
        </div>

        <header className="grid gap-x-10 pt-12 md:pt-16 lg:grid-cols-12">
          <div lang={foreign} className="lg:col-span-9 lg:col-start-4">
            <h1
              id="note-title"
              className="max-w-[20ch] font-semiwide text-display-l font-semibold text-ink animate-fade-up"
            >
              {typo(note.title, note.lang)}
            </h1>
            {note.description && (
              <p className="mt-8 max-w-[52ch] text-lead text-ink-2 animate-fade-up [animation-delay:120ms]">
                {typo(note.description, note.lang)}
              </p>
            )}
          </div>
        </header>

        <div className="mt-12 grid gap-x-10 gap-y-10 border-t border-line pt-8 md:mt-16 lg:grid-cols-12 lg:pt-12">
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-1 lg:gap-y-7">
                <div>
                  <dt className="label">{t.notesPublished}</dt>
                  <dd className="mt-1.5 text-[0.95rem] text-ink">
                    <time dateTime={note.date}>{formatYearMonth(note.date, lang)}</time>
                  </dd>
                </div>
                <div>
                  <dt className="label">{t.notesReading}</dt>
                  <dd className="mt-1.5 text-[0.95rem] text-ink">{t.notesReadingTime(note.readingMinutes)}</dd>
                </div>
                {note.tags.length > 0 && (
                  <div className="col-span-2 lg:col-span-1">
                    <dt className="label">{t.notesTopics}</dt>
                    <dd className="mt-2.5 flex flex-wrap gap-1.5">
                      {note.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
              {foreign && (
                <p className="mt-6 flex max-w-[32ch] gap-2.5 text-[0.9rem] leading-snug text-ink-2 lg:mt-8">
                  <span aria-hidden="true" className="mt-[0.45em] h-1.5 w-1.5 shrink-0 bg-accent" />
                  {t.notesUntranslated}
                </p>
              )}
            </div>
          </aside>

          <div lang={foreign} className="min-w-0 lg:col-span-8 lg:col-start-4">
            <Markdown source={note.body} lang={note.lang} />
          </div>
        </div>

        {(older || newer) && (
          <nav aria-label={t.notesLabel} className="mt-section grid border-y border-line md:grid-cols-2">
            {older && <Sibling note={older} label={t.notesOlder} align="start" />}
            {newer && <Sibling note={newer} label={t.notesNewer} align="end" />}
          </nav>
        )}
      </div>
    </article>
  );
}
