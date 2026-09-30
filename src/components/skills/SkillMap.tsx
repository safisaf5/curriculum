import { memo, useMemo } from 'react';
import { skillGroups } from '../../data';
import { useReveal } from '../../hooks';
import { useI18n } from '../../i18n';
import { cn } from '../../lib/cn';
import { pad2 } from '../../lib/text';
import { CORNERS, LABEL_SIZE, MAP_CX, MAP_CY, MAP_H, MAP_W, RELATED, getMapLayout, type MapNode } from './layout';

/**
 * The skills constellation: a visual mirror of the skill list, hidden from
 * assistive technology (every interaction here also exists on the buttons).
 *
 * One SVG for every screen. From md up it is labelled and reacts to the
 * pointer; below md it becomes a compact plate (no labels, bigger marks,
 * no pointer events) that still follows the selection.
 *
 * Styling is hoisted to the root with attribute hooks to keep the
 * prerendered HTML small:
 *   data-e  element fades in when the plate enters the viewport
 *   data-s  ...and grows from its hub (spokes)
 *   data-n  mark scaled up on the compact plate
 */

type NodeState = 'idle' | 'active' | 'related' | 'dim';

const TICK = 50;
const ticksX = Array.from({ length: MAP_W / TICK - 1 }, (_, i) => (i + 1) * TICK).filter((x) => x !== MAP_CX);
const ticksY = Array.from({ length: MAP_H / TICK - 1 }, (_, i) => (i + 1) * TICK).filter((y) => y !== MAP_CY);

const Grid = memo(function Grid() {
  return (
    <g fill="none">
      <line x1={0} y1={MAP_CY} x2={MAP_W} y2={MAP_CY} className="stroke-line" />
      <line x1={MAP_CX} y1={0} x2={MAP_CX} y2={MAP_H} className="stroke-line" />
      <g className="stroke-ink-3" strokeOpacity={0.45}>
        {ticksX.map((x) => (
          <line key={`x${x}`} data-n="" x1={x} y1={MAP_CY - 3} x2={x} y2={MAP_CY + 3} />
        ))}
        {ticksY.map((y) => (
          <line key={`y${y}`} data-n="" x1={MAP_CX - 3} y1={y} x2={MAP_CX + 3} y2={y} />
        ))}
      </g>
      <circle data-n="" cx={MAP_CX} cy={MAP_CY} r={9} className="stroke-ink-3" />
      <circle cx={MAP_CX} cy={MAP_CY} r={286} className="stroke-ink-3" strokeOpacity={0.35} strokeDasharray="2 7" />
    </g>
  );
});

/** Curved link between two skills that share a proof, bowed towards the centre. */
const linkPath = (a: MapNode, b: MapNode) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  return `M${a.x} ${a.y}Q${(mx + (MAP_CX - mx) * 0.35).toFixed(1)} ${(my + (MAP_CY - my) * 0.35).toFixed(1)} ${b.x} ${b.y}`;
};

const diamond = (x: number, y: number, r: number) => `${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`;

const SPOKE_OPACITY: Record<NodeState, number> = { idle: 0.22, active: 1, related: 0.32, dim: 0.07 };

interface SkillMapProps {
  /** Highlighted skill (hovered, focused or selected). */
  active: string | null;
  /** Pinned skill: keeps its ring while another one is previewed. */
  selected: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  /** Stagger the entrance (false for reduced motion). */
  animate?: boolean;
  className?: string;
}

