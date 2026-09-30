import type { EntityRef, TimelineChapter } from './types';
import { allEntities, type EntityInfo } from './entities';
import { education } from './education';
import { experience } from './experience';

/**
 * Timeline chapters. Titles are written by hand; the items under each year
 * are collected automatically from every dated entry in /src/data, so a new
 * job, project or appearance shows up here without touching this file.
 */
export const timelineChapters: Omit<TimelineChapter, 'items'>[] = [
  {
    year: 2017,
    title: { fr: 'Premier établi', en: 'First workbench' },
    body: {
      fr: "Premier stage : remplacer le châssis d'iPhones par des modèles en or ou gravés.",
      en: 'First internship: swapping iPhone chassis for gold or engraved ones.',
    },
  },
  {
    year: 2018,
    title: { fr: 'Mécanique et ingénierie', en: 'Mechanics and engineering' },
    body: {
      fr: "À l'HEPIA et au CFPT : les principes de l'ingénierie et de la mécanique de précision.",
      en: 'At HEPIA and CFPT: the basics of engineering and precision mechanics.',
    },
  },
  {
    year: 2019,
    title: { fr: 'Tester des métiers', en: 'Trying out trades' },
    body: {
      fr: 'Rolex, une pharmacie, un cabinet de pédiatrie : trois univers en un mois.',
      en: 'Rolex, a pharmacy, a paediatric practice: three worlds in one month.',
    },
  },
  {
    year: 2020,
    title: { fr: 'Première entreprise', en: 'First company' },
    body: {
      fr: 'Création de Heal ElectroniX en juillet. Entrée au Collège Voltaire.',
      en: 'Heal ElectroniX founded in July. Started at Collège Voltaire.',
    },
  },
  {
    year: 2021,
    title: { fr: 'Deuxième entreprise', en: 'Second company' },
    body: {
      fr: 'Cofondation de SBSA. Réparations chez PhoneLab, données chez Crypto-Expert.',
      en: 'Co-founded SBSA. Repairs at PhoneLab, data work at Crypto-Expert.',
    },
  },
  {
    year: 2022,
    title: { fr: 'Le code et la parole', en: 'Code and speech' },
    body: {
      fr: 'Scala et IoT à Genève, SEO, un premier site à gérer. Et le Club Genevois de Débat.',
      en: 'Scala and IoT in Geneva, SEO, a first website to run. And the Geneva Debate Club.',
    },
  },
  {
    year: 2023,
    title: { fr: 'Précision et responsabilités', en: 'Precision and responsibility' },
    body: {
      fr: 'Une montre automatique notée 6/6, la présidence des GEunes, des livraisons pour La Poste.',
      en: 'An automatic watch graded 6/6, presidency of Les GEunes, deliveries for Swiss Post.',
    },
  },
  {
    year: 2024,
    title: { fr: 'Sur scène et sur le terrain', en: 'On stage and in the field' },
    body: {
      fr: "2e prix au Concours d'éloquence, la RTS, une maturité avec mention, un scanner MRZ.",
      en: 'Second prize at the Eloquence Contest, Swiss TV, the Matura with honours, an MRZ scanner.',
    },
  },
  {
    year: 2025,
    title: { fr: 'Acquérir et transmettre', en: 'Acquire and teach' },
    body: {
      fr: "L'armée, le Cirque du Soleil, la marque PEPE CHICKEN, un premier atelier IA, l'EPFL.",
      en: 'The army, Cirque du Soleil, the PEPE CHICKEN brand, a first AI workshop, EPFL.',
    },
  },
  {
    year: 2026,
    title: { fr: "L'IA pour les PME", en: 'AI for small businesses' },
    body: {
      fr: 'Lancement de Neuron IA : agents IA et automatisation pour les PME suisses.',
      en: 'Launch of Neuron IA: AI agents and automation for Swiss SMEs.',
    },
  },
];

/** Entries that would duplicate another one on the timeline. */
const exclude = new Set<EntityRef>([
  'eloquence-stage-2024', // same event as the award
  'geunes-2023', // same as the engagement entry
  'tm-2023', // shown through the watch project
  ...experience.filter((x) => x.project).map((x) => x.id), // founder roles are shown as projects
  ...education.filter((e) => e.kind === 'school').map((e) => e.id),
]);

const yearOf = (e: EntityInfo) => (e.date ? Number(e.date.slice(0, 4)) : NaN);

export interface TimelineYear extends Omit<TimelineChapter, 'items'> {
  items: EntityInfo[];
}

export const getTimeline = (): TimelineYear[] => {
  const entities = allEntities().filter((e) => e.date && !exclude.has(e.id));
  return timelineChapters.map((chapter) => ({
    ...chapter,
    items: entities
      .filter((e) => yearOf(e) === chapter.year)
      .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '')),
  }));
};
