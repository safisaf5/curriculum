import type { Lang, Period, YearMonth } from '../data/types';
import { BUILD_MONTH } from './build';
import { localize } from './text';

const MONTHS: Record<Lang, string[]> = {
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const PRESENT: Record<Lang, string> = { fr: "aujourd'hui", en: 'present' };

/** '2020-07' → 'juil. 2020' / 'Jul 2020'; '2020' → '2020'; '2024-03-28' → '28 mars 2024'. */
export const formatYearMonth = (value: YearMonth, lang: Lang): string => {
  const [y, m, d] = value.split('-');
  if (!m) return y;
  const month = MONTHS[lang][Number(m) - 1];
  if (d) return lang === 'fr' ? `${Number(d)} ${month} ${y}` : `${month} ${Number(d)}, ${y}`;
  return `${month} ${y}`;
};

export const yearOf = (value?: YearMonth) => (value ? Number(value.slice(0, 4)) : undefined);

/** True when the period ends in the future or is ongoing (relative to the build date). */
export const isOngoing = (period: Period): boolean => {
  if (period.end === 'present') return true;
  if (!period.end) return false;
  return period.end.slice(0, 7) >= BUILD_MONTH && period.start.slice(0, 7) <= BUILD_MONTH;
};

/**
 * 'juil. 2020 → aujourd'hui', '2020 → 2024', 'oct. 2019'.
 * Arrow instead of a dash on purpose (house style: no em/en dashes).
 */
export const formatPeriod = (period: Period, lang: Lang, opts: { withDetail?: boolean } = {}): string => {
  const start = formatYearMonth(period.start, lang);
  let out = start;
  if (period.end) {
    const end = period.end === 'present' ? PRESENT[lang] : formatYearMonth(period.end, lang);
    // Same year: "mai → juin 2025"
    if (period.end !== 'present' && period.start.length === 7 && period.end.length === 7 && period.start.slice(0, 4) === period.end.slice(0, 4)) {
      out = `${MONTHS[lang][Number(period.start.slice(5, 7)) - 1]} → ${end}`;
    } else {
      out = `${start} → ${end}`;
    }
  }
  if (opts.withDetail && period.detail) out = `${out} (${localize(period.detail, lang)})`;
  return localize(out, lang);
};

/** Short period, years only: '2020 → 2024', '2020 → auj.', '2019'. */
export const formatYears = (period: Period): string => {
  const s = period.start.slice(0, 4);
  if (!period.end) return s;
  if (period.end === 'present') return `${s} →`;
  const e = period.end.slice(0, 4);
  return s === e ? s : `${s} → ${e}`;
};

/** Duration in months, inclusive, for display like "5 mois". */
export const durationMonths = (period: Period): number | undefined => {
  if (period.start.length < 7) return undefined;
  const end = period.end === 'present' ? BUILD_MONTH : period.end;
  if (!end || end.length < 7) return 1;
  const [sy, sm] = period.start.split('-').map(Number);
  const [ey, em] = end.split('-').map(Number);
  return (ey - sy) * 12 + (em - sm) + 1;
};
