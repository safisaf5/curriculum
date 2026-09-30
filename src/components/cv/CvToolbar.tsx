import { useEffect, useRef, type MouseEvent } from 'react';
import { ArrowDown, ArrowLeft, Printer } from 'lucide-react';
import { useLang, useT } from '../../i18n';
import { track } from '../../lib/analytics';
import { cn } from '../../lib/cn';
import { FILES } from '../../site';
import { LangSwitch, ThemeToggle } from '../layout/controls';
import { SmartLink } from '../ui/SmartLink';

/** Shared width of the toolbar row and the document sheet. */
export const CV_WIDTH = 'mx-auto w-full max-w-[66rem]';

/** Opens the print dialog (the print stylesheet expands everything). */
export const printCv = (from: string) => {
  track('cv_print', { from });
  window.print();
};

/** Other language of the page, for the second PDF. */
export const useOtherLang = () => (useLang() === 'fr' ? 'en' : 'fr');

/** Bigger hit areas for the shared FR / EN switch (44px on touch screens). */
const LANG_TARGETS = '[&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:px-1.5 [&_span[aria-current]]:inline-flex [&_span[aria-current]]:min-h-11 [&_span[aria-current]]:items-center [&_span[aria-current]]:px-1.5';

/**
 * Slim sticky bar: back to the site, FR / EN, theme, print, both PDFs.
 * A hairline in the accent colour tracks the reading progress.
 */
export const CvToolbar = () => {
  const t = useT('cv');
  const lang = useLang();
  const other = useOtherLang();
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // The home page keeps the scroll position of the previous page: start it at the top.
  const onBack = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    window.scrollTo(0, 0);
  };

  const quiet = 'inline-flex h-10 items-center gap-2 px-2 text-[0.875rem] text-ink-2 transition-colors duration-300 hover:text-ink';

  return (
    <header className="cv-toolbar sticky top-0 z-40 border-b border-line bg-bg print:hidden">
      <div className={cn(CV_WIDTH, 'flex h-14 items-center justify-between gap-3 px-[var(--gutter)]')}>
        <SmartLink
          to="/"
          onClick={onBack}
          className="group -ml-2.5 inline-flex h-11 min-w-11 items-center gap-2 px-2.5 text-[0.875rem] text-ink-2 transition-colors duration-300 hover:text-ink"
        >
          <ArrowLeft
            aria-hidden="true"
            size={16}
            strokeWidth={1.6}
            className="shrink-0 transition-transform duration-500 ease-out-expo group-hover:-translate-x-1"
          />
          <span className="sr-only sm:not-sr-only">{t.cvBack}</span>
        </SmartLink>

        <div className="flex items-center gap-1 sm:gap-2" role="group" aria-label={t.cvActions}>
          <LangSwitch className={LANG_TARGETS} />
          <ThemeToggle className="h-11 w-11" />
          <span aria-hidden="true" className="mx-1.5 hidden h-5 w-px bg-line lg:block" />
          <button type="button" onClick={() => printCv('cv-toolbar')} className={cn(quiet, 'group hidden lg:inline-flex')}>
            <Printer aria-hidden="true" size={16} strokeWidth={1.6} />
            <span className="link">{t.cvPrint}</span>
          </button>
          <a
            href={FILES.cvPdf[other]}
            download
            hrefLang={other}
            onClick={() => track('cv_download', { lang: other, from: 'cv-page' })}
            className={cn(quiet, 'hidden lg:inline-flex')}
          >
            <span className="link">{t.cvDownloadOther}</span>
            <span className="font-mono text-label uppercase text-ink-3">{other}</span>
          </a>
          <a
            href={FILES.cvPdf[lang]}
            download
            hrefLang={lang}
            onClick={() => track('cv_download', { lang, from: 'cv-page' })}
            className="btn btn-primary ml-1 min-h-10 gap-2.5 px-4 text-[0.875rem]"
          >
            <span aria-hidden="true" className="sm:hidden">
              {t.cvPdfShort}
            </span>
            <span className="sr-only sm:not-sr-only">{t.cvDownload}</span>
            <ArrowDown aria-hidden="true" size={15} strokeWidth={1.7} className="btn-arrow btn-arrow-down shrink-0" />
          </a>
        </div>
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 -bottom-px h-px">
        <div ref={bar} className="h-full origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
      </div>
    </header>
  );
};
