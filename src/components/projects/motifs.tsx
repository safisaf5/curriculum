import type { ReactElement } from 'react';
import type { CoverMotif } from '../../data';
import { between, n1, n2, range, rngFor, type Rng } from './random';

/**
 * Generated "spec plates" for projects without a cover image.
 *
 * Every drawing is built from a seeded PRNG (slug hash), so the server and the
 * client produce the exact same SVG. Shapes of the same style are merged into
 * one <path> each: a plate is a handful of DOM nodes, cheap at any size.
 * Colour comes from the tokens only: ink (currentColor, low opacity),
 * bg / bg-2 for knock-outs, and a single accent element per plate.
 */

/** Hairlines stay 1 CSS pixel whatever the rendered size: crisp from thumbnail to full width. */
const NS = '[vector-effect:non-scaling-stroke]';

interface Pt {
  x: number;
  y: number;
}

interface Canvas {
  W: number;
  H: number;
  /** min(W, H): the unit every motif scales with. */
  s: number;
  rng: Rng;
  compact: boolean;
}

const TAU = Math.PI * 2;

const circle = (x: number, y: number, r: number) =>
  `M${n1(x - r)} ${n1(y)}a${n1(r)} ${n1(r)} 0 1 0 ${n1(2 * r)} 0a${n1(r)} ${n1(r)} 0 1 0 ${n1(-2 * r)} 0Z`;
