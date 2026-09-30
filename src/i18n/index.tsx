import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { L, Lang } from '../data/types';
import { localize, typo } from '../lib/text';
import type { StringTable } from './define';
import { localizePath } from '../site';
import common from './strings/common';
import nav from './strings/nav';
import home from './strings/home';
import projects from './strings/projects';
import journey from './strings/journey';
import skills from './strings/skills';
import offer from './strings/offer';
import contact from './strings/contact';
import cv from './strings/cv';
import card from './strings/card';
import notes from './strings/notes';
import pdf from './strings/pdf';
import seo from './strings/seo';

/**
 * All UI strings, by namespace. Content (projects, jobs...) is localised in
 * /src/data with { fr, en } fields; this module only covers interface copy.
 */
export const strings = { common, nav, home, projects, journey, skills, offer, contact, cv, card, notes, pdf, seo };
export type Namespace = keyof typeof strings;

const LangContext = createContext<Lang>('fr');

export const LangProvider = ({ lang, children }: { lang: Lang; children: ReactNode }) => (
  <LangContext.Provider value={lang}>{children}</LangContext.Provider>
);

export const useLang = () => useContext(LangContext);

// Same typographic polish as the data (curly apostrophes, French spacing),
// applied once per namespace and language.
const polished = new Map<string, StringTable>();
const polish = (ns: Namespace, lang: Lang): StringTable => {
  const key = `${ns}:${lang}`;
  let table = polished.get(key);
  if (!table) {
    const source = strings[ns][lang] as StringTable;
    table = Object.fromEntries(
      Object.entries(source).map(([k, v]) => [
        k,
        typeof v === 'string' ? typo(v, lang) : (...args: unknown[]) => typo(String(v(...args)), lang),
      ]),
    );
    polished.set(key, table);
  }
  return table;
};

/** Direct access outside React (prerender, generators). */
export const getStrings = <N extends Namespace>(ns: N, lang: Lang) => polish(ns, lang) as (typeof strings)[N]['fr'];

/** Typed strings of one namespace for the current language: `const t = useT('nav'); t.about` */
export const useT = <N extends Namespace>(ns: N) => {
  const lang = useLang();
  return getStrings(ns, lang);
};

/** Localise a data field: `const l = useL(); l(project.name)` */
export const useL = () => {
  const lang = useLang();
  return useCallback((value: L | string | undefined) => localize(value, lang), [lang]);
};

/** Localised internal path: `const lp = useLocalePath(); lp('/cv')` → '/en/cv' in English. */
export const useLocalePath = () => {
  const lang = useLang();
  return useCallback((path: string) => localizePath(path, lang), [lang]);
};

/** Everything at once, for components that need several helpers. */
export const useI18n = () => {
  const lang = useLang();
  const l = useL();
  const lp = useLocalePath();
  return useMemo(() => ({ lang, l, lp }), [lang, l, lp]);
};
