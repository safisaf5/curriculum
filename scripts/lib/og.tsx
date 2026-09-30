/** @jsxRuntime automatic @jsxImportSource react */
/**
 * Open Graph images and favicons, generated from /src/data with satori
 * (layout, text to paths) and resvg-wasm (SVG to PNG). French titles, the
 * default language of the site.
 *
 *   public/og/default.png                 the site (1200 x 630)
 *   public/og/projects/<slug>.png         one per project (1200 x 630)
 *   public/favicon.svg                    identity mark, glyphs as paths
 *   public/favicon-32.png, apple-touch-icon.png (180), icon-192.png, icon-512.png
 *   public/site.webmanifest
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { ReactNode } from 'react';
import satori, { type Font as SatoriFont } from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { profile, projects, type Lang, type Period, type Project, type Universe } from '../../src/data';
import { getStrings } from '../../src/i18n';
import { formatPeriod } from '../../src/lib/dates';
import { localize, pad2 } from '../../src/lib/text';
import { FILES, SITE_URL } from '../../src/site';
import { FAMILY, FONT_FILES, fitText, fontMetrics, fontSafe } from './fonts';
import { Dial, Motif, OG, type DialNode } from './og-motifs';

const LANG: Lang = 'fr';
const W = 1200;
const H = 630;
const PAD_X = 56;
const PAD_Y = 44;
/** Display tracking of the site's wide headings (-0.04em). */
const TRACK = -0.04;
/** Width available to display type, minus 3% for satori's kerning and rounding. */
const FIT_WIDTH = (W - PAD_X * 2) * 0.97;

// ── Renderer setup ─────────────────────────────────────────────

let wasmReady: Promise<void> | undefined;
const ensureWasm = () =>
  (wasmReady ??= readFile(fileURLToPath(new URL('../../node_modules/@resvg/resvg-wasm/index_bg.wasm', import.meta.url))).then((wasm) =>
    initWasm(wasm),
  ));

let fontsCache: Promise<SatoriFont[]> | undefined;
const loadFonts = () =>
  (fontsCache ??= Promise.all([
    readFile(FONT_FILES.archivo[400]).then((data) => ({ name: FAMILY.sans, data, weight: 400 as const, style: 'normal' as const })),
    readFile(FONT_FILES.archivo[500]).then((data) => ({ name: FAMILY.sans, data, weight: 500 as const, style: 'normal' as const })),
    readFile(FONT_FILES.mono[400]).then((data) => ({ name: FAMILY.mono, data, weight: 400 as const, style: 'normal' as const })),
    readFile(FONT_FILES.mono[500]).then((data) => ({ name: FAMILY.mono, data, weight: 500 as const, style: 'normal' as const })),
    readFile(FONT_FILES.wide800).then((data) => ({ name: FAMILY.wide, data, weight: 800 as const, style: 'normal' as const })),
    readFile(FONT_FILES.semiwide500).then((data) => ({ name: FAMILY.semiwide, data, weight: 500 as const, style: 'normal' as const })),
  ]));

const toSvg = async (node: ReactNode, width: number, height: number) =>
  satori(node, { width, height, fonts: await loadFonts() });

const toPng = async (svg: string, width: number) => {
  await ensureWasm();
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false } });
  const png = resvg.render().asPng();
  resvg.free();
  return png;
};

// ── Shared pieces ──────────────────────────────────────────────

const t = (value: Parameters<typeof localize>[0]) => fontSafe(localize(value, LANG));

/** Capitals are set in the string (not with text-transform) so satori measures what it draws. */
const upper = (text: string) => text.toLocaleUpperCase('fr-CH');

const monoLabel = (color = OG.ink3, size = 15) =>
  ({
    fontFamily: FAMILY.mono,
    fontSize: size,
    fontWeight: 500,
    letterSpacing: size * 0.12,
    color,
  }) as const;

const ArrowGlyph = ({ color, size }: { color: string; size: number }) => (
  <svg width={size * 1.5} height={size} viewBox="0 0 16 10" style={{ margin: `0 ${size * 0.6}px` }}>
    <path d="M0.5 5 H14.5 M10.5 1 L14.5 5 L10.5 9" stroke={color} strokeWidth={1.1} fill="none" />
  </svg>
);

/**
 * "2020 → 2024" with a drawn arrow: the font subset has no arrow glyph.
 * Mono labels are passed in capitals (not text-transform) so that satori
 * measures what it draws and right-aligned labels stay inside the margin.
 */
