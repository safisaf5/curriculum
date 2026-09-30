import { ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { resolveEntities, type EntityInfo, type EntityKind, type Skill, type SkillGroup } from '../../data';
import { useI18n, useT } from '../../i18n';
import { track } from '../../lib/analytics';
import { cn } from '../../lib/cn';
import { SmartLink } from '../ui/SmartLink';

type SkillsStrings = ReturnType<typeof useT<'skills'>>;

export const kindLabel = (t: SkillsStrings, kind: EntityKind) =>
  ({
    project: t.kindProject,
    experience: t.kindExperience,
    education: t.kindEducation,
    award: t.kindAward,
    engagement: t.kindEngagement,
    media: t.kindMedia,
    certificate: t.kindCertificate,
  })[kind];

const ProofRow = ({ entity, compact }: { entity: EntityInfo; compact?: boolean }) => {
  const { l } = useI18n();
  const t = useT('skills');
  const external = Boolean(entity.external);
  const Arrow = external ? ArrowUpRight : ArrowRight;
  const year = entity.date?.slice(0, 4);
  return (
    <li className="border-t border-line">
      <SmartLink
        to={entity.href ?? '/'}
        onClick={external && entity.kind === 'media' ? () => track('media_open', { id: entity.id, from: 'skills' }) : undefined}
        className={cn(
          'group relative grid items-baseline gap-x-4 py-3.5',
          compact ? 'grid-cols-[minmax(0,1fr)_auto]' : 'grid-cols-[6.5rem_minmax(0,1fr)_auto]',
        )}
      >
        <span
          aria-hidden="true"
          className="absolute left-0 top-[1.55rem] h-px w-3 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out-expo group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
        {!compact && (
          <span className="label transition-transform duration-500 ease-out-expo group-hover:translate-x-5 group-focus-visible:translate-x-5">
            {kindLabel(t, entity.kind)}
          </span>
        )}
        <span
          className={cn(
            'min-w-0 transition-transform duration-500 ease-out-expo',
            compact ? 'group-hover:translate-x-5 group-focus-visible:translate-x-5' : 'group-hover:translate-x-2 group-focus-visible:translate-x-2',
          )}
        >
          {compact && <span className="label mb-1 block">{kindLabel(t, entity.kind)}</span>}
          <span className="block text-[0.98rem] font-medium leading-snug text-ink">{l(entity.title)}</span>
          {entity.subtitle && (
            <span className="mt-0.5 block text-[0.85rem] leading-snug text-ink-3">{l(entity.subtitle)}</span>
          )}
        </span>
        <span className="label flex items-center gap-2.5 self-center">
          {year && <span className="tabular">{year}</span>}
          <Arrow
            aria-hidden="true"
            size={15}
            strokeWidth={1.6}
            className={cn(
              'text-ink-3 transition-[transform,color] duration-500 ease-out-expo group-hover:text-accent-ink group-focus-visible:text-accent-ink',
              external ? 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5' : 'group-hover:translate-x-1',
            )}
          />
        </span>
      </SmartLink>
    </li>
  );
};

export const ProofList = ({ skill, compact }: { skill: Skill; compact?: boolean }) => (
  <ul className="border-b border-line">
    {resolveEntities(skill.evidence).map((e) => (
      <ProofRow key={e.id} entity={e} compact={compact} />
    ))}
  </ul>
);

interface PanelProps {
  id: string;
  skill: Skill | null;
  group: SkillGroup | null;
  /** A skill is pinned: show the reset button. */
  pinned: boolean;
  onClear: () => void;
  stats: { skills: number; groups: number; proofs: number };
}

/** Desktop panel, under the map: shows the previewed or selected skill. */
export const ProofPanel = ({ id, skill, group, pinned, onClear, stats }: PanelProps) => {
  const { l } = useI18n();
  const t = useT('skills');
  const count = skill ? resolveEntities(skill.evidence).length : 0;
  return (
    <div id={id} className="grid min-h-[19rem] grid-cols-8 gap-x-10 border-t border-line pt-5">
      <div className="col-span-3 flex flex-col">
        <p className="label flex items-center gap-2.5">
          <span aria-hidden="true" className={cn('h-1.5 w-1.5 transition-colors duration-300', skill ? 'bg-accent' : 'bg-ink-3/50')} />
          {t.skillsUsedIn}
        </p>
        {skill && group ? (
          <div key={skill.id} className="animate-[fade-in_0.35s_ease-out_both]">
            <p className="mt-5 font-semiwide text-display-s font-semibold text-ink">{l(skill.name)}</p>
            <p className="label mt-3">
              {l(group.label)} <span aria-hidden="true">·</span> {t.skillsProofs(count)}
            </p>
          </div>
        ) : (
          <p className="mt-5 max-w-[30ch] text-[0.98rem] leading-relaxed text-ink-2">{l(t.skillsHint)}</p>
        )}
        {pinned && (
          <button
            type="button"
            onClick={onClear}
            className="group label mt-auto inline-flex min-h-10 items-center gap-2 self-start pt-4 text-ink-2 transition-colors hover:text-ink"
          >
            <X aria-hidden="true" size={14} strokeWidth={1.7} className="transition-transform duration-500 ease-out-expo group-hover:rotate-90" />
            <span className="link">{t.skillsClear}</span>
          </button>
        )}
      </div>
      <div className="col-span-5">
        {skill ? (
          <div key={skill.id} className="animate-[fade-in_0.35s_ease-out_both]">
            <ProofList skill={skill} />
          </div>
        ) : (
          <dl className="grid grid-cols-3 gap-x-6">
            {[
              [t.skillsStatSkills, stats.skills],
              [t.skillsStatGroups, stats.groups],
              [t.skillsStatProofs, stats.proofs],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col-reverse justify-end border-t border-line pt-3">
                <dt className="label mt-2">{label}</dt>
                <dd className="font-semiwide text-display-m font-semibold tabular text-ink">{String(value).padStart(2, '0')}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
};

/** Mobile / tablet drawer, opened under the group of the selected skill. */
export const ProofDrawer = ({ id, skill, onClear }: { id: string; skill: Skill; onClear: () => void }) => {
  const { l } = useI18n();
  const t = useT('skills');
  const count = resolveEntities(skill.evidence).length;
  return (
    <div id={id} className="mt-4 animate-fade-up border-t border-ink pt-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label flex items-center gap-2.5">
            <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
            {t.skillsUsedIn}
          </p>
          <p className="mt-2 font-semiwide text-[1.35rem] font-semibold leading-tight tracking-[-0.015em] text-ink">
            {l(skill.name)}
            <span className="label ml-3 align-middle">{t.skillsProofs(count)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label={t.skillsClear}
          className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center text-ink-2 transition-colors hover:text-ink"
        >
          <X aria-hidden="true" size={18} strokeWidth={1.6} />
        </button>
      </div>
      <div className="mt-3">
        <ProofList skill={skill} compact />
      </div>
    </div>
  );
};
