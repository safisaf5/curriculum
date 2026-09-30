import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sortedProjects, type Project } from '../../data';
import { useFinePointer, useMediaQuery, useReducedMotion, useRevealChildren } from '../../hooks';
import { useT } from '../../i18n';
import { track } from '../../lib/analytics';
import { cn } from '../../lib/cn';
import { FeaturedProject } from '../projects/FeaturedProject';
import { FILTERS, FilterBar, type ProjectFilter } from '../projects/FilterBar';
import { FloatingPreview } from '../projects/FloatingPreview';
import { ProjectIndexRow } from '../projects/ProjectIndexRow';
import { SectionHeader } from '../ui/SectionHeader';

const matches = (project: Project, filter: ProjectFilter) => filter === 'all' || project.categories.includes(filter);

const COUNTS = Object.fromEntries(
  FILTERS.map((f) => [f, sortedProjects.filter((p) => matches(p, f)).length]),
) as Record<ProjectFilter, number>;

/** Time the outgoing list takes to fade before the new one enters (ms). */
const LEAVE_MS = 180;

/**
 * Project explorer: filters, the lead project of the current filter, then a
 * studio-style work index. Every row opens in place (preview panel) or links
 * to its page; on desktop a cover trails the cursor over the index.
 */
export default function ProjectExplorer() {
  const t = useT('projects');
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const tablet = useMediaQuery('(min-width: 768px)');

  // `filter` drives the buttons and the counter at once, `shown` swaps the list after the fade-out
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [shown, setShown] = useState<ProjectFilter>('all');
  const [leaving, setLeaving] = useState(false);
  const [changed, setChanged] = useState(false);
  const [open, setOpen] = useState<string[]>([]);
  const timer = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const rootRef = useRevealChildren<HTMLDivElement>([shown]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const select = (next: ProjectFilter) => {
    if (next === filter) return;
    setFilter(next);
    track('project_filter', { category: next });
    window.clearTimeout(timer.current);
    if (reduced) {
      setShown(next);
      setChanged(true);
      return;
    }
    setLeaving(true);
    timer.current = window.setTimeout(() => {
      setShown(next);
      setLeaving(false);
      setChanged(true);
    }, LEAVE_MS);
  };

  const toggle = useCallback(
    (slug: string) => setOpen((list) => (list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug])),
    [],
  );

  const visible = useMemo(() => sortedProjects.filter((p) => matches(p, shown)), [shown]);
  const featured = visible.find((p) => p.featured);
  const rest = visible.filter((p) => p !== featured);

  const title = t.projectsTitle;
  const period = title.endsWith('.');

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative py-section">
      <div ref={rootRef} className="container-site">
        <SectionHeader
          id="projects"
          label={t.projectsLabel}
          title={
            <span id="projects-title">
              {period ? title.slice(0, -1) : title}
              {period && <span className="text-accent">.</span>}
            </span>
          }
          intro={t.projectsIntro}
          aside={
            <p className="label tabular text-ink-2" aria-live="polite">
              {t.projectCount(COUNTS[filter])}
            </p>
          }
          className="md:mb-16"
        />

        <FilterBar value={filter} counts={COUNTS} onSelect={select} />

        <div ref={listRef}>
          <div
            key={shown}
            className={cn(
              'transition-[opacity,transform] duration-200 ease-out',
              leaving && '-translate-y-1 opacity-0',
            )}
          >
            {featured && <FeaturedProject project={featured} enter={changed} className="mt-10 md:mt-14" />}

            {rest.length > 0 && (
              <div className={featured ? 'mt-16 md:mt-24' : 'mt-10 md:mt-14'}>
                <div
                  aria-hidden="true"
                  className="label hidden grid-cols-12 gap-x-6 border-b border-line pb-3 md:grid"
                >
                  <span className="col-span-1">{t.projectNo}</span>
                  <span className="col-span-7 lg:col-span-4">{t.colProject}</span>
                  <span className="hidden lg:col-span-3 lg:block">{t.colBrief}</span>
                  <span className="col-span-2">
                    {t.colYear} / {t.factCategory}
                  </span>
                </div>
                <ol className="border-t border-line md:border-t-0">
                  {rest.map((p, i) => (
                    <ProjectIndexRow
                      key={p.slug}
                      project={p}
                      index={i}
                      open={open.includes(p.slug)}
                      onToggle={() => toggle(p.slug)}
                      enter={changed}
                    />
                  ))}
                </ol>
              </div>
            )}

            {visible.length === 0 && <p className="mt-12 text-lead text-ink-2">{t.noProjects}</p>}
          </div>
        </div>
      </div>

      {fine && tablet && <FloatingPreview listRef={listRef} projects={sortedProjects} still={reduced} />}
    </section>
  );
}
