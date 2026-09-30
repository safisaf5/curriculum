import { useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import {
  engagement,
  experience,
  media,
  profile,
  sortedProjects,
  type Engagement,
  type Experience,
} from '../../data';
import { useI18n, useT } from '../../i18n';
import { track } from '../../lib/analytics';
import { cn } from '../../lib/cn';
import { formatYearMonth, formatYears, isOngoing } from '../../lib/dates';
import { dotJoin, pad2 } from '../../lib/text';
import { SmartLink } from '../ui/SmartLink';
import { CvSection, CvToggle, PeriodLabel, printUrl, useStatusLabel, useTypeLabel } from './parts';

/**
 * Wide entry: a mono meta column (dates, place, type) and the content.
 * On phones the meta collapses into one line above the title.
 */
const WideEntry = ({ meta, children }: { meta: ReactNode; children: ReactNode }) => (
  <li className="cv-entry cv-wide grid gap-x-6 gap-y-2 border-t border-line py-5 first:border-t-0 first:pt-0 sm:grid-cols-[8.75rem_minmax(0,1fr)] md:py-6">
    <div className="cv-entry-meta label leading-[1.45]">{meta}</div>
    <div className="min-w-0">{children}</div>
  </li>
);

/** Meta column parts: stacked on sm+, one dotted line on phones. */
const MetaExtra = ({ items }: { items: string[] }) => (
  <>
    {items.filter(Boolean).map((item) => (
      <span key={item} className="cv-meta-extra block sm:mt-1">
        <span aria-hidden="true" className="sm:hidden">
          ·{' '}
        </span>
        {item}
      </span>
    ))}
  </>
);

const Description = ({ children }: { children: ReactNode }) => (
  <p className="cv-desc mt-2.5 max-w-[62ch] text-[0.94rem] leading-relaxed text-ink-2">{children}</p>
);

// ── Profile ─────────────────────────────────────────────────

export const ProfileSection = () => {
  const { l } = useI18n();
  const t = useT('cv');
  return (
    <CvSection id="cv-profile" title={t.cvProfile}>
      <p className="cv-summary max-w-[64ch] text-[1.0625rem] leading-[1.65] text-ink md:text-[1.125rem]">{l(profile.summary)}</p>
    </CvSection>
  );
};

// ── Experience ──────────────────────────────────────────────

const ExperienceItem = ({ x }: { x: Experience }) => {
  const { l } = useI18n();
  const typeLabel = useTypeLabel();
  return (
    <WideEntry
      meta={
        <div className="flex flex-wrap gap-x-1.5 sm:block">
          <PeriodLabel period={x.period} ongoing={isOngoing(x.period)} stacked className="sm:mb-2" />
          <MetaExtra items={[l(x.location), typeLabel(x.type)]} />
        </div>
      }
    >
      <h3 className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.005em] text-ink">{l(x.role)}</h3>
      <p className="mt-0.5 text-[0.95rem] leading-snug text-ink-2">
        {x.link ? (
          <SmartLink to={x.link} data-print-url={printUrl(x.link)} className="link hover:text-ink">
            {l(x.company)}
            <ArrowUpRight aria-hidden="true" size={13} strokeWidth={1.6} className="cv-noprint ml-1 inline-block align-[-1px]" />
          </SmartLink>
        ) : (
          l(x.company)
        )}
        <span className="cv-print-meta hidden">{` · ${dotJoin(l(x.location), typeLabel(x.type))}`}</span>
      </p>
      {x.description && <Description>{l(x.description)}</Description>}
    </WideEntry>
  );
};

export const ExperienceSection = () => {
  const t = useT('cv');
  const [open, setOpen] = useState(false);
  const main = experience.filter((x) => x.highlight);
  const more = experience.filter((x) => !x.highlight);
  const moreId = 'cv-experience-more';

  return (
    <CvSection id="cv-experience" title={t.cvExperience} count={experience.length}>
      <ol>
        {main.map((x) => (
          <ExperienceItem key={x.id} x={x} />
        ))}
      </ol>
      {more.length > 0 && (
        <>
          <div className="mt-5 md:mt-6">
            <CvToggle expanded={open} onToggle={() => setOpen((v) => !v)} controls={moreId} shown={main.length} total={experience.length} />
          </div>
          <div id={moreId} className={cn('cv-more', open ? 'block animate-fade-up' : 'hidden print:block')}>
            <h3 className="label mb-5 mt-8 flex items-center gap-3 print:mt-4">
              <span aria-hidden="true" className="h-px w-6 bg-ink-3/60" />
              {t.cvMoreExperience}
            </h3>
            <ol>
              {more.map((x) => (
                <ExperienceItem key={x.id} x={x} />
              ))}
            </ol>
          </div>
        </>
      )}
    </CvSection>
  );
};

