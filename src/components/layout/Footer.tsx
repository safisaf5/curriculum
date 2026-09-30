import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { profile } from '../../data';
import { useZonedClock } from '../../hooks';
import { useI18n, useT } from '../../i18n';
import { track } from '../../lib/analytics';
import { BUILD_YEAR } from '../../lib/build';
import { getNotes } from '../../lib/notes';
import { FILES } from '../../site';
import { SmartLink } from '../ui/SmartLink';

export const Footer = () => {
  const { lang, l } = useI18n();
  const t = useT('contact');
  const tn = useT('nav');
  const tc = useT('common');
  const time = useZonedClock(profile.location.timeZone);
  const hasNotes = getNotes(lang).length > 0;

  const col = 'space-y-3 text-[0.95rem]';
  const link = 'link text-ink-2 hover:text-ink';

  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg-2">
      <div className="container-site pb-10 pt-20 md:pt-28">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-wide text-[1.35rem] font-extrabold uppercase leading-tight tracking-[-0.02em] text-ink">
              {profile.name}
            </p>
            <p className="mt-3 text-ink-2">{t.footerTagline}</p>
            <p className="mt-1 text-ink-2">
              {l(profile.location.city)}, {l(profile.location.country)}
            </p>
            <p className="label mt-6 flex items-center gap-2" aria-live="off">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-accent" aria-hidden="true" />
              {tc.genevaTime} <span className="tabular text-ink-2">{time ? `${time.label} ${time.zone}` : '--:--'}</span>
            </p>
          </div>

          <nav aria-label={t.footerNav} className="md:col-span-2">
            <p className="label mb-4">{t.footerNav}</p>
            <ul className={col}>
              <li><SmartLink to="/#projects" className={link}>{tn.projects}</SmartLink></li>
              <li><SmartLink to="/#experience" className={link}>{tn.experience}</SmartLink></li>
              <li><SmartLink to="/#services" className={link}>{tn.services}</SmartLink></li>
              <li><SmartLink to="/#contact" className={link}>{tn.contact}</SmartLink></li>
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="label mb-4">{t.footerResources}</p>
            <ul className={col}>
              <li>
                <SmartLink to="/cv" className={link} onClick={() => track('cv_view', { from: 'footer' })}>
                  {t.footerCv}
                </SmartLink>
              </li>
              <li>
                <a href={FILES.cvPdf[lang]} download className={link} onClick={() => track('cv_download', { lang, from: 'footer' })}>
                  {tn.cvPdf}
                </a>
              </li>
              <li><SmartLink to="/card" className={link}>{t.footerCard}</SmartLink></li>
              <li>
                <a href={FILES.vcard} download className={link} onClick={() => track('vcard_download', { from: 'footer' })}>
                  vCard
                </a>
              </li>
              {hasNotes && (
                <li><SmartLink to="/notes" className={link}>{t.footerNotes}</SmartLink></li>
              )}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="label mb-4">{t.footerSocial}</p>
            <ul className={col}>
              <li>
                <SmartLink to={profile.contact.linkedin} className={`${link} inline-flex items-center gap-1`} onClick={() => track('contact_linkedin', { from: 'footer' })}>
                  LinkedIn <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.6} />
                </SmartLink>
              </li>
              <li>
                <SmartLink to={profile.contact.whatsapp} className={`${link} inline-flex items-center gap-1`} onClick={() => track('contact_whatsapp', { from: 'footer' })}>
                  WhatsApp <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.6} />
                </SmartLink>
              </li>
              <li>
                <a href={`mailto:${profile.contact.email}`} className={link} onClick={() => track('contact_email', { from: 'footer' })}>
                  {t.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Oversized wordmark, cropped by the bottom edge */}
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 1000 150"
          className="pointer-events-none mt-20 block w-full select-none md:mt-28"
        >
          <text
            x="0"
            y="140"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
            className="fill-ink/[0.07] font-wide text-[178px] font-extrabold uppercase"
          >
            Safwan<tspan className="fill-accent/50">.</tspan>
          </text>
        </svg>

        <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6 text-[0.85rem] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {BUILD_YEAR} {profile.name}. {t.footerRights} {t.footerMade}
          </p>
          <button
            type="button"
            onClick={() => {
              const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
            }}
            className="inline-flex items-center gap-2 self-start text-ink-2 transition-colors hover:text-ink"
          >
            {tc.backToTop}
            <ArrowUp aria-hidden="true" size={14} strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </footer>
  );
};
