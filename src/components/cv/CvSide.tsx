import { useState, type ReactNode } from 'react';
import {
  awards,
  cefrScale,
  education,
  interests,
  languages,
  permits,
  personalSkills,
  profile,
  publications,
  skillGroups,
  toolGroups,
  type Cefr,
  type Education,
} from '../../data';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { formatYearMonth, isOngoing } from '../../lib/dates';
import { dotJoin } from '../../lib/text';
import { SmartLink } from '../ui/SmartLink';
import { CvSection, CvToggle, InlineList, Marker, PeriodLabel, printUrl } from './parts';

/**
 * Side column of the CV. Narrow on desktop and in print; on tablets the
 * column is full width, so entries get the date column of the main entries
 * and short lists run in two columns.
 */

/** Education entries shown before "show all". */
const EDUCATION_VISIBLE = 6;

/** Two columns on tablets only: the first two items of a list both open the grid. */
const TABLET_PAIRS = 'cv-pairs md:grid md:grid-cols-2 md:gap-x-10 md:[&>li:nth-child(2)]:border-t-0 md:[&>li:nth-child(2)]:pt-0 lg:block';

/** Entry with a meta line (dates) and content; the meta becomes a column on tablets. */
const SideEntry = ({ meta, children, className }: { meta?: ReactNode; children: ReactNode; className?: string }) => (
  <li
    className={cn(
      'cv-entry cv-side-entry border-t border-line py-4 first:border-t-0 first:pt-0',
      meta !== undefined && 'md:grid md:grid-cols-[8.75rem_minmax(0,1fr)] md:gap-x-6 md:py-5 lg:block lg:py-4',
      className,
    )}
  >
    {meta !== undefined && <div className="label mb-2 md:mb-0 lg:mb-2">{meta}</div>}
    <div className="min-w-0">{children}</div>
  </li>
);

// ── Education ───────────────────────────────────────────────

const EducationItem = ({ e }: { e: Education }) => {
  const { l } = useI18n();
  const t = useT('cv');
  const ongoing = isOngoing(e.period);
  // Explicit status first; otherwise only "in progress" is ever derived, never "completed".
  const status = e.status ? l(e.status) : ongoing ? t.cvInProgress : '';
  const where = dotJoin(l(e.field), l(e.location));
  return (
    <SideEntry meta={<PeriodLabel period={e.period} ongoing={ongoing} />}>
      <h3 className="text-[1rem] font-semibold leading-snug text-ink">{l(e.program)}</h3>
      <p className="mt-0.5 text-[0.9rem] leading-snug text-ink-2">{l(e.institution)}</p>
      {where && <p className="mt-1 text-[0.85rem] leading-snug text-ink-3">{where}</p>}
      {e.result && <p className="mt-2 text-[0.875rem] font-medium leading-snug text-ink">{l(e.result)}</p>}
      {status && (
        <p className="label mt-2 flex items-center gap-2 text-ink-2">
          <Marker on={ongoing && !e.status} />
          {status}
        </p>
      )}
      {e.description && <p className="cv-desc mt-2 text-[0.875rem] leading-relaxed text-ink-2">{l(e.description)}</p>}
    </SideEntry>
  );
};

export const EducationSection = () => {
  const t = useT('cv');
  const [open, setOpen] = useState(false);
  const main = education.slice(0, EDUCATION_VISIBLE);
  const more = education.slice(EDUCATION_VISIBLE);
  const moreId = 'cv-education-more';

  return (
    <CvSection id="cv-education" title={t.cvEducation} count={education.length}>
      <ol>
        {main.map((e) => (
          <EducationItem key={e.id} e={e} />
        ))}
      </ol>
      {more.length > 0 && (
        <>
          <div className="mt-4">
            <CvToggle expanded={open} onToggle={() => setOpen((v) => !v)} controls={moreId} shown={main.length} total={education.length} />
          </div>
          <div id={moreId} className={cn('cv-more', open ? 'block animate-fade-up' : 'hidden print:block')}>
            <h3 className="label mb-4 mt-7 flex items-center gap-3 print:mt-3">
              <span aria-hidden="true" className="h-px w-6 bg-ink-3/60" />
              {t.cvMoreEducation}
            </h3>
            <ol>
              {more.map((e) => (
                <EducationItem key={e.id} e={e} />
              ))}
            </ol>
          </div>
        </>
      )}
    </CvSection>
  );
};

// ── Languages ───────────────────────────────────────────────

/** Six CEFR steps, A1 to C2; native fills them all. */
const CefrBar = ({ cefr }: { cefr: Cefr }) => {
  const reached = cefr === 'native' ? 6 : cefrScale.indexOf(cefr) + 1;
  return (
    <span aria-hidden="true" className="cv-cefr mt-2 grid grid-cols-6 gap-[3px]">
      {cefrScale.slice(0, 6).map((step, i) => (
        <span key={step} className={cn('h-[3px]', i < reached ? 'bg-ink' : 'bg-line')} />
      ))}
    </span>
  );
};

