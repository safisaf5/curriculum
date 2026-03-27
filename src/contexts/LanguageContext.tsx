import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  fr: {
    // Navigation
    'nav.home':       'Accueil',
    'nav.about':      'À propos',
    'nav.services':   'Services',
    'nav.projects':   'Projets',
    'nav.experience': 'Parcours',
    'nav.skills':     'Compétences',
    'nav.contact':    'Contact',
    'nav.cta':        'Travaillons ensemble',

    // Hero
    'hero.badge':      'Disponible pour consulting',
    'hero.h1a':        'J\'automatise et ',
    'hero.h1b':        'amplifie votre business',
    'hero.h1c':        ' avec l\'IA',
    'hero.sub':        'Entrepreneur tech basé à Genève. Je combine expertise en IA, automation et stratégie business pour transformer vos opérations.',
    'hero.who.label':  'Qui j\'aide',
    'hero.who.text':   'PME, startups et entrepreneurs qui veulent exploiter l\'IA pour gagner du temps, réduire les coûts et croître plus vite.',
    'hero.cta1':       'Planifier un appel',
    'hero.cta2':       'Voir mes projets',
    'hero.scroll':     'Défiler pour découvrir',
    'hero.years':      'Années en business',
    'hero.languages':  'Langues',

    // About
    'about.title':    'À propos',
    'about.subtitle': 'Entrepreneur & Innovateur',
    'about.bio.title':    'Biographie',
    'about.bio.content':  'Diplômé du Collège Voltaire avec une maturité gymnasiale mention en Biochimie (2020-2024), je me suis spécialisé dans les technologies émergentes et l\'entrepreneuriat.',
    'about.qualities.title': 'Qualités',
    'about.languages.title': 'Langues',
    'about.languages.french':  'Français',
    'about.languages.arabic':  'Arabe',
    'about.languages.english': 'Anglais',
    'about.languages.italian': 'Italien',
    'about.languages.german':  'Allemand',

    // Services
    'services.title':    'Services',
    'services.subtitle': 'Comment je peux vous aider',
    'services.cta':      'En savoir plus',
    'services.contact':  'Démarrer un projet',

    // Projects
    'projects.title':    'Projets',
    'projects.subtitle': 'Innovations & réalisations',
    'projects.more':     'D\'autres projets bientôt',

    // Experience
    'experience.title':    'Parcours',
    'experience.subtitle': 'Expériences professionnelles & académiques',

    // Skills
    'skills.title':    'Compétences',
    'skills.subtitle': 'Expertise technique & personnelle',
    'skills.technical': 'Tech & IA',
    'skills.personal':  'Leadership',
    'skills.languages': 'Langues',
    'skills.tools':     'Outils',

    // Contact
    'contact.title':    'Travaillons ensemble',
    'contact.subtitle': 'Prêt à transformer votre business avec l\'IA ?',
    'contact.body':     'Que ce soit pour du consulting IA, une transformation digitale ou un projet innovant — je réponds en moins de 24h.',
    'contact.email':    'Email',
    'contact.phone':    'Téléphone',
    'contact.whatsapp': 'WhatsApp',
    'contact.card':     'Carte de visite',
    'contact.location': 'Genève, Suisse',

    // Common
    'common.darkMode':  'Mode sombre',
    'common.lightMode': 'Mode clair',
    'common.language':  'Langue',
  },
  en: {
    // Navigation
    'nav.home':       'Home',
    'nav.about':      'About',
    'nav.services':   'Services',
    'nav.projects':   'Projects',
    'nav.experience': 'Journey',
    'nav.skills':     'Skills',
    'nav.contact':    'Contact',
    'nav.cta':        'Let\'s work together',

    // Hero
    'hero.badge':      'Available for consulting',
    'hero.h1a':        'I automate and ',
    'hero.h1b':        'amplify your business',
    'hero.h1c':        ' with AI',
    'hero.sub':        'Tech entrepreneur based in Geneva. I combine AI expertise, automation and business strategy to transform your operations.',
    'hero.who.label':  'Who I help',
    'hero.who.text':   'SMEs, startups and entrepreneurs who want to leverage AI to save time, cut costs and grow faster.',
    'hero.cta1':       'Book a call',
    'hero.cta2':       'See my work',
    'hero.scroll':     'Scroll to discover',
    'hero.years':      'Years in business',
    'hero.languages':  'Languages',

    // About
    'about.title':    'About',
    'about.subtitle': 'Entrepreneur & Innovator',
    'about.bio.title':    'Biography',
    'about.bio.content':  'Graduate of Collège Voltaire with a high school diploma in Biochemistry (2020-2024), I specialized in emerging technologies and entrepreneurship.',
    'about.qualities.title': 'Strengths',
    'about.languages.title': 'Languages',
    'about.languages.french':  'French',
    'about.languages.arabic':  'Arabic',
    'about.languages.english': 'English',
    'about.languages.italian': 'Italian',
    'about.languages.german':  'German',

    // Services
    'services.title':    'Services',
    'services.subtitle': 'How I can help you',
    'services.cta':      'Learn more',
    'services.contact':  'Start a project',

    // Projects
    'projects.title':    'Projects',
    'projects.subtitle': 'Innovations & achievements',
    'projects.more':     'More projects coming soon',

    // Experience
    'experience.title':    'Journey',
    'experience.subtitle': 'Professional & academic experience',

    // Skills
    'skills.title':    'Skills',
    'skills.subtitle': 'Technical & personal expertise',
    'skills.technical': 'Tech & AI',
    'skills.personal':  'Leadership',
    'skills.languages': 'Languages',
    'skills.tools':     'Tools',

    // Contact
    'contact.title':    'Let\'s work together',
    'contact.subtitle': 'Ready to transform your business with AI?',
    'contact.body':     'Whether it\'s AI consulting, digital transformation or an innovative project — I reply within 24 hours.',
    'contact.email':    'Email',
    'contact.phone':    'Phone',
    'contact.whatsapp': 'WhatsApp',
    'contact.card':     'Business card',
    'contact.location': 'Geneva, Switzerland',

    // Common
    'common.darkMode':  'Dark mode',
    'common.lightMode': 'Light mode',
    'common.language':  'Language',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