const PeriodLabel = ({ period, color, size }: { period: Period; color: string; size: number }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {formatPeriod(period, LANG)
      .split(' → ')
      .flatMap((part, i) => [
        i > 0 ? <ArrowGlyph key={`a${i}`} color={color} size={size * 0.72} /> : null,
        <span key={`p${i}`}>{upper(fontSafe(part))}</span>,
      ])}
  </div>
);

const Frame = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      width: W,
      height: H,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      backgroundColor: OG.paper,
      padding: `${PAD_Y}px ${PAD_X}px`,
      fontFamily: FAMILY.sans,
      color: OG.ink,
    }}
  >
    {children}
  </div>
);

/** Index number, short rule, label: the site's section opener. */
const IndexLabel = ({ index, label }: { index: string; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', ...monoLabel() }}>
    <span style={{ color: OG.accentInk }}>{index}</span>
    <div style={{ width: 28, height: 1, backgroundColor: OG.ink3, margin: '0 14px' }} />
    <span style={{ color: OG.ink }}>{upper(label)}</span>
  </div>
);

const TopRow = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18, borderBottom: `1px solid ${OG.line}` }}>
    {children}
  </div>
);

/** A display heading set line by line in the wide cut, with the site's tracking. */
const Display = ({ lines, size, period }: { lines: string[]; size: number; period?: boolean }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {lines.map((line, i) => (
      <div
        key={i}
        style={{
          display: 'flex',
          fontFamily: FAMILY.wide,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 0.86,
          letterSpacing: size * TRACK,
          color: OG.ink,
          marginTop: i ? size * 0.04 : 0,
        }}
      >
        {line}
        {period && i === lines.length - 1 && <span style={{ color: OG.accent }}>.</span>}
      </div>
    ))}
  </div>
);

const host = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

const dms = (value: number, pos: string, neg: string) => {
  const abs = Math.abs(value);
  const d = Math.floor(abs);
  const m = Math.round((abs - d) * 60);
  return `${d}°${pad2(m)}′${value >= 0 ? pos : neg}`;
};

// ── Default image ──────────────────────────────────────────────

const DIAL_ANGLES: Record<Universe['id'], number> = { tech: -90, business: 0, communication: 90, creative: 180 };
const DIAL_ORDER: Universe['id'][] = ['tech', 'business', 'communication', 'creative'];

/** Same layout rule as the hero dial: evidence spread around, grouped by first universe. */
const dialLayout = (lit: Universe['id']) => {
  const c = 120;
  const pos = (r: number, deg: number) => ({ x: c + r * Math.cos((deg * Math.PI) / 180), y: c + r * Math.sin((deg * Math.PI) / 180) });
  const owner = new Map<string, Universe['id']>();
  const memberships = new Map<string, Universe['id'][]>();
  for (const u of profile.universes) {
    for (const id of u.evidence) {
      if (!owner.has(id)) owner.set(id, u.id);
      memberships.set(id, [...(memberships.get(id) ?? []), u.id]);
    }
  }
  const groups = DIAL_ORDER.map((uid) => [...owner].filter(([, o]) => o === uid).map(([id]) => id));
  const step = 360 / Math.max(groups.flat().length, 1);
  const nodes: DialNode[] = [];
  let index = 0;
  groups.forEach((group, g) => {
    group.forEach((id, i) => {
      const angle = DIAL_ANGLES[DIAL_ORDER[g]] + (i - (group.length - 1) / 2) * step;
      const p = pos([63, 44][index % 2], angle);
      const universes = memberships.get(id) ?? [];
      nodes.push({ ...p, anchors: universes.map((u) => pos(88, DIAL_ANGLES[u])), lit: universes.includes(lit) });
      index += 1;
    });
  });
  const markers = DIAL_ORDER.map((u) => pos(88, DIAL_ANGLES[u]));
  return { nodes, markers, litMarker: DIAL_ORDER.indexOf(lit) };
};

