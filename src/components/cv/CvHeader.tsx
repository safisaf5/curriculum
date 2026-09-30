import type { ReactNode } from 'react';
import { profile } from '../../data';
import { useI18n, useT } from '../../i18n';
import { track } from '../../lib/analytics';
import { BUILD_DATE } from '../../lib/build';
import { cn } from '../../lib/cn';
import { formatYearMonth } from '../../lib/dates';
import { SmartLink } from '../ui/SmartLink';
import { Marker, printUrl } from './parts';

const PORTRAIT = '/images/portrait-square-240.jpg';
const PORTRAIT_2X = '/images/portrait-square-600.jpg';

const ContactItem = ({ label, children, className }: { label: string; children: ReactNode; className?: string }) => (
  <div className={cn('cv-contact-item min-w-0 border-t border-line py-3', className)}>
    <dt className="label">{label}</dt>
    <dd className="mt-1 break-words text-[0.95rem] leading-snug text-ink">{children}</dd>
  </div>
);

/** Document header: meta row, name, title, portrait, contact grid. */
export const CvHeader = () => {
  const { l, lang } = useI18n();
  const t = useT('cv');
  const { contact } = profile;
  const updated = BUILD_DATE.slice(0, 10);
  const link = 'link text-ink transition-colors hover:text-accent-ink';

  return (
    <header className="cv-head">
      <div className="label flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line pb-3">
        <span className="flex items-center gap-2.5 text-ink-2">
          <Marker />
          {t.cvTitle}
        </span>
        <span>
          <time dateTime={updated}>{t.cvUpdated(formatYearMonth(updated, lang))}</time>
        </span>
      </div>

      <div className="mt-8 flex flex-col gap-6 sm:mt-10 sm:flex-row sm:items-start sm:justify-between sm:gap-10 md:mt-12">
        <div className="min-w-0">
          <h1 className="cv-name font-wide text-[clamp(2.15rem,9.6vw,4.6rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.045em] text-ink sm:text-[clamp(2.6rem,6.4vw,4.6rem)]">
            <span className="block">{profile.givenName}</span>{' '}
            <span className="block">
              {profile.familyName}
              <span aria-hidden="true" className="text-accent">
                .
              </span>
            </span>
          </h1>
          <p className="cv-role mt-5 max-w-[30ch] font-semiwide text-[1.2rem] font-medium leading-snug tracking-[-0.015em] text-ink md:mt-6 md:text-[1.45rem]">
            {l(profile.title)}
          </p>
        </div>
        <img
          src={PORTRAIT}
          srcSet={`${PORTRAIT} 240w, ${PORTRAIT_2X} 600w`}
          sizes="(min-width: 768px) 128px, 80px"
          width={240}
          height={240}
          alt={l(profile.portrait.alt)}
          decoding="async"
          className="cv-portrait order-first h-20 w-20 shrink-0 bg-bg-2 object-cover sm:order-none sm:h-24 sm:w-24 md:h-32 md:w-32"
        />
      </div>

      <dl className="cv-contact mt-8 grid grid-cols-1 gap-x-8 xs:grid-cols-2 md:mt-12 md:grid-cols-3">
        <ContactItem label={t.cvEmail}>
          <a href={`mailto:${contact.email}`} className={link} onClick={() => track('contact_email', { from: 'cv' })}>
            {contact.email}
          </a>
        </ContactItem>
        <ContactItem label={t.cvPhone}>
          <a href={`tel:${contact.phoneE164}`} className={cn(link, 'tabular')} onClick={() => track('contact_phone', { from: 'cv' })}>
            {contact.phone}
          </a>
        </ContactItem>
        <ContactItem label={t.cvLocation}>
          {l(profile.location.city)}, {l(profile.location.country)}
        </ContactItem>
        <ContactItem label="LinkedIn">
          <SmartLink to={contact.linkedin} className={link} onClick={() => track('contact_linkedin', { from: 'cv' })}>
            {printUrl(contact.linkedin)}
          </SmartLink>
        </ContactItem>
        <ContactItem label={t.cvWebsite}>
          <SmartLink to="/" className={link}>
            {printUrl(contact.website)}
          </SmartLink>
        </ContactItem>
        <ContactItem label={t.cvNationality}>
          {l(profile.nationality)}
          <span className="text-ink-2"> · {l(profile.origin)}</span>
        </ContactItem>
      </dl>
    </header>
  );
};
