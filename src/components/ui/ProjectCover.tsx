import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { Project } from '../../data';
import { useL, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { projectNumber } from '../projects/labels';
import { MotifArt } from '../projects/motifs';

export type CoverAspect = 'wide' | 'square' | 'tall';

/** Drawing space per aspect (viewBox units). */
const SIZES: Record<CoverAspect, [number, number]> = {
  wide: [1600, 1000],
  square: [1000, 1000],
  tall: [900, 1200],
};

const RATIOS: Record<CoverAspect, string> = {
  wide: 'aspect-[16/10]',
  square: 'aspect-square',
  tall: 'aspect-[3/4]',
};

interface ProjectCoverProps {
  project: Project;
  className?: string;
  aspect?: CoverAspect;
  priority?: boolean;
  /** Replaces the default aspect-ratio classes, e.g. 'aspect-[4/3] lg:aspect-[2/1]'. The drawing is cropped to fill. */
  ratio?: string;
  /** Thumbnails: lighter drawing, no annotations. */
  compact?: boolean;
  /** Duplicate of a visible name (preview, thumbnail): hidden from assistive technologies. */
  decorative?: boolean;
  /** Slight zoom of the drawing while an ancestor `.group` is hovered. */
  zoom?: boolean;
  /** `sizes` attribute for a real cover image. */
  sizes?: string;
}

const Registration = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
    <circle cx="8" cy="8" r="4.5" />
    <path d="M8 0v16M0 8h16" />
  </svg>
);

/**
 * Project visual. A real image when `project.cover.image` exists (falls back on
 * error), otherwise a generated "spec plate": a technical drawing seeded by the
 * slug, framed and annotated like a drafting sheet. Token colours only, so it
 * follows the theme; deterministic, so SSR and hydration agree.
 */
export const ProjectCover = memo(function ProjectCover({
  project,
  className,
  aspect = 'wide',
  priority,
  ratio,
  compact = false,
  decorative = false,
  zoom = false,
  sizes = '(min-width: 1024px) 60vw, 100vw',
}: ProjectCoverProps) {
  const l = useL();
  const t = useT('projects');
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [w, h] = SIZES[aspect];
  const label = t.coverAlt(l(project.name));
  const image = project.cover.image;

  // An image that failed before hydration never fires onError: check once mounted.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  const art = useMemo(
    () => (
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
        className={cn(
          'absolute inset-0 h-full w-full',
          zoom && 'transition-transform duration-700 ease-out-expo group-hover:scale-[1.025]',
        )}
      >
        <MotifArt motif={project.cover.motif} seed={project.slug} width={w} height={h} compact={compact} />
      </svg>
    ),
    [project.cover.motif, project.slug, w, h, compact, zoom],
  );

  const frame = cn('relative overflow-hidden bg-bg-2 text-ink', ratio ?? RATIOS[aspect], className);

  if (image && !failed) {
    return (
      <div className={frame} aria-hidden={decorative || undefined}>
        <img
          ref={imgRef}
          src={image}
          alt={decorative ? '' : label}
          width={w}
          height={h}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onError={() => setFailed(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover',
            zoom && 'transition-transform duration-700 ease-out-expo group-hover:scale-[1.025]',
          )}
        />
      </div>
    );
  }

  const year = project.period?.start.slice(0, 4);
  const a11y = decorative ? { 'aria-hidden': true as const } : { role: 'img', 'aria-label': label };

  return (
    <div className={frame} {...a11y}>
      {art}
      {!compact && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 font-mono text-[0.625rem] font-medium uppercase leading-none tracking-[0.1em] text-ink-3"
        >
          <span className="absolute inset-2 border border-ink/10 sm:inset-3" />
          <span className="absolute left-2 top-2 bg-bg-2 px-2 py-1.5 sm:left-3 sm:top-3">
            <span className="tabular text-accent-ink">
              {t.projectNo} {projectNumber(project)}
            </span>
          </span>
          {year && (
            <span className="tabular absolute right-2 top-2 bg-bg-2 px-2 py-1.5 sm:right-3 sm:top-3">{year}</span>
          )}
          <span className="absolute bottom-2 left-2 bg-bg-2 px-2 py-1.5 normal-case tracking-[0.04em] sm:bottom-3 sm:left-3">
            {project.slug}
          </span>
          <span className="absolute bottom-2 right-2 bg-bg-2 p-1 sm:bottom-3 sm:right-3">
            <Registration />
          </span>
        </div>
      )}
    </div>
  );
});
