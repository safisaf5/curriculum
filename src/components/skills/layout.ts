import { resolveEntities, skillGroups, type Lang, type SkillGroup } from '../../data';
import { localize } from '../../lib/text';

/**
 * Deterministic layout of the skills constellation.
 *
 * Four hubs (one per skill group) sit in the four quadrants of a crosshair,
 * clockwise from the top left in the same order as the hero dial
 * (tech, business, communication, creative). Every skill is a node on a
 * loose elliptical orbit around its hub; a string hash nudges angle and
 * radius so the result reads as a constellation rather than a clock face,
 * while staying identical on the server and the client.
 *
 * Labels are placed greedily: for each node we try positions around it
 * (outward first) and keep the first one that stays inside the canvas and
 * clears every node, hub and label already placed. Text widths come from a
 * table measured on Archivo (weight 500) so no DOM is needed.
 */

export type GroupId = SkillGroup['id'];

export const MAP_W = 1000;
export const MAP_H = 640;
export const MAP_CX = 500;
export const MAP_CY = 320;
/** Skill label size, in viewBox units. */
export const LABEL_SIZE = 16;

export interface HubSpec {
  x: number;
  y: number;
  /** Orbit radii (outer ring; inner ring is scaled down). */
  rx: number;
  ry: number;
  /** Angle of the first node, degrees (0 = east, clockwise). */
  start: number;
}

export const HUBS: Record<GroupId, HubSpec> = {
  tech: { x: 262, y: 172, rx: 186, ry: 116, start: -96 },
  business: { x: 752, y: 170, rx: 150, ry: 104, start: -78 },
  communication: { x: 748, y: 474, rx: 132, ry: 96, start: -35 },
  creative: { x: 250, y: 482, rx: 118, ry: 88, start: -20 },
};

/** Quadrant caption anchors (outer corners of the canvas). */
export const CORNERS: Record<GroupId, { x: number; y: number; anchor: 'start' | 'end' }> = {
  tech: { x: 18, y: 30, anchor: 'start' },
  business: { x: MAP_W - 18, y: 30, anchor: 'end' },
  communication: { x: MAP_W - 18, y: MAP_H - 18, anchor: 'end' },
  creative: { x: 18, y: MAP_H - 18, anchor: 'start' },
};

export interface MapHub {
  id: GroupId;
  x: number;
  y: number;
}

export type Anchor = 'start' | 'middle' | 'end';

export interface MapNode {
  id: string;
  group: GroupId;
  /** Index of the skill inside its group (for staggered reveals). */
  index: number;
  x: number;
  y: number;
  r: number;
  count: number;
  label: string;
  lx: number;
  ly: number;
  anchor: Anchor;
}

export interface MapLayout {
  hubs: MapHub[];
  nodes: MapNode[];
  byId: Record<string, MapNode>;
}

// ── Text metrics ────────────────────────────────────────────────────────────
// Advance widths of Archivo Variable (wght 500) at 100px, measured in Chromium.
const ADVANCE: Record<string, number> = {
  a: 55, b: 58, c: 53, d: 58, e: 55, f: 29, g: 57, h: 57, i: 24, j: 24, k: 53, l: 24, m: 86,
  n: 57, o: 58, p: 58, q: 58, r: 35, s: 52, t: 31, u: 57, v: 52, w: 74, x: 53, y: 52, z: 50,
  I: 27, J: 57, L: 55, M: 85, W: 94, ' ': 25, '.': 29, ',': 29, '(': 36, ')': 36, '-': 33,
  '&': 71, "'": 23, '’': 23, '/': 30,
};

/** Estimated rendered width of a label (letter-spacing -0.01em included). */
export const textWidth = (text: string, size = LABEL_SIZE) => {
  let units = 0;
  let chars = 0;
  for (const ch of text) {
    const base = ch.normalize('NFD')[0] ?? ch;
    units += ADVANCE[base] ?? (/[A-Z]/.test(base) ? 70 : /[0-9]/.test(base) ? 57 : 56);
    chars += 1;
  }
  return ((units - chars) / 100) * size;
};

// ── Helpers ─────────────────────────────────────────────────────────────────

/** FNV-1a, 32 bit: a stable pseudo-random source from a string. */
const hash = (s: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};
/** Stable value in [-1, 1] for a key. */
const jitter = (key: string) => ((hash(key) % 2001) / 1000) - 1;

const rad = (deg: number) => (deg * Math.PI) / 180;
const round = (n: number) => Math.round(n * 10) / 10;

interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const overlaps = (a: Box, b: Box, pad = 0) =>
  a.x1 < b.x2 + pad && a.x2 + pad > b.x1 && a.y1 < b.y2 + pad && a.y2 + pad > b.y1;

const overlapArea = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1)) * Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1));

const circleBox = (x: number, y: number, r: number): Box => ({ x1: x - r, y1: y - r, x2: x + r, y2: y + r });

/** Does the segment (x1,y1)→(x2,y2) cross the box? (Liang-Barsky clipping) */
const segmentHits = (x1: number, y1: number, x2: number, y2: number, b: Box) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const edges: [number, number][] = [
    [-dx, x1 - b.x1],
    [dx, b.x2 - x1],
    [-dy, y1 - b.y1],
    [dy, b.y2 - y1],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const r = q / p;
    if (p < 0) t0 = Math.max(t0, r);
    else t1 = Math.min(t1, r);
    if (t0 > t1) return false;
  }
  return true;
};

const labelBox = (x: number, baseline: number, anchor: Anchor, width: number, size = LABEL_SIZE): Box => {
  const x1 = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2;
  return { x1, y1: baseline - size * 0.8, x2: x1 + width, y2: baseline + size * 0.24 };
};

// ── Relations (language independent) ────────────────────────────────────────

/** For each skill, the other skills that share at least one proof, with the shared count. */
export const RELATED: Record<string, Record<string, number>> = (() => {
  const all = skillGroups.flatMap((g) => g.items);
  const out: Record<string, Record<string, number>> = {};
  for (const a of all) {
    out[a.id] = {};
    for (const b of all) {
      if (a.id === b.id) continue;
      const shared = a.evidence.filter((id) => b.evidence.includes(id)).length;
      if (shared) out[a.id][b.id] = shared;
    }
  }
  return out;
})();

/** Resolved proofs per skill (unknown ids are skipped, see scripts/check-content). */
export const proofCount = (evidence: string[]) => resolveEntities(evidence).length;

// ── Layout ──────────────────────────────────────────────────────────────────

