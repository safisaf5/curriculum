import type { Profile } from './types';

export const profile: Profile = {
  name: 'Safwan Abdirahman',
  givenName: 'Safwan',
  familyName: 'Abdirahman',
  initials: 'SA',
  positioning: 'Tech Entrepreneur · AI · Automation · Electronics · Business',
  roles: ['Tech Entrepreneur', 'AI', 'Automation', 'Electronics', 'Business'],
  title: {
    fr: 'Entrepreneur tech · IA & automatisation',
    en: 'Tech entrepreneur · AI & automation',
  },
  headline: {
    fr: 'Je construis des entreprises, des produits et des systèmes avec la technologie.',
    en: 'I build companies, products and systems with technology.',
  },
  subline: {
    fr: "Entrepreneur basé à Genève, spécialisé dans l'IA, l'automatisation, le développement de projets et la transformation digitale.",
    en: 'Geneva-based entrepreneur focused on AI, automation, project development and digital transformation.',
  },
  availability: {
    fr: 'Disponible pour de nouveaux projets',
    en: 'Available for new projects',
  },
  responseTime: {
    fr: 'Réponse sous 24 h',
    en: 'Reply within 24 hours',
  },
  location: {
    city: { fr: 'Genève', en: 'Geneva' },
    country: { fr: 'Suisse', en: 'Switzerland' },
    region: 'GE',
    countryCode: 'CH',
    lat: 46.2044,
    lng: 6.1432,
    timeZone: 'Europe/Zurich',
  },
  nationality: { fr: 'Suisse', en: 'Swiss' },
  origin: { fr: 'Originaire de Romont (FR)', en: 'Citizen of Romont (FR)' },
  contact: {
    email: 'abdirahman@safwan.ch',
    phone: '+41 78 963 62 23',
    phoneE164: '+41789636223',
    whatsapp: 'https://wa.me/41789636223',
    // Confirmed by Safwan (Sept. 2026).
    linkedin: 'https://www.linkedin.com/in/safwanab',
    website: 'https://safwan.ch',
  },
  buildingSince: 2020,
  summary: {
    fr: "Entrepreneur genevois. J'ai fondé Heal ElectroniX en 2020 (réparation électronique et micro-soudure), cofondé SBSA en 2021 (personnalisation textile et print B2B) et acquis la marque PEPE CHICKEN pour la Suisse en 2025. Aujourd'hui, je construis des outils d'IA et d'automatisation pour les PME avec Neuron IA. Des expériences dans des secteurs très différents, de l'horlogerie à l'armée en passant par l'hôpital, m'ont appris à comprendre vite un métier et à parler à ceux qui le font.",
    en: 'Geneva-based entrepreneur. I founded Heal ElectroniX in 2020 (electronics repair and micro-soldering), co-founded SBSA in 2021 (B2B textile and print customisation) and acquired the PEPE CHICKEN brand for Switzerland in 2025. Today I build AI and automation tools for small businesses with Neuron IA. Jobs in very different sectors, from watchmaking to the army and a hospital, taught me to understand a trade quickly and to talk to the people who do it.',
  },
  universesIntro: {
    title: {
      fr: 'Je ne rentre pas dans une seule case.',
      en: "I don't fit in a single box.",
    },
    body: {
      fr: "Mon avantage n'est pas une spécialité, c'est la combinaison : comprendre la technique, le client et les chiffres, puis l'expliquer clairement.",
      en: "My edge isn't a speciality, it's the combination: understanding the tech, the customer and the numbers, then explaining it clearly.",
    },
  },
  universes: [
    {
      id: 'tech',
      label: { fr: 'Tech', en: 'Tech' },
      domains: {
        fr: 'IA, programmation, automatisation, électronique, IoT',
        en: 'AI, programming, automation, electronics, IoT',
      },
      body: {
        fr: "Du fer à souder au code : réparation de cartes électroniques, Scala et IoT, vision par ordinateur, agents IA.",
        en: 'From soldering iron to code: circuit board repair, Scala and IoT, computer vision, AI agents.',
      },
      evidence: ['heal-electronix', 'heg-scala-iot', 'mrz-scanner', 'neuron-ia'],
    },
    {
      id: 'business',
      label: { fr: 'Business', en: 'Business' },
      domains: {
        fr: 'Entrepreneuriat, création de projets, stratégie, acquisition de marque, développement commercial',
        en: 'Entrepreneurship, venture building, strategy, brand acquisition, business development',
      },
      body: {
        fr: 'Heal ElectroniX en 2020, SBSA en 2021, la marque PEPE CHICKEN en 2025 : je crée, je vends et je gère.',
        en: 'Heal ElectroniX in 2020, SBSA in 2021, the PEPE CHICKEN brand in 2025: I start, sell and run.',
      },
      evidence: ['heal-electronix', 'sbsa', 'pepe-chicken', 'ifage-cafetier'],
    },
    {
      id: 'creative',
      label: { fr: 'Création', en: 'Creative' },
      domains: {
        fr: 'Design, horlogerie, électronique, création de produits',
        en: 'Design, watchmaking, electronics, product making',
      },
      body: {
        fr: "Une montre automatique assemblée à partir de pièces détachées et notée 6/6, de la PAO et de la production textile chez SBSA, de l'impression 3D.",
        en: 'An automatic watch built from spare parts and graded 6/6, DTP and textile production at SBSA, 3D printing.',
      },
      evidence: ['mechanical-watch', 'sbsa', 'rolex', 'lab'],
    },
    {
      id: 'communication',
      label: { fr: 'Communication', en: 'Communication' },
      domains: {
        fr: 'Débat, éloquence, présentation, négociation, relation client',
        en: 'Debate, public speaking, presenting, negotiation, client relations',
      },
      body: {
        fr: "Finaliste du Concours genevois d'éloquence 2024, invité de la RTS, formateur IA devant une trentaine de personnes, président d'une association faîtière d'élèves.",
        en: 'Finalist at the 2024 Geneva Eloquence Contest, featured on Swiss TV (RTS), AI trainer for a room of thirty, president of a student umbrella association.',
      },
      evidence: ['eloquence-2024', 'rts-2024', 'ai-workshop-2025', 'geunes'],
    },
  ],
  story: [
    {
      id: 'repair',
      period: '2017 → 2020',
      title: { fr: 'Réparer', en: 'Repair' },
      body: {
        fr: "J'ai commencé par construire et réparer des choses. Un premier stage en 2017 à transformer des iPhones, puis Rolex, l'HEPIA et le CFPT, et enfin mon propre atelier de micro-soudure.",
        en: 'I started by building and repairing things. A first internship in 2017 customising iPhones, then Rolex, HEPIA and CFPT, and finally my own micro-soldering workshop.',
      },
      evidence: ['golden-dreams', 'rolex', 'hepia', 'cfpt', 'heal-electronix'],
    },
    {
      id: 'venture',
      period: '2020 → 2025',
      title: { fr: 'Entreprendre', en: 'Start companies' },
      body: {
        fr: "Puis j'ai appris à créer des entreprises : Heal ElectroniX en 2020, SBSA en 2021, la marque PEPE CHICKEN en 2025. Devis, clients, fournisseurs, livraisons : le terrain apprend vite.",
        en: 'Then I learned to build companies: Heal ElectroniX in 2020, SBSA in 2021, the PEPE CHICKEN brand in 2025. Quotes, customers, suppliers, deliveries: the field teaches fast.',
      },
      evidence: ['heal-electronix', 'sbsa', 'pepe-chicken', 'ifage-cafetier'],
    },
    {
      id: 'software',
      period: '2022 → 2026',
      title: { fr: 'Coder', en: 'Write software' },
      body: {
        fr: "Ensuite, le software et l'IA pour des problèmes plus complexes : Scala et IoT à l'Université de Genève, un scanner MRZ par vision par ordinateur, du prompt engineering, puis Neuron IA.",
        en: 'Next, software and AI for harder problems: Scala and IoT at the University of Geneva, an MRZ scanner built on computer vision, prompt engineering, then Neuron IA.',
      },
      evidence: ['heg-scala-iot', 'mrz-scanner', 'ai-projects', 'neuron-ia'],
    },
    {
      id: 'combine',
      period: '2026',
      title: { fr: 'Combiner', en: 'Combine' },
      body: {
        fr: "Aujourd'hui, je combine technologie, business et communication pour construire des projets, et pour les expliquer : sur scène, à la RTS ou en atelier.",
        en: 'Today I combine technology, business and communication to build projects, and to explain them: on stage, on TV or in a workshop.',
      },
      evidence: ['eloquence-2024', 'rts-2024', 'ai-workshop-2025'],
    },
  ],
  qualities: [
    { fr: 'Leader naturel', en: 'Natural leader' },
    { fr: 'Orateur', en: 'Public speaker' },
    { fr: 'Innovateur', en: 'Innovator' },
    { fr: 'Polyglotte', en: 'Polyglot' },
    { fr: 'Rigoureux', en: 'Rigorous' },
    { fr: 'Stratège', en: 'Strategist' },
  ],
  portrait: {
    alt: {
      fr: 'Portrait de Safwan Abdirahman, chemise noire, sur fond clair',
      en: 'Portrait of Safwan Abdirahman in a black shirt against a light background',
    },
    base: '/images/portrait',
    width: 1800,
    height: 2400,
    fallback: '/IMG_8964.JPG',
  },
};
