import type { Lang } from './data/types';

/** Site-wide configuration. Content lives in /src/data, UI strings in /src/i18n. */
export const SITE_URL = 'https://safwan.ch';

export const LANGS: Lang[] = ['fr', 'en'];
export const DEFAULT_LANG: Lang = 'fr';

/** Home sections, in page order. `nav: true` = listed in the main navigation. */
export const SECTIONS = [
  { id: 'top', nav: false },
  { id: 'about', nav: true },
  { id: 'build', nav: false },
  { id: 'projects', nav: true },
  { id: 'timeline', nav: false },
  { id: 'experience', nav: true },
  { id: 'education', nav: false },
  { id: 'skills', nav: true },
  { id: 'languages', nav: false },
  { id: 'services', nav: true },
  { id: 'media', nav: false },
  { id: 'philosophy', nav: false },
  { id: 'contact', nav: true },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

export const NAV_SECTIONS = SECTIONS.filter((s) => s.nav).map((s) => s.id);

/** Generated at build time by scripts/generate (see docs/ARCHITECTURE.md). */
export const FILES = {
  cvPdf: {
    fr: '/files/Safwan-Abdirahman-CV-FR.pdf',
    en: '/files/Safwan-Abdirahman-CV-EN.pdf',
  } satisfies Record<Lang, string>,
  vcard: '/files/safwan-abdirahman.vcf',
  ogDefault: '/og/default.png',
  ogProject: (slug: string) => `/og/projects/${slug}.png`,
};

/** Localised path: '/cv' → '/en/cv' for English. */
export const localizePath = (path: string, lang: Lang): string => {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === DEFAULT_LANG) return clean;
  if (clean === '/') return `/${lang}`;
  if (clean.startsWith('/#')) return `/${lang}${clean.slice(1)}`;
  return `/${lang}${clean}`;
};

/** Split a pathname into its language and the language-neutral path. */
export const parsePath = (pathname: string): { lang: Lang; path: string } => {
  const match = pathname.match(/^\/(en)(\/.*)?$/);
  if (match) return { lang: 'en', path: match[2] || '/' };
  return { lang: 'fr', path: pathname || '/' };
};

/** Same page in the other language. */
export const switchLangPath = (pathname: string, to: Lang): string => localizePath(parsePath(pathname).path, to);

export const absoluteUrl = (path: string) => `${SITE_URL}${path === '/' ? '/' : path}`;
