import { defineStrings } from '../define';

/** Titles and meta descriptions. Kept under ~60 / ~160 characters. */
export default defineStrings({
  fr: {
    homeTitle: 'Safwan Abdirahman · Entrepreneur tech, IA & automatisation à Genève',
    homeDescription:
      "Safwan Abdirahman, entrepreneur basé à Genève. Fondateur de Heal ElectroniX, IA et automatisation pour les PME avec Neuron IA. Projets, parcours, CV et contact.",
    ogTitle: 'Safwan Abdirahman · Entrepreneur & AI',
    cvTitle: 'CV · Safwan Abdirahman',
    cvDescription: 'Curriculum vitae de Safwan Abdirahman : expérience, projets, formation, langues et compétences. Téléchargeable en PDF.',
    cardTitle: 'Carte de visite · Safwan Abdirahman',
    cardDescription: 'Coordonnées de Safwan Abdirahman, entrepreneur à Genève : e-mail, téléphone, WhatsApp, LinkedIn et vCard.',
    notesTitle: 'Notes · Safwan Abdirahman',
    notesDescription: "Notes de Safwan Abdirahman sur l'IA, l'automatisation, l'entrepreneuriat et la technologie.",
    projectTitle: (name: string) => `${name} · Projet de Safwan Abdirahman`,
    notFoundTitle: 'Page introuvable · Safwan Abdirahman',
  },
  en: {
    homeTitle: 'Safwan Abdirahman · Tech entrepreneur, AI & automation in Geneva',
    homeDescription:
      'Safwan Abdirahman, Geneva-based entrepreneur. Founder of Heal ElectroniX, AI and automation for small businesses with Neuron IA. Projects, journey, CV and contact.',
    ogTitle: 'Safwan Abdirahman · Entrepreneur & AI',
    cvTitle: 'CV · Safwan Abdirahman',
    cvDescription: "Safwan Abdirahman's CV: experience, projects, education, languages and skills. Downloadable as PDF.",
    cardTitle: 'Business card · Safwan Abdirahman',
    cardDescription: 'Contact details for Safwan Abdirahman, entrepreneur in Geneva: email, phone, WhatsApp, LinkedIn and vCard.',
    notesTitle: 'Notes · Safwan Abdirahman',
    notesDescription: 'Notes by Safwan Abdirahman on AI, automation, entrepreneurship and technology.',
    projectTitle: (name: string) => `${name} · A project by Safwan Abdirahman`,
    notFoundTitle: 'Page not found · Safwan Abdirahman',
  },
});
