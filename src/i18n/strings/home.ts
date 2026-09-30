import { defineStrings } from '../define';

/**
 * Short display names for evidence entities whose full title is too long for
 * an inline proof link. Anything not listed falls back to the entity title.
 */
const EVIDENCE_SHORT: Record<string, { fr: string; en: string }> = {
  'heg-scala-iot': { fr: 'Scala & IoT', en: 'Scala & IoT' },
  'ifage-cafetier': { fr: 'Patente de cafetier', en: 'Restaurant licence' },
  'eloquence-2024': { fr: 'Éloquence, 2e prix', en: 'Eloquence, 2nd prize' },
  'rts-2024': { fr: 'RTS', en: 'RTS' },
  'ai-workshop-2025': { fr: 'Atelier IA', en: 'AI workshop' },
  geunes: { fr: 'Président GEunes', en: 'GEunes president' },
  rolex: { fr: 'Stage Rolex', en: 'Rolex internship' },
  hepia: { fr: 'HEPIA', en: 'HEPIA' },
  cfpt: { fr: 'CFPT', en: 'CFPT' },
};

/** Hero, identity, story, proof and "what I build". */
export default defineStrings({
  fr: {
    // Hero
    heroIndex: 'Index',
    heroLocation: 'Geneva / Switzerland',
    heroDisciplines: 'AI · Automation · Entrepreneurship',
    heroSince: (year: number) => `Building since ${year}`,
    heroCtaJourney: 'Explorer mon parcours',
    heroCtaWork: 'Travailler avec moi',
    heroCtaCv: 'Télécharger mon CV',
    heroScroll: 'Défiler',
    dialLabel: "Carte de l'écosystème : disciplines et projets de Safwan",
    dialHint: 'Survolez une discipline',

    // Identity
    identityLabel: 'Identité',
    identityProof: 'Exemples',
    evidenceShort: (id: string) => EVIDENCE_SHORT[id]?.fr ?? '',

    // Story
    storyLabel: 'Parcours',
    storyTitle: "D'abord réparer. Ensuite construire.",
    storyNav: 'Chapitres du parcours',
    storyStep: (n: number, title: string) => `Chapitre ${n} : ${title}`,

    // Proof
    proofLabel: 'En chiffres',
    proofSince: 'Première entreprise, Heal ElectroniX',
    proofCompanies: 'Entreprises fondées ou cofondées',
    proofBrand: 'Marque acquise en Suisse',
    proofExperiences: (sectors: number) => `Expériences dans ${sectors} secteurs`,
    proofLanguages: 'Langues parlées',
    proofWorkshop: 'Participants à mon atelier IA',
    proofNote: 'Chiffres calculés à partir des données du site.',
    proofAbout: (n: number) => `environ ${n}`,

    // What I build
    buildLabel: 'Ce que je construis',
    buildTitle: 'Quatre types de systèmes.',
    buildIntro: 'Chaque catégorie renvoie à des projets réels, pas à des promesses.',
    buildScope: 'Périmètre',
  },
  en: {
    heroIndex: 'Index',
    heroLocation: 'Geneva / Switzerland',
    heroDisciplines: 'AI · Automation · Entrepreneurship',
    heroSince: (year: number) => `Building since ${year}`,
    heroCtaJourney: 'Explore my journey',
    heroCtaWork: 'Work with me',
    heroCtaCv: 'Download my CV',
    heroScroll: 'Scroll',
    dialLabel: "Ecosystem map: Safwan's disciplines and projects",
    dialHint: 'Hover a discipline',

    identityLabel: 'Identity',
    identityProof: 'Examples',
    evidenceShort: (id: string) => EVIDENCE_SHORT[id]?.en ?? '',

    storyLabel: 'Journey',
    storyTitle: 'Repair first. Then build.',
    storyNav: 'Journey chapters',
    storyStep: (n: number, title: string) => `Chapter ${n}: ${title}`,

    proofLabel: 'In numbers',
    proofSince: 'First company, Heal ElectroniX',
    proofCompanies: 'Companies founded or co-founded',
    proofBrand: 'Brand acquired in Switzerland',
    proofExperiences: (sectors: number) => `Jobs across ${sectors} sectors`,
    proofLanguages: 'Languages spoken',
    proofWorkshop: 'Participants in my AI workshop',
    proofNote: 'Figures computed from the data on this site.',
    proofAbout: (n: number) => `about ${n}`,

    buildLabel: 'What I build',
    buildTitle: 'Four kinds of systems.',
    buildIntro: 'Each category points to real projects, not promises.',
    buildScope: 'Scope',
  },
});
