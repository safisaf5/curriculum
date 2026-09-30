import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { profile } from '../../data';
import { useActiveSection, useScrolled } from '../../hooks';
import { useI18n, useT } from '../../i18n';
import { track } from '../../lib/analytics';
import { cn } from '../../lib/cn';
import { FILES, NAV_SECTIONS, parsePath } from '../../site';
import { SmartLink } from '../ui/SmartLink';
import { CvMenu, LangSwitch, ThemeToggle, Wordmark } from './controls';

type NavId = (typeof NAV_SECTIONS)[number];

/**
 * Transparent on top of the page, compact glass bar once scrolled.
 * Desktop: sections + CV menu + FR/EN + theme + CTA. Mobile: fullscreen menu.
 */
export const Nav = () => {
  const t = useT('nav');
  const { lang } = useI18n();
  const { pathname } = useLocation();
  const onHome = parsePath(pathname).path === '/';
  const scrolled = useScrolled(24);
  const active = useActiveSection(NAV_SECTIONS, onHome);
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,height] duration-500 ease-out-expo',
          scrolled || open ? 'border-b border-line/70' : 'border-b border-transparent',
          scrolled && !open ? 'glass' : '',
          open ? 'bg-bg' : '',
        )}
      >
        <nav
          aria-label={t.mainNav}
          className={cn(
            'container-site flex items-center justify-between gap-6 transition-[height] duration-500 ease-out-expo',
            scrolled ? 'h-[3.75rem]' : 'h-[4.5rem]',
          )}
        >
          <SmartLink to="/" aria-label={t.logoLabel} className="shrink-0 py-2 text-ink">
            <Wordmark />
          </SmartLink>

          <ul className="hidden items-center gap-0.5 xl:flex">
            {NAV_SECTIONS.map((id) => (
              <li key={id}>
                <SmartLink
                  to={`/#${id}`}
                  aria-current={onHome && active === id ? 'true' : undefined}
                  className={cn(
                    'relative flex items-center gap-2 whitespace-nowrap px-3 py-2 text-[0.875rem] transition-colors',
                    onHome && active === id ? 'text-ink' : 'text-ink-2 hover:text-ink',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-1 w-1 rounded-full bg-accent transition-transform duration-300',
                      onHome && active === id ? 'scale-100' : 'scale-0',
                    )}
                  />
                  {t[id as NavId]}
                </SmartLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <CvMenu className="hidden sm:block" />
            <LangSwitch className="hidden md:flex" />
            <ThemeToggle className="hidden md:inline-flex" />
            <SmartLink
              to="/#contact"
              className="btn btn-primary ml-2 hidden min-h-10 whitespace-nowrap px-4 text-[0.875rem] md:inline-flex"
            >
              <span>{t.cta}</span>
              <ArrowRight aria-hidden="true" size={15} strokeWidth={1.7} className="btn-arrow" />
            </SmartLink>
            <a
              href={FILES.cvPdf[lang]}
              download
              onClick={() => track('cv_download', { lang, from: 'nav-mobile' })}
              className="inline-flex h-10 items-center px-2 text-[0.875rem] font-medium text-ink sm:hidden"
            >
              {t.cv}
              <span className="sr-only"> PDF</span>
            </a>
            <MenuButton open={open} onToggle={() => setOpen((v) => !v)} />
          </div>
        </nav>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} active={onHome ? active : null} />
    </>
  );
};

const MenuButton = ({ open, onToggle }: { open: boolean; onToggle: () => void }) => {
  const t = useT('common');
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? t.closeMenu : t.openMenu}
      className="relative -mr-2 inline-flex h-11 w-11 items-center justify-center xl:hidden"
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute h-[1.5px] w-5 bg-ink transition-transform duration-500 ease-out-expo',
          open ? 'rotate-45' : '-translate-y-[4px]',
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          'absolute h-[1.5px] w-5 bg-ink transition-transform duration-500 ease-out-expo',
          open ? '-rotate-45' : 'translate-y-[4px]',
        )}
      />
    </button>
  );
};

const MobileMenu = ({ open, onClose, active }: { open: boolean; onClose: () => void; active: string | null }) => {
  const t = useT('nav');
  const tc = useT('contact');
  const ref = useRef<HTMLDivElement>(null);

  // Lock scroll, trap focus, close on Escape
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const first = ref.current?.querySelector<HTMLElement>('a, button');
    first?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !ref.current) return;
      const focusables = [...ref.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
      const toggle = document.querySelector<HTMLElement>('[aria-controls="mobile-menu"]');
      const cycle = toggle ? [toggle, ...focusables] : focusables;
      const idx = cycle.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && idx <= 0) {
        e.preventDefault();
        cycle[cycle.length - 1]?.focus();
      } else if (!e.shiftKey && idx === cycle.length - 1) {
        e.preventDefault();
        cycle[0]?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const handleNav = useCallback(() => onClose(), [onClose]);

  return (
    <div
      id="mobile-menu"
      ref={ref}
      hidden={!open}
      className={cn('fixed inset-0 z-40 flex-col overflow-y-auto bg-bg pt-[4.5rem] xl:hidden', open ? 'flex' : 'hidden')}
    >
      <div className="container-site flex flex-1 flex-col justify-between pb-[max(2rem,env(safe-area-inset-bottom))] pt-6">
        <ul className="space-y-1">
          {NAV_SECTIONS.map((id, i) => (
            <li
              key={id}
              className="animate-fade-up border-b border-line"
              style={{ animationDelay: `${60 + i * 45}ms` }}
            >
              <SmartLink
                to={`/#${id}`}
                onClick={handleNav}
                aria-current={active === id ? 'true' : undefined}
                className="flex items-baseline gap-4 py-4"
              >
                <span className="label tabular w-6 text-accent-ink">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-semiwide text-[2rem] font-semibold leading-none tracking-[-0.03em] text-ink">
                  {t[id as NavId]}
                </span>
              </SmartLink>
            </li>
          ))}
        </ul>

        <div className="mt-10 space-y-6 animate-fade-in" style={{ animationDelay: '320ms' }}>
          <div className="flex flex-wrap gap-3">
            <SmartLink to="/#contact" onClick={handleNav} className="btn btn-primary flex-1">
              <span>{t.cta}</span>
              <ArrowRight aria-hidden="true" size={16} strokeWidth={1.7} className="btn-arrow" />
            </SmartLink>
            <SmartLink to="/cv" onClick={handleNav} className="btn btn-outline flex-1">
              <span>{t.cvView}</span>
            </SmartLink>
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-[0.95rem]">
            <a href={`mailto:${profile.contact.email}`} className="text-ink-2" onClick={() => track('contact_email', { from: 'menu' })}>
              {tc.email}
            </a>
            <SmartLink to={profile.contact.whatsapp} className="text-ink-2" onClick={() => track('contact_whatsapp', { from: 'menu' })}>
              WhatsApp
            </SmartLink>
            <SmartLink to={profile.contact.linkedin} className="text-ink-2" onClick={() => track('contact_linkedin', { from: 'menu' })}>
              LinkedIn
            </SmartLink>
            <SmartLink to="/card" onClick={handleNav} className="text-ink-2">
              {t.card}
            </SmartLink>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-4">
            <LangSwitch />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};
