import type { CSSProperties } from 'react';
import type { Project } from '../../data';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { formatPeriod } from '../../lib/dates';
import { ButtonLink } from '../ui/Button';
import { ProjectCover } from '../ui/ProjectCover';
import { SmartLink } from '../ui/SmartLink';
import { isLiveStatus, projectNumber, statusLabel } from './labels';

interface FeaturedProjectProps {
  project: Project;
  /** Entering after a filter change (animated) rather than revealed on scroll. */
  enter?: boolean;
  className?: string;
}

/** Lead project of the current filter: cover on 7 columns, facts on 5. */
export const FeaturedProject = ({ project, enter, className }: FeaturedProjectProps) => {
  const { l, lang } = useI18n();
  const t = useT('projects');
  const tc = useT('common');
  const href = `/projects/${project.slug}`;
  const titleId = `featured-${project.slug}`;

  return (
    <article
      aria-labelledby={titleId}
      className={cn('grid gap-x-10 gap-y-8 lg:grid-cols-12', className)}
    >
      {/* Same destination as the button below: kept out of the tab order */}
      <SmartLink
        to={href}
        tabIndex={-1}
        aria-hidden="true"
        className={cn('group block lg:col-span-7', enter ? 'animate-fade-up' : 'reveal')}
      >
        <ProjectCover project={project} aspect="wide" ratio="aspect-[16/10] lg:aspect-[4/3]" zoom decorative />
      </SmartLink>

      <div
        className={cn('flex flex-col lg:col-span-5', enter ? 'animate-fade-up' : 'reveal')}
        style={(enter ? { animationDelay: '80ms' } : { '--reveal-delay': '120ms' }) as CSSProperties}
      >
        <p className="label flex items-center gap-3">
          <span className="tabular text-accent-ink">{projectNumber(project)}</span>
          <span aria-hidden="true" className="h-px w-6 bg-ink-3/60" />
          <span>{t.featured}</span>
        </p>

        <h3
          id={titleId}
          className="mt-6 break-words font-wide text-[clamp(2.2rem,4.3vw,4.1rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] text-ink"
        >
          {l(project.name)}
        </h3>
        <p className="mt-6 max-w-[30ch] font-semiwide text-[clamp(1.15rem,1.5vw,1.4rem)] font-medium leading-[1.3] tracking-[-0.01em] text-ink">
          {l(project.tagline)}
        </p>
        <p className="mt-4 max-w-prose text-ink-2">{l(project.summary)}</p>

        <ul className="mt-6 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>

        <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-4 lg:mt-auto">
          {project.status && (
            <div>
              <dt className="label">{t.factStatus}</dt>
              <dd className="mt-2 flex items-center gap-2 font-mono text-[0.8125rem] uppercase tracking-[0.04em] text-ink">
                {isLiveStatus(project.status) && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />}
                {statusLabel(t, project.status)}
              </dd>
            </div>
          )}
          {project.period && (
            <div>
              <dt className="label">{t.factYear}</dt>
              <dd className="tabular mt-2 font-mono text-[0.8125rem] uppercase tracking-[0.04em] text-ink">
                {formatPeriod(project.period, lang)}
              </dd>
            </div>
          )}
        </dl>

        <ButtonLink to={href} className="mt-8 self-start">
          {tc.seeProject}
        </ButtonLink>
      </div>
    </article>
  );
};
