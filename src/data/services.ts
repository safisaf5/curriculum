import type { Service } from '../types';

export const services: Service[] = [
  {
    id: 'ai-consulting',
    icon: 'Brain',
    title: {
      fr: 'Consulting IA & Automatisation',
      en: 'AI Consulting & Automation',
    },
    description: {
      fr: "J'aide les entreprises à identifier, implémenter et maîtriser les outils d'IA pour automatiser leurs processus et gagner en compétitivité.",
      en: "I help businesses identify, implement and master AI tools to automate their processes and gain a competitive edge.",
    },
    features: [
      { fr: 'Audit de processus automatisables', en: 'Automatable process audit' },
      { fr: 'Sélection des outils IA adaptés', en: 'Right AI tool selection' },
      { fr: 'Intégration et configuration', en: 'Integration & configuration' },
      { fr: 'Formation et accompagnement', en: 'Training & support' },
    ],
    accent: 'from-brand-500 to-purple-500',
  },
  {
    id: 'digital-transformation',
    icon: 'TrendingUp',
    title: {
      fr: 'Transformation Digitale',
      en: 'Digital Transformation',
    },
    description: {
      fr: "Stratégie et mise en œuvre pour moderniser votre entreprise, améliorer votre présence digitale et optimiser vos opérations.",
      en: "Strategy and execution to modernize your business, improve your digital presence and optimize operations.",
    },
    features: [
      { fr: 'Analyse et diagnostic digital', en: 'Digital audit & diagnosis' },
      { fr: 'Stratégie de transformation', en: 'Transformation roadmap' },
      { fr: 'Mise en place des outils', en: 'Tools setup & deployment' },
      { fr: 'Suivi des performances', en: 'Performance monitoring' },
    ],
    accent: 'from-cyan-500 to-brand-500',
  },
  {
    id: 'electronics',
    icon: 'Cpu',
    title: {
      fr: 'Électronique & Hardware',
      en: 'Electronics & Hardware',
    },
    description: {
      fr: "Via Heal ElectroniX, je propose des services professionnels de réparation électronique, micro-soudure et récupération de données.",
      en: "Through Heal ElectroniX, I offer professional electronics repair, micro-soldering and data recovery services.",
    },
    features: [
      { fr: 'Réparation & micro-soudure', en: 'Repair & micro-soldering' },
      { fr: 'Récupération de données', en: 'Data recovery' },
      { fr: 'Diagnostics matériels', en: 'Hardware diagnostics' },
      { fr: 'Conseil en équipement', en: 'Equipment consulting' },
    ],
    accent: 'from-orange-500 to-pink-500',
  },
];
