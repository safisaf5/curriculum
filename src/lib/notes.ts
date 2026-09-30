import type { Lang } from '../data/types';

/**
 * Notes / journal, stored as Markdown in /src/content/notes.
 *
 *   src/content/notes/<slug>.fr.md   (French)
 *   src/content/notes/<slug>.en.md   (English, optional: falls back to French)
 *
 * Front matter (between --- lines): title, description, date (YYYY-MM-DD),
 * tags ([ai, business]), draft (true to hide). Files starting with "_" are
 * ignored (see _template.fr.md). No CMS needed: add a file, rebuild.
 */

export interface NoteMeta {
  slug: string;
  lang: Lang;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingMinutes: number;
}

export interface Note extends NoteMeta {
  body: string;
}

const raw = import.meta.glob('/src/content/notes/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;

const parseValue = (value: string): string | string[] | boolean => {
  const v = value.trim();
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v.startsWith('[') && v.endsWith(']')) {
    return v
      .slice(1, -1)
      .split(',')
      .map((x) => x.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }
  return v.replace(/^['"]|['"]$/g, '');
};

export const parseNote = (source: string, file: string): (Note & { draft: boolean }) | null => {
  const name = file.split('/').pop() ?? '';
  const match = name.match(/^([a-z0-9-]+)\.(fr|en)\.md$/);
  if (!match || name.startsWith('_')) return null;
  const [, slug, lang] = match;

  const fm = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const data: Record<string, string | string[] | boolean> = {};
  if (fm) {
    for (const line of fm[1].split(/\r?\n/)) {
      const i = line.indexOf(':');
      if (i > 0) data[line.slice(0, i).trim()] = parseValue(line.slice(i + 1));
    }
  }
  const body = fm ? source.slice(fm[0].length) : source;
  const words = body.split(/\s+/).filter(Boolean).length;

  return {
    slug,
    lang: lang as Lang,
    title: String(data.title ?? slug),
    description: String(data.description ?? ''),
    date: String(data.date ?? ''),
    tags: Array.isArray(data.tags) ? data.tags : [],
    readingMinutes: Math.max(1, Math.round(words / 220)),
    draft: data.draft === true,
    body,
  };
};

const all: Note[] = Object.entries(raw)
  .map(([file, source]) => parseNote(source, file))
  .filter((n): n is Note & { draft: boolean } => Boolean(n) && !n!.draft)
  .map(({ draft: _draft, ...note }) => note)
  .sort((a, b) => b.date.localeCompare(a.date));

/** Notes for a language, falling back to the other language when untranslated. */
export const getNotes = (lang: Lang): NoteMeta[] => {
  const slugs = [...new Set(all.map((n) => n.slug))];
  return slugs
    .map((slug) => all.find((n) => n.slug === slug && n.lang === lang) ?? all.find((n) => n.slug === slug)!)
    .map(({ body: _body, ...meta }) => meta)
    .sort((a, b) => b.date.localeCompare(a.date));
};

export const getNote = (slug: string, lang: Lang): Note | undefined =>
  all.find((n) => n.slug === slug && n.lang === lang) ?? all.find((n) => n.slug === slug);

export const getNoteSlugs = (): string[] => [...new Set(all.map((n) => n.slug))];
