import type { Cefr, SpokenLanguage } from './types';

export const languages: SpokenLanguage[] = [
  {
    code: 'FR',
    name: { fr: 'Français', en: 'French' },
    level: { fr: 'Langue maternelle', en: 'Native' },
    cefr: 'native',
    cefrLabel: 'C2',
  },
  {
    code: 'AR',
    name: { fr: 'Arabe', en: 'Arabic' },
    level: { fr: 'Courant', en: 'Fluent' },
    cefr: 'C1',
    cefrLabel: 'B2-C1',
    note: { fr: 'École arabe de Genève, 2010 à 2020', en: 'Arabic School of Geneva, 2010 to 2020' },
  },
  {
    code: 'EN',
    name: { fr: 'Anglais', en: 'English' },
    level: { fr: 'Intermédiaire supérieur', en: 'Upper intermediate' },
    cefr: 'B2',
    cefrLabel: 'B2',
    certification: {
      name: 'Cambridge English B2 First (FCE)',
      detail: { fr: 'Score 172 · grade C', en: 'Score 172 · grade C' },
      date: '2024-04-20',
    },
  },
  {
    code: 'IT',
    name: { fr: 'Italien', en: 'Italian' },
    level: { fr: 'Intermédiaire supérieur', en: 'Upper intermediate' },
    cefr: 'B2',
    cefrLabel: 'B2',
    certification: {
      name: 'DILI-B2 (AIL Firenze)',
      detail: { fr: 'Examen passé à Florence (Italie)', en: 'Exam taken in Florence, Italy' },
      date: '2024-03-16',
    },
  },
  {
    code: 'DE',
    name: { fr: 'Allemand', en: 'German' },
    level: { fr: 'Élémentaire', en: 'Elementary' },
    cefr: 'A2',
    cefrLabel: 'A2',
    note: { fr: 'Acquis pendant le service militaire à Thoune (BE)', en: 'Acquired during military service in Thun (BE)' },
  },
];

/** Scale used by the language graphic. */
export const cefrScale: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'];

/** Language certificates as referencable entities (for skills evidence). */
export const languageCertificates = [
  { id: 'cambridge-fce', language: 'EN', date: '2024-04-20' },
  { id: 'dili-b2', language: 'IT', date: '2024-03-16' },
] as const;
