/** @jsxRuntime automatic @jsxImportSource react */
/**
 * Line motifs for the generated Open Graph images, one per `cover.motif`,
 * plus the watch dial of the home image. Pure SVG drawn on a 240 x 240 box:
 * ink hairlines, one vermilion detail. Deterministic (seeded by the slug).
 */
import type { ReactElement } from 'react';
import type { CoverMotif } from '../../src/data';

export const OG = {
  paper: '#F3F1EC',
  ink: '#0E0E0F',
  ink2: '#4A4844',
  ink3: '#6B6862',
  line: '#D6D2C9',
  accent: '#E23D1E',
  accentInk: '#B32A0E',
};

/** Small deterministic PRNG (mulberry32) seeded from a string. */
export const seeded = (seed: string) => {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const r2 = (n: number) => Math.round(n * 100) / 100;
const rad = (deg: number) => (deg * Math.PI) / 180;
const polar = (cx: number, cy: number, r: number, deg: number) => ({ x: r2(cx + r * Math.cos(rad(deg))), y: r2(cy + r * Math.sin(rad(deg))) });

// ── Watch dial ─────────────────────────────────────────────────

export interface DialNode {
  x: number;
  y: number;
  anchors: { x: number; y: number }[];
  lit: boolean;
}

/**
 * The hero's dial on paper: 60 ticks, four hour markers, hands at 10:10:30
 * (watch photography), optional nodes wired to the markers.
 */
export const Dial = ({ size, nodes = [], markers = [], litMarker }: { size: number; nodes?: DialNode[]; markers?: { x: number; y: number }[]; litMarker?: number }) => {
  const c = 120;
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const major = i % 5 === 0;
    const a = i * 6 - 90;
    const p1 = polar(c, c, major ? 92 : 97, a);
    const p2 = polar(c, c, 102, a);
    return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={OG.ink3} strokeWidth={major ? 1.3 : 0.6} strokeOpacity={major ? 0.95 : 0.55} />;
  });
  const hand = (deg: number, length: number, tail: number) => {
    const tip = polar(c, c, length, deg - 90);
    const back = polar(c, c, tail, deg + 90);
    return { x1: back.x, y1: back.y, x2: tip.x, y2: tip.y };
  };
  const hourDeg = (10 + 10 / 60) * 30;
  const minDeg = (10 + 30 / 60) * 6;
  const secDeg = 30 * 6;
  const secDot = polar(c, c, 63, secDeg - 90);
  return (
    <svg width={size} height={size} viewBox="0 0 240 240">
      <circle cx={c} cy={c} r={107} fill="none" stroke={OG.ink3} strokeOpacity={0.3} strokeWidth={0.6} />
      <circle cx={c} cy={c} r={30} fill="none" stroke={OG.ink3} strokeOpacity={0.35} strokeWidth={0.6} strokeDasharray="1 3" />
      {ticks}
      {nodes.flatMap((n, i) =>
        n.anchors.map((a, j) => {
          const qx = r2((n.x + a.x) / 2 + (c - (n.x + a.x) / 2) * 0.35);
          const qy = r2((n.y + a.y) / 2 + (c - (n.y + a.y) / 2) * 0.35);
          return (
            <path
              key={`${i}-${j}`}
              d={`M ${n.x} ${n.y} Q ${qx} ${qy} ${a.x} ${a.y}`}
              fill="none"
              stroke={n.lit ? OG.accent : OG.ink}
              strokeOpacity={n.lit ? 0.85 : 0.16}
              strokeWidth={n.lit ? 0.9 : 0.6}
            />
          );
        }),
      )}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={2.4} fill={n.lit ? OG.accent : OG.ink} fillOpacity={n.lit ? 1 : 0.55} />
      ))}
      {markers.map((m, i) => (
        <rect key={i} x={m.x - 3} y={m.y - 3} width={6} height={6} fill={i === litMarker ? OG.accent : OG.ink} transform={`rotate(45 ${m.x} ${m.y})`} />
      ))}
      <line {...hand(hourDeg, 44, 8)} stroke={OG.ink} strokeWidth={3.6} strokeLinecap="square" />
      <line {...hand(minDeg, 68, 10)} stroke={OG.ink} strokeWidth={2.2} strokeLinecap="square" />
      <line {...hand(secDeg, 58, 18)} stroke={OG.accent} strokeWidth={1} />
      <circle cx={secDot.x} cy={secDot.y} r={4.2} fill={OG.accent} />
      <circle cx={c} cy={c} r={3.2} fill={OG.paper} stroke={OG.ink} strokeWidth={1.3} />
    </svg>
  );
};