const DefaultImage = ({ portrait }: { portrait: string }) => {
  // Measured with its full stop, drawn in vermilion after the last line.
  const name = fitText(upper(`${profile.givenName} ${profile.familyName}.`), fontMetrics(FONT_FILES.wide800), {
    maxSize: 128,
    minSize: 80,
    maxWidth: FIT_WIDTH,
    maxLines: 2,
    letterSpacingEm: TRACK,
  });
  const lines = name.lines.map((line, i) => (i === name.lines.length - 1 ? line.replace(/\.$/, '') : line));
  const dial = dialLayout('tech');
  // Dial box: 240 units, outer ring at r = 107 around the centre (120, 120).
  const DIAL = 300;
  const scale = DIAL / 240;
  const dialX = W - PAD_X - DIAL - 22;
  const dialY = 116;
  const cx = dialX + DIAL / 2;
  const cy = dialY + DIAL / 2;
  const ring = 107 * scale;
  const universe = (id: Universe['id']) => t(profile.universes.find((u) => u.id === id)?.label);
  const LABEL_W = 220;
  const label = (id: Universe['id'], x: number, y: number, rotate = 0) => (
    <div
      style={{
        ...monoLabel(id === 'tech' ? OG.accentInk : OG.ink3, 12),
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        width: LABEL_W,
        height: 14,
        left: x - LABEL_W / 2,
        top: y - 7,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {upper(universe(id))}
    </div>
  );
  return (
    <Frame>
      <TopRow>
        <IndexLabel index="01" label={host(SITE_URL)} />
        <span style={monoLabel()}>{`${dms(profile.location.lat, 'N', 'S')} ${dms(profile.location.lng, 'E', 'W')}`}</span>
        <span style={monoLabel(OG.ink2)}>{upper(`${t(profile.location.city)}, ${t(profile.location.country)}`)}</span>
      </TopRow>

      <div style={{ display: 'flex', marginTop: 34, width: 700 }}>
        <img src={portrait} width={168} height={168} style={{ width: 168, height: 168, objectFit: 'cover' }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginLeft: 30, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', ...monoLabel(OG.ink, 14) }}>
            <div style={{ width: 9, height: 9, backgroundColor: OG.accent, marginRight: 12 }} />
            {upper(t(profile.title))}
          </div>
          <div style={{ display: 'flex', fontFamily: FAMILY.semiwide, fontWeight: 500, fontSize: 31, lineHeight: 1.14, letterSpacing: -0.62, color: OG.ink }}>
            {t(profile.headline)}
          </div>
        </div>
      </div>

      {/* The hero's dial, top right, with the four universes at 12, 3, 6 and 9 */}
      <div style={{ position: 'absolute', left: dialX, top: dialY, display: 'flex' }}>
        <Dial size={DIAL} nodes={dial.nodes} markers={dial.markers} litMarker={dial.litMarker} />
      </div>
      {label('tech', cx, cy - ring - 16)}
      {label('business', cx + ring + 16, cy, 90)}
      {label('communication', cx, cy + ring + 16)}
      {label('creative', cx - ring - 16, cy, -90)}

      <div style={{ position: 'absolute', left: PAD_X, bottom: PAD_Y + 4, display: 'flex' }}>
        <Display lines={lines} size={name.size} period />
      </div>
    </Frame>
  );
};

// ── Project images ─────────────────────────────────────────────

const CATEGORY_KEY = {
  ai: 'catAi',
  software: 'catSoftware',
  hardware: 'catHardware',
  business: 'catBusiness',
  automation: 'catAutomation',
  creative: 'catCreative',
} as const;

const STATUS_KEY = {
  active: 'statusActive',
  completed: 'statusCompleted',
  ongoing: 'statusOngoing',
  acquired: 'statusAcquired',
} as const;

/** One line or two, whichever sets the name bigger, within the space under the motif. */
const fitName = (text: string) => {
  const name = upper(text);
  const metrics = fontMetrics(FONT_FILES.wide800);
  const one = fitText(name, metrics, { maxSize: 150, minSize: 60, maxWidth: FIT_WIDTH, maxLines: 1, letterSpacingEm: TRACK });
  const two = fitText(name, metrics, { maxSize: 104, minSize: 60, maxWidth: FIT_WIDTH, maxLines: 2, letterSpacingEm: TRACK });
  return two.lines.length > 1 && two.size > one.size ? two : one;
};

const ProjectImage = ({ project }: { project: Project }) => {
  const strings = getStrings('projects', LANG);
  const pdf = getStrings('pdf', LANG);
  const name = fitName(t(project.name));
  const categories = upper(project.categories.map((c) => fontSafe(strings[CATEGORY_KEY[c]])).join(' · '));
  const MOTIF = 236;
  return (
    <Frame>
      <TopRow>
        <IndexLabel index={pad2(project.order)} label={fontSafe(pdf.ogProject)} />
        <span style={monoLabel(OG.ink2)}>{categories}</span>
      </TopRow>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: 700 }}>
          <div style={{ display: 'flex', fontFamily: FAMILY.semiwide, fontWeight: 500, fontSize: 38, lineHeight: 1.12, letterSpacing: -0.76 }}>
            {t(project.tagline)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 22, ...monoLabel(OG.ink3, 14) }}>
            {project.period && <PeriodLabel period={project.period} color={OG.ink3} size={14} />}
            {project.period && project.status && <span style={{ margin: '0 12px', color: OG.line }}>/</span>}
            {project.status && <span style={{ color: OG.accentInk }}>{upper(fontSafe(strings[STATUS_KEY[project.status]]))}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', marginTop: -8 }}>
          <Motif motif={project.cover.motif} seed={project.slug} size={MOTIF} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
        <Display lines={name.lines} size={name.size} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 26,
            paddingTop: 16,
            borderTop: `1px solid ${OG.line}`,
            ...monoLabel(OG.ink3, 14),
          }}
        >
          <span>{upper(fontSafe(`${pdf.ogBy} ${profile.name}`))}</span>
          <span style={{ color: OG.ink }}>{upper(`${host(SITE_URL)}/projects/${project.slug}`)}</span>
        </div>
      </div>
    </Frame>
  );
};

