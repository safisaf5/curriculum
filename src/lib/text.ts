import type { L, Lang } from '../data/types';

const NNBSP = ' '; // narrow no-break space (French punctuation)

/**
 * Light typographic polish, deterministic so server and client agree:
 *  - straight apostrophes become typographic ones;
 *  - French: narrow no-break space before : ; ! ? and inside « ».
 */
export const typo = (text: string, lang: Lang): string => {
  let out = text.replace(/(\w)'(\w)/g, '$1’$2').replace(/'/g, '’');
  if (lang === 'fr') {
    out = out
      .replace(/\s+([:;!?»])/g, `${NNBSP}$1`)
      .replace(/«\s+/g, `«${NNBSP}`);
  }
  return out;
};

/** Pick the language and polish. Accepts plain strings for convenience. */
export const localize = (value: L | string | undefined, lang: Lang): string => {
  if (value === undefined) return '';
  if (typeof value === 'string') return typo(value, lang);
  return typo(value[lang], lang);
};

/** Join with a middle dot, skipping empty parts. */
export const dotJoin = (...parts: (string | undefined | false | null)[]) =>
  parts.filter(Boolean).join(' · ');

export const pad2 = (n: number) => String(n).padStart(2, '0');
