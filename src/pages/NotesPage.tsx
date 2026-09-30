import { publications } from '../data';
import { useRevealChildren } from '../hooks';
import { useI18n, useT } from '../i18n';
import { getNotes } from '../lib/notes';
import { NoteList } from '../components/notes/NoteList';
import { PublicationList } from '../components/notes/PublicationList';

/**
 * /notes: the journal. Oversized title, then the notes as editorial rows.
 * With no published note yet, an honest empty state followed by the posts
 * already published elsewhere (from src/data, no invented links).
 */
export default function NotesPage() {
  const { lang, l } = useI18n();
  const t = useT('notes');
  const notes = getNotes(lang);
  const posts = [...publications].sort((a, b) => b.date.localeCompare(a.date));
  const listRef = useRevealChildren<HTMLDivElement>([lang, notes.length]);

  return (
    <div className="pb-section">
      <header className="container-site pt-[4.5rem]">
        <div className="label flex items-center justify-between gap-4 border-b border-line py-4 animate-fade-in">
          <p className="flex items-center gap-3">
            <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
            {t.notesLabel}
          </p>
          {notes.length > 0 && <p className="tabular">{t.notesCount(notes.length)}</p>}
        </div>

        <h1 className="mt-12 overflow-hidden pb-[0.04em] font-wide text-[clamp(3.1rem,13.6vw,14rem)] font-extrabold uppercase leading-[0.84] tracking-[-0.045em] text-ink md:mt-16">
          <span className="block animate-rise-in">
            {t.notesTitle}
            <span aria-hidden="true" className="text-accent">
              .
            </span>
          </span>
        </h1>

        <div className="mt-10 grid gap-6 md:mt-14 lg:grid-cols-12">
          <p className="max-w-[46ch] text-lead text-ink-2 animate-fade-up [animation-delay:150ms] lg:col-span-5 lg:col-start-8">
            {l(t.notesIntro)}
          </p>
        </div>
      </header>

      <div ref={listRef} className="container-site mt-16 md:mt-24">
        {notes.length > 0 ? (
          <section aria-label={t.notesList}>
            <NoteList notes={notes} />
          </section>
        ) : (
          <div className="grid gap-x-10 gap-y-12 border-t border-line pt-10 md:pt-14 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="reveal flex max-w-[26ch] gap-4 font-semiwide text-[clamp(1.3rem,1.9vw,1.65rem)] font-medium leading-[1.25] tracking-[-0.015em] text-ink lg:sticky lg:top-28">
                <span aria-hidden="true" className="mt-[0.45em] h-2 w-2 shrink-0 animate-blink bg-accent" />
                {l(t.notesEmpty)}
              </p>
            </div>

            {posts.length > 0 && (
              <section aria-labelledby="notes-recent" className="lg:col-span-8">
                <h2 id="notes-recent" className="label mb-6 flex items-center gap-3">
                  <span aria-hidden="true" className="tabular text-ink-2">{String(posts.length).padStart(2, '0')}</span>
                  <span aria-hidden="true" className="h-px w-6 bg-ink-3/60" />
                  {t.notesRecent}
                </h2>
                <PublicationList publications={posts} />
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
