import type { Capability, Service } from './types';

export const services: Service[] = [
  {
    id: 'ai-automation',
    index: '01',
    title: { fr: 'IA & automatisation', en: 'AI & automation' },
    short: {
      fr: "Audit, automatisation, agents IA, intégration d'outils, formation.",
      en: 'Audit, automation, AI agents, tool integration, training.',
    },
    description: {
      fr: "Je repère ce qui peut être automatisé dans votre entreprise, je choisis les outils d'IA adaptés, je les mets en place, puis je forme votre équipe à s'en servir.",
      en: 'I find what can be automated in your business, pick the right AI tools, set them up, then train your team to use them.',
    },
    examples: [
      { fr: 'Tri et réponse assistée aux e-mails entrants', en: 'Sorting and drafting replies to incoming emails' },
      { fr: "Génération de devis à partir d'une demande client", en: 'Generating quotes from a customer request' },
      { fr: 'Agent de support qui répond en plusieurs langues', en: 'A support agent that answers in several languages' },
      { fr: 'Workflows n8n ou Make entre CRM, e-mail et facturation', en: 'n8n or Make workflows between CRM, email and invoicing' },
      { fr: "Atelier de prise en main de l'IA pour une équipe", en: 'A hands-on AI workshop for a team' },
    ],
    deliverables: [
      { fr: 'Audit des processus automatisables', en: 'Audit of automatable processes' },
      { fr: 'Sélection des outils IA adaptés', en: 'Selection of the right AI tools' },
      { fr: 'Intégration et configuration', en: 'Integration and configuration' },
      { fr: 'Formation et accompagnement', en: 'Training and support' },
    ],
    subject: 'ai',
    related: ['neuron-ia', 'ai-projects', 'ai-workshop-2025'],
  },
  {
    id: 'digital-transformation',
    index: '02',
    title: { fr: 'Transformation digitale', en: 'Digital transformation' },
    short: {
      fr: 'Modernisation des processus, présence digitale, outils et workflows.',
      en: 'Process modernisation, digital presence, tools and workflows.',
    },
    description: {
      fr: 'Stratégie et mise en œuvre pour moderniser votre entreprise, améliorer votre présence digitale et simplifier vos opérations.',
      en: 'Strategy and execution to modernise your business, improve your digital presence and simplify operations.',
    },
    examples: [
      { fr: 'Remplacer des fichiers dispersés par un outil central', en: 'Replacing scattered spreadsheets with one central tool' },
      { fr: 'Refonte de site et référencement (SEO)', en: 'Website redesign and SEO' },
      { fr: "Mise en place d'un CRM et de ses automatisations", en: 'Setting up a CRM and its automations' },
      { fr: 'Digitalisation des devis ou des rendez-vous', en: 'Digitising quotes or bookings' },
    ],
    deliverables: [
      { fr: 'Analyse et diagnostic digital', en: 'Digital audit and diagnosis' },
      { fr: 'Stratégie de transformation', en: 'Transformation roadmap' },
      { fr: 'Mise en place des outils', en: 'Tool setup and rollout' },
      { fr: 'Suivi des performances', en: 'Performance tracking' },
    ],
    subject: 'digital',
    related: ['neuron-ia', 'mamajah', 'google-seo'],
  },
  {
    id: 'technology-hardware',
    index: '03',
    title: { fr: 'Technologie & hardware', en: 'Technology & hardware' },
    short: {
      fr: 'Électronique, hardware, diagnostic et projets techniques.',
      en: 'Electronics, hardware, diagnostics and technical projects.',
    },
    description: {
      fr: 'Avec Heal ElectroniX : réparation électronique, micro-soudure et récupération de données. Et un appui sur vos projets techniques : prototypage, IoT, diagnostic.',
      en: 'Through Heal ElectroniX: electronics repair, micro-soldering and data recovery. Plus support on technical projects: prototyping, IoT, diagnostics.',
    },
    examples: [
      { fr: 'Réparation de smartphones, Mac et PC', en: 'Smartphone, Mac and PC repair' },
      { fr: 'Micro-soudure sur carte mère', en: 'Motherboard micro-soldering' },
      { fr: 'Récupération de données', en: 'Data recovery' },
      { fr: 'Maintenance préventive et effacement sécurisé pour entreprises', en: 'Preventive maintenance and secure wiping for businesses' },
      { fr: 'Prototype Arduino ou Raspberry Pi', en: 'Arduino or Raspberry Pi prototype' },
    ],
    deliverables: [
      { fr: 'Réparation & micro-soudure', en: 'Repair & micro-soldering' },
      { fr: 'Récupération de données', en: 'Data recovery' },
      { fr: 'Diagnostic matériel', en: 'Hardware diagnostics' },
      { fr: 'Conseil en équipement', en: 'Equipment advice' },
    ],
    subject: 'hardware',
    related: ['heal-electronix', 'lab'],
  },
];

/** "What I build": four kinds of things, each backed by real projects. */
export const capabilities: Capability[] = [
  {
    id: 'ai-systems',
    title: { fr: 'Systèmes IA', en: 'AI systems' },
    body: { fr: 'Agents IA, automatisation, workflows.', en: 'AI agents, automation, workflows.' },
    items: [
      { fr: 'Agents spécialisés', en: 'Specialised agents' },
      { fr: 'Workflows automatisés', en: 'Automated workflows' },
      { fr: 'Prompt engineering', en: 'Prompt engineering' },
    ],
    evidence: ['neuron-ia', 'ai-projects'],
    glyph: 'agents',
  },
  {
    id: 'digital-products',
    title: { fr: 'Produits digitaux', en: 'Digital products' },
    body: { fr: 'Applications web, SaaS, outils internes.', en: 'Web apps, SaaS, internal tools.' },
    items: [
      { fr: 'Applications web', en: 'Web applications' },
      { fr: 'Plateformes SaaS', en: 'SaaS platforms' },
      { fr: 'Vision par ordinateur', en: 'Computer vision' },
    ],
    evidence: ['neuron-ia', 'mrz-scanner'],
    glyph: 'product',
  },
  {
    id: 'business-systems',
    title: { fr: 'Systèmes business', en: 'Business systems' },
    body: { fr: 'CRM, automatisation, acquisition, processus.', en: 'CRM, automation, acquisition, processes.' },
    items: [
      { fr: 'Offres B2B', en: 'B2B offers' },
      { fr: 'Processus de production', en: 'Production processes' },
      { fr: 'Acquisition de marque', en: 'Brand acquisition' },
    ],
    evidence: ['sbsa', 'heal-electronix', 'pepe-chicken'],
    glyph: 'system',
  },
  {
    id: 'hardware',
    title: { fr: 'Hardware', en: 'Hardware' },
    body: { fr: 'Électronique, IoT, réparation, prototypage.', en: 'Electronics, IoT, repair, prototyping.' },
    items: [
      { fr: 'Micro-soudure', en: 'Micro-soldering' },
      { fr: 'Horlogerie', en: 'Watchmaking' },
      { fr: 'Prototypes IoT', en: 'IoT prototypes' },
    ],
    evidence: ['heal-electronix', 'mechanical-watch', 'lab'],
    glyph: 'hardware',
  },
];