// ── Project motifs ─────────────────────────────────────────────

const Network = ({ rand }: { rand: () => number }) => {
  // A small neural network: 3 → 5 → 4 → 2, one path lit.
  const layers = [3, 5, 4, 2];
  const cols = layers.map((count, li) => {
    const x = 28 + li * 61;
    return Array.from({ length: count }, (_, i) => ({ x, y: r2(120 + (i - (count - 1) / 2) * 38 + (rand() - 0.5) * 6) }));
  });
  const lit = cols.map((col) => Math.floor(rand() * col.length));
  const edges: ReactElement[] = [];
  for (let l = 0; l < cols.length - 1; l++) {
    cols[l].forEach((a, i) =>
      cols[l + 1].forEach((b, j) => {
        const on = lit[l] === i && lit[l + 1] === j;
        edges.push(
          <line key={`${l}-${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={on ? OG.accent : OG.ink} strokeOpacity={on ? 1 : 0.22} strokeWidth={on ? 1.4 : 0.7} />,
        );
      }),
    );
  }
  return (
    <g>
      {edges}
      {cols.flatMap((col, l) =>
        col.map((n, i) => (
          <circle key={`${l}-${i}`} cx={n.x} cy={n.y} r={lit[l] === i ? 6 : 5} fill={lit[l] === i ? OG.accent : OG.paper} stroke={lit[l] === i ? OG.accent : OG.ink} strokeWidth={1.3} />
        )),
      )}
    </g>
  );
};

const Circuit = ({ rand }: { rand: () => number }) => {
  // A chip with traces leaving on four sides, ending in pads.
  const chip = { x: 84, y: 84, s: 72 };
  const traces: ReactElement[] = [];
  const pads: ReactElement[] = [];
  const litIndex = Math.floor(rand() * 12);
  let k = 0;
  for (const side of ['top', 'right', 'bottom', 'left'] as const) {
    for (let i = 0; i < 3; i++) {
      const offset = chip.x + 14 + i * 22;
      const bend = 18 + Math.floor(rand() * 3) * 12;
      const dir = i === 0 ? -1 : i === 2 ? 1 : 0;
      let d = '';
      let end = { x: 0, y: 0 };
      if (side === 'top') {
        end = { x: offset + dir * 34, y: 14 };
        d = `M ${offset} ${chip.y} V ${chip.y - bend} L ${end.x} ${chip.y - bend - Math.abs(dir) * 34} V ${end.y}`;
      } else if (side === 'bottom') {
        end = { x: offset + dir * 34, y: 226 };
        d = `M ${offset} ${chip.y + chip.s} V ${chip.y + chip.s + bend} L ${end.x} ${chip.y + chip.s + bend + Math.abs(dir) * 34} V ${end.y}`;
      } else if (side === 'left') {
        end = { x: 14, y: offset + dir * 34 };
        d = `M ${chip.x} ${offset} H ${chip.x - bend} L ${chip.x - bend - Math.abs(dir) * 34} ${end.y} H ${end.x}`;
      } else {
        end = { x: 226, y: offset + dir * 34 };
        d = `M ${chip.x + chip.s} ${offset} H ${chip.x + chip.s + bend} L ${chip.x + chip.s + bend + Math.abs(dir) * 34} ${end.y} H ${end.x}`;
      }
      const on = k === litIndex;
      traces.push(<path key={`t${k}`} d={d} fill="none" stroke={on ? OG.accent : OG.ink} strokeOpacity={on ? 1 : 0.55} strokeWidth={on ? 1.6 : 1} />);
      pads.push(<circle key={`p${k}`} cx={end.x} cy={end.y} r={4.5} fill={on ? OG.accent : OG.paper} stroke={on ? OG.accent : OG.ink} strokeWidth={1.2} />);
      k++;
    }
  }
  return (
    <g>
      {traces}
      {pads}
      <rect x={chip.x} y={chip.y} width={chip.s} height={chip.s} fill={OG.ink} />
      <circle cx={chip.x + 10} cy={chip.y + 10} r={2.5} fill={OG.paper} />
    </g>
  );
};

const Scan = () => {
  // An identity card with its machine readable zone and a scan line.
  const chevrons = (y: number, count: number, from: number) =>
    Array.from({ length: count }, (_, i) => (
      <path key={`${y}-${i}`} d={`M ${from + i * 7} ${y - 3} L ${from + i * 7 + 3} ${y} L ${from + i * 7} ${y + 3}`} fill="none" stroke={OG.ink} strokeWidth={0.9} />
    ));
  return (
    <g>
      <rect x={16} y={52} width={208} height={136} fill="none" stroke={OG.ink} strokeWidth={1.3} rx={6} />
      <rect x={30} y={68} width={46} height={58} fill="none" stroke={OG.ink} strokeWidth={1} />
      <circle cx={53} cy={90} r={9} fill="none" stroke={OG.ink} strokeWidth={1} />
      <path d="M 37 124 Q 53 104 69 124" fill="none" stroke={OG.ink} strokeWidth={1} />
      {[72, 84, 96, 108].map((y, i) => (
        <rect key={y} x={90} y={y} width={i % 2 ? 84 : 118} height={4} fill={OG.ink} fillOpacity={0.75} />
      ))}
      <rect x={16} y={140} width={208} height={48} fill={OG.ink} fillOpacity={0.05} />
      <g>{chevrons(154, 8, 28)}</g>
      <rect x={88} y={151} width={120} height={6} fill={OG.ink} fillOpacity={0.8} />
      <rect x={28} y={167} width={96} height={6} fill={OG.ink} fillOpacity={0.8} />
      <g>{chevrons(170, 11, 132)}</g>
      <line x1={4} y1={146} x2={236} y2={146} stroke={OG.accent} strokeWidth={1.6} />
      {[
        [6, 42, 1, 1],
        [234, 42, -1, 1],
        [6, 198, 1, -1],
        [234, 198, -1, -1],
      ].map(([x, y, sx, sy]) => (
        <path key={`${x}-${y}`} d={`M ${x} ${y + sy * 16} V ${y} H ${x + sx * 16}`} fill="none" stroke={OG.ink} strokeWidth={1.6} />
      ))}
    </g>
  );
};

const Grid = ({ rand }: { rand: () => number }) => {
  // A modular grid, some cells filled: prototypes on a bench.
  const n = 7;
  const step = 30;
  const origin = 15;
  const accent = Math.floor(rand() * n * n);
  const cells: ReactElement[] = [];
  for (let i = 0; i < n * n; i++) {
    const x = origin + (i % n) * step;
    const y = origin + Math.floor(i / n) * step;
    const v = rand();
    if (i === accent) cells.push(<rect key={i} x={x + 4} y={y + 4} width={step - 8} height={step - 8} fill={OG.accent} />);
    else if (v < 0.2) cells.push(<rect key={i} x={x + 4} y={y + 4} width={step - 8} height={step - 8} fill={OG.ink} />);
    else if (v < 0.42) cells.push(<rect key={i} x={x + 4.5} y={y + 4.5} width={step - 9} height={step - 9} fill="none" stroke={OG.ink} strokeWidth={1} />);
    else cells.push(<circle key={i} cx={x + step / 2} cy={y + step / 2} r={1.4} fill={OG.ink} fillOpacity={0.6} />);
  }
  return (
    <g>
      <rect x={origin} y={origin} width={n * step} height={n * step} fill="none" stroke={OG.ink} strokeOpacity={0.35} strokeWidth={0.7} />
      {cells}
    </g>
  );
};

const Thread = () => {
  // Embroidery: running stitches along waves, a row of cross-stitches.
  const wave = (y: number, amp: number, phase: number) => {
    const pts: string[] = [];
    for (let x = 10; x <= 230; x += 4) pts.push(`${x} ${r2(y + Math.sin((x / 220) * Math.PI * 3 + phase) * amp)}`);
    return `M ${pts.join(' L ')}`;
  };
  return (
    <g>
      <path d={wave(62, 16, 0)} fill="none" stroke={OG.ink} strokeWidth={1.4} strokeDasharray="7 5" />
      <path d={wave(104, 16, 0.9)} fill="none" stroke={OG.accent} strokeWidth={1.8} strokeDasharray="7 5" />
      <path d={wave(146, 16, 1.8)} fill="none" stroke={OG.ink} strokeWidth={1.4} strokeDasharray="7 5" />
      {Array.from({ length: 10 }, (_, i) => {
        const x = 20 + i * 22;
        return <path key={i} d={`M ${x - 6} 186 L ${x + 6} 198 M ${x + 6} 186 L ${x - 6} 198`} stroke={OG.ink} strokeWidth={1.3} />;
      })}
      <line x1={10} y1={214} x2={230} y2={214} stroke={OG.ink} strokeOpacity={0.3} strokeWidth={0.7} />
    </g>
  );
};

const Flame = () => {
  // Nested flame outlines, the core in vermilion.
  const flame = (scale: number) => {
    const w = 78 * scale;
    const h = 170 * scale;
    const base = 206;
    const cx = 120;
    const top = base - h;
    return `M ${cx} ${r2(top)} C ${r2(cx + w * 0.35)} ${r2(top + h * 0.28)} ${r2(cx + w)} ${r2(top + h * 0.45)} ${r2(cx + w * 0.8)} ${r2(top + h * 0.78)} C ${r2(cx + w * 0.62)} ${r2(base)} ${r2(cx - w * 0.62)} ${r2(base)} ${r2(cx - w * 0.8)} ${r2(top + h * 0.78)} C ${r2(cx - w)} ${r2(top + h * 0.45)} ${r2(cx - w * 0.35)} ${r2(top + h * 0.28)} ${cx} ${r2(top)} Z`;
  };
  return (
    <g>
      <path d={flame(1)} fill="none" stroke={OG.ink} strokeWidth={1.4} />
      <path d={flame(0.74)} fill="none" stroke={OG.ink} strokeOpacity={0.6} strokeWidth={1.1} />
      <path d={flame(0.48)} fill="none" stroke={OG.ink} strokeOpacity={0.35} strokeWidth={1} />
      <path d={flame(0.24)} fill={OG.accent} />
      <line x1={30} y1={220} x2={210} y2={220} stroke={OG.ink} strokeWidth={1.4} />
    </g>
  );
};

export const Motif = ({ motif, seed, size }: { motif: CoverMotif; seed: string; size: number }) => {
  if (motif === 'dial') return <Dial size={size} />;
  const rand = seeded(seed);
  const body =
    motif === 'network' ? <Network rand={rand} /> :
    motif === 'circuit' ? <Circuit rand={rand} /> :
    motif === 'scan' ? <Scan /> :
    motif === 'thread' ? <Thread /> :
    motif === 'flame' ? <Flame /> :
    <Grid rand={rand} />;
  return (
    <svg width={size} height={size} viewBox="0 0 240 240">
      {body}
    </svg>
  );
};
