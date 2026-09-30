import { useCallback, useEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { resolveEntities, skillGroups, type Skill } from '../../data';
import { useMediaQuery, useReducedMotion } from '../../hooks';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { pad2 } from '../../lib/text';
import { SectionHeader, sectionNumber } from '../ui/SectionHeader';
import { SkillMap } from '../skills/SkillMap';
import { ProofDrawer, ProofPanel } from '../skills/SkillProofs';
import { Toolbox } from '../skills/Toolbox';

const PANEL_ID = 'skills-proofs';
const DRAWER_ID = 'skills-proofs-inline';

const allSkills = skillGroups.flatMap((g) => g.items);
const findSkill = (id: string | null) => (id ? allSkills.find((s) => s.id === id) ?? null : null);
const groupOf = (id: string | null) => (id ? skillGroups.find((g) => g.items.some((s) => s.id === id)) ?? null : null);
const proofTotal = new Set(allSkills.flatMap((s) => resolveEntities(s.evidence).map((e) => e.id))).size;

interface ChipProps {
  skill: Skill;
  pressed: boolean;
  previewed: boolean;
  controls: string;
  onSelect: (id: string) => void;
  onPreview: (id: string | null) => void;
}

const SkillChip = ({ skill, pressed, previewed, controls, onSelect, onPreview }: ChipProps) => {
  const { l } = useI18n();
  const t = useT('skills');
  const count = resolveEntities(skill.evidence).length;
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-controls={controls}
      onClick={() => onSelect(skill.id)}
      onPointerEnter={(e: PointerEvent) => e.pointerType === 'mouse' && onPreview(skill.id)}
      onPointerLeave={(e: PointerEvent) => e.pointerType === 'mouse' && onPreview(null)}
      onFocus={(e: FocusEvent<HTMLButtonElement>) => e.currentTarget.matches(':focus-visible') && onPreview(skill.id)}
      onBlur={() => onPreview(null)}
      className={cn(
        'group/chip relative inline-flex min-h-11 items-center gap-2.5 border px-3.5 text-left text-[0.92rem] leading-tight transition-[color,background-color,border-color] duration-300 ease-out-expo xl:min-h-10 xl:px-3',
        pressed
          ? 'border-ink bg-ink text-bg'
          : previewed
            ? 'border-ink text-ink'
            : 'border-line text-ink-2 hover:border-ink hover:text-ink',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'h-1.5 w-1.5 shrink-0 bg-accent transition-[transform,margin] duration-500 ease-out-expo',
          pressed ? 'scale-100' : '-mr-4 scale-0',
        )}
      />
      <span>{l(skill.name)}</span>
      <span
        aria-hidden="true"
        className={cn('font-mono text-[0.6875rem] tabular transition-colors duration-300', pressed ? 'text-bg/70' : 'text-ink-3')}
      >
        {count}
      </span>
      <span className="sr-only">, {t.skillsProofs(count)}</span>
    </button>
  );
};

