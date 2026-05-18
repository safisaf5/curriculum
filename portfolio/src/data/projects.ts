import { Project } from '../types';

export const projects: Project[] = [
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