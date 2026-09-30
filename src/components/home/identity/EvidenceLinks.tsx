import { ArrowUpRight } from 'lucide-react';
import { resolveEntities, type EntityInfo, type EntityRef } from '../../../data';
import { useL, useT } from '../../../i18n';
import { track } from '../../../lib/analytics';
import { cn } from '../../../lib/cn';
import { SmartLink } from '../../ui/SmartLink';

/** Short display label for an entity: curated short name, else the part before " · ", else the title. */
export const useEntityLabel = () => {
  const l = useL();
  const t = useT('home');
  return (entity: EntityInfo) => {
    const short = t.evidenceShort(entity.id);
    if (short) return l(short);
    const title = l(entity.title);
    const cut = title.indexOf(' · ');
    return cut > 0 ? title.slice(0, cut) : title;
  };
};

interface EvidenceLinksProps {
  ids: EntityRef[];
  /** Mono prefix shown before the links ("Exemples"). */
  label: string;
  /** Analytics origin for external links. */
  from: string;
  className?: string;
}

/**
 * Inline list of proof links (projects, jobs, awards, appearances).
 * Internal entries route inside the site, external ones open in a new tab.
 */
export const EvidenceLinks = ({ ids, label, from, className }: EvidenceLinksProps) => {
  const entityLabel = useEntityLabel();
  const entities = resolveEntities(ids);
  if (!entities.length) return null;
  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-5', className)}>
      <p className="label shrink-0">{label}</p>
      <ul className="-my-2 flex flex-wrap gap-x-5 sm:my-0 sm:gap-y-1.5">
        {entities.map((entity) => (
          <li key={entity.id}>
            <SmartLink
              to={entity.href ?? '/'}
              onClick={entity.external ? () => track('media_open', { id: entity.id, from }) : undefined}
              className="group/ev inline-flex min-h-11 items-center gap-1 text-[0.9375rem] text-ink-2 transition-colors duration-300 hover:text-ink focus-visible:text-ink sm:min-h-0"
            >
              <span className="link">{entityLabel(entity)}</span>
              {entity.external && (
                <ArrowUpRight
                  aria-hidden="true"
                  size={14}
                  strokeWidth={1.6}
                  className="shrink-0 text-ink-3 transition-transform duration-300 ease-out-expo group-hover/ev:-translate-y-0.5 group-hover/ev:translate-x-0.5"
                />
              )}
            </SmartLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