export default function Skills() {
  const { l } = useI18n();
  const t = useT('skills');
  const reduced = useReducedMotion();
  const wide = useMediaQuery('(min-width: 1280px)');
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const clearTimer = useRef(0);

  // Leaving one skill for the next should not flash the idle state in between.
  const preview = useCallback((id: string | null) => {
    window.clearTimeout(clearTimer.current);
    if (id) setHovered(id);
    else clearTimer.current = window.setTimeout(() => setHovered(null), 140);
  }, []);
  useEffect(() => () => window.clearTimeout(clearTimer.current), []);

  // Clicking the pinned skill again releases it (and drops its preview).
  const select = useCallback(
    (id: string) => {
      window.clearTimeout(clearTimer.current);
      if (selected === id) {
        setSelected(null);
        setHovered(null);
      } else {
        setSelected(id);
      }
    },
    [selected],
  );

  const clear = useCallback(() => {
    window.clearTimeout(clearTimer.current);
    setSelected(null);
    setHovered(null);
  }, []);

  const active = hovered ?? selected;
  const activeSkill = findSkill(active);
  const selectedSkill = findSkill(selected);
  const stats = useMemo(() => ({ skills: allSkills.length, groups: skillGroups.length, proofs: proofTotal }), []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && selected) clear();
  };

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative py-section">
      <div className="container-site">
        <SectionHeader
          id="skills"
          label={t.skillsLabel}
          title={<span id="skills-title">{t.skillsTitle}</span>}
          intro={l(t.skillsIntro)}
        />

        <div className="grid gap-y-12 md:gap-y-16 xl:grid-cols-12 xl:gap-x-10">
          {/* Primary, accessible UI: skills as toggle buttons, grouped by field */}
          <div className="order-2 xl:order-1 xl:col-span-4" onKeyDown={onKeyDown}>
            {skillGroups.map((g, gi) => {
              const openHere = selectedSkill && g.items.some((s) => s.id === selectedSkill.id);
              return (
                <div
                  key={g.id}
                  className={cn('border-t border-line pt-4 md:grid md:grid-cols-12 md:gap-x-10 xl:block', gi > 0 && 'mt-8 md:mt-10')}
                >
                  <h3 className="label flex items-center gap-2.5 md:col-span-3 md:self-start md:pt-3.5 xl:pt-0">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'h-2 w-2 rotate-45 transition-colors duration-500',
                        activeSkill && groupOf(activeSkill.id)?.id === g.id ? 'bg-accent' : 'bg-ink',
                      )}
                    />
                    <span className="text-ink-2">{l(g.label)}</span>
                    <span className="tabular text-ink-3/80">{pad2(g.items.length)}</span>
                  </h3>
                  <div className="md:col-span-9">
                    <ul className="mt-4 flex flex-wrap gap-2 md:mt-0 xl:mt-4">
                      {g.items.map((s) => (
                        <li key={s.id}>
                          <SkillChip
                            skill={s}
                            pressed={selected === s.id}
                            previewed={active === s.id}
                            controls={wide ? PANEL_ID : DRAWER_ID}
                            onSelect={select}
                            onPreview={preview}
                          />
                        </li>
                      ))}
                    </ul>
                    {openHere && selectedSkill && (
                      <div className="xl:hidden">
                        <ProofDrawer id={DRAWER_ID} skill={selectedSkill} onClear={clear} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <p className="sr-only" aria-live="polite">
              {selectedSkill ? `${l(selectedSkill.name)}, ${t.skillsProofs(resolveEntities(selectedSkill.evidence).length)}` : ''}
            </p>
          </div>

          {/* The map (a visual mirror of the list) and, on wide screens, the proofs panel */}
          <div className="order-1 xl:order-2 xl:col-span-8">
            <div className="border border-line">
              <SkillMap active={active} selected={selected} onHover={preview} onSelect={select} animate={!reduced} />
            </div>
            <MapLegend />
            <div className="mt-10 hidden xl:block">
              <ProofPanel
                id={PANEL_ID}
                skill={activeSkill}
                group={groupOf(active)}
                pinned={Boolean(selected)}
                onClear={clear}
                stats={stats}
              />
            </div>
          </div>
        </div>

        <Toolbox index={`${sectionNumber('skills')}.2`} />
      </div>
    </section>
  );
}

const MapLegend = () => {
  const t = useT('skills');
  return (
    <ul aria-hidden="true" className="label mt-3 hidden flex-wrap items-center gap-x-6 gap-y-2 md:flex">
      <li className="flex items-center gap-2">
        <span className="h-2 w-2 rotate-45 bg-ink" />
        {t.skillsMapLegendGroup}
      </li>
      <li className="flex items-center gap-2">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-ink" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink" />
        </span>
        {t.skillsMapLegendSkill}
      </li>
      <li className="flex items-center gap-2">
        <svg width="22" height="6" viewBox="0 0 22 6" className="text-accent">
          <line x1="0" y1="3" x2="22" y2="3" stroke="currentColor" strokeDasharray="3 3" />
        </svg>
        {t.skillsMapLegendShared}
      </li>
    </ul>
  );
};