// ── Favicon ────────────────────────────────────────────────────

/**
 * Identity mark: ink rounded square, paper "S" in the wide cut and the
 * vermilion full stop of "SAFWAN." `small` is drawn bolder for 32 px.
 */
const Mark = ({ size, rounded, small }: { size: number; rounded: boolean; small?: boolean }) => {
  const glyph = size * (small ? 0.74 : 0.66);
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: OG.ink,
        borderRadius: rounded ? size * 0.22 : 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontFamily: FAMILY.wide,
          fontWeight: 800,
          fontSize: glyph,
          lineHeight: 1,
          letterSpacing: small ? glyph * -0.02 : 0,
          color: OG.paper,
          marginTop: glyph * 0.04,
        }}
      >
        {profile.name.charAt(0)}
        <span style={{ color: OG.accent }}>.</span>
      </div>
    </div>
  );
};

// ── Entry point ────────────────────────────────────────────────

export const generateOgImages = async () => {
  await Promise.all([ensureWasm(), loadFonts()]);
  const portrait = `data:image/jpeg;base64,${(await readFile('public/images/portrait-square-600.jpg')).toString('base64')}`;
  const card = (node: ReactNode) => toSvg(node, W, H).then((svg) => toPng(svg, W));

  // Render everything first, write only when all succeeded: a failure keeps
  // the previous files intact.
  const [ogDefault, ogProjects, master, small, square] = await Promise.all([
    card(<DefaultImage portrait={portrait} />),
    Promise.all(projects.map((project) => card(<ProjectImage project={project} />))),
    toSvg(<Mark size={512} rounded />, 512, 512),
    toSvg(<Mark size={512} rounded small />, 512, 512),
    toSvg(<Mark size={512} rounded={false} />, 512, 512),
  ]);
  const [favicon32, appleTouch, icon192, icon512] = await Promise.all([toPng(small, 32), toPng(square, 180), toPng(master, 192), toPng(master, 512)]);

  const manifest = {
    name: profile.name,
    short_name: profile.givenName,
    lang: LANG,
    start_url: '/',
    display: 'browser',
    theme_color: OG.ink,
    background_color: OG.paper,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };

  const files: [string, string | Uint8Array][] = [
    [`public${FILES.ogDefault}`, ogDefault],
    ...projects.map((project, i): [string, Uint8Array] => [`public${FILES.ogProject(project.slug)}`, ogProjects[i]]),
    ['public/favicon.svg', master],
    ['public/favicon-32.png', favicon32],
    ['public/apple-touch-icon.png', appleTouch],
    ['public/icon-192.png', icon192],
    ['public/icon-512.png', icon512],
    ['public/site.webmanifest', `${JSON.stringify(manifest, null, 2)}\n`],
  ];
  await mkdir('public/og/projects', { recursive: true });
  await Promise.all(files.map(([path, data]) => writeFile(path, data)));

  // Remove images of projects that no longer exist.
  const slugs = new Set(projects.map((p) => `${p.slug}.png`));
  const stale = (await readdir('public/og/projects')).filter((f) => f.endsWith('.png') && !slugs.has(f));
  await Promise.all(stale.map((f) => rm(`public/og/projects/${f}`)));

  console.log(`    OG: default + ${projects.length} projects, favicons, manifest`);
};