const seg = (a: Pt, b: Pt) => `M${n1(a.x)} ${n1(a.y)}L${n1(b.x)} ${n1(b.y)}`;
const poly = (pts: Pt[], close = false) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${n1(p.x)} ${n1(p.y)}`).join('') + (close ? 'Z' : '');
const square = (x: number, y: number, r: number) => `M${n1(x - r)} ${n1(y - r)}h${n1(2 * r)}v${n1(2 * r)}h${n1(-2 * r)}Z`;
const plus = (x: number, y: number, r: number) => `M${n1(x - r)} ${n1(y)}h${n1(2 * r)}M${n1(x)} ${n1(y - r)}v${n1(2 * r)}`;
/** Four L-shaped corners around a box, like a detection frame. */
const brackets = (x0: number, y0: number, x1: number, y1: number, l: number) =>
  [
    `M${n1(x0)} ${n1(y0 + l)}V${n1(y0)}H${n1(x0 + l)}`,
    `M${n1(x1 - l)} ${n1(y0)}H${n1(x1)}V${n1(y0 + l)}`,
    `M${n1(x1)} ${n1(y1 - l)}V${n1(y1)}H${n1(x1 - l)}`,
    `M${n1(x0 + l)} ${n1(y1)}H${n1(x0)}V${n1(y1 - l)}`,
  ].join('');

/** Registration crosses on a regular grid: drafting paper, barely there. */
const Drafting = ({ W, H, s }: Canvas) => {
  const step = s / 8;
  const x0 = ((W % step) + step) / 2;
  const y0 = ((H % step) + step) / 2;
  let d = '';
  for (let x = x0; x < W; x += step) for (let y = y0; y < H; y += step) d += plus(x, y, s * 0.006);
  return <path d={d} fill="none" stroke="currentColor" strokeOpacity={0.14} className={NS} />;
};

// ── network: nodes + edges (Neuron IA) ──────────────────────────────────────

const network = ({ W, H, s, rng, compact }: Canvas) => {
  const cols = compact ? 4 : W > H ? 10 : 7;
  const rows = compact ? 4 : H > W ? 9 : 6;
  const mx = W * 0.05;
  const my = H * 0.08;
  const cw = (W - 2 * mx) / cols;
  const ch = (H - 2 * my) / rows;
  const nodes: Pt[] = [];
  for (let r = 0; r < rows; r += 1)
    for (let c = 0; c < cols; c += 1) {
      if (rng() < 0.14) continue;
      nodes.push({ x: mx + (c + range(rng, 0.15, 0.85)) * cw, y: my + (r + range(rng, 0.15, 0.85)) * ch });
    }
  const count = nodes.length;
  const dist = (a: Pt, b: Pt) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  const adj: number[][] = nodes.map(() => []);
  const edges: [number, number][] = [];
  const known = new Set<string>();
  const link = (i: number, j: number) => {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (i === j || known.has(key)) return;
    known.add(key);
    edges.push([i, j]);
    adj[i].push(j);
    adj[j].push(i);
  };
  // Minimum spanning tree (Prim): one connected mesh, no stray islands
  const inTree = new Array(count).fill(false);
  const best = new Array(count).fill(Infinity);
  const from = new Array(count).fill(-1);
  best[0] = 0;
  for (let k = 0; k < count; k += 1) {
    let u = -1;
    for (let i = 0; i < count; i += 1) if (!inTree[i] && (u < 0 || best[i] < best[u])) u = i;
    inTree[u] = true;
    if (from[u] >= 0) link(u, from[u]);
    for (let v = 0; v < count; v += 1) {
      const d = dist(nodes[u], nodes[v]);
      if (!inTree[v] && d < best[v]) {
        best[v] = d;
        from[v] = u;
      }
    }
  }
  // Extra short links for a real mesh
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: dist(a, b) }))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d);
    link(i, near[0].j);
    if (rng() < 0.55) link(i, near[1].j);
  });
  const ranked = adj
    .map((a, i) => ({ i, d: a.length }))
    .sort((a, b) => b.d - a.d || a.i - b.i)
    .map((h) => h.i);
  // Accent route: a short signal path (four hops at most) leaving the busiest hub
  const start = ranked[0];
  const hops = new Array(count).fill(-1);
  const prev = new Array(count).fill(-1);
  hops[start] = 0;
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift() as number;
    for (const nb of adj[cur])
      if (hops[nb] < 0) {
        hops[nb] = hops[cur] + 1;
        prev[nb] = cur;
        queue.push(nb);
      }
  }
  const depth = Math.min(compact ? 2 : 4, Math.max(...hops));
  const end = hops.reduce((b, h, i) => (h === depth && (b < 0 || dist(nodes[i], nodes[start]) > dist(nodes[b], nodes[start])) ? i : b), -1);
  const route: Pt[] = [];
  for (let c = end; c !== -1; c = prev[c]) route.unshift(nodes[c]);
  const hubs = ranked.slice(0, compact ? 1 : 3).map((i) => nodes[i]);
  const r = s * (compact ? 0.014 : 0.0052);
  const last = route[route.length - 1] ?? nodes[start];
  return (
    <g>
      <path d={edges.map(([a, b]) => seg(nodes[a], nodes[b])).join('')} fill="none" stroke="currentColor" strokeOpacity={0.26} className={NS} />
      {!compact && (
        <circle cx={n1(hubs[0].x)} cy={n1(hubs[0].y)} r={n1(s * 0.11)} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeDasharray="2 5" className={NS} />
      )}
      <path d={hubs.map((p) => circle(p.x, p.y, r * 2.8)).join('')} fill="none" stroke="currentColor" strokeOpacity={0.6} className={NS} />
      <path d={nodes.map((p) => circle(p.x, p.y, r)).join('')} fill="currentColor" fillOpacity={0.72} />
      <path d={poly(route)} fill="none" strokeWidth={compact ? 1.25 : 1.75} strokeLinejoin="round" className={`stroke-accent ${NS}`} />
      <path d={route.map((p) => circle(p.x, p.y, r * 1.3)).join('')} className="fill-accent" />
      <circle cx={n1(last.x)} cy={n1(last.y)} r={n1(r * 3.4)} fill="none" strokeWidth={1.25} className={`stroke-accent ${NS}`} />
    </g>
  );
};

// ── circuit: PCB traces, pads and vias (Heal ElectroniX) ────────────────────

const circuit = ({ W, H, s, rng, compact }: Canvas) => {
  const cx = W / 2 + range(rng, -0.04, 0.04) * W;
  const cy = H / 2 + range(rng, -0.03, 0.03) * H;
  const half = s * (compact ? 0.2 : 0.15);
  const pins = compact ? 4 : 7;
  const pitch = (2 * half) / (pins + 1);
  const pinLen = s * 0.03;
  const fan = 0.9;
  const traces: Pt[][] = [];
  const vias: Pt[] = [];
  const pads: Pt[] = [];
  const pinPaths: string[] = [];
  const sides = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
  ];
  sides.forEach(({ dx, dy }) => {
    const lx = -dy;
    const ly = dx;
    const l1 = s * range(rng, 0.03, 0.06);
    for (let i = 0; i < pins; i += 1) {
      const off = -half + pitch * (i + 1);
      const base = { x: cx + dx * half + lx * off, y: cy + dy * half + ly * off };
      const tip = { x: base.x + dx * pinLen, y: base.y + dy * pinLen };
      pinPaths.push(seg(base, tip));
      if (rng() < 0.14) continue; // unrouted pin
      const t = i - (pins - 1) / 2;
      const diag = Math.abs(t) * pitch * fan;
      const sign = Math.sign(t);
      const a = { x: tip.x + dx * l1, y: tip.y + dy * l1 };
      const b = { x: a.x + dx * diag + lx * sign * diag, y: a.y + dy * diag + ly * sign * diag };
      const roll = rng();
      const run = roll < 0.78 ? s * range(rng, 0.05, 0.42) : s * 2;
      const c = { x: b.x + dx * run, y: b.y + dy * run };
      traces.push([tip, a, b, c]);
      if (roll < 0.58) vias.push(c);
      else if (roll < 0.78) pads.push(c);
    }
  });
  // Small passives (resistor / capacitor footprints) in the free corners
  const passives: string[] = [];
  const pr = s * 0.011;
  for (let i = 0; i < (compact ? 0 : 7); i += 1) {
    const x = range(rng, 0.08, 0.92) * W;
    const y = range(rng, 0.1, 0.9) * H;
    if (Math.abs(x - cx) < half * 2.2 && Math.abs(y - cy) < half * 2.2) continue;
    const vertical = rng() < 0.5;
    const gap = s * 0.022;
    const p1 = vertical ? { x, y: y - gap } : { x: x - gap, y };
    const p2 = vertical ? { x, y: y + gap } : { x: x + gap, y };
    passives.push(square(p1.x, p1.y, pr), square(p2.x, p2.y, pr));
  }
  const accentIndex = traces.findIndex((tr, i) => i >= Math.floor(traces.length / 3) && vias.includes(tr[3]));
  const accent = traces[accentIndex >= 0 ? accentIndex : 0];
  const rv = s * (compact ? 0.02 : 0.012);
  const hole = (p: Pt) => circle(p.x, p.y, rv * 0.42);
  const mount = s * 0.07;
  const corners = [
    { x: mount, y: mount },
    { x: W - mount, y: mount },
    { x: W - mount, y: H - mount },
    { x: mount, y: H - mount },
  ];
  const court = half + pinLen + s * 0.014;
  return (
    <g>
      {!compact && (
        <path d={corners.map((p) => circle(p.x, p.y, s * 0.022) + circle(p.x, p.y, s * 0.01)).join('')} fill="none" stroke="currentColor" strokeOpacity={0.4} className={NS} />
      )}
      <path
        d={traces.filter((tr) => tr !== accent).map((tr) => poly(tr)).join('')}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.42}
        strokeWidth={n1(s * (compact ? 0.012 : 0.006))}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {accent && (
        <path d={poly(accent)} fill="none" strokeWidth={n1(s * (compact ? 0.014 : 0.0075))} strokeLinejoin="round" strokeLinecap="round" className="stroke-accent" />
      )}
      <path d={passives.join('')} fill="currentColor" fillOpacity={0.35} />
      <path d={pads.map((p) => square(p.x, p.y, rv * 0.9)).join('')} fill="currentColor" fillOpacity={0.5} />
      <path d={vias.map((p) => circle(p.x, p.y, rv)).join('')} className="fill-bg-2" stroke="currentColor" strokeOpacity={0.6} strokeWidth={n1(s * 0.004)} />
      <path d={vias.filter((p) => p !== accent?.[3]).map(hole).join('')} fill="currentColor" fillOpacity={0.55} />
      {accent && <path d={circle(accent[3].x, accent[3].y, rv) + hole(accent[3])} fillRule="evenodd" className="fill-accent" />}
      <path d={pinPaths.join('')} stroke="currentColor" strokeOpacity={0.7} strokeWidth={n1(s * 0.012)} />
      <rect x={n1(cx - court)} y={n1(cy - court)} width={n1(court * 2)} height={n1(court * 2)} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeDasharray="3 4" className={NS} />
      <rect x={n1(cx - half)} y={n1(cy - half)} width={n1(half * 2)} height={n1(half * 2)} className={`fill-bg ${NS}`} stroke="currentColor" strokeOpacity={0.75} />
      <circle cx={n1(cx - half + pitch * 0.7)} cy={n1(cy - half + pitch * 0.7)} r={n1(s * 0.008)} fill="currentColor" fillOpacity={0.7} />
      {!compact && (
        <>
          <rect x={n1(cx - half * 0.55)} y={n1(cy - half * 0.55)} width={n1(half * 1.1)} height={n1(half * 1.1)} fill="none" stroke="currentColor" strokeOpacity={0.25} strokeDasharray="2 3" className={NS} />
          <text x={n1(cx - court)} y={n1(cy - court - s * 0.016)} className="fill-current font-mono" fillOpacity={0.55} fontSize={n1(s * 0.024)} letterSpacing={n1(s * 0.003)}>
            U1
          </text>
        </>
      )}
    </g>
  );
};

// ── dial: watch dial with ticks and hands (mechanical watch) ────────────────

const dial = ({ W, H, s, rng, compact }: Canvas) => {
  const cx = W / 2;
  const cy = H / 2;
  const R = s * (compact ? 0.4 : 0.34);
  const at = (r: number, deg: number, ox = cx, oy = cy): Pt => {
    const a = ((deg - 90) * Math.PI) / 180;
    return { x: ox + r * Math.cos(a), y: oy + r * Math.sin(a) };
  };
  let minor = '';
  let major = '';
  for (let i = 0; i < 60; i += 1) {
    const isMajor = i % 5 === 0;
    const a = at(isMajor ? R - s * 0.06 : R - s * 0.022, i * 6);
    const b = at(R, i * 6);
    if (isMajor) major += seg(a, b);
    else if (!compact) minor += seg(a, b);
  }
  // Small seconds at 6 o'clock
  const sx = cx;
  const sy = cy + R * 0.47;
  const sr = R * 0.2;
  let subTicks = '';
  for (let i = 0; i < 12; i += 1) subTicks += seg(at(sr * 0.8, i * 30, sx, sy), at(sr, i * 30, sx, sy));
  const hand = (deg: number, len: number, tail: number, w: number, ox = cx, oy = cy) => {
    const tip = at(len, deg, ox, oy);
    const back = at(-tail, deg, ox, oy);
    const n = at(w / 2, deg + 90, 0, 0);
    return poly(
      [
        { x: back.x + n.x, y: back.y + n.y },
        { x: tip.x + n.x * 0.25, y: tip.y + n.y * 0.25 },
        { x: tip.x - n.x * 0.25, y: tip.y - n.y * 0.25 },
        { x: back.x - n.x, y: back.y - n.y },
      ],
      true,
    );
  };
  const seconds = range(rng, 0, 360);
  const secTip = at(sr * 0.92, seconds, sx, sy);
  const secTail = at(-sr * 0.25, seconds, sx, sy);
  const dimX = cx + R + s * 0.12;
  const arrow = s * 0.014;
  return (
    <g>
      {!compact && (
        <>
          <path d={`M0 ${n1(cy)}H${W}M${n1(cx)} 0V${H}`} fill="none" stroke="currentColor" strokeOpacity={0.22} strokeDasharray="14 5 2 5" className={NS} />
          {dimX + s * 0.04 < W && (
            <g stroke="currentColor" strokeOpacity={0.45} fill="none">
              <path
                className={NS}
                d={`M${n1(cx + s * 0.03)} ${n1(cy - R)}H${n1(dimX + s * 0.018)}M${n1(cx + s * 0.03)} ${n1(cy + R)}H${n1(dimX + s * 0.018)}M${n1(dimX)} ${n1(cy - R)}V${n1(cy + R)}`}
              />
              <path
                className={NS}
                fill="currentColor"
                fillOpacity={0.6}
                d={`M${n1(dimX)} ${n1(cy - R)}l${n1(-arrow / 2.4)} ${n1(arrow)}h${n1(arrow / 1.2)}ZM${n1(dimX)} ${n1(cy + R)}l${n1(-arrow / 2.4)} ${n1(-arrow)}h${n1(arrow / 1.2)}Z`}
              />
              <text x={n1(dimX + s * 0.022)} y={n1(cy)} dominantBaseline="middle" stroke="none" className="fill-current font-mono" fillOpacity={0.6} fontSize={n1(s * 0.03)}>
                Ø
              </text>
            </g>
          )}
          <circle cx={n1(cx)} cy={n1(cy)} r={n1(R * 0.66)} fill="none" stroke="currentColor" strokeOpacity={0.28} strokeDasharray="2 5" className={NS} />
        </>
      )}
      <circle cx={n1(cx)} cy={n1(cy)} r={n1(R + s * 0.035)} fill="none" stroke="currentColor" strokeOpacity={0.35} className={NS} />
      <circle cx={n1(cx)} cy={n1(cy)} r={n1(R)} className={`fill-bg ${NS}`} stroke="currentColor" strokeOpacity={0.55} />
      <path d={minor} stroke="currentColor" strokeOpacity={0.5} className={NS} />
      <path d={major} stroke="currentColor" strokeOpacity={0.85} strokeWidth={n1(s * 0.008)} />
      <circle cx={n1(sx)} cy={n1(sy)} r={n1(sr)} fill="none" stroke="currentColor" strokeOpacity={0.45} className={NS} />
      {!compact && <path d={subTicks} stroke="currentColor" strokeOpacity={0.5} className={NS} />}
      <path d={seg(secTail, secTip)} strokeWidth={1.5} className={`stroke-accent ${NS}`} />
      <circle cx={n1(sx)} cy={n1(sy)} r={n1(s * 0.006)} className="fill-accent" />
      <path d={hand(305, R * 0.55, R * 0.1, s * 0.026) + hand(60, R * 0.86, R * 0.12, s * 0.016)} fill="currentColor" fillOpacity={0.9} />
      <circle cx={n1(cx)} cy={n1(cy)} r={n1(s * 0.016)} fill="currentColor" />
      <circle cx={n1(cx)} cy={n1(cy)} r={n1(s * 0.006)} className="fill-bg-2" />
    </g>
  );
};

// ── scan: document + MRZ-like rows + scan line (MRZ scanner) ────────────────

/** Generic letters only: never realistic personal data. */
const LETTERS = 'ABCDEFGHJKLMNPRSTUVWXYZ';

const mrzRow = (rng: Rng, length: number, tail: boolean) => {
  let out = '';
  while (out.length < length) {
    if (rng() < 0.55) {
      const n = between(rng, 2, 7);
      for (let i = 0; i < n; i += 1) out += LETTERS[between(rng, 0, LETTERS.length - 1)];
    } else out += '<'.repeat(between(rng, 1, 3));
    if (tail && out.length > length * 0.45) break;
  }
  return out.padEnd(length, '<').slice(0, length);
};

const scan = ({ W, H, s, rng, compact }: Canvas) => {
  let cw = W * 0.66;
  let ch = cw / 1.586;
  if (ch > H * 0.72) {
    ch = H * 0.72;
    cw = ch * 1.586;
  }
  const x0 = (W - cw) / 2;
  const y0 = (H - ch) / 2;
  const photo = { x: x0 + cw * 0.05, y: y0 + ch * 0.1, w: cw * 0.25, h: ch * 0.5 };
  let labels = '';
  let values = '';
  for (let i = 0; i < 5; i += 1) {
    const y = y0 + ch * (0.12 + i * 0.1);
    const x = x0 + cw * 0.35;
    labels += `M${n1(x)} ${n1(y)}h${n1(cw * range(rng, 0.05, 0.1))}`;
    values += `M${n1(x)} ${n1(y + ch * 0.038)}h${n1(cw * range(rng, 0.14, 0.46))}`;
  }
  const rows = 3;
  const chars = 30;
  const mrzTop = y0 + ch * 0.68;
  const lineH = (ch * 0.26) / rows;
  const textW = cw * 0.88;
  const scanRow = between(rng, 0, rows - 1);
  const scanY = mrzTop + lineH * (scanRow + 0.5);
  const pad = s * 0.018;
  return (
    <g>
      {!compact && (
        <path
          d={`M0 ${n1(y0)}H${W}M0 ${n1(y0 + ch)}H${W}M${n1(x0)} 0V${H}M${n1(x0 + cw)} 0V${H}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.16}
          strokeDasharray="14 5 2 5"
          className={NS}
        />
      )}
      <rect x={n1(x0)} y={n1(y0)} width={n1(cw)} height={n1(ch)} className={`fill-bg ${NS}`} stroke="currentColor" strokeOpacity={0.55} />
      <rect x={n1(photo.x)} y={n1(photo.y)} width={n1(photo.w)} height={n1(photo.h)} fill="none" stroke="currentColor" strokeOpacity={0.45} className={NS} />
      <path
        d={seg({ x: photo.x, y: photo.y }, { x: photo.x + photo.w, y: photo.y + photo.h }) + seg({ x: photo.x + photo.w, y: photo.y }, { x: photo.x, y: photo.y + photo.h })}
        stroke="currentColor"
        strokeOpacity={0.2}
        className={NS}
      />
      <path d={labels} stroke="currentColor" strokeOpacity={0.22} strokeWidth={n1(ch * 0.014)} />
      <path d={values} stroke="currentColor" strokeOpacity={0.5} strokeWidth={n1(ch * 0.03)} />
      <rect x={n1(x0)} y={n1(scanY - ch * 0.14)} width={n1(cw)} height={n1(ch * 0.14)} className="fill-accent" fillOpacity={0.07} />
      <g className="fill-current font-mono" fillOpacity={0.78}>
        {Array.from({ length: rows }, (_, i) => (
          <text
            key={i}
            x={n1(x0 + cw * 0.05)}
            y={n1(mrzTop + lineH * (i + 0.5))}
            dominantBaseline="central"
            fontSize={n1(lineH * 0.64)}
            textLength={n1(textW)}
            lengthAdjust="spacing"
          >
            {mrzRow(rng, chars, i === rows - 1)}
          </text>
        ))}
      </g>
      <path
        d={brackets(x0 + cw * 0.05 - pad, mrzTop - pad * 0.6, x0 + cw * 0.95 + pad, mrzTop + lineH * rows + pad * 0.6, s * 0.035)}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.75}
        className={NS}
      />
      <path d={`M${n1(x0 - s * 0.06)} ${n1(scanY)}H${n1(x0 + cw + s * 0.06)}`} strokeWidth={1.5} className={`stroke-accent ${NS}`} />
    </g>
  );
};

