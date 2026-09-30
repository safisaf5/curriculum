import type { EntityKind, ExperienceType } from '../../data';

/** journey.kind* key for every entity kind shown on the timeline. */
export const KIND_KEY = {
  project: 'kindProject',
  experience: 'kindExperience',
  education: 'kindEducation',
  award: 'kindAward',
  engagement: 'kindEngagement',
  media: 'kindMedia',
  certificate: 'kindCertificate',
} as const satisfies Record<EntityKind, string>;

/** journey.type* key for every experience type, in filter order. */
export const TYPE_KEY = {
  founder: 'typeFounder',
  work: 'typeWork',
  military: 'typeMilitary',
  internship: 'typeInternship',
} as const satisfies Record<ExperienceType, string>;

export const EXPERIENCE_TYPES = Object.keys(TYPE_KEY) as ExperienceType[];

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** 'https://sbsa.agency/' → 'sbsa.agency' (display only). */
export const hostOf = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/**
 * Split an institution such as "EPFL · École polytechnique fédérale de Lausanne"
 * into its short name and the rest, so the short name can carry the weight.
 */
export const splitInstitution = (value: string): [string, string | undefined] => {
  const i = value.indexOf(' · ');
  return i < 0 ? [value, undefined] : [value.slice(0, i), value.slice(i + 3)];
};

export interface ResultPart {
  text: string;
  /** Grade found in the text, e.g. "5.1/6". */
  grade?: string;
}

const GRADE = /(\d+(?:[.,]\d+)?\/\d+)/;

/**
 * "Moyenne générale 5.1/6 · travail de maturité noté 6/6" →
 * [{ text: 'Moyenne générale', grade: '5.1/6' }, { text: 'travail de maturité noté', grade: '6/6' }].
 * Pure string work on the data, nothing is added.
 */
export const parseResult = (value: string): ResultPart[] =>
  value
    .split(' · ')
    .map((part) => {
      const m = part.match(GRADE);
      if (!m || m.index === undefined) return { text: part.trim() };
      const text = (part.slice(0, m.index) + part.slice(m.index + m[1].length)).replace(/\s+/g, ' ').trim();
      return { text, grade: m[1] };
    })
    .filter((p) => p.text || p.grade);
