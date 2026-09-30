import { ArrowDown, ArrowLeft, ArrowRight, UserPlus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { profile } from '../data';
import { useReducedMotion, useZonedClock } from '../hooks';
import { useI18n, useT } from '../i18n';
import { track } from '../lib/analytics';
import { typo } from '../lib/text';
import { FILES, localizePath, SITE_URL } from '../site';
import { ActionList } from '../components/card/ActionList';
import { ShareButton } from '../components/card/ShareButton';
import { LangSwitch, ThemeToggle, Wordmark } from '../components/layout/controls';
import { WatchDial } from '../components/notes/WatchDial';
import { SmartLink } from '../components/ui/SmartLink';

/** Always paper and ink, even in dark mode: scanners want dark modules on a light field. */
const QR_BG = '#F3F1EC';
const QR_FG = '#0E0E0F';

const dms = (value: number, pos: string, neg: string) => {
  const abs = Math.abs(value);
  const d = Math.floor(abs);
  const m = Math.round((abs - d) * 60);
  return `${d}°${String(m).padStart(2, '0')}′${value >= 0 ? pos : neg}`;
};

/** Geneva time with a tiny live dial (hands rest at 10:10 before hydration). */
const LocalTime = () => {
  const t = useT('card');
  const reduced = useReducedMotion();
  const time = useZonedClock(profile.location.timeZone);
  return (
    <p className="label flex items-center justify-end gap-2" title={t.cardTime}>
      <span className="block h-[1.125rem] w-[1.125rem]">
        <WatchDial variant="mini" h={time?.h ?? 10} m={time?.m ?? 10} s={reduced ? null : (time?.s ?? 30)} />
      </span>
      <span className="sr-only">{t.cardTime} </span>
      <span className="tabular text-ink-2">{time?.label ?? '--:--'}</span>
      <span>{time?.zone ?? ''}</span>
    </p>
  );
};

/**
 * /card: the digital business card. Standalone page (no site nav/footer),
 * designed for a phone first: someone scans the QR code at a meeting and
 * lands here to save the contact, call or write.
 *  - phone: full bleed, identity → add to contacts → contact rows → QR stub;
 *  - tablet: the same column as a paper card on the desk;
 *  - desktop: the card gets a perforated stub on the right with the QR code,
 *    so it can be scanned straight from the screen.
 */
export default function CardPage() {
  const { lang, l } = useI18n();
  const t = useT('card');
  const cardUrl = `${SITE_URL}${localizePath('/card', lang)}`;
  const displayUrl = cardUrl.replace(/^https?:\/\//, '');
  const { location } = profile;
  const coords = `${dms(location.lat, 'N', 'S')} ${dms(location.lng, 'E', 'W')}`;

  return (
    <div className="flex min-h-[100svh] flex-col bg-bg text-ink md:bg-bg-2">
      <header className="container-site flex h-16 shrink-0 items-center justify-between gap-4">
        <SmartLink
          to="/"
          className="group -ml-2 inline-flex min-h-11 items-center gap-2 px-2 text-[0.9rem] text-ink-2 transition-colors hover:text-ink"
        >
          <ArrowLeft
            aria-hidden="true"
            size={16}
            strokeWidth={1.6}
            className="transition-transform duration-500 ease-out-expo group-hover:-translate-x-1"
          />
          {t.cardBack}
        </SmartLink>
        <div className="-mr-2 flex items-center gap-1">
          <LangSwitch />
          <ThemeToggle />
        </div>
      </header>

      <main id="main" className="flex flex-1 justify-center md:items-center md:px-6 md:pb-16 md:pt-4">
        <article
          aria-labelledby="card-name"
          className="grain w-full animate-fade-up md:max-w-[30rem] md:border md:border-line md:bg-surface lg:flex lg:max-w-none lg:w-auto"
        >
          {/* Front: identity, main action, contact rows */}
          <div className="container-site pb-10 pt-4 md:px-8 md:pb-8 md:pt-8 lg:w-[30rem]">
            <div className="flex items-start justify-between gap-4">
              <img
                src="/images/portrait-square-600.jpg"
                width={600}
                height={600}
                alt={l(profile.portrait.alt)}
                decoding="async"
                className="h-24 w-24 shrink-0 bg-bg-2 object-cover md:h-28 md:w-28"
              />
              <div className="space-y-1.5 text-right">
                <p className="label flex items-center justify-end gap-2">
                  {t.cardTitle}
                  <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
                </p>
                <LocalTime />
              </div>
            </div>

            <h1
              id="card-name"
              className="mt-7 font-wide text-[clamp(2.1rem,10.4vw,2.75rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] text-ink"
            >
              <span className="block">{profile.givenName}</span>
              <span className="block">
                {profile.familyName}
                <span aria-hidden="true" className="text-accent">
                  .
                </span>
              </span>
            </h1>
            <p lang={lang === 'en' ? undefined : 'en'} className="mt-4 font-semiwide text-[1.05rem] font-medium tracking-[-0.01em] text-ink">
              {t.cardRole}
            </p>
            <p className="label mt-2">
              {l(location.city)}, {l(location.country)}
            </p>

            <a
              href={FILES.vcard}
              type="text/vcard"
              onClick={() => track('vcard_download', { from: 'card', mode: 'open' })}
              className="btn btn-primary mt-7 min-h-14 w-full justify-between"
            >
              <span className="flex items-center gap-3">
                <UserPlus aria-hidden="true" size={18} strokeWidth={1.6} className="shrink-0" />
                <span>{t.cardAdd}</span>
              </span>
              <ArrowRight aria-hidden="true" size={17} strokeWidth={1.6} className="btn-arrow shrink-0" />
            </a>

            <div className="mt-8">
              <ActionList />
            </div>
          </div>

          {/* Stub: QR code, keep or pass on the card */}
          <aside
            aria-label={t.cardScan}
            className="container-site flex flex-col border-t border-dashed border-line py-10 md:px-8 md:py-8 lg:w-[18rem] lg:border-l lg:border-t-0"
          >
            <figure className="mx-auto w-full max-w-[14rem] animate-fade-in [animation-delay:300ms] lg:mb-8 lg:max-w-none">
              <div style={{ backgroundColor: QR_BG }}>
                <QRCodeSVG
                  value={cardUrl}
                  size={224}
                  level="M"
                  includeMargin
                  bgColor={QR_BG}
                  fgColor={QR_FG}
                  role="img"
                  aria-label={t.cardQr(displayUrl)}
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </div>
              <figcaption className="mt-4 text-center lg:text-left">
                <span className="label block">{t.cardScan}</span>
                <span className="mt-1.5 block break-all font-mono text-[0.8rem] text-ink-2">{displayUrl}</span>
              </figcaption>
            </figure>

            <div className="mx-auto mt-8 grid w-full max-w-[24rem] gap-2 sm:grid-cols-2 lg:mt-7 lg:max-w-none lg:grid-cols-1">
              <a
                href={FILES.vcard}
                download
                onClick={() => track('vcard_download', { from: 'card', mode: 'download' })}
                className="btn btn-outline px-3 text-[0.875rem]"
              >
                <ArrowDown aria-hidden="true" size={16} strokeWidth={1.6} className="btn-arrow btn-arrow-down shrink-0" />
                <span>{t.cardDownload}</span>
              </a>
              <ShareButton title={typo(`${profile.name} · ${t.cardTitle}`, lang)} url={cardUrl} className="px-3 text-[0.875rem]" />
            </div>

            <div className="mt-10 flex items-end justify-between gap-4 border-t border-line pt-4 lg:mt-auto">
              <Wordmark className="text-[0.95rem]" />
              <span className="label tabular">{coords}</span>
            </div>
          </aside>
        </article>
      </main>
    </div>
  );
}
