import { Project } from '../types';

export const projects: Project[] = [
  {
    id: 'neuronia',
    title: {
      fr: 'Neuron IA — Assistant IA privé pour PME',
      en: 'Neuron IA — Private AI Assistant for SMBs'
    },
    description: {
      fr: 'Plateforme SaaS d\'automatisation par IA pour les PME suisses. 4 agents IA spécialisés (support client, commercial, analyste, multilingue) qui automatisent e-mails, devis et CRM — hébergés en Suisse pour une confidentialité totale. Déploiement en 7 jours, gain moyen de 10h/semaine.',
      en: 'AI-powered automation SaaS platform for Swiss SMBs. 4 specialized AI agents (customer support, sales, analyst, multilingual) that automate emails, quotes and CRM — hosted in Switzerland for total data privacy. 7-day deployment, average time savings of 10h/week.'
    },
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Framer Motion', 'AI Agents'],
    year: '2026',
    featured: true,
    link: 'https://neuronia.ch'
  },
  {
    id: 'mechanical-watch',
    title: {
      fr: 'Montre Mécanique Artisanale',
      en: 'Artisanal Mechanical Watch'
    },
    description: {
      fr: 'Conception et réalisation complète d\'une montre mécanique pour mon Travail de Maturité. Projet alliant précision horlogère, ingénierie mécanique et design esthétique.',
      en: 'Complete design and creation of a mechanical watch for my graduation project. Project combining watchmaking precision, mechanical engineering and aesthetic design.'
    },
    technologies: ['Horlogerie', 'Ingénierie mécanique', 'Design', 'Fabrication artisanale'],
    year: '2023'
  },
  {
    id: 'mrz-scanner',
    title: {
      fr: 'Scanner MRZ avec IA',
      en: 'MRZ Scanner with AI'
    },
    description: {
      fr: 'Développement d\'une solution web innovante de scan MRZ (Machine Readable Zone) intégrant l\'intelligence artificielle pour la reconnaissance et validation automatique de documents d\'identité.',
      en: 'Development of an innovative web solution for MRZ (Machine Readable Zone) scanning integrating artificial intelligence for automatic recognition and validation of identity documents.'
    },
    technologies: ['Intelligence Artificielle', 'Vision par ordinateur', 'Web Development', 'OCR'],
    year: '2024'
  },
  {
    id: 'ai-prompt-engineering',
    title: {
      fr: 'Projets en Prompt Engineering',
      en: 'Prompt Engineering Projects'
    },
    description: {
      fr: 'Développement de solutions utilisant des techniques avancées de prompt engineering pour optimiser les interactions avec les modèles d\'IA et créer des applications intelligentes.',
      en: 'Development of solutions using advanced prompt engineering techniques to optimize interactions with AI models and create intelligent applications.'
    },
    technologies: ['Prompt Engineering', 'IA Générative', 'NLP', 'Automatisation'],
    year: '2024'
  }
];