/** Pure layout for a set of hub specs (exported for the tuning script). */
export const computeLayout = (lang: Lang, specs: Record<GroupId, HubSpec>): MapLayout => {
  const hubs: MapHub[] = skillGroups.map((g) => ({ id: g.id, x: specs[g.id].x, y: specs[g.id].y }));
  const nodes: MapNode[] = [];

  for (const group of skillGroups) {
    const spec = specs[group.id];
    const n = group.items.length;
    group.items.forEach((skill, i) => {
      const count = proofCount(skill.evidence);
      const outer = i % 2 === 0;
      const scale = (outer ? 1 : 0.68) * (1 + jitter(`${skill.id}:r`) * 0.07);
      const angle = spec.start + (i * 360) / n + jitter(`${skill.id}:a`) * (90 / n);
      nodes.push({
        id: skill.id,
        group: group.id,
        index: i,
        x: round(spec.x + Math.cos(rad(angle)) * spec.rx * scale),
        y: round(spec.y + Math.sin(rad(angle)) * spec.ry * scale),
        r: round(4 + count * 1.25),
        count,
        label: localize(skill.name, lang),
        lx: 0,
        ly: 0,
        anchor: 'start',
      });
    });
  }

  // Obstacles: canvas corners (quadrant captions), hubs, every other node.
  const fixed: Box[] = [
    { x1: 0, y1: 0, x2: 190, y2: 44 },
    { x1: MAP_W - 190, y1: 0, x2: MAP_W, y2: 44 },
    { x1: 0, y1: MAP_H - 36, x2: 210, y2: MAP_H },
    { x1: MAP_W - 210, y1: MAP_H - 36, x2: MAP_W, y2: MAP_H },
    ...hubs.map((h) => circleBox(h.x, h.y, 12)),
  ];
  const placed: Box[] = [];
  const bounds: Box = { x1: 6, y1: 6, x2: MAP_W - 6, y2: MAP_H - 6 };

  // Longest labels first: they have the fewest valid spots.
  const order = [...nodes].sort((a, b) => textWidth(b.label) - textWidth(a.label));
  for (const node of order) {
    const hub = specs[node.group];
    const w = textWidth(node.label);
    const d = node.r + 7;
    const east = node.x >= hub.x;
    const south = node.y >= hub.y;
    const side = (dir: 1 | -1) => ({
      x: node.x + dir * d,
      y: node.y + LABEL_SIZE * 0.32,
      anchor: (dir === 1 ? 'start' : 'end') as Anchor,
    });
    const vertical = (dir: 1 | -1) => ({
      x: node.x,
      y: dir === 1 ? node.y + d + LABEL_SIZE * 0.78 : node.y - d - LABEL_SIZE * 0.2,
      anchor: 'middle' as Anchor,
    });
    const diagonal = (dx: 1 | -1, dy: 1 | -1) => ({
      x: node.x + dx * (d - 2),
      y: dy === 1 ? node.y + d + LABEL_SIZE * 0.5 : node.y - d + LABEL_SIZE * 0.1,
      anchor: (dx === 1 ? 'start' : 'end') as Anchor,
    });
    const h = east ? 1 : -1;
    const v = south ? 1 : -1;
    const candidates = [
      side(h),
      diagonal(h, v),
      diagonal(h, (v * -1) as 1 | -1),
      vertical(v),
      side((h * -1) as 1 | -1),
      vertical((v * -1) as 1 | -1),
      diagonal((h * -1) as 1 | -1, v),
      diagonal((h * -1) as 1 | -1, (v * -1) as 1 | -1),
    ];

    let best = candidates[0];
    let bestCost = Infinity;
    for (const c of candidates) {
      const box = labelBox(c.x, c.y, c.anchor, w);
      const outside =
        Math.max(0, bounds.x1 - box.x1) + Math.max(0, box.x2 - bounds.x2) + Math.max(0, bounds.y1 - box.y1) + Math.max(0, box.y2 - bounds.y2);
      let cost = outside * 1000;
      for (const o of fixed) if (overlaps(box, o, 2)) cost += 50 + overlapArea(box, o);
      for (const other of nodes) {
        if (other === node) continue;
        // Keep clear of other nodes, so a label never reads as someone else's.
        const o = circleBox(other.x, other.y, other.r + 9);
        if (overlaps(box, o)) cost += 50 + overlapArea(box, o);
        const sh = specs[other.group];
        if (segmentHits(sh.x, sh.y, other.x, other.y, box)) cost += 40;
      }
      if (segmentHits(hub.x, hub.y, node.x, node.y, box)) cost += 40;
      for (const p of placed) if (overlaps(box, p, 3)) cost += 200 + overlapArea(box, p);
      if (cost < bestCost) {
        best = c;
        bestCost = cost;
      }
      if (cost === 0) break;
    }
    node.lx = round(best.x);
    node.ly = round(best.y);
    node.anchor = best.anchor;
    placed.push(labelBox(best.x, best.y, best.anchor, w));
  }

  return {
    hubs,
    nodes,
    byId: Object.fromEntries(nodes.map((n) => [n.id, n])),
  };
};

const cache = new Map<Lang, MapLayout>();

/** Layout per language, computed once (identical on the server and the client). */
export const getMapLayout = (lang: Lang): MapLayout => {
  const cached = cache.get(lang);
  if (cached) return cached;
  const layout = computeLayout(lang, HUBS);
  cache.set(lang, layout);
  return layout;
};

/** Collision report, used by the tuning script. */
export const layoutReport = (lang: Lang, specs: Record<GroupId, HubSpec> = HUBS) => {
  const { nodes } = computeLayout(lang, specs);
  const boxes = nodes.map((n) => ({ id: n.id, box: labelBox(n.lx, n.ly, n.anchor, textWidth(n.label)) }));
  const issues: string[] = [];
  boxes.forEach((a, i) =>
    boxes.slice(i + 1).forEach((b) => {
      if (overlaps(a.box, b.box, 1)) issues.push(`label ${a.id} x label ${b.id}`);
    }),
  );
  boxes.forEach((a) =>
    nodes.forEach((n) => {
      if (n.id !== a.id && overlaps(a.box, circleBox(n.x, n.y, n.r))) issues.push(`label ${a.id} x node ${n.id}`);
    }),
  );
  boxes.forEach((a) =>
    nodes.forEach((n) => {
      if (n.id !== a.id && overlaps(a.box, circleBox(n.x, n.y, n.r + 8)) && !overlaps(a.box, circleBox(n.x, n.y, n.r)))
        issues.push(`label ${a.id} close to node ${n.id}`);
      const h = specs[n.group];
      if (segmentHits(h.x, h.y, n.x, n.y, a.box)) issues.push(`label ${a.id} crosses spoke ${n.id}`);
    }),
  );
  boxes.forEach((a) => {
    if (a.box.x1 < 0 || a.box.x2 > MAP_W || a.box.y1 < 0 || a.box.y2 > MAP_H) issues.push(`label ${a.id} out of bounds`);
  });
  return issues;
};
