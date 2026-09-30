import { defineStrings } from '../define';

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

    // Story
    storyLabel: 'Parcours',
    storyTitle: "D'abord réparer. Ensuite construire.",

    // Proof
    proofLabel: 'En chiffres',
    proofSince: 'Première entreprise, Heal ElectroniX',
    proofCompanies: 'Entreprises fondées ou cofondées',
    proofBrand: 'Marque acquise en Suisse',
    proofExperiences: (sectors: number) => `Expériences dans ${sectors} secteurs`,
    proofLanguages: 'Langues parlées',
    proofWorkshop: 'Participants à mon atelier IA',
    proofNote: 'Chiffres calculés à partir des données du site.',

    // What I build
    buildLabel: 'Ce que je construis',
    buildTitle: 'Quatre types de systèmes.',
    buildIntro: 'Chaque catégorie renvoie à des projets réels, pas à des promesses.',
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

    storyLabel: 'Journey',
    storyTitle: 'Repair first. Then build.',

    proofLabel: 'In numbers',
    proofSince: 'First company, Heal ElectroniX',
    proofCompanies: 'Companies founded or co-founded',
    proofBrand: 'Brand acquired in Switzerland',
    proofExperiences: (sectors: number) => `Jobs across ${sectors} sectors`,
    proofLanguages: 'Languages spoken',
    proofWorkshop: 'Participants in my AI workshop',
    proofNote: 'Figures computed from the data on this site.',

    buildLabel: 'What I build',
    buildTitle: 'Four kinds of systems.',
    buildIntro: 'Each category points to real projects, not promises.',
  },
});
