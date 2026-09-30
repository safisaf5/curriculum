import { ArrowRight } from 'lucide-react';
import { useReveal, useRevealChildren } from '../../hooks';
import { useI18n, useT } from '../../i18n';
import { getNotes } from '../../lib/notes';
import { NoteList } from '../notes/NoteList';
import { SmartLink } from '../ui/SmartLink';

/**
 * Home: the three latest notes, just before Contact. Not a numbered
 * section (not in SECTIONS). Renders nothing while no note is published.
 */
export default function NotesTeaser() {
  const { lang, l } = useI18n();
  const t = useT('notes');
  const notes = getNotes(lang).slice(0, 3);
  const lineRef = useReveal<HTMLDivElement>();
  const listRef = useRevealChildren<HTMLDivElement>([lang, notes.length]);

  if (!notes.length) return null;

  return (
    <section id="notes" aria-labelledby="notes-teaser-title" className="py-section">
      <div className="container-site">
        <div ref={lineRef} className="reveal-line h-px w-full bg-line" aria-hidden="true" />
        <div ref={listRef} className="mt-4 grid gap-x-10 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="label flex items-center gap-3">
              <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
              {t.notesLabel}
            </p>
            <h2 id="notes-teaser-title" className="reveal mt-8 font-semiwide text-display-l font-semibold text-ink md:mt-10">
              {t.notesTitle}
            </h2>
            <p className="reveal mt-6 max-w-[34ch] text-ink-2 [--reveal-delay:80ms]">{l(t.notesIntro)}</p>
            <SmartLink
              to="/notes"
              className="group reveal mt-8 inline-flex min-h-11 items-center gap-2 text-[0.95rem] font-medium text-ink [--reveal-delay:140ms]"
            >
              <span className="link">{t.notesSeeAll}</span>
              <ArrowRight
                aria-hidden="true"
                size={16}
                strokeWidth={1.6}
                className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1"
              />
            </SmartLink>
          </div>
          <div className="lg:col-span-8 lg:pt-[3.25rem]">
            <NoteList notes={notes} headingLevel="h3" compact />
          </div>
        </div>
      </div>
    </section>
  );
}
