import type { EntityRef, L, YearMonth } from './types';
import { projects } from './projects';
import { experience } from './experience';
import { education } from './education';
import { awards, engagement, media } from './recognition';
import { languages, languageCertificates } from './languages';

/**
 * A flat index of every referencable thing (projects, jobs, courses, awards,
 * appearances...). Used by skill "evidence", the story and the timeline so
 * that labels always come from the original entry.
 */
export type EntityKind =
  | 'project'
  | 'experience'
  | 'education'
  | 'award'
  | 'engagement'
  | 'media'
  | 'certificate';

export interface EntityInfo {
  id: EntityRef;
  kind: EntityKind;
  title: L;
  subtitle?: L;
  date?: YearMonth;
  /** Internal path (not localised) or absolute URL. */
  href?: string;
  external?: boolean;
}

const index = new Map<string, EntityInfo>();

const add = (e: EntityInfo) => {
  if (index.has(e.id)) {
    throw new Error(`Duplicate entity id "${e.id}" in src/data`);
  }
  index.set(e.id, e);
};

for (const p of projects) {
  add({
    id: p.slug,
    kind: 'project',
    title: p.name,
    subtitle: p.tagline,
    date: p.period?.start,
    href: `/projects/${p.slug}`,
  });
}

for (const x of experience) {
  add({
    id: x.id,
    kind: 'experience',
    title: x.company,
    subtitle: x.role,
    date: x.period.start,
    href: x.project ? `/projects/${x.project}` : `/#experience`,
  });
}

for (const e of education) {
  add({
    id: e.id,
    kind: 'education',
    title: e.program,
    subtitle: e.institution,
    date: e.period.start,
    href: '/#education',
  });
}

for (const a of awards) {
  add({ id: a.id, kind: 'award', title: a.title, subtitle: a.event, date: a.date, href: '/#media' });
}

for (const g of engagement) {
  add({ id: g.id, kind: 'engagement', title: g.name, subtitle: g.role, date: g.period?.start, href: '/cv' });
}

for (const m of media) {
  add({
    id: m.id,
    kind: 'media',
    title: m.title,
    subtitle: m.outlet,
    date: m.date,
    href: m.url ?? '/#media',
    external: Boolean(m.url),
  });
}

for (const c of languageCertificates) {
  const lang = languages.find((l) => l.code === c.language);
  if (!lang?.certification) continue;
  add({
    id: c.id,
    kind: 'certificate',
    title: { fr: lang.certification.name, en: lang.certification.name },
    subtitle: lang.name,
    date: c.date,
    href: '/#languages',
  });
}

export const getEntity = (id: EntityRef): EntityInfo | undefined => index.get(id);

export const allEntities = (): EntityInfo[] => [...index.values()];

/** Resolve a list of refs, silently skipping unknown ids (checked by scripts/check-content). */
export const resolveEntities = (ids: EntityRef[] = []): EntityInfo[] =>
  ids.map((id) => index.get(id)).filter((e): e is EntityInfo => Boolean(e));