export const SkillMap = memo(function SkillMap({ active, selected, onHover, onSelect, animate = true, className }: SkillMapProps) {
  const { lang, l } = useI18n();
  const layout = getMapLayout(lang);
  const ref = useReveal<HTMLDivElement>();

  const activeNode = active ? layout.byId[active] : undefined;
  const related = useMemo(() => (active ? RELATED[active] ?? {} : {}), [active]);
  const activeGroup = activeNode?.group ?? null;
  const hubs = useMemo(() => Object.fromEntries(layout.hubs.map((h) => [h.id, h])), [layout]);

  const stateOf = (id: string): NodeState => (!active ? 'idle' : id === active ? 'active' : related[id] ? 'related' : 'dim');
  const groupDelay = (g: string) => skillGroups.findIndex((x) => x.id === g) * 140;
  const delay = (ms: number) => ({ transitionDelay: animate ? `${ms}ms` : '0ms' });

  const hover = (id: string | null) => (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') onHover?.(id);
  };

  return (
    <div
      ref={ref}
      className={cn(
        'relative',
        '[&_[data-e]]:transition-[opacity,transform] [&_[data-e]]:duration-1000 [&_[data-e]]:ease-out-expo',
        '[.js_&:not(.is-in)_[data-e]]:opacity-0 [.js_&:not(.is-in)_[data-s]]:scale-0',
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        aria-hidden="true"
        focusable="false"
        className={cn(
          'block h-auto w-full select-none overflow-visible max-md:pointer-events-none',
          '[&_*]:transition-[fill,stroke,opacity,stroke-opacity,stroke-width] [&_*]:duration-500 [&_*]:ease-out-expo',
          '[&_line]:[vector-effect:non-scaling-stroke] [&_path]:[vector-effect:non-scaling-stroke] [&_circle]:[vector-effect:non-scaling-stroke]',
          'max-md:[&_[data-n]]:origin-center max-md:[&_[data-n]]:scale-[2.4] max-md:[&_[data-n]]:[transform-box:fill-box]',
        )}
      >
        <Grid />

        {/* Quadrant captions */}
        {skillGroups.map((g) => {
          const c = CORNERS[g.id];
          return (
            <text
              key={g.id}
              x={c.x}
              y={c.y}
              textAnchor={c.anchor}
              className={cn(
                'font-mono text-[13px] font-medium uppercase tracking-[0.16em] max-md:text-[32px] max-md:tracking-[0.08em]',
                activeGroup === g.id ? 'fill-accent-ink' : 'fill-ink-2',
              )}
            >
              {l(g.label)}
              <tspan dx={10} className="fill-ink-3">
                {pad2(g.items.length)}
              </tspan>
            </text>
          );
        })}

        {/* Hub → skill spokes */}
        <g fill="none">
          {layout.nodes.map((n) => {
            const hub = hubs[n.group];
            const s = stateOf(n.id);
            return (
              <g
                key={n.id}
                data-e=""
                data-s=""
                style={{ transformOrigin: `${hub.x}px ${hub.y}px`, transformBox: 'view-box', ...delay(groupDelay(n.group) + n.index * 45) }}
              >
                <line
                  x1={hub.x}
                  y1={hub.y}
                  x2={n.x}
                  y2={n.y}
                  className={s === 'active' ? 'stroke-accent' : 'stroke-ink'}
                  strokeWidth={s === 'active' ? 1.6 : 1}
                  strokeOpacity={SPOKE_OPACITY[s]}
                />
              </g>
            );
          })}
        </g>

        {/* Shared proofs of the highlighted skill */}
        {activeNode && (
          <g key={activeNode.id} fill="none" className="stroke-accent animate-fade-in" strokeOpacity={0.75} strokeDasharray="3 5">
            {Object.keys(related).map((id) =>
              layout.byId[id] ? (
                <path key={id} d={linkPath(activeNode, layout.byId[id])} strokeWidth={related[id] > 1 ? 1.4 : 1} />
              ) : null,
            )}
          </g>
        )}

        {/* Hubs */}
        {layout.hubs.map((h) => (
          <g key={h.id} data-e="" style={delay(groupDelay(h.id))}>
            <polygon data-n="" points={diamond(h.x, h.y, 8.5)} className={activeGroup === h.id ? 'fill-accent' : 'fill-ink'} />
          </g>
        ))}

        {/* Skill nodes */}
        {layout.nodes.map((n) => {
          const s = stateOf(n.id);
          return (
            <g
              key={n.id}
              data-e=""
              style={delay(groupDelay(n.group) + 260 + n.index * 45)}
              className="cursor-pointer"
              onPointerEnter={hover(n.id)}
              onPointerLeave={hover(null)}
              onClick={() => onSelect?.(n.id)}
            >
              <g style={{ opacity: s === 'dim' ? 0.18 : 1 }}>
                <circle cx={n.x} cy={n.y} r={Math.max(18, n.r + 8)} fill="transparent" />
                <circle
                  data-n=""
                  cx={n.x}
                  cy={n.y}
                  r={n.r + 6}
                  fill="none"
                  strokeWidth={1.2}
                  className="stroke-accent"
                  style={{ opacity: selected === n.id || s === 'active' ? 1 : 0 }}
                />
                <circle data-n="" cx={n.x} cy={n.y} r={n.r} className={s === 'active' ? 'fill-accent' : 'fill-ink'} />
              </g>
            </g>
          );
        })}

        {/* Labels, on top of every line (hidden on the compact plate) */}
        <g
          className="font-medium tracking-[-0.01em] [paint-order:stroke] [stroke-linejoin:round] max-md:hidden"
          style={{ fontSize: LABEL_SIZE, stroke: 'rgb(var(--c-bg))', strokeWidth: 5 }}
        >
          {layout.nodes.map((n) => {
            const s = stateOf(n.id);
            return (
              <g key={n.id} data-e="" style={delay(groupDelay(n.group) + 300 + n.index * 45)}>
                <text
                  x={n.lx}
                  y={n.ly}
                  textAnchor={n.anchor}
                  className={cn('cursor-pointer', s === 'active' || s === 'related' ? 'fill-ink' : 'fill-ink-2')}
                  style={{ opacity: s === 'dim' ? 0.2 : 1 }}
                  onPointerEnter={hover(n.id)}
                  onPointerLeave={hover(null)}
                  onClick={() => onSelect?.(n.id)}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
});
