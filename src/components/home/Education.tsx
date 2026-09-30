import { useMemo, useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { education, languages, type Education as EducationEntry, type EducationKind } from '../../data';
import { useRevealChildren } from '../../hooks';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { formatPeriod, formatYearMonth, isOngoing } from '../../lib/dates';
import { dotJoin, pad2 } from '../../lib/text';
import { SectionHeader } from '../ui/SectionHeader';
import { EDU_GRID, EducationRow, type EducationLine } from '../journey/EducationRow';

const SCHOOL_ID = 'education-schooling';

interface GroupProps {
  id: string;
  title: string;
  count: number;
  children: ReactNode;
  /** Replaces the rows area header (used by the schooling toggle). */
  action?: ReactNode;
}

/**
 * A group of the table: its name on the left (sticky on large screens), the
 * rows on the right nine columns.
 */
const Group = ({ id, title, count, children, action }: GroupProps) => (
  <section aria-labelledby={id} className="reveal grid border-t border-ink lg:grid-cols-12 lg:gap-x-8">
    <div className="flex items-baseline justify-between gap-4 pt-5 lg:col-span-3 lg:block lg:pt-0">
      <div className="lg:sticky lg:top-24 lg:pt-8">
        <h3 id={id} className="font-semiwide text-[1.35rem] font-semibold leading-tight tracking-[-0.015em] text-ink md:text-[1.5rem]">
          {title}
        </h3>
        <p className="label tabular mt-2 hidden lg:block">{pad2(count)}</p>
      </div>
      <p className="label tabular lg:hidden">{pad2(count)}</p>
    </div>
    <div className="lg:col-span-9">{action ?? children}</div>
    {action && <div className="lg:col-span-9 lg:col-start-4">{children}</div>}
  </section>
);

/**
 * Education as a compact editorial table: programmes, courses, language
 * certificates, then schooling folded behind a toggle (still in the HTML).
 * Status rule: the explicit status when there is one, otherwise "in progress"
 * only while the dates say so. "Completed" is never written.
 */
export default function Education() {
  const t = useT('journey');
  const { l, lang } = useI18n();
  const [schooling, setSchooling] = useState(false);
  const ref = useRevealChildren<HTMLDivElement>();

  const groups = useMemo(() => {
    const toLine = (e: EducationEntry, feature = false): EducationLine => ({
      id: e.id,
      period: formatPeriod(e.period, lang, { withDetail: true }),
      program: l(e.program),
      institution: l(e.institution),
      meta: dotJoin(e.field && l(e.field), e.location && l(e.location)) || undefined,
      description: e.description && l(e.description),
      result: e.result && l(e.result),
      status: e.status && l(e.status),
      inProgress: !e.status && isOngoing(e.period),
      feature,
    });
    const byKind = (...kinds: EducationKind[]) => education.filter((e) => kinds.includes(e.kind));

    const main = byKind('degree', 'program').map((e) => toLine(e, Boolean(e.highlight)));
    const courses = byKind('course', 'certificate').map((e) => toLine(e));
    const certs: EducationLine[] = languages.flatMap((lg) =>
      lg.certification
        ? [
            {
              id: `cert-${lg.code.toLowerCase()}`,
              period: formatYearMonth(lg.certification.date, lang),
              program: lg.certification.name,
              institution: l(lg.name),
              description: l(lg.certification.detail),
              level: lg.cefrLabel,
            },
          ]
        : [],
    );
    const school = byKind('school').map((e) => toLine(e));
    return { main, courses, certs, school };
  }, [l, lang]);

  const rows = (lines: EducationLine[]) => (
    <ul>
      {lines.map((line) => (
        <EducationRow key={line.id} line={line} inProgressLabel={t.inProgress} />
      ))}
    </ul>
  );

  return (
    <section id="education" aria-labelledby="education-title" className="py-section">
      <div className="container-site">
        <SectionHeader id="education" label={t.educationLabel} title={<span id="education-title">{t.educationTitle}</span>} />

        {/* Column heads, large screens only (every cell also reads on its own) */}
        <div aria-hidden="true" className="hidden lg:grid lg:grid-cols-12 lg:gap-x-8">
          <div className={cn('label pb-3 lg:col-span-9 lg:col-start-4', EDU_GRID)}>
            <span>{t.colPeriod}</span>
            <span>{t.colProgram}</span>
            <span className="text-right">{t.colResult}</span>
          </div>
        </div>

        <div ref={ref} className="space-y-14 md:space-y-20">
          <Group id="education-main" title={t.groupMain} count={groups.main.length}>
            {rows(groups.main)}
          </Group>
          <Group id="education-courses" title={t.groupCourses} count={groups.courses.length}>
            {rows(groups.courses)}
          </Group>
          <Group id="education-languages" title={t.groupLanguages} count={groups.certs.length}>
            {rows(groups.certs)}
          </Group>
          <Group
            id="education-school"
            title={t.groupSchool}
            count={groups.school.length}
            action={
              <button
                type="button"
                aria-expanded={schooling}
                aria-controls={SCHOOL_ID}
                onClick={() => setSchooling((v) => !v)}
                className="group flex min-h-11 w-full items-center justify-between gap-4 text-left text-[0.95rem] text-ink-2 transition-colors hover:text-ink"
              >
                <span className="link">{schooling ? t.hideSchooling : t.showSchooling}</span>
                <span aria-hidden="true" className="inline-flex h-11 w-11 items-center justify-center border border-line transition-colors group-hover:border-ink">
                  <Plus size={16} strokeWidth={1.6} className={cn('transition-transform duration-500 ease-out-expo', schooling && 'rotate-45')} />
                </span>
              </button>
            }
          >
            <div id={SCHOOL_ID} hidden={!schooling} className={cn(schooling && 'animate-fade-up')}>
              {rows(groups.school)}
            </div>
          </Group>
        </div>
      </div>
    </section>
  );
}
