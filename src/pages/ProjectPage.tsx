import { useEffect, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { getProject, resolveEntities, sortedProjects, type Project } from '../data';
import { useRevealChildren } from '../hooks';
import { useI18n, useT } from '../i18n';
import { track } from '../lib/analytics';
import { cn } from '../lib/cn';
import { requestContact } from '../lib/contactIntent';
import { formatPeriod, formatYearMonth } from '../lib/dates';
import { pad2 } from '../lib/text';
import {
  categoryLabel,
  contactSubjectFor,
  isLiveStatus,
  kindLabel,
  projectNumber,
  projectTotal,
  statusLabel,
} from '../components/projects/labels';
import { ButtonLink } from '../components/ui/Button';
import { ProjectCover } from '../components/ui/ProjectCover';
import { SmartLink } from '../components/ui/SmartLink';
import NotFoundPage from './NotFoundPage';

/** /projects/:slug and /en/projects/:slug, prerendered for every project. */
export default function ProjectPage() {
  const { slug = '' } = useParams();
  const project = getProject(slug);

  useEffect(() => {
    if (project) track('project_view', { slug: project.slug });
  }, [project]);

  if (!project) return <NotFoundPage />;
  return <ProjectDetail project={project} />;
}

const StatusDot = () => <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />;

const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-line py-4 sm:grid-cols-[9rem_minmax(0,1fr)] lg:grid-cols-[7.5rem_minmax(0,1fr)]">
    <dt className="label pt-[0.2rem]">{label}</dt>
    <dd className="text-[0.95rem] leading-snug text-ink">{children}</dd>
  </div>
);

const prose = 'max-w-prose text-[1.0625rem] leading-[1.7] text-ink-2';

