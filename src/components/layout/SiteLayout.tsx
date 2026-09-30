import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { Footer } from './Footer';
import { Nav } from './Nav';

/** Thin accent bar tracking reading progress (transform only: cheap). */
const ScrollProgress = () => {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
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
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-[2px]">
      <div ref={bar} className="h-full origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
};

const BackToTop = () => {
  const t = useT('common');
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > 900);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <button
      type="button"
      aria-label={t.backToTop}
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      }}
      className={cn(
        'fixed bottom-5 right-5 z-40 hidden h-11 w-11 items-center justify-center border border-line bg-surface text-ink shadow-[0_10px_30px_-12px_rgb(0_0_0/0.35)] transition-all duration-500 ease-out-expo hover:border-ink sm:flex',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <ArrowUp aria-hidden="true" size={17} strokeWidth={1.6} />
    </button>
  );
};

/** Scroll to the top on new pages, or to the #hash target when present. */
const useScrollManagement = () => {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      if (!hash) return;
    }
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const t = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' });
      }, 30);
      return () => window.clearTimeout(t);
    }
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [pathname, hash, navType]);
};

/** Shell for regular pages: skip link, nav, main, footer. */
export const SiteLayout = () => {
  const t = useT('common');
  const { pathname } = useLocation();
  useScrollManagement();
  // Page transition only after the first client navigation (never delays the first paint / LCP)
  const firstPath = useRef(pathname);
  const navigated = useRef(false);
  if (pathname !== firstPath.current) navigated.current = true;

  return (
    <div className="min-h-screen bg-bg text-ink">
      <a
        href="#main"
        className="sr-only-focusable fixed left-4 top-4 z-[70] bg-ink px-4 py-3 text-sm font-medium text-bg"
      >
        {t.skipToContent}
      </a>
      <ScrollProgress />
      <Nav />
      <main id="main" key={pathname} tabIndex={-1} className={cn('outline-none', navigated.current && 'animate-page-in')}>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};
