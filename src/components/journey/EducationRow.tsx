import { cn } from '../../lib/cn';
import { parseResult, splitInstitution } from './shared';

/** One line of the education table, already localised. */
export interface EducationLine {
  id: string;
  period: string;
  program: string;
  institution: string;
  /** Field and location, joined. */
  meta?: string;
  description?: string;
  result?: string;
  /** Large mark in the result column (e.g. a CEFR level). */
  level?: string;
  status?: string;
  inProgress?: boolean;
  feature?: boolean;
}

/** Row tracks shared by the rows and the column heads. */
export const EDU_GRID =
  'lg:grid lg:grid-cols-[8.5rem_minmax(0,1fr)_minmax(0,12rem)] lg:gap-x-8 xl:grid-cols-[11rem_minmax(0,1fr)_minmax(0,15rem)]';

const Grade = ({ grade }: { grade: string }) => {
  const [num, den] = grade.split('/');
  return (
    <span className="tabular whitespace-nowrap font-wide text-[1.9rem] font-extrabold leading-none tracking-[-0.03em] text-ink md:text-[2.25rem]">
      {num}
      <span className="text-[0.55em] font-bold text-ink-3">/{den}</span>
    </span>
  );
};

export const EducationRow = ({ line, inProgressLabel }: { line: EducationLine; inProgressLabel: string }) => {
  const [short, rest] = splitInstitution(line.institution);
  const parts = line.result ? parseResult(line.result) : [];
  const hasAside = parts.length > 0 || line.level || line.status || line.inProgress;

  return (
    <li className="border-t border-line first:border-t-0">
      <article
        aria-labelledby={`edu-${line.id}`}
        className={cn('grid gap-y-3 py-6', EDU_GRID, line.feature ? 'md:py-9' : 'md:py-7')}
      >
        <p className="flex items-center gap-2.5 font-mono text-[0.75rem] font-medium uppercase leading-snug tracking-[0.06em] text-ink lg:items-start lg:pt-1.5">
          {line.feature && <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-accent lg:mt-1" />}
          <span className="tabular">{line.period}</span>
        </p>

        <div className="min-w-0">
          <h4
            id={`edu-${line.id}`}
            className={cn(
              'text-ink',
              line.feature
                ? 'font-semiwide text-[1.45rem] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[1.85rem]'
                : 'text-[1.1rem] font-semibold leading-snug tracking-[-0.01em] md:text-[1.2rem]',
            )}
          >
            {line.program}
          </h4>
          <p className="mt-1.5 leading-snug text-ink-2">
            <span className="font-medium text-ink">{short}</span>
            {rest && <span> · {rest}</span>}
          </p>
          {line.meta && <p className="label mt-2.5">{line.meta}</p>}
          {line.description && <p className="mt-3 max-w-[60ch] text-[0.95rem] leading-relaxed text-ink-2">{line.description}</p>}
        </div>

        {hasAside && (
          <div className="flex flex-col items-start gap-3 lg:items-end lg:pt-1 lg:text-right">
            {line.inProgress && (
              <p className="label flex items-center gap-2 text-ink">
                <span aria-hidden="true" className="h-1.5 w-1.5 animate-blink rounded-full bg-accent" />
                {inProgressLabel}
              </p>
            )}
            {line.status && <p className="tag max-w-full text-left leading-snug">{line.status}</p>}
            {line.level && (
              <span className="tabular font-wide text-[1.9rem] font-extrabold leading-none tracking-[-0.03em] text-ink md:text-[2.25rem]">
                {line.level}
              </span>
            )}
            {parts.length > 0 && (
              <ul className="flex flex-col gap-3 lg:items-end">
                {parts.map((p, i) =>
                  p.grade ? (
                    <li key={i} className="flex items-baseline gap-3 lg:flex-col-reverse lg:items-end lg:gap-1.5">
                      <Grade grade={p.grade} />
                      {p.text && <span className="label">{p.text}</span>}
                    </li>
                  ) : (
                    <li key={i} className="text-[0.95rem] leading-snug text-ink-2">
                      {p.text}
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        )}
      </article>
    </li>
  );
};