export const LanguagesSection = () => {
  const { l, lang } = useI18n();
  const t = useT('cv');
  return (
    <CvSection id="cv-languages" title={t.cvLanguages} count={languages.length}>
      <ul className={TABLET_PAIRS}>
        {languages.map((lg) => (
          <SideEntry key={lg.code}>
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                <h3 className="text-[1rem] font-semibold leading-snug text-ink">{l(lg.name)}</h3>
                <span className="cv-level text-[0.875rem] leading-snug text-ink-2">{l(lg.level)}</span>
              </div>
              <span className="font-mono text-[0.75rem] font-medium tabular text-ink">{lg.cefrLabel}</span>
            </div>
            <CefrBar cefr={lg.cefr} />
            {lg.certification && (
              <p className="mt-1.5 text-[0.85rem] leading-snug text-ink">
                {lg.certification.name}
                <span className="block text-ink-3">
                  {dotJoin(l(lg.certification.detail), formatYearMonth(lg.certification.date, lang))}
                </span>
              </p>
            )}
            {lg.note && <p className="mt-1.5 text-[0.85rem] leading-snug text-ink-3">{l(lg.note)}</p>}
          </SideEntry>
        ))}
      </ul>
    </CvSection>
  );
};

// ── Skills, tools, strengths ───────────────────────────────

const Group = ({ label, items, tone = 'ink' }: { label: string; items: string[]; tone?: 'ink' | 'ink-2' }) => (
  <div className="cv-entry">
    <h3 className="label mb-1.5">{label}</h3>
    <InlineList items={items} className={cn('text-[0.925rem] leading-relaxed', tone === 'ink' ? 'text-ink' : 'text-ink-2')} />
  </div>
);

const GROUPS = 'cv-groups grid gap-y-5 md:grid-cols-2 md:gap-x-10 lg:grid-cols-1';

export const SkillsSection = () => {
  const { l } = useI18n();
  const t = useT('cv');
  return (
    <CvSection id="cv-skills" title={t.cvSkills}>
      <div className={GROUPS}>
        {skillGroups.map((g) => (
          <Group key={g.id} label={l(g.label)} items={g.items.map((s) => l(s.name))} />
        ))}
      </div>
    </CvSection>
  );
};

export const ToolsSection = () => {
  const { l } = useI18n();
  const t = useT('cv');
  return (
    <CvSection id="cv-tools" title={t.cvTools}>
      <div className={GROUPS}>
        {toolGroups.map((g) => (
          <Group key={g.id} label={l(g.label)} items={g.items.map((s) => l(s))} tone="ink-2" />
        ))}
      </div>
    </CvSection>
  );
};

export const PersonalSection = () => {
  const { l } = useI18n();
  const t = useT('cv');
  return (
    <CvSection id="cv-personal" title={t.cvPersonal}>
      <InlineList items={profile.qualities.map((q) => l(q))} className="text-[1rem] font-medium leading-relaxed text-ink" />
      <InlineList items={personalSkills.map((s) => l(s))} className="mt-3 text-[0.925rem] leading-relaxed text-ink-2" />
    </CvSection>
  );
};

// ── Awards, publications ───────────────────────────────────

export const AwardsSection = () => {
  const { l, lang } = useI18n();
  const t = useT('cv');
  return (
    <CvSection id="cv-awards" title={t.cvAwards} count={awards.length}>
      <ol>
        {awards.map((a) => (
          <SideEntry key={a.id} meta={<time dateTime={a.date} className="text-ink-2">{formatYearMonth(a.date, lang)}</time>}>
            <h3 className="text-[1rem] font-semibold leading-snug text-ink">{l(a.title)}</h3>
            <p className="mt-0.5 text-[0.9rem] leading-snug text-ink-2">{l(a.event)}</p>
            {a.details && <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-3">{l(a.details)}</p>}
          </SideEntry>
        ))}
      </ol>
    </CvSection>
  );
};

export const PublicationsSection = () => {
  const { l, lang } = useI18n();
  const t = useT('cv');
  return (
    <CvSection id="cv-publications" title={t.cvPublications} count={publications.length}>
      <ol>
        {publications.map((p) => (
          <SideEntry
            key={p.id}
            meta={
              <>
                <span className="text-ink-2">{formatYearMonth(p.date, lang)}</span>
                {/* One line in the narrow side column and in print, two lines in the tablet date column */}
                <span aria-hidden="true" className="md:hidden lg:inline print:!inline">
                  {' · '}
                </span>
                <br className="hidden md:block lg:hidden print:!hidden" />
                {p.platform}
              </>
            }
          >
            <h3 className="text-[1rem] font-semibold leading-snug text-ink">
              {p.url ? (
                <SmartLink to={p.url} data-print-url={printUrl(p.url)} className="link hover:text-accent-ink">
                  {l(p.title)}
                </SmartLink>
              ) : (
                l(p.title)
              )}
            </h3>
            <p className="cv-desc mt-1.5 text-[0.875rem] leading-relaxed text-ink-2">{l(p.summary)}</p>
          </SideEntry>
        ))}
      </ol>
    </CvSection>
  );
};

// ── Permits, interests ─────────────────────────────────────

export const PermitsSection = () => {
  const { l } = useI18n();
  const t = useT('cv');
  return (
    <CvSection id="cv-permits" title={t.cvPermits} count={permits.length}>
      <ul className="cv-groups grid gap-y-3 md:grid-cols-3 md:gap-x-10 lg:grid-cols-1">
        {permits.map((p) => (
          <li key={p.name.en} className="cv-entry cv-permit">
            <span className="block text-[0.925rem] leading-snug text-ink">{l(p.name)}</span>
            <span className="label">{l(p.category)}</span>
          </li>
        ))}
      </ul>
    </CvSection>
  );
};

export const InterestsSection = () => {
  const { l } = useI18n();
  const t = useT('cv');
  return (
    <CvSection id="cv-interests" title={t.cvInterests}>
      <InlineList items={interests.map((i) => l(i))} className="text-[0.925rem] leading-relaxed text-ink-2" />
    </CvSection>
  );
};
