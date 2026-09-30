import { useCallback, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Contact, FileText, Moon, Sun } from 'lucide-react';
import { useDismiss } from '../../hooks';
import { useLang, useT } from '../../i18n';
import { track } from '../../lib/analytics';
import { cn } from '../../lib/cn';
import { FILES, switchLangPath } from '../../site';
import { useTheme } from '../../theme/ThemeProvider';
import { SmartLink } from '../ui/SmartLink';

/** ☀ / ☾ switch. Both icons are rendered and toggled by CSS: no hydration mismatch. */
export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const t = useT('common');
  const label = theme === 'dark' ? t.themeToLight : t.themeToDark;
  return (
    <button
      type="button"
      onClick={() => {
        toggleTheme();
        track('theme_switch');
      }}
      aria-label={theme ? label : `${t.themeToDark} / ${t.themeToLight}`}
      title={theme ? label : undefined}
      className={cn(
        'group relative inline-flex h-10 w-10 items-center justify-center text-ink-2 transition-colors hover:text-ink',
        className,
      )}
    >
      <Sun aria-hidden="true" size={17} strokeWidth={1.6} className="hidden transition-transform duration-500 group-hover:rotate-45 dark:block" />
      <Moon aria-hidden="true" size={17} strokeWidth={1.6} className="block transition-transform duration-500 group-hover:-rotate-12 dark:hidden" />
    </button>
  );
};

/** FR / EN switch, links to the same page in the other language. */
export const LangSwitch = ({ className }: { className?: string }) => {
  const lang = useLang();
  const t = useT('common');
  const { pathname, hash } = useLocation();
  const remember = (to: string) => {
    try {
      localStorage.setItem('language', to);
    } catch {
      /* ignore */
    }
    track('language_switch', { to });
  };
  return (
    <div className={cn('flex items-center font-mono text-[0.75rem] font-medium uppercase', className)} role="group" aria-label={t.language}>
      {(['fr', 'en'] as const).map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="px-1 text-ink-3/60" aria-hidden="true">/</span>}
          {l === lang ? (
            <span aria-current="true" className="px-1 py-2 text-ink">
              {l}
            </span>
          ) : (
            <SmartLink
              raw
              to={`${switchLangPath(pathname, l)}${hash}`}
              lang={l}
              hrefLang={l}
              onClick={() => remember(l)}
              aria-label={t.switchLanguage}
              className="px-1 py-2 text-ink-3 transition-colors hover:text-ink"
            >
              {l}
            </SmartLink>
          )}
        </span>
      ))}
    </div>
  );
};

/** "CV ↓" disclosure: web CV, PDF (both languages), vCard. Always visible in the nav. */
export const CvMenu = ({ className, align = 'right' }: { className?: string; align?: 'left' | 'right' }) => {
  const t = useT('nav');
  const lang = useLang();
  const other = lang === 'fr' ? 'en' : 'fr';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, close, open);

  const item = 'flex items-center gap-3 px-4 py-3 text-[0.9rem] text-ink-2 transition-colors hover:bg-ink/[0.04] hover:text-ink';

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-1.5 px-2 text-[0.875rem] font-medium text-ink transition-colors hover:text-accent-ink"
      >
        {t.cv}
        <ArrowDown aria-hidden="true" size={14} strokeWidth={1.8} className={cn('transition-transform duration-300', open && 'rotate-180')} />
        <span className="sr-only">{t.cvMenu}</span>
      </button>
      <div
        id={id}
        hidden={!open}
        className={cn(
          'absolute top-full z-50 mt-2 w-72 border border-line bg-surface py-2 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)]',
          align === 'right' ? 'right-0' : 'left-0',
        )}
      >
        <ul onClick={close}>
          <li>
            <SmartLink to="/cv" className={item} onClick={() => track('cv_view', { from: 'nav' })}>
              <FileText aria-hidden="true" size={16} strokeWidth={1.6} />
              {t.cvView}
            </SmartLink>
          </li>
          <li>
            <a
              href={FILES.cvPdf[lang]}
              download
              className={item}
              onClick={() => track('cv_download', { lang, from: 'nav' })}
            >
              <ArrowDown aria-hidden="true" size={16} strokeWidth={1.6} />
              <span className="flex-1">{t.cvPdf}</span>
              <span className="font-mono text-label uppercase text-ink-3">{lang}</span>
            </a>
          </li>
          <li>
            <a
              href={FILES.cvPdf[other]}
              download
              hrefLang={other}
              className={item}
              onClick={() => track('cv_download', { lang: other, from: 'nav' })}
            >
              <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.6} />
              <span className="flex-1">{t.cvPdfOther}</span>
              <span className="font-mono text-label uppercase text-ink-3">{other}</span>
            </a>
          </li>
          <li className="mt-2 border-t border-line pt-2">
            <a href={FILES.vcard} download className={item} onClick={() => track('vcard_download', { from: 'nav' })}>
              <Contact aria-hidden="true" size={16} strokeWidth={1.6} />
              {t.vcard}
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

/** Wordmark: SAFWAN. with the full stop in the accent colour. */
export const Wordmark = ({ className }: { className?: string }) => (
  <span className={cn('font-wide text-[1.05rem] font-extrabold uppercase leading-none tracking-[-0.02em]', className)}>
    Safwan<span className="text-accent">.</span>
  </span>
);