// ── Projects ────────────────────────────────────────────────

export const ProjectsSection = () => {
  const { l } = useI18n();
  const t = useT('cv');
  const statusLabel = useStatusLabel();

  return (
    <CvSection id="cv-projects" title={t.cvProjects} count={sortedProjects.length}>
      <ol className="border-t border-line">
        {sortedProjects.map((p, i) => {
          const when = p.period ? formatYears(p.period) : p.status ? statusLabel(p.status) : '';
          return (
            <li key={p.slug} className="cv-entry border-b border-line">
              <SmartLink
                to={`/projects/${p.slug}`}
                className="cv-project group grid min-h-12 grid-cols-[1.75rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-3.5 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto] sm:gap-x-4"
              >
                <span aria-hidden="true" className="label tabular transition-colors duration-300 group-hover:text-accent-ink">
                  {pad2(i + 1)}
                </span>
                <span className="min-w-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                  <span className="font-semibold text-ink">{l(p.name)}</span>
                  <span className="cv-project-tagline block text-[0.92rem] leading-snug text-ink-2 sm:ml-2 sm:inline">{l(p.tagline)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="label tabular whitespace-nowrap">{when}</span>
                  <ArrowRight
                    aria-hidden="true"
                    size={14}
                    strokeWidth={1.6}
                    className="cv-noprint hidden -translate-x-1 text-accent-ink opacity-0 transition duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100 sm:block print:hidden"
                  />
                </span>
              </SmartLink>
            </li>
          );
        })}
      </ol>
    </CvSection>
  );
};

// ── Engagement ──────────────────────────────────────────────

const EngagementItem = ({ e }: { e: Engagement }) => {
  const { l } = useI18n();
  return (
    <WideEntry
      meta={
        <div className="flex flex-wrap gap-x-1.5 sm:block">
          {e.period && <PeriodLabel period={e.period} ongoing={isOngoing(e.period)} stacked className="sm:mb-2" />}
          {e.period ? <MetaExtra items={[l(e.kind)]} /> : <span className="block">{l(e.kind)}</span>}
        </div>
      }
    >
      <h3 className="text-[1.0625rem] font-semibold leading-snug text-ink">{l(e.name)}</h3>
      <p className="mt-0.5 text-[0.95rem] leading-snug text-ink-2">{l(e.role)}</p>
      {e.description && <Description>{l(e.description)}</Description>}
    </WideEntry>
  );
};

export const EngagementSection = () => {
  const t = useT('cv');
  return (
    <CvSection id="cv-engagement" title={t.cvEngagement} count={engagement.length}>
      <ol>
        {engagement.map((e) => (
          <EngagementItem key={e.id} e={e} />
        ))}
      </ol>
    </CvSection>
  );
};

// ── Media ───────────────────────────────────────────────────

export const MediaSection = () => {
  const { l, lang } = useI18n();
  const t = useT('cv');
  return (
    <CvSection id="cv-media" title={t.cvMedia} count={media.length}>
      <ol>
        {media.map((m) => (
          <WideEntry key={m.id} meta={<span className="text-ink-2">{formatYearMonth(m.date, lang)}</span>}>
            <h3 className="text-[1.0625rem] font-semibold leading-snug text-ink">{l(m.title)}</h3>
            <p className="mt-0.5 text-[0.95rem] leading-snug text-ink-2">{l(m.outlet)}</p>
            <Description>{l(m.description)}</Description>
            {m.url && (
              <p className="cv-link-row mt-2.5">
                <SmartLink
                  to={m.url}
                  data-print-url={printUrl(m.url)}
                  onClick={() => track('media_open', { id: m.id, from: 'cv' })}
                  className="cv-url group inline-flex min-h-11 items-center gap-1.5 text-[0.9rem] font-medium text-ink transition-colors hover:text-accent-ink sm:min-h-0"
                >
                  <span className="link">{m.cta ? l(m.cta) : printUrl(m.url)}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    size={14}
                    strokeWidth={1.6}
                    className="cv-noprint transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </SmartLink>
              </p>
            )}
          </WideEntry>
        ))}
      </ol>
    </CvSection>
  );
};
