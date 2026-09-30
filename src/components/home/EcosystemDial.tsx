import { memo, useEffect, useMemo, useRef } from 'react';
import { profile, resolveEntities, type EntityInfo, type Universe } from '../../data';
import { useFinePointer, useReducedMotion, useZonedClock } from '../../hooks';
import { useI18n, useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { SmartLink } from '../ui/SmartLink';

/**
 * "Ecosystem dial": a watch dial (Geneva, precision, horology) used as a map.
 *  - the four universes sit at 12, 3, 6 and 9 o'clock;
 *  - every project / proof listed in profile.universes is a node, wired to
 *    each universe it belongs to (the connections between disciplines);
 *  - the hands show the live time in Geneva (10:10:30 before hydration);
 *  - on desktop, three layers drift with the pointer for a hint of depth.
 * Everything is derived from /src/data. Mobile and reduced motion get a
 * static, lighter version.
 */

const SIZE = 640;
const C = SIZE / 2;
const R_TICK_OUT = 262;
const R_TICK_IN = 250;
const R_LABEL = 290;
const R_NODE = [162, 112];

const ANGLES: Record<Universe['id'], number> = {
  tech: -90,
  business: 0,
  communication: 90,
  creative: 180,
};

/** Short labels for long entity titles (display only). */
const SHORT: Record<string, { fr: string; en: string }> = {
  'heg-scala-iot': { fr: 'Scala & IoT', en: 'Scala & IoT' },
  'ifage-cafetier': { fr: 'Patente de cafetier', en: 'Restaurant licence' },
  'eloquence-2024': { fr: 'Éloquence, 2e prix', en: 'Eloquence, 2nd prize' },
  'rts-2024': { fr: 'RTS', en: 'RTS' },
  'ai-workshop-2025': { fr: 'Atelier IA', en: 'AI workshop' },
  geunes: { fr: 'Président GEunes', en: 'GEunes president' },
  rolex: { fr: 'Stage Rolex', en: 'Rolex internship' },
};

const rad = (deg: number) => (deg * Math.PI) / 180;
const polar = (r: number, deg: number) => ({ x: C + r * Math.cos(rad(deg)), y: C + r * Math.sin(rad(deg)) });

interface DialNode {
  entity: EntityInfo;
  universes: Universe['id'][];
  x: number;
  y: number;
  angle: number;
}

const ORDER: Universe['id'][] = ['tech', 'business', 'communication', 'creative'];

/**
 * Nodes are spread evenly around the dial, grouped by their first universe
 * and centred on that universe's hour marker. Radii alternate to avoid
 * label collisions.
 */
const useDialLayout = () =>
  useMemo(() => {
    const owner = new Map<string, Universe['id']>();
    const memberships = new Map<string, Universe['id'][]>();
    for (const u of profile.universes) {
      for (const id of u.evidence) {
        if (!owner.has(id)) owner.set(id, u.id);
        memberships.set(id, [...(memberships.get(id) ?? []), u.id]);
      }
    }
    const groups = ORDER.map((uid) => {
      const u = profile.universes.find((x) => x.id === uid);
      return u ? resolveEntities(u.evidence.filter((id) => owner.get(id) === uid)).map((entity) => ({ entity, uid })) : [];
    });
    const flat = groups.flat();
    const step = 360 / Math.max(flat.length, 1);
    const nodes: DialNode[] = [];
    let index = 0;
    groups.forEach((group, g) => {
      const center = ANGLES[ORDER[g]];
      group.forEach(({ entity, uid }, i) => {
        const angle = center + (i - (group.length - 1) / 2) * step;
        const r = R_NODE[index % 2];
        const { x, y } = polar(r, angle);
        nodes.push({ entity, universes: memberships.get(entity.id) ?? [uid], x, y, angle });
        index += 1;
      });
    });
    return nodes;
  }, []);

const Ticks = memo(function Ticks() {
  return (
    <g className="text-ink-3" stroke="currentColor">
      {Array.from({ length: 60 }, (_, i) => {
        const major = i % 5 === 0;
        const a = i * 6 - 90;
        const p1 = polar(major ? R_TICK_IN - 10 : R_TICK_IN, a);
        const p2 = polar(R_TICK_OUT, a);
        return (
          <line
            key={i}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            strokeWidth={major ? 2.2 : 1}
            strokeOpacity={major ? 0.9 : 0.45}
          />
        );
      })}
      <circle cx={C} cy={C} r={R_TICK_OUT + 12} fill="none" strokeOpacity={0.25} strokeWidth={1} />
      <circle cx={C} cy={C} r={R_NODE[1] - 34} fill="none" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="2 6" />
    </g>
  );
});

/** Live Geneva time. Before hydration the hands rest at 10:10:30, like in watch photography. */
const Hands = ({ reduced }: { reduced: boolean }) => {
  const time = useZonedClock(profile.location.timeZone);
  const h = time?.h ?? 10;
  const m = time?.m ?? 10;
  const s = time?.s ?? 30;
  const hourDeg = ((h % 12) + m / 60) * 30;
  const minDeg = (m + s / 60) * 6;
  const secDeg = s * 6;
  return (
    <g>
      <g style={{ transform: `rotate(${hourDeg}deg)`, transformOrigin: `${C}px ${C}px` }}>
        <line x1={C} y1={C + 14} x2={C} y2={C - 70} className="stroke-ink" strokeWidth={6} strokeLinecap="square" />
      </g>
      <g style={{ transform: `rotate(${minDeg}deg)`, transformOrigin: `${C}px ${C}px` }}>
        <line x1={C} y1={C + 18} x2={C} y2={C - 112} className="stroke-ink" strokeWidth={3.5} strokeLinecap="square" />
      </g>
      {!reduced && (
        <g style={{ transform: `rotate(${secDeg}deg)`, transformOrigin: `${C}px ${C}px` }}>
          <line x1={C} y1={C + 30} x2={C} y2={C - 96} className="stroke-accent" strokeWidth={1.6} />
          <circle cx={C} cy={C - 104} r={7} className="fill-accent" />
        </g>
      )}
      <circle cx={C} cy={C} r={5} className="fill-bg stroke-ink" strokeWidth={2} />
    </g>
  );
};

interface EcosystemDialProps {
  active: Universe['id'] | null;
  onActivate: (id: Universe['id'] | null) => void;
  className?: string;
  /** Element whose pointer movement drives the parallax (defaults to the dial). */
  pointerTarget?: React.RefObject<HTMLElement>;
}

export const EcosystemDial = ({ active, onActivate, className, pointerTarget }: EcosystemDialProps) => {
  const { l, lang } = useI18n();
  const t = useT('home');
  const nodes = useDialLayout();
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const layers = useRef<(SVGGElement | null)[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Pointer parallax: three layers, lerped in a rAF loop that stops when idle.
  useEffect(() => {
    if (!fine || reduced) return;
    const target = (pointerTarget?.current ?? svgRef.current) as HTMLElement | null;
    if (!target) return;
    const depth = [4, 9, 16];
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let frame = 0;
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layers.current.forEach((g, i) => {
        if (g) g.style.transform = `translate3d(${(cx * depth[i]).toFixed(2)}px, ${(cy * depth[i]).toFixed(2)}px, 0)`;
      });
      frame = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const rect = target.getBoundingClientRect();
      tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      if (!frame) frame = requestAnimationFrame(loop);
    };
    target.addEventListener('pointermove', onMove, { passive: true });
    target.addEventListener('pointerleave', onLeave);
    return () => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [fine, reduced, pointerTarget]);

  const isLit = (universes: Universe['id'][]) => !active || universes.includes(active);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="group"
      aria-label={t.dialLabel}
      className={cn('h-auto w-full select-none overflow-visible', className)}
    >
      {/* Layer 0: dial */}
      <g ref={(el) => (layers.current[0] = el)} className="will-change-transform">
        <Ticks />
      </g>

      {/* Layer 1: connections */}
      <g ref={(el) => (layers.current[1] = el)} className="will-change-transform" fill="none">
        {nodes.flatMap((n) =>
          n.universes.map((u) => {
            const anchor = polar(R_TICK_IN - 18, ANGLES[u]);
            const lit = isLit([u]) && (!active || n.universes.includes(active));
            return (
              <path
                key={`${n.entity.id}-${u}`}
                d={`M ${n.x} ${n.y} Q ${(n.x + anchor.x) / 2 + (C - (n.x + anchor.x) / 2) * 0.35} ${(n.y + anchor.y) / 2 + (C - (n.y + anchor.y) / 2) * 0.35} ${anchor.x} ${anchor.y}`}
                className={cn(
                  'transition-[stroke,stroke-opacity] duration-500',
                  active && lit ? 'stroke-accent' : 'stroke-ink',
                )}
                strokeOpacity={active ? (lit ? 0.9 : 0.06) : 0.2}
                strokeWidth={active && lit ? 1.4 : 1}
              />
            );
          }),
        )}
      </g>

      {/* Layer 2: nodes and universe markers */}
      <g ref={(el) => (layers.current[2] = el)} className="will-change-transform">
        {profile.universes.map((u) => {
          const p = polar(R_LABEL, ANGLES[u.id]);
          const m = polar(R_TICK_IN - 18, ANGLES[u.id]);
          const on = active === u.id;
          const side = u.id === 'business' || u.id === 'creative';
          const rotate = u.id === 'business' ? 90 : u.id === 'creative' ? -90 : 0;
          const ly = u.id === 'tech' ? p.y + 4 : u.id === 'communication' ? p.y + 6 : p.y;
          return (
            <g
              key={u.id}
              onPointerEnter={() => onActivate(u.id)}
              onPointerLeave={() => onActivate(null)}
              className="cursor-default"
            >
              <rect
                x={m.x - 5}
                y={m.y - 5}
                width={10}
                height={10}
                className={cn('transition-colors duration-300', on ? 'fill-accent' : 'fill-ink')}
                transform={`rotate(45 ${m.x} ${m.y})`}
              />
              <text
                x={p.x}
                y={ly}
                textAnchor="middle"
                dominantBaseline={side ? 'middle' : u.id === 'tech' ? 'auto' : 'hanging'}
                transform={rotate ? `rotate(${rotate} ${p.x} ${ly})` : undefined}
                className={cn(
                  'font-mono text-[24px] font-medium uppercase tracking-[0.12em] transition-colors duration-300 sm:text-[15px] sm:tracking-[0.14em]',
                  on ? 'fill-accent-ink' : 'fill-ink-2',
                )}
              >
                {l(u.label)}
              </text>
            </g>
          );
        })}

        {nodes.map((n, i) => {
          const lit = isLit(n.universes);
          const cos = Math.cos(rad(n.angle));
          const sin = Math.sin(rad(n.angle));
          const anchor = cos > 0.35 ? 'start' : cos < -0.35 ? 'end' : 'middle';
          const lx = n.x + (anchor === 'start' ? 11 : anchor === 'end' ? -11 : 0);
          const ly = n.y + (anchor === 'middle' ? (sin < 0 ? -13 : 22) : 5);
          const label = SHORT[n.entity.id]?.[lang] ?? l(n.entity.title);
          // External links (e.g. a TV replay) stay in the page: the media section lists them
          const href = n.entity.external ? '/#media' : (n.entity.href ?? '/');
          return (
            <SmartLink
              key={n.entity.id}
              to={href}
              aria-label={`${label}${n.entity.subtitle ? `, ${l(n.entity.subtitle)}` : ''}`}
              className="group outline-none"
              onFocus={() => onActivate(n.universes[0])}
              onBlur={() => onActivate(null)}
            >
              <g className="animate-fade-in" style={{ animationDelay: reduced ? '0ms' : `${500 + i * 55}ms` }}>
              <g style={{ opacity: lit ? 1 : 0.22, transition: 'opacity 0.5s' }}>
                <circle cx={n.x} cy={n.y} r={16} className="fill-transparent" />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={5}
                  className={cn(
                    'transition-all duration-300 group-hover:fill-accent group-focus-visible:fill-accent',
                    active && lit ? 'fill-accent' : 'fill-ink',
                  )}
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={11}
                  fill="none"
                  className="stroke-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  strokeWidth={1.5}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor={anchor}
                  className="fill-ink text-[15px] font-medium tracking-[-0.01em] [paint-order:stroke] [stroke-linejoin:round] group-hover:fill-accent-ink max-sm:hidden"
                  style={{ stroke: 'rgb(var(--c-bg))', strokeWidth: 5 }}
                >
                  {label}
                </text>
              </g>
              </g>
            </SmartLink>
          );
        })}
      </g>

      <Hands reduced={reduced} />
    </svg>
  );
};