// ── grid: dot matrix with a highlighted pattern (AI projects, lab) ──────────

const RULES = [30, 90, 110, 150, 22, 60, 126, 18];

const grid = ({ W, H, s, rng, compact }: Canvas) => {
  const step = s / (compact ? 12 : 25);
  const cols = Math.floor((W - step) / step);
  const rows = Math.floor((H - step) / step);
  const ox = (W - (cols - 1) * step) / 2;
  const oy = (H - (rows - 1) * step) / 2;
  const rule = RULES[between(rng, 0, RULES.length - 1)];
  // One-dimensional cellular automaton: each row is the next generation
  let row = new Array(cols).fill(0);
  row[Math.floor(cols / 2) + between(rng, -3, 3)] = 1;
  const on: Pt[] = [];
  let dots = '';
  for (let r = 0; r < rows; r += 1) {
    row.forEach((v, c) => {
      const p = { x: ox + c * step, y: oy + r * step };
      if (v) on.push(p);
      else dots += circle(p.x, p.y, step * 0.07);
    });
    const prev = row;
    row = prev.map((_, c) => {
      const l = prev[(c - 1 + cols) % cols];
      const m = prev[c];
      const rr = prev[(c + 1) % cols];
      return (rule >> (l * 4 + m * 2 + rr)) & 1;
    });
  }
  // Accent cell: inside the safe area, so every crop (4:3 to 2:1) keeps it
  const aim = { x: W * range(rng, 0.55, 0.7), y: H * 0.66 };
  const pick = on.reduce<Pt | undefined>(
    (b, p) => (!b || (p.x - aim.x) ** 2 + (p.y - aim.y) ** 2 < (b.x - aim.x) ** 2 + (b.y - aim.y) ** 2 ? p : b),
    undefined,
  );
  const size = step * 0.25;
  let ticks = '';
  const labels: ReactElement[] = [];
  if (!compact) {
    for (let c = 0; c < cols; c += 4) {
      ticks += `M${n1(ox + c * step)} ${n1(oy - step * 0.55)}v${n1(-step * 0.18)}`;
      labels.push(
        <text key={`c${c}`} x={n1(ox + c * step)} y={n1(oy - step * 0.85)} textAnchor="middle" fontSize={n1(step * 0.3)}>
          {String(c).padStart(2, '0')}
        </text>,
      );
    }
  }
  return (
    <g>
      <path d={dots} fill="currentColor" fillOpacity={0.4} />
      <path d={on.filter((p) => p !== pick).map((p) => square(p.x, p.y, size)).join('')} fill="currentColor" fillOpacity={0.82} />
      {!compact && (
        <>
          <path d={ticks} stroke="currentColor" strokeOpacity={0.4} className={NS} />
          <g className="fill-current font-mono" fillOpacity={0.5}>
            {labels}
          </g>
        </>
      )}
      {pick && (
        <>
          <path d={square(pick.x, pick.y, size)} className="fill-accent" />
          <path d={brackets(pick.x - step * 0.75, pick.y - step * 0.75, pick.x + step * 0.75, pick.y + step * 0.75, step * 0.3)} fill="none" strokeWidth={1.25} className={`stroke-accent ${NS}`} />
        </>
      )}
    </g>
  );
};

