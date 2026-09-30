import { useEffect, useMemo, useRef } from 'react';
import { useNavigationType } from 'react-router-dom';
import { ArrowDown, ArrowUp, Printer } from 'lucide-react';
import { profile } from '../data';
import { useI18n, useT } from '../i18n';
import { track } from '../lib/analytics';
import { BUILD_YEAR } from '../lib/build';
import { cn } from '../lib/cn';
import { localize } from '../lib/text';
import { FILES, SITE_URL } from '../site';
import { CvHeader } from '../components/cv/CvHeader';
import {
  EngagementSection,
  ExperienceSection,
  MediaSection,
  ProfileSection,
  ProjectsSection,
} from '../components/cv/CvMain';
import {
  AwardsSection,
  EducationSection,
  InterestsSection,
  LanguagesSection,
  PermitsSection,
  PersonalSection,
  PublicationsSection,
  SkillsSection,
  ToolsSection,
} from '../components/cv/CvSide';
import { CV_WIDTH, CvToolbar, printCv, useOtherLang } from '../components/cv/CvToolbar';
import { buildPrintCss } from '../components/cv/printCss';
import { SmartLink } from '../components/ui/SmartLink';

/**
 * Printer's crop marks at the four corners of the sheet (decorative, screen only).
 * Drawn for the top-left corner, rotated for the others; the lines continue the
 * sheet's hairline edges with a 10px gap.
 */
const CropMarks = () => {
  const corners = [
    'left-0 top-0 -translate-x-full -translate-y-full',
    'right-0 top-0 translate-x-full -translate-y-full rotate-90',
    'bottom-0 right-0 translate-x-full translate-y-full rotate-180',
    'bottom-0 left-0 -translate-x-full translate-y-full -rotate-90',
  ];
  return (
    <>
      {corners.map((pos) => (
        <svg
          key={pos}
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={cn('cv-crop pointer-events-none absolute hidden h-6 w-6 overflow-visible text-ink-3 md:block', pos)}
        >
          <path d="M24.5 0V14M0 24.5H14" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      ))}
    </>
  );
};

/** Secondary actions under the header on phones and tablets (the toolbar holds them on desktop). */
const MobileActions = () => {
  const t = useT('cv');
  const other = useOtherLang();
  const item =
    'btn btn-outline min-h-12 flex-1 gap-2.5 border-line px-4 text-[0.9rem]';
  return (
    <div className="cv-actions mt-8 flex flex-col gap-2 xs:flex-row lg:hidden print:hidden">
      <a
        href={FILES.cvPdf[other]}
        download
        hrefLang={other}
        onClick={() => track('cv_download', { lang: other, from: 'cv-page' })}
        className={item}
      >
        <ArrowDown aria-hidden="true" size={16} strokeWidth={1.6} className="btn-arrow btn-arrow-down shrink-0" />
        <span>{t.cvDownloadOther}</span>
      </a>
      <button type="button" onClick={() => printCv('cv-page')} className={item}>
        <Printer aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0" />
        <span>{t.cvPrint}</span>
      </button>
    </div>
  );
};

const CvFooter = () => {
  const t = useT('cv');
  const tc = useT('common');
  return (
    <footer className={cn(CV_WIDTH, 'cv-footer px-[var(--gutter)] pb-10 print:hidden')}>
      <div className="label flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between md:border-t-0 md:pt-0">
        <p>
          © {BUILD_YEAR} {profile.name}
        </p>
        <div className="flex items-center gap-6">
          <SmartLink to="/" className="inline-flex min-h-11 items-center text-ink-2 transition-colors hover:text-ink">
            {t.cvBack}
          </SmartLink>
          <button
            type="button"
            onClick={() => {
              const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
            }}
            className="group inline-flex min-h-11 items-center gap-2 uppercase text-ink-2 transition-colors hover:text-ink"
          >
            {tc.backToTop}
            <ArrowUp
              aria-hidden="true"
              size={13}
              strokeWidth={1.6}
              className="transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </footer>
  );
};

/**
 * /cv and /en/cv: the CV as a clean, printable web document.
 * Standalone page (no site nav): toolbar, sheet, minimal footer.
 * Every entry comes from /src/data, so it never drifts from the site or the PDF.
 */
export default function CvPage() {
  const { lang, lp } = useI18n();
  const t = useT('cv');
  const tc = useT('common');
  const navType = useNavigationType();
  const viewed = useRef(false);

  useEffect(() => {
    // Client-side navigation keeps the previous scroll position: start at the top.
    if (navType === 'PUSH' && !window.location.hash) window.scrollTo(0, 0);
    if (viewed.current) return;
    viewed.current = true;
    track('cv_view', { from: 'page' });
  }, [navType]);

  const printCss = useMemo(() => {
    const host = SITE_URL.replace(/^https?:\/\//, '');
    return buildPrintCss(localize(`${profile.name} · ${t.cvWebVersion} → ${host}${lp('/cv')}`, lang));
  }, [lang, lp, t.cvWebVersion]);

  return (
    <div className="cv-page min-h-screen bg-bg text-ink">
      <style dangerouslySetInnerHTML={{ __html: printCss }} />
      <a
        href="#cv-main"
        className="cv-skip sr-only-focusable fixed left-4 top-4 z-[70] bg-ink px-4 py-3 text-sm font-medium text-bg"
      >
        {tc.skipToContent}
      </a>
      <CvToolbar />

      <main id="cv-main" tabIndex={-1} className="cv-main pb-12 pt-8 outline-none md:py-14 lg:py-20">
        <div className={cn(CV_WIDTH, 'cv-frame md:px-[var(--gutter)]')}>
          <article
            aria-label={`${t.cvTitle} · ${profile.name}`}
            className="cv-sheet cv-doc relative animate-fade-in px-[var(--gutter)] md:border md:border-line md:bg-surface md:px-12 md:py-14 lg:px-16 lg:py-16"
          >
            <CropMarks />
            <CvHeader />
            <MobileActions />

            <div className="cv-grid mt-14 grid gap-y-14 md:mt-16 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-14">
              <div className="cv-col cv-main-top min-w-0 space-y-14 lg:col-span-8 lg:row-start-1">
                <ProfileSection />
                <ExperienceSection />
                <ProjectsSection />
              </div>
              <div className="cv-col cv-side min-w-0 space-y-12 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1">
                <EducationSection />
                <LanguagesSection />
                <SkillsSection />
                <ToolsSection />
                <PersonalSection />
                <AwardsSection />
                <PublicationsSection />
                <PermitsSection />
                <InterestsSection />
              </div>
              <div className="cv-col cv-main-bottom min-w-0 space-y-14 lg:col-span-8 lg:col-start-1 lg:row-start-2">
                <EngagementSection />
                <MediaSection />
              </div>
            </div>
          </article>
        </div>
      </main>

      <CvFooter />
    </div>
  );
}
