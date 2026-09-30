import { profile } from '../data';
import { useI18n, useT } from '../i18n';
import { typo } from '../lib/text';
import { ButtonLink } from '../components/ui/Button';
import { WatchDial } from '../components/notes/WatchDial';

/** The dial is stopped at 4:04:40. Fixed values: the page is prerendered as dist/404.html. */
const TIME = { h: 4, m: 4, s: 40 } as const;

interface NotFoundPageProps {
  /** Replaces the default explanation (e.g. "This note does not exist"). */
  message?: string;
}

/**
 * Unknown URLs, projects and notes. Rendered inside SiteLayout.
 * Oversized "404" with a stopped watch next to it, the brand line (kept in
 * English on purpose) and two ways back.
 */
export default function NotFoundPage({ message }: NotFoundPageProps) {
  const t = useT('notes');
  const { lang, l } = useI18n();
  const city = l(profile.location.city);
  const clock = `${String(TIME.h).padStart(2, '0')}:${String(TIME.m).padStart(2, '0')}:${TIME.s}`;

  return (
    <section aria-labelledby="not-found-title" className="flex min-h-[100svh] flex-col pt-[4.5rem]">
      <div className="container-site flex flex-1 flex-col">
        {/* Meta row */}
        <div className="label flex items-center justify-between gap-4 border-b border-line py-4 animate-fade-in">
          <p className="flex items-center gap-3">
            <span className="tabular text-accent-ink">{t.notFoundCode}</span>
            <span aria-hidden="true" className="h-px w-6 bg-ink-3/60" />
            {t.notFoundLabel}
          </p>
          <p aria-hidden="true" className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="tabular text-ink-2">{clock}</span>
            <span className="hidden xs:inline">{city}</span>
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center py-10 md:py-14">
          {/* 404 + stopped watch */}
          <div aria-hidden="true" className="flex items-center justify-between gap-4 md:gap-10">
            <span className="block overflow-hidden pb-[0.02em]">
              <span className="block animate-rise-in font-wide text-[clamp(5.75rem,26vw,24rem)] font-extrabold leading-[0.8] tracking-[-0.06em] text-ink">
                {t.notFoundCode}
              </span>
            </span>
            <span className="block w-[23vw] shrink-0 animate-fade-in [animation-delay:250ms] md:w-[20vw] md:max-w-[17rem]">
              <WatchDial h={TIME.h} m={TIME.m} s={TIME.s} caption={city} />
            </span>
          </div>

          <div className="mt-10 grid gap-x-10 gap-y-8 border-t border-line pt-8 md:mt-14 md:pt-10 lg:grid-cols-12">
            <h1
              id="not-found-title"
              lang={lang === 'en' ? undefined : 'en'}
              className="max-w-[17ch] font-semiwide text-display-m font-semibold text-ink animate-fade-up [animation-delay:150ms] lg:col-span-7"
            >
              {typo(t.notFoundTitle, 'en')}
            </h1>
            <div className="animate-fade-up [animation-delay:230ms] lg:col-span-5 lg:pt-1">
              <p className="max-w-[44ch] text-lead text-ink-2">{l(message ?? t.notFoundBody)}</p>
              <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
                <ButtonLink to="/">{l(t.notFoundHome)}</ButtonLink>
                <ButtonLink to="/#projects" variant="outline">
                  {t.notFoundProjects}
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