// ── thread: embroidery hoop and satin stitches (SBSA) ──────────────────────

const thread = ({ W, H, s, rng, compact }: Canvas) => {
  const cx = W / 2 + range(rng, -0.04, 0.04) * W;
  const cy = H / 2;
  const R = s * (compact ? 0.46 : 0.39);
  const limit = (R - s * 0.03) ** 2;
  const inside = (p: Pt) => (p.x - cx) ** 2 + (p.y - cy) ** 2 < limit;
  const count = compact ? 2 : 4;
  const accentBand = between(rng, 0, count - 1);
  const bands: { d: string; accent: boolean }[] = [];
  let running = '';
  for (let b = 0; b < count; b += 1) {
    const amp = s * range(rng, 0.04, 0.11);
    const freq = range(rng, 0.6, 1.5);
    const phase = range(rng, 0, TAU);
    const offset = (b - (count - 1) / 2) * s * (compact ? 0.3 : 0.17) + range(rng, -0.02, 0.02) * s;
    const width = s * range(rng, 0.035, 0.06);
    const step = s * (compact ? 0.02 : 0.0075);
    const segments: Pt[][] = [];
    let current: Pt[] = [];
    let flip = 1;
    const center: Pt[] = [];
    for (let x = cx - R; x <= cx + R; x += step) {
      const u = ((x - cx) / R) * Math.PI * freq + phase;
      const y = cy + offset + amp * Math.sin(u);
      const dy = amp * Math.cos(u) * ((Math.PI * freq) / R);
      const len = Math.hypot(1, dy);
      const p = { x: n1(x + ((-dy / len) * width * flip) / 2), y: n1(y + ((1 / len) * width * flip) / 2) };
      flip = -flip;
      if (inside(p)) current.push(p);
      else if (current.length) {
        segments.push(current);
        current = [];
      }
      const q = { x: n1(x), y: n1(y + width * 1.1) };
      if (inside(q)) center.push(q);
    }
    if (current.length) segments.push(current);
    bands.push({ d: segments.map((pts) => poly(pts)).join(''), accent: b === accentBand });
    if (!compact && b % 2 === 0 && center.length > 1) running += poly(center);
  }
  const clampW = s * 0.07;
  const marks = [45, 135, 225, 315].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return plus(cx + Math.cos(a) * (R + s * 0.1), cy + Math.sin(a) * (R + s * 0.1), s * 0.014);
  });
  return (
    <g>
      <circle cx={n1(cx)} cy={n1(cy)} r={n1(R + s * 0.03)} fill="none" stroke="currentColor" strokeOpacity={0.35} className={NS} />
      <circle cx={n1(cx)} cy={n1(cy)} r={n1(R)} className={`fill-bg ${NS}`} stroke="currentColor" strokeOpacity={0.55} />
      {!compact && (
        <>
          <rect x={n1(cx - clampW / 2)} y={n1(cy - R - s * 0.085)} width={n1(clampW)} height={n1(s * 0.055)} className={`fill-bg-2 ${NS}`} stroke="currentColor" strokeOpacity={0.5} />
          <path d={`M${n1(cx)} ${n1(cy - R - s * 0.12)}V${n1(cy - R - s * 0.03)}`} stroke="currentColor" strokeOpacity={0.5} className={NS} />
          <path d={marks.join('')} stroke="currentColor" strokeOpacity={0.5} className={NS} />
          <path d={running} fill="none" stroke="currentColor" strokeOpacity={0.45} strokeDasharray="6 4" className={NS} />
        </>
      )}
      {bands.map((band, i) => (
        <path
          key={i}
          d={band.d}
          fill="none"
          strokeLinejoin="round"
          className={band.accent ? `stroke-accent ${NS}` : NS}
          stroke={band.accent ? undefined : 'currentColor'}
          strokeOpacity={band.accent ? 1 : 0.55}
          strokeWidth={band.accent ? 1.25 : 1}
        />
      ))}
    </g>
  );
};

