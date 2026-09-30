import type { CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Experience } from '../../data';
import { useI18n, useT } from '../../i18n';
import { durationMonths, formatPeriod } from '../../lib/dates';
import { SmartLink } from '../ui/SmartLink';
import { TYPE_KEY, hostOf, splitInstitution } from './shared';

interface ExperienceRowProps {
  item: Experience;
  hidden: boolean;
  /** Stagger for the entrance animation, in ms. */
  delay: number;
}

/**
 * One role on the 12-column grid: when (and for how long) on the left,
 * what and where in the middle, type and links on the right.
 */
export const ExperienceRow = ({ item: x, hidden, delay }: ExperienceRowProps) => {
  const { l, lang } = useI18n();
  const t = useT('journey');
  const founder = x.type === 'founder';
  // A duration only makes sense for a real span of months (never guessed for a single date)
  const months = x.period.end ? durationMonths(x.period) : undefined;
  const [company, companyDetail] = splitInstitution(l(x.company));
  const headingId = `xp-${x.id}`;

  return (
    <li hidden={hidden} className="animate-fade-up border-t border-line" style={{ animationDelay: `${delay}ms` } as CSSProperties}>
      <article aria-labelledby={headingId} className="grid gap-x-8 gap-y-4 py-8 md:py-10 lg:grid-cols-12">
        {/* When */}
        <div className="flex items-start justify-between gap-4 lg:col-span-3 lg:block">
          <div>
            <p className="flex items-center gap-2.5 font-mono text-[0.75rem] font-medium uppercase tracking-[0.06em] text-ink">
              {founder && <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-accent" />}
              <span className="tabular">{formatPeriod(x.period, lang, { withDetail: true })}</span>
            </p>
            {months !== undefined && <p className="label mt-1.5 tabular">{t.duration(months)}</p>}
            <p className="label mt-3 hidden text-ink-3 lg:block">{l(x.sector)}</p>
          </div>
          <span className="tag shrink-0 lg:hidden">{t[TYPE_KEY[x.type]]}</span>
        </div>

        {/* What */}
        <div className="min-w-0 lg:col-span-6">
          <h3 id={headingId} className="font-semiwide text-[1.35rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink md:text-[1.6rem]">
            {l(x.role)}
          </h3>
          <p className="mt-2 text-[1rem] leading-snug text-ink-2">
            <span className="font-medium text-ink">{company}</span>
            {companyDetail && <span> · {companyDetail}</span>}
            {x.location && <span className="text-ink-3"> · {l(x.location)}</span>}
          </p>
          {x.description && <p className="mt-4 max-w-[62ch] text-[0.975rem] leading-relaxed text-ink-2">{l(x.description)}</p>}
          {x.skills && x.skills.length > 0 && (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
              <p className="label shrink-0">{t.skillsGained}</p>
              <ul className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.75rem] leading-relaxed text-ink-2">
                {x.skills.map((s, i) => (
                  <li key={i} className="after:ml-3 after:text-ink-3/60 after:content-['/'] last:after:content-none">
                    {l(s)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Type and links */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-3 lg:flex-col lg:items-end lg:justify-between">
          <span className="tag hidden lg:inline-flex">{t[TYPE_KEY[x.type]]}</span>
          {(x.project || x.link) && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 lg:flex-col lg:items-end">
              {x.project && (
                <SmartLink
                  to={`/projects/${x.project}`}
                  className="group inline-flex min-h-11 items-center gap-2 text-[0.95rem] font-medium text-ink lg:min-h-0"
                >
                  <span className="link">{t.projectLink}</span>
                  <ArrowRight aria-hidden="true" size={15} strokeWidth={1.6} className="text-accent-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
                </SmartLink>
              )}
              {x.link && (
                <SmartLink
                  to={x.link}
                  className="group inline-flex min-h-11 items-center gap-1.5 font-mono text-[0.75rem] text-ink-2 transition-colors hover:text-ink lg:min-h-0"
                >
                  <span className="link">{hostOf(x.link)}</span>
                  <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.6} className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </SmartLink>
              )}
            </div>
          )}
        </div>
      </article>
    </li>
  );
};
