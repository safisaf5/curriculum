import type { Project, ProjectCategory } from './types';

/**
 * Projects. To add one: copy an entry, give it a unique `slug`, fill what you
 * know and leave the rest out. Its page (/projects/<slug>), Open Graph image,
 * sitemap entry and filters are generated automatically.
 */
export const projects: Project[] = [
  {
    slug: 'neuron-ia',
    name: { fr: 'Neuron IA', en: 'Neuron IA' },
    tagline: {
      fr: 'IA et automatisation pour les PME suisses.',
      en: 'AI and automation for Swiss SMEs.',
    },
    summary: {
      fr: 'Assistant IA privé pour PME : quatre agents spécialisés automatisent e-mails, devis et CRM, avec un hébergement en Suisse.',
      en: 'A private AI assistant for SMEs: four specialised agents automate emails, quotes and CRM, hosted in Switzerland.',
    },
    period: { start: '2026', end: 'present' },
    status: 'active',
    categories: ['ai', 'automation', 'software', 'business'],
    tags: ['AI', 'AUTOMATION', 'SOFTWARE', 'ENTREPRENEURSHIP'],
    featured: true,
    order: 1,
    overview: {
      fr: "Neuron IA est une plateforme SaaS d'automatisation par l'IA pensée pour les PME suisses. Quatre agents spécialisés (support client, commercial, analyste, multilingue) prennent en charge les e-mails, les devis et le CRM.",
      en: 'Neuron IA is an AI automation SaaS platform built for Swiss SMEs. Four specialised agents (customer support, sales, analyst, multilingual) handle emails, quotes and CRM.',
    },
    problem: {
      fr: "Les PME passent beaucoup de temps sur des tâches répétitives (e-mails, devis, suivi client) et hésitent à confier leurs données à des outils d'IA hébergés à l'étranger.",
      en: 'Small businesses spend a lot of time on repetitive work (emails, quotes, customer follow-up) and are wary of handing their data to AI tools hosted abroad.',
    },
    idea: {
      fr: "Des agents IA privés, spécialisés par métier et hébergés en Suisse pour la confidentialité des données. L'offre annonce un déploiement en 7 jours et un gain moyen de 10 heures par semaine.",
      en: 'Private AI agents, each specialised in a job and hosted in Switzerland to keep data confidential. The offer states a 7-day deployment and an average of 10 hours saved per week.',
    },
    role: {
      fr: 'Conception du produit et développement de la plateforme.',
      en: 'Product design and platform development.',
    },
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Framer Motion', 'AI Agents'],
    links: [{ label: { fr: 'neuronia.ch', en: 'neuronia.ch' }, href: 'https://neuronia.ch' }],
    milestones: [{ date: '2026', title: { fr: 'Lancement de la plateforme', en: 'Platform launch' } }],
    cover: { motif: 'network' },
    related: ['ai-projects', 'ai-workshop-2025'],
  },
  {
    slug: 'heal-electronix',
    name: { fr: 'Heal ElectroniX', en: 'Heal ElectroniX' },
    tagline: {
      fr: 'Réparation électronique, micro-soudure et hardware.',
      en: 'Electronics repair, micro-soldering and hardware.',
    },
    summary: {
      fr: 'Atelier genevois de réparation de smartphones, Mac et PC fondé en juillet 2020 : micro-soudure, diagnostic et récupération de données, pour particuliers et entreprises.',
      en: 'A Geneva workshop repairing smartphones, Macs and PCs, founded in July 2020: micro-soldering, diagnostics and data recovery for individuals and businesses.',
    },
    period: { start: '2020-07', end: 'present' },
    status: 'active',
    categories: ['hardware', 'business'],
    tags: ['HARDWARE', 'BUSINESS', 'ENTREPRENEURSHIP'],
    featured: true,
    order: 2,
    overview: {
      fr: "Heal ElectroniX est l'atelier que j'ai fondé à Genève en 2020. Il répare smartphones, Mac et PC, jusqu'aux composants de la carte mère grâce à la micro-soudure.",
      en: 'Heal ElectroniX is the workshop I founded in Geneva in 2020. It repairs smartphones, Macs and PCs down to motherboard components with micro-soldering.',
    },
    problem: {
      fr: "Beaucoup d'appareils sont remplacés alors qu'une réparation au niveau des composants suffirait, et les données qu'ils contiennent sont souvent perdues.",
      en: 'Many devices get replaced when a component-level repair would do, and the data they hold is often lost.',
    },
    idea: {
      fr: 'Un atelier spécialisé : diagnostic, devis, réparations (écrans, batteries, caméras, connecteurs, désoxydation) et récupération de données. Pour les entreprises : maintenance préventive, facturation centralisée et effacement sécurisé des données.',
      en: 'A specialised workshop: diagnostics, quotes, repairs (screens, batteries, cameras, connectors, liquid damage) and data recovery. For businesses: preventive maintenance, centralised billing and secure data wiping.',
    },
    role: {
      fr: 'Fondateur, CEO et responsable technique.',
      en: 'Founder, CEO and technical lead.',
    },
    results: [
      { fr: 'Atelier en activité depuis juillet 2020.', en: 'Workshop running since July 2020.' },
      { fr: 'Offre élargie aux entreprises (B2B).', en: 'Offer extended to businesses (B2B).' },
    ],
    technologies: ['Micro-soudure', 'Diagnostic carte mère', 'Récupération de données', 'Désoxydation', 'Effacement sécurisé'],
    links: [{ label: { fr: 'helectronix.com', en: 'helectronix.com' }, href: 'https://helectronix.com' }],
    milestones: [{ date: '2020-07', title: { fr: "Création de l'atelier", en: 'Workshop founded' } }],
    cover: { motif: 'circuit' },
    related: ['phonelab', 'golden-dreams'],
  },
  {
    slug: 'mrz-scanner',
    name: { fr: 'Scanner MRZ', en: 'MRZ Scanner' },
    tagline: {
      fr: "Lecture automatisée de documents d'identité.",
      en: 'Automated reading of identity documents.',
    },
    summary: {
      fr: "Solution web qui lit la zone MRZ des documents d'identité par vision par ordinateur et OCR, puis valide les données automatiquement.",
      en: 'A web solution that reads the MRZ of identity documents with computer vision and OCR, then validates the data automatically.',
    },
    period: { start: '2024' },
    categories: ['ai', 'software'],
    tags: ['AI', 'SOFTWARE'],
    featured: true,
    order: 3,
    overview: {
      fr: "Développement d'une solution web de scan MRZ (Machine Readable Zone) qui intègre l'intelligence artificielle pour la reconnaissance et la validation automatiques des documents d'identité.",
      en: 'Development of a web solution that scans the MRZ (Machine Readable Zone) and uses artificial intelligence to recognise and validate identity documents automatically.',
    },
    problem: {
      fr: "Recopier à la main les informations d'un passeport ou d'une carte d'identité est lent et source d'erreurs.",
      en: 'Typing passport or ID card details by hand is slow and error-prone.',
    },
    idea: {
      fr: "Lire directement la zone MRZ, standardisée sur tous les documents de voyage, et valider les données sans ressaisie.",
      en: 'Read the MRZ directly, standard on every travel document, and validate the data without retyping.',
    },
    role: { fr: 'Développement de la solution.', en: 'Built the solution.' },
    technologies: ['Intelligence artificielle', 'Vision par ordinateur', 'OCR', 'Web'],
    cover: { motif: 'scan' },
  },
  {
    slug: 'mechanical-watch',
    name: { fr: 'Montre mécanique', en: 'Mechanical watch' },
    tagline: {
      fr: 'Une montre automatique construite à partir de pièces détachées.',
      en: 'An automatic watch built from spare parts.',
    },
    summary: {
      fr: 'Travail de maturité : construire une montre automatique à partir de pièces détachées. Meilleure note, 6/6.',
      en: 'High school thesis: building an automatic watch from spare parts. Top grade, 6/6.',
    },
    period: { start: '2023' },
    status: 'completed',
    categories: ['hardware', 'creative'],
    tags: ['HARDWARE', 'CREATIVE'],
    featured: true,
    order: 4,
    overview: {
      fr: "Pour mon travail de maturité au Collège Voltaire, j'ai construit une montre automatique à partir de pièces détachées. Un projet de précision qui mêle horlogerie, ingénierie mécanique et design.",
      en: 'For my high school thesis at Collège Voltaire I built an automatic watch from spare parts. A precision project combining watchmaking, mechanical engineering and design.',
    },
    problem: {
      fr: "Comprendre un mouvement automatique de l'intérieur, pièce par pièce.",
      en: 'Understanding an automatic movement from the inside, part by part.',
    },
    idea: {
      fr: 'Partir de pièces détachées et assembler une montre automatique complète et fonctionnelle.',
      en: 'Start from spare parts and assemble a complete, working automatic watch.',
    },
    role: { fr: 'Auteur du travail de maturité.', en: 'Author of the thesis.' },
    results: [
      { fr: 'Note de 6/6, la meilleure note possible.', en: 'Graded 6/6, the highest possible mark.' },
    ],
    technologies: ['Horlogerie', 'Mécanique de précision', 'Assemblage', 'Design'],
    milestones: [
      { date: '2019-10', title: { fr: 'Stage en horlogerie chez Rolex', en: 'Watchmaking internship at Rolex' } },
      { date: '2023', title: { fr: 'Travail de maturité noté 6/6', en: 'Thesis graded 6/6' } },
    ],
    cover: { motif: 'dial' },
    related: ['tm-2023', 'college-voltaire', 'rolex'],
  },
  {
    slug: 'ai-projects',
    name: { fr: 'Projets IA', en: 'AI Projects' },
    tagline: {
      fr: "Expérimentations et solutions construites avec l'IA.",
      en: 'Experiments and solutions built with AI.',
    },
    summary: {
      fr: "Prompt engineering, modèles de langage et automatisation de workflows : des solutions construites avec l'IA, puis transmises en atelier.",
      en: 'Prompt engineering, language models and workflow automation: solutions built with AI, then taught in workshops.',
    },
    period: { start: '2024', end: 'present' },
    status: 'ongoing',
    categories: ['ai', 'automation', 'software'],
    tags: ['AI', 'AUTOMATION', 'SOFTWARE'],
    order: 5,
    overview: {
      fr: "Depuis 2024, je développe des solutions qui utilisent des techniques avancées de prompt engineering pour optimiser les interactions avec les modèles d'IA et créer des applications intelligentes.",
      en: 'Since 2024 I have been building solutions that use advanced prompt engineering to get more out of AI models and create intelligent applications.',
    },
    idea: {
      fr: "Utiliser les bons modèles et les bons outils pour chaque tâche : génération de texte, transcription, recherche, automatisation entre applications.",
      en: 'Use the right model and tool for each task: text generation, transcription, research, automation between apps.',
    },
    role: { fr: 'Conception et développement.', en: 'Design and development.' },
    results: [
      {
        fr: "Un atelier interactif sur l'IA animé à Genève pour une trentaine de participants (2025).",
        en: 'An interactive AI workshop run in Geneva for around thirty participants (2025).',
      },
    ],
    technologies: ['Prompt engineering', 'LLMs', 'Hugging Face', 'n8n', 'Make', 'Whisper', 'NotebookLM', 'Perplexity'],
    cover: { motif: 'grid' },
    related: ['ai-workshop-2025'],
  },
  {
    slug: 'sbsa',
    name: { fr: 'SBSA', en: 'SBSA' },
    tagline: {
      fr: 'Agence B2B de personnalisation textile et print.',
      en: 'B2B textile and print customisation agency.',
    },
    summary: {
      fr: "Cofondée en 2021 : écoles, associations, clubs et entreprises accompagnés de l'idée à la livraison.",
      en: 'Co-founded in 2021: schools, associations, clubs and companies supported from idea to delivery.',
    },
    period: { start: '2021-01', end: 'present' },
    status: 'active',
    categories: ['business', 'creative'],
    tags: ['BUSINESS', 'ENTREPRENEURSHIP', 'CREATIVE'],
    order: 6,
    overview: {
      fr: "SBSA accompagne écoles, associations, clubs et entreprises de l'idée à la livraison : conseil, création et PAO, production (broderie, sérigraphie, DTG, DTF, flocage), contrôle qualité et logistique. Côté print : cartes de visite, flyers, brochures, PLV et goodies.",
      en: 'SBSA supports schools, associations, clubs and companies from idea to delivery: consulting, design and DTP, production (embroidery, screen printing, DTG, DTF, flocking), quality control and logistics. On the print side: business cards, flyers, brochures, point-of-sale and merchandise.',
    },
    idea: {
      fr: 'Un seul interlocuteur pour tout le cycle, du premier croquis au carton livré.',
      en: 'One point of contact for the whole cycle, from first sketch to delivered box.',
    },
    role: { fr: 'Cofondateur.', en: 'Co-founder.' },
    technologies: ['Broderie', 'Sérigraphie', 'DTG', 'DTF', 'Flocage', 'PAO'],
    links: [{ label: { fr: 'sbsa.agency', en: 'sbsa.agency' }, href: 'https://sbsa.agency/' }],
    milestones: [{ date: '2021-01', title: { fr: "Création de l'agence", en: 'Agency founded' } }],
    cover: { motif: 'thread' },
    related: ['faclab'],
  },
  {
    slug: 'pepe-chicken',
    name: { fr: 'PEPE CHICKEN', en: 'PEPE CHICKEN' },
    tagline: {
      fr: 'Acquisition de marque dans la restauration rapide.',
      en: 'Brand acquisition in fast food.',
    },
    summary: {
      fr: 'Acquisition en 2025 de la marque PEPE CHICKEN by FastGood Cuisine pour la Suisse, et développement dans la restauration rapide.',
      en: 'Acquisition of the PEPE CHICKEN by FastGood Cuisine brand for Switzerland in 2025, and development in fast food.',
    },
    period: { start: '2025' },
    status: 'acquired',
    categories: ['business'],
    tags: ['BUSINESS', 'ENTREPRENEURSHIP'],
    order: 7,
    overview: {
      fr: "En 2025, j'ai acquis la marque PEPE CHICKEN by FastGood Cuisine en Suisse, avec l'objectif de la développer dans le secteur de la restauration rapide en misant sur l'innovation et la qualité.",
      en: 'In 2025 I acquired the PEPE CHICKEN by FastGood Cuisine brand in Switzerland, to grow it in the fast food sector with a focus on innovation and quality.',
    },
    role: { fr: 'Acquisition de la marque et développement.', en: 'Brand acquisition and development.' },
    milestones: [{ date: '2025', title: { fr: 'Acquisition de la marque en Suisse', en: 'Brand acquired in Switzerland' } }],
    cover: { motif: 'flame' },
    related: ['ifage-cafetier'],
  },
  {
    slug: 'lab',
    name: { fr: 'Lab personnel', en: 'Personal lab' },
    tagline: {
      fr: 'Domotique, serveurs et prototypage.',
      en: 'Home automation, servers and prototyping.',
    },
    summary: {
      fr: "Automatisations (HomeLink, Arduino, n8n, Make), serveurs NAS et multimédia, impression 3D : le terrain d'essai de mes idées.",
      en: 'Automations (HomeLink, Arduino, n8n, Make), NAS and media servers, 3D printing: the testing ground for my ideas.',
    },
    status: 'ongoing',
    categories: ['hardware', 'automation', 'creative'],
    tags: ['HARDWARE', 'AUTOMATION'],
    order: 8,
    overview: {
      fr: "À côté des projets clients, je teste des idées chez moi : automatisations avec HomeLink, Arduino, n8n et Make, serveurs NAS avec Plex et Kodi, prototypes sur Raspberry Pi et impression 3D.",
      en: 'Alongside client work I test ideas at home: automations with HomeLink, Arduino, n8n and Make, NAS servers running Plex and Kodi, Raspberry Pi prototypes and 3D printing.',
    },
    technologies: ['Arduino', 'Raspberry Pi', 'HomeLink', 'n8n', 'Make', 'NAS', 'Plex', 'Kodi', 'Impression 3D', 'Cura', 'Rhino'],
    cover: { motif: 'grid' },
  },
];

export const projectCategories: ProjectCategory[] = ['ai', 'software', 'hardware', 'business', 'automation', 'creative'];

export const sortedProjects = [...projects].sort((a, b) => a.order - b.order);

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
