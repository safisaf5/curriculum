/**
 * Content checks, run with `npm run check` (and before every build).
 *  - every cross-reference (evidence, related, story...) points to a real entry;
 *  - every localised field has both French and English;
 *  - house style: no em dash or en dash anywhere in visible copy;
 *  - dates are well formed.
 * Exits with code 1 on error so a broken edit never reaches production.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as data from '../src/data';
import { strings } from '../src/i18n';

const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);

// 1. References
const refs: [string, string[]][] = [
  ...data.profile.universes.map((u) => [`profile.universes.${u.id}`, u.evidence] as [string, string[]]),
  ...data.profile.story.map((s) => [`profile.story.${s.id}`, s.evidence] as [string, string[]]),
  ...data.skillGroups.flatMap((g) => g.items.map((s) => [`skills.${s.id}`, s.evidence] as [string, string[]])),
  ...data.services.map((s) => [`services.${s.id}`, s.related] as [string, string[]]),
  ...data.capabilities.map((c) => [`capabilities.${c.id}`, c.evidence] as [string, string[]]),
  ...data.projects.map((p) => [`projects.${p.slug}.related`, p.related ?? []] as [string, string[]]),
  ...data.media.map((m) => [`media.${m.id}.related`, m.related ?? []] as [string, string[]]),
];
for (const [where, ids] of refs) {
  for (const id of ids) if (!data.getEntity(id)) fail(`${where}: unknown reference "${id}"`);
}
for (const x of data.experience) {
  if (x.project && !data.getProject(x.project)) fail(`experience.${x.id}: unknown project "${x.project}"`);
}

// 2. Localised fields + 3. dashes
const DASH = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);
const walk = (value: unknown, path: string) => {
  if (typeof value === 'string') {
    if (DASH.test(value)) fail(`${path}: contains an em/en dash: "${value.slice(0, 80)}"`);
    return;
  }
  if (typeof value === 'function') {
    const sample = (value as (...a: unknown[]) => unknown)(3, 3, 'x');
    if (typeof sample === 'string' && DASH.test(sample)) fail(`${path}(): contains an em/en dash`);
    return;
  }
  if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('fr' in obj && 'en' in obj && Object.keys(obj).length === 2) {
      if (!obj.fr || !obj.en) fail(`${path}: missing ${!obj.fr ? 'fr' : 'en'} text`);
    }
    for (const [k, v] of Object.entries(obj)) walk(v, `${path}.${k}`);
  }
};
for (const [name, value] of Object.entries(data)) {
  if (typeof value !== 'function') walk(value, `data.${name}`);
}
walk(strings, 'i18n');

// 4. Dates
const YM = /^\d{4}(-\d{2}(-\d{2})?)?$/;
const checkPeriod = (p: { start: string; end?: string } | undefined, where: string) => {
  if (!p) return;
  if (!YM.test(p.start)) fail(`${where}: bad start "${p.start}"`);
  if (p.end && p.end !== 'present' && !YM.test(p.end)) fail(`${where}: bad end "${p.end}"`);
  if (p.end && p.end !== 'present' && p.end < p.start) fail(`${where}: ends before it starts`);
};
data.experience.forEach((x) => checkPeriod(x.period, `experience.${x.id}`));
data.education.forEach((x) => checkPeriod(x.period, `education.${x.id}`));
data.projects.forEach((x) => checkPeriod(x.period, `projects.${x.slug}`));

// 5. Dashes and retired copy in source files (JSX text, notes)
const RETIRED = [/Agir avec excellence/i, /servir avec conscience/i]; // check-content:allow
const scan = async (dir: string) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await scan(full);
    else if (/\.(tsx?|md|html|txt|js)$/.test(entry.name)) {
      const text = await readFile(full, 'utf8');
      text.split('\n').forEach((line, i) => {
        if (DASH.test(line) && !line.includes('check-content:allow')) fail(`${full}:${i + 1}: em/en dash`);
        for (const r of RETIRED) if (r.test(line) && !line.includes('check-content:allow')) fail(`${full}:${i + 1}: retired phrase`);
      });
    }
  }
};
await scan('src');
await scan('public').catch(() => undefined);
await scan('scripts');
await readFile('index.html', 'utf8').then((t) => DASH.test(t) && fail('index.html: em/en dash'));

if (errors.length) {
  console.error(`✗ ${errors.length} content problem(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ Content OK: ${data.projects.length} projects, ${data.experience.length} roles, ${data.education.length} courses, ${data.allEntities().length} entities.`);