// ── flame: layered curves (PEPE CHICKEN) ────────────────────────────────────

const flame = ({ W, H, s, rng, compact }: Canvas) => {
  const cx = W / 2;
  const base = H / 2 + s * 0.3;
  const layers = compact ? 5 : 9;
  const lean = s * range(rng, -0.07, 0.07);
  const phase = range(rng, 0, TAU);
  const wobble = s * range(rng, 0.012, 0.024);
  const contours: string[] = [];
  let core = '';
  for (let k = 0; k < layers; k += 1) {
    const sc = 1 - k * (0.7 / (layers - 1));
    const b = s * 0.28 * sc;
    const a = s * 0.19 * sc;
    const yc = base - b;
    const pts: Pt[] = [];
    for (let i = 0; i <= 96; i += 1) {
      const t = (i / 96) * TAU;
      const x0 = a * Math.sin(t) * Math.pow(Math.sin(t / 2), 1.6);
      const y0 = -b * Math.cos(t);
      const up = (b - y0) / (2 * b);
      pts.push({
        x: cx + x0 + lean * sc * up * up + wobble * sc * Math.sin(up * 3 * Math.PI + phase + k * 0.6) * up,
        y: yc + y0,
      });
    }
    if (k === layers - 1) core = poly(pts, true);
    else contours.push(poly(pts, true));
  }
  let ticks = '';
  const tick = s * 0.022;
  for (let i = -12; i <= 12; i += 1) ticks += `M${n1(cx + i * tick)} ${n1(base + s * 0.035)}v${n1(i % 4 === 0 ? s * 0.035 : s * 0.018)}`;
  let sparks = '';
  for (let i = 0; i < (compact ? 0 : 7); i += 1)
    sparks += circle(cx + lean + range(rng, -0.14, 0.14) * s, base - s * 0.5 - range(rng, 0.02, 0.12) * s, s * range(rng, 0.003, 0.007));
  return (
    <g>
      {contours.map((d, k) => (
        <path key={k} d={d} fill="none" stroke="currentColor" strokeOpacity={n2(0.22 + (0.55 * k) / layers)} className={NS} />
      ))}
      <path d={core} className="fill-accent" fillOpacity={0.92} />
      <path d={`M${n1(cx - s * 0.44)} ${n1(base + s * 0.02)}H${n1(cx + s * 0.44)}`} stroke="currentColor" strokeOpacity={0.5} className={NS} />
      {!compact && (
        <>
          <path d={ticks} stroke="currentColor" strokeOpacity={0.4} className={NS} />
          <path d={sparks} fill="currentColor" fillOpacity={0.5} />
        </>
      )}
    </g>
  );
};

const MOTIFS: Record<CoverMotif, (c: Canvas) => ReactElement> = { network, circuit, dial, scan, grid, thread, flame };

interface MotifArtProps {
  motif: CoverMotif;
  seed: string;
  width: number;
  height: number;
  compact?: boolean;
}

/** The drawing itself (no frame, no annotations). Pure: same props, same SVG. */
export const MotifArt = ({ motif, seed, width, height, compact = false }: MotifArtProps) => {
  const canvas: Canvas = { W: width, H: height, s: Math.min(width, height), rng: rngFor(`${seed}:${motif}`), compact };
  return (
    <>
      {!compact && motif !== 'grid' && <Drafting {...canvas} />}
      {MOTIFS[motif](canvas)}
    </>
  );
};