const ProjectDetail = ({ project }: { project: Project }) => {
  const { l, lang } = useI18n();
  const t = useT('projects');
  const contentRef = useRevealChildren<HTMLDivElement>([project.slug]);

  const name = l(project.name);
  const index = sortedProjects.findIndex((p) => p.slug === project.slug);
  const total = sortedProjects.length;
  const prev = sortedProjects[(index - 1 + total) % total];
  const next = sortedProjects[(index + 1) % total];
  const related = resolveEntities(project.related);

  const blocks: { id: string; title: string; body: ReactNode }[] = [];
  if (project.overview)
    blocks.push({
      id: 'overview',
      title: t.sectionOverview,
      body: <p className="max-w-[40ch] text-[clamp(1.2rem,1.75vw,1.55rem)] leading-[1.42] tracking-[-0.01em] text-ink">{l(project.overview)}</p>,
    });
  if (project.problem) blocks.push({ id: 'problem', title: t.sectionProblem, body: <p className={prose}>{l(project.problem)}</p> });
  if (project.idea) blocks.push({ id: 'idea', title: t.sectionIdea, body: <p className={prose}>{l(project.idea)}</p> });
  if (project.role)
    blocks.push({
      id: 'role',
      title: t.sectionRole,
      body: (
        <p className="max-w-[28ch] border-l-2 border-accent pl-5 font-semiwide text-display-s font-medium text-ink">{l(project.role)}</p>
      ),
    });
  if (project.results?.length)
    blocks.push({
      id: 'results',
      title: t.sectionResults,
      body: (
        <ol className="max-w-prose border-t border-line md:-mt-4 md:border-t-0">
          {project.results.map((r, i) => (
            <li key={i} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-line py-4">
              <span className="label tabular pt-[0.3rem] text-accent-ink">{pad2(i + 1)}</span>
              <span className="text-[1.0625rem] leading-relaxed text-ink">{l(r)}</span>
            </li>
          ))}
        </ol>
      ),
    });
  if (project.milestones?.length)
    blocks.push({
      id: 'timeline',
      title: t.sectionTimeline,
      body: (
        <ol className="relative max-w-prose">
          <span aria-hidden="true" className="absolute bottom-3 left-[5px] top-3 w-px bg-line" />
          {project.milestones.map((m, i, all) => (
            <li key={`${m.date}-${i}`} className="relative grid gap-1 pb-7 pl-9 last:pb-0 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-0 top-[0.35rem] h-[11px] w-[11px] border',
                  i === all.length - 1 ? 'border-accent bg-accent' : 'border-ink bg-bg',
                )}
              />
              <span className="label tabular pt-[0.2rem] text-ink-2">{formatYearMonth(m.date, lang)}</span>
              <span className="text-[1.0625rem] leading-snug text-ink">{l(m.title)}</span>
            </li>
          ))}
        </ol>
      ),
    });
  if (project.media?.length)
    blocks.push({
      id: 'media',
      title: t.sectionMedia,
      body: (
        <ul className="grid gap-4 sm:grid-cols-2">
          {project.media.map((m) => (
            <li key={m.src} className={cn(project.media?.length === 1 && 'sm:col-span-2')}>
              {m.type === 'image' ? (
                <img
                  src={m.src}
                  alt={l(m.alt)}
                  width={m.width}
                  height={m.height}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full border border-line bg-bg-2"
                />
              ) : (
                <figure>
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    poster={m.poster}
                    width={m.width}
                    height={m.height}
                    aria-label={l(m.alt)}
                    className="h-auto w-full border border-line bg-bg-2"
                  >
                    <source src={m.src} />
                  </video>
                  <figcaption className="label mt-2">{l(m.alt)}</figcaption>
                </figure>
              )}
            </li>
          ))}
        </ul>
      ),
    });
  if (related.length)
    blocks.push({
      id: 'related',
      title: t.sectionRelated,
      body: (
        <ul className="border-t border-line md:-mt-4 md:border-t-0">
          {related.map((e) => {
            const Arrow = e.external ? ArrowUpRight : ArrowRight;
            return (
              <li key={e.id}>
                <SmartLink
                  to={e.href ?? '/'}
                  className="group grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 border-b border-line py-4 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto]"
                >
                  <span className="label">{kindLabel(t, e.kind)}</span>
                  <span className="col-start-1 min-w-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-2 sm:col-start-2 sm:row-start-1">
                    <span className="block text-[1.0625rem] leading-snug text-ink">{l(e.title)}</span>
                    {e.subtitle && <span className="mt-0.5 block text-[0.9rem] text-ink-2">{l(e.subtitle)}</span>}
                  </span>
                  <span className="col-start-2 row-span-2 row-start-1 flex items-center gap-4 self-center sm:col-start-3 sm:row-span-1">
                    {e.date && <span className="label tabular hidden sm:inline">{formatYearMonth(e.date, lang)}</span>}
                    <Arrow
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.6}
                      className="text-ink-3 transition-[transform,color] duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-accent-ink"
                    />
                  </span>
                </SmartLink>
              </li>
            );
          })}
        </ul>
      ),
    });

  return (
    <article>
      <header className="container-site pt-[calc(var(--nav-h)+1.75rem)] md:pt-[calc(var(--nav-h)+3rem)]">
        <nav aria-label={t.breadcrumbLabel} className="animate-fade-in">
          <ol className="label flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <SmartLink to="/#projects" className="inline-flex min-h-11 items-center gap-2 text-ink-2 transition-colors hover:text-ink">
                <ArrowLeft aria-hidden="true" size={13} strokeWidth={1.7} />
                <span className="link">{t.breadcrumbProjects}</span>
              </SmartLink>
            </li>
            <li aria-hidden="true" className="text-ink-3/70">
              /
            </li>
            <li aria-current="page" className="text-ink">
              {name}
            </li>
          </ol>
        </nav>

        <div className="label mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-line py-3 animate-fade-in md:mt-5">
          <span className="tabular">
            <span className="text-accent-ink">
              {t.projectNo} {projectNumber(project)}
            </span>
            <span> / {projectTotal}</span>
          </span>
          {project.period && <span className="tabular text-ink-2">{formatPeriod(project.period, lang)}</span>}
          {project.status && (
            <span className="flex items-center gap-2 text-ink-2">
              {isLiveStatus(project.status) && <StatusDot />}
              {statusLabel(t, project.status)}
            </span>
          )}
        </div>

        <h1 className="mt-10 break-words font-wide text-[clamp(2.2rem,10.4vw,10rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.045em] text-ink md:mt-14">
          <span className="-mt-[0.14em] block overflow-hidden pb-[0.05em] pt-[0.14em]">
            <span className="block animate-rise-in">{name}</span>
          </span>
        </h1>

        <div className="mt-8 grid gap-6 md:mt-10 lg:grid-cols-12 lg:items-end">
          <p className="max-w-[36ch] text-lead text-ink-2 animate-fade-up [animation-delay:120ms] lg:col-span-7">{l(project.tagline)}</p>
          <ul className="flex flex-wrap gap-1.5 animate-fade-up [animation-delay:180ms] lg:col-span-5 lg:justify-end">
            {project.tags.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="container-site mt-10 animate-fade-in [animation-delay:150ms] md:mt-14">
        <ProjectCover project={project} aspect="wide" priority ratio="aspect-[4/3] md:aspect-[16/10] lg:aspect-[2/1]" sizes="100vw" />
      </div>

      <div className="container-site grid gap-x-10 gap-y-14 py-section lg:grid-cols-12">
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] lg:col-span-4 lg:self-start xl:col-span-3">
          <dl className="border-t border-ink">
            {project.period && <Fact label={t.factYear}>{formatPeriod(project.period, lang, { withDetail: true })}</Fact>}
            {project.status && (
              <Fact label={t.factStatus}>
                <span className="flex items-center gap-2">
                  {isLiveStatus(project.status) && <StatusDot />}
                  {statusLabel(t, project.status)}
                </span>
              </Fact>
            )}
            <Fact label={t.factCategory}>
              <ul>
                {project.categories.map((c) => (
                  <li key={c}>{categoryLabel(t, c)}</li>
                ))}
              </ul>
            </Fact>
            {project.role && <Fact label={t.factRole}>{l(project.role)}</Fact>}
            {project.technologies && project.technologies.length > 0 && (
              <Fact label={t.factStack}>
                <ul className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <li key={tech} className="tag">
                      {tech}
                    </li>
                  ))}
                </ul>
              </Fact>
            )}
            {project.links && project.links.length > 0 && (
              <Fact label={t.factLinks}>
                <ul className="space-y-1">
                  {project.links.map((link) => (
                    <li key={link.href}>
                      <SmartLink to={link.href} className="group inline-flex min-h-11 items-center gap-1.5 text-ink">
                        <span className="link-static">{l(link.label)}</span>
                        <ArrowUpRight
                          aria-hidden="true"
                          size={15}
                          strokeWidth={1.6}
                          className="text-accent-ink transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </Fact>
            )}
          </dl>
        </div>

        <div ref={contentRef} className="min-w-0 lg:col-span-8 lg:col-start-5 xl:col-span-8 xl:col-start-5">
          {blocks.map((b, i) => (
            <section
              key={b.id}
              aria-labelledby={`project-${b.id}`}
              className="reveal grid gap-5 border-t border-line pb-14 pt-5 last:pb-0 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-10 md:pb-20"
            >
              <h2 id={`project-${b.id}`} className="label flex items-baseline gap-3 md:pt-1.5">
                <span className="tabular text-accent-ink">{pad2(i + 1)}</span>
                <span>{b.title}</span>
              </h2>
              <div className="min-w-0">{b.body}</div>
            </section>
          ))}
        </div>
      </div>

      <nav aria-label={t.projectNavLabel} className="border-t border-line">
        <div className="container-site grid md:grid-cols-2">
          {[
            { p: prev, dir: 'prev' as const, label: t.prevProject },
            { p: next, dir: 'next' as const, label: t.nextProject },
          ].map(({ p, dir, label }) => (
            <SmartLink
              key={dir}
              to={`/projects/${p.slug}`}
              rel={dir}
              className={cn(
                'group flex min-w-0 items-center gap-6 py-8 md:py-12',
                dir === 'prev' ? 'border-b border-line md:border-b-0 md:border-r md:pr-10' : 'flex-row-reverse text-right md:pl-10',
              )}
            >
              <ProjectCover project={p} aspect="square" compact decorative className="hidden w-20 shrink-0 sm:block lg:w-24" />
              <span className="min-w-0 flex-1">
                <span className={cn('label flex items-center gap-2', dir === 'next' && 'justify-end')}>
                  {dir === 'prev' && (
                    <ArrowLeft aria-hidden="true" size={14} strokeWidth={1.7} className="transition-transform duration-500 ease-out-expo group-hover:-translate-x-1" />
                  )}
                  <span>{label}</span>
                  <span className="tabular text-ink-3/80">{projectNumber(p)}</span>
                  {dir === 'next' && (
                    <ArrowRight aria-hidden="true" size={14} strokeWidth={1.7} className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
                  )}
                </span>
                <span
                  className={cn(
                    'mt-3 block break-words font-semiwide text-display-s font-semibold text-ink transition-transform duration-500 ease-out-expo',
                    dir === 'prev' ? 'group-hover:translate-x-2' : 'group-hover:-translate-x-2',
                  )}
                >
                  {l(p.name)}
                </span>
              </span>
            </SmartLink>
          ))}
        </div>
        <div className="border-t border-line">
          <div className="container-site flex justify-center py-3">
            <SmartLink to="/#projects" className="label inline-flex min-h-11 items-center gap-2 text-ink-2 transition-colors hover:text-ink">
              <span className="link">{t.backToProjects}</span>
              <span className="tabular text-ink-3">({pad2(total)})</span>
            </SmartLink>
          </div>
        </div>
      </nav>

      <section aria-labelledby="project-cta-title" className="border-t border-line">
        <div className="container-site grid gap-10 py-section lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="label flex items-center gap-3">
              <StatusDot />
              {t.ctaLabel}
            </p>
            <h2
              id="project-cta-title"
              className="mt-6 max-w-[16ch] font-wide text-[clamp(2.1rem,6vw,5.75rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] text-ink"
            >
              {l(t.projectCta)}
            </h2>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <ButtonLink to="/#contact" onClick={() => requestContact(contactSubjectFor(project), false)}>
              {t.projectCtaButton}
            </ButtonLink>
          </div>
        </div>
      </section>
    </article>
  );
};
