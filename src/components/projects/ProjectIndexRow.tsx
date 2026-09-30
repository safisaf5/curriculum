import { useRef, type CSSProperties } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import type { Project } from '../../data';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { formatYears } from '../../lib/dates';
import { ButtonLink } from '../ui/Button';
import { ProjectCover } from '../ui/ProjectCover';
import { SmartLink } from '../ui/SmartLink';
import { categoryLabel, projectNumber, statusLabel } from './labels';

interface ProjectIndexRowProps {
  project: Project;
  /** Position in the current list, for the stagger. */
  index: number;
  open: boolean;
  onToggle: () => void;
  /** Entering after a filter change (animated) rather than revealed on scroll. */
  enter?: boolean;
}

/** Hover / keyboard focus shift of the left part of the row. */
const shift = 'transition-transform duration-500 ease-out-expo group-hover/row:translate-x-2 group-focus-within/row:translate-x-2';

/**
 * One line of the work index. The project name is the link and stretches over
 * the whole row (::after), so the row is one large target while the link keeps
 * a short accessible name. The "Preview" toggle sits above it and opens the
 * project in place.
 */
export const ProjectIndexRow = ({ project, index, open, onToggle, enter }: ProjectIndexRowProps) => {
  const { l } = useI18n();
  const t = useT('projects');
  const toggleRef = useRef<HTMLButtonElement>(null);
  const href = `/projects/${project.slug}`;
  const panelId = `project-panel-${project.slug}`;
  const name = l(project.name);
  const num = projectNumber(project);
  const when = project.period ? formatYears(project.period) : project.status ? statusLabel(t, project.status) : undefined;
  const fields = project.categories.map((c) => categoryLabel(t, c));

  return (
    <li
      className={cn('border-b border-line', enter ? 'animate-fade-up' : 'reveal')}
      style={(enter ? { animationDelay: `${60 + index * 55}ms` } : { '--reveal-delay': `${index * 60}ms` }) as CSSProperties}
    >
      <div
        data-row={project.slug}
        className="group/row relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 py-5 md:grid-cols-12 md:items-baseline md:gap-x-6 md:py-7"
      >
        {/* Phone: number and year on one mono line */}
        <p className="label col-start-1 row-start-1 md:hidden">
          <span className="tabular text-ink-2">{num}</span>
          {when && <span className="tabular"> · {when}</span>}
        </p>
        <div className="col-start-2 row-span-3 row-start-1 md:hidden">
          <ProjectCover project={project} aspect="square" compact decorative className="w-[4.75rem] xs:w-[5.5rem]" />
        </div>

        <p
          aria-hidden="true"
          className={cn(
            'tabular hidden font-mono text-[0.8125rem] font-medium text-ink-3 group-hover/row:text-accent-ink group-focus-within/row:text-accent-ink md:col-start-1 md:row-start-1 md:block',
            shift,
          )}
        >
          {num}
        </p>

        <h3 className="col-start-1 row-start-2 mt-2 md:col-span-7 md:col-start-2 md:row-start-1 md:mt-0 lg:col-span-4">
          {/* The transform lives on the inner span: the link's ::after must keep the row as containing block */}
          <SmartLink
            to={href}
            className="font-semiwide text-[clamp(1.55rem,2.5vw,2.4rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-ink after:absolute after:inset-0"
          >
            <span className={cn('inline-block', shift)}>{name}</span>
          </SmartLink>
        </h3>

        <p
          className={cn(
            'col-start-1 row-start-3 mt-1.5 text-[0.95rem] leading-snug text-ink-2 md:col-span-7 md:col-start-2 md:row-start-2 md:mt-2 lg:col-span-3 lg:col-start-6 lg:row-start-1 lg:mt-0',
            shift,
          )}
        >
          {l(project.tagline)}
        </p>

        <div className="col-start-1 row-start-4 mt-4 self-center md:col-span-2 md:col-start-9 md:row-start-1 md:mt-0 md:self-auto">
          {when && <p className="tabular hidden font-mono text-[0.75rem] uppercase tracking-[0.06em] text-ink md:block">{when}</p>}
          {/* Separators stay at the end of a line, never at the start of the next one */}
          <ul className="label flex flex-wrap gap-x-1.5 gap-y-1 md:mt-2">
            {fields.map((f, i) => (
              <li key={f}>
                {f}
                {i < fields.length - 1 && <span aria-hidden="true"> ·</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="col-start-2 row-start-4 mt-4 flex items-center justify-end gap-5 self-center md:col-span-2 md:col-start-11 md:row-start-1 md:mt-0 md:self-auto">
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
            className="relative z-10 -mr-2 inline-flex min-h-11 items-center gap-2 px-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ink-2 transition-colors hover:text-ink md:-my-3"
          >
            <span
              aria-hidden="true"
              className={cn(
                'flex h-5 w-5 items-center justify-center border transition-colors duration-300',
                open ? 'border-ink bg-ink text-bg' : 'border-line',
              )}
            >
              <Plus size={12} strokeWidth={1.7} className={cn('transition-transform duration-500 ease-out-expo', open && 'rotate-45')} />
            </span>
            {t.expand}
            <span className="sr-only"> {name}</span>
          </button>
          <ArrowRight
            aria-hidden="true"
            size={18}
            strokeWidth={1.6}
            className="hidden shrink-0 text-ink-3 transition-[transform,color] duration-500 ease-out-expo group-hover/row:translate-x-1 group-hover/row:text-ink md:block"
          />
        </div>

        {/* Draws under the hovered row */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-ink transition-transform duration-700 ease-out-expo group-hover/row:scale-x-100"
        />
      </div>

      <div id={panelId} hidden={!open}>
        {open && (
          <div className="grid animate-fade-up gap-x-6 gap-y-7 pb-9 pt-1 md:grid-cols-12 md:pb-12">
            <SmartLink
              to={href}
              tabIndex={-1}
              aria-hidden="true"
              className="group block md:col-span-5 md:col-start-2 lg:col-span-4 lg:col-start-2"
            >
              <ProjectCover project={project} aspect="wide" zoom decorative />
            </SmartLink>
            <div className="md:col-span-6 lg:col-span-4">
              <p className="max-w-prose text-[1.0625rem] leading-relaxed text-ink">{l(project.summary)}</p>
              {project.role && (
                <dl className="mt-6">
                  <dt className="label">{t.factRole}</dt>
                  <dd className="mt-2 text-ink-2">{l(project.role)}</dd>
                </dl>
              )}
            </div>
            <div className="flex flex-col md:col-span-10 md:col-start-2 lg:col-span-3 lg:col-start-10">
              {project.technologies && project.technologies.length > 0 && (
                <>
                  <p className="label">{t.factStack}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <li key={tech} className="tag">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 lg:mt-auto lg:pt-8">
                <ButtonLink to={href} variant="outline" className="min-h-11 px-4 text-[0.875rem]">
                  {t.open}
                  <span className="sr-only"> {name}</span>
                </ButtonLink>
                <button
                  type="button"
                  aria-controls={panelId}
                  aria-expanded={open}
                  onClick={() => {
                    onToggle();
                    toggleRef.current?.focus();
                  }}
                  className="label inline-flex min-h-11 items-center transition-colors hover:text-ink"
                >
                  {t.collapse}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  );
};
