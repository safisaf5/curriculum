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
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.experience': 'Expériences',
    'nav.projects': 'Projets',
    'nav.skills': 'Compétences',
    'nav.media': 'Médias',
    'nav.contact': 'Contact',
    
    // Home
    'home.quote': 'Agir avec excellence, servir avec conscience',
    'home.intro': 'Entrepreneur dynamique et polyvalent de Genève, spécialisé dans l\'électronique, l\'horlogerie et les nouvelles technologies. Reconnu pour mes qualités d\'orateur et mon engagement communautaire, je me forme constamment pour maîtriser les dernières innovations technologiques telles que l\'intelligence artificielle et le prompt engineering.',
    'home.cta': 'En savoir plus',
    
    // About
    'about.title': 'À propos',
    'about.subtitle': 'Entrepreneur & Innovateur',
    'about.bio.title': 'Biographie',
    'about.bio.content': 'Diplômé du Collège Voltaire avec une maturité gymnasiale mention en Biochimie (2020-2024), Safwan Abdirahman s\'est spécialisé dans les technologies émergentes. Sa formation diversifiée inclut la programmation Scala & IoT par l\'Université de Genève, un diplôme cantonal de cafetier, et une formation en langue arabe. Polyglotte accompli et leader naturel, il préside l\'association Les GEunes et participe activement au Club Genevois de Débat.',
    'about.qualities.title': 'Qualités personnelles',
    'about.qualities.items': 'Leader naturel • Rigoureux • Engagé • Polyglotte • Innovateur • Communicateur',
    'about.languages.title': 'Langues',
    'about.languages.french': 'Français (natif)',
    'about.languages.arabic': 'Arabe (natif)',
    'about.languages.english': 'Anglais (B2)',
    'about.languages.italian': 'Italien (B2)',
    'about.languages.german': 'Allemand (A2)',
    
    // Experience
    'experience.title': 'Expériences',
    'experience.subtitle': 'Parcours professionnel et académique',
    
    // Projects
    'projects.title': 'Projets',
    'projects.subtitle': 'Innovations et réalisations',
    
    // Skills
    'skills.title': 'Compétences',
    'skills.subtitle': 'Expertise technique et personnelle',
    'skills.technical': 'Compétences techniques',
    'skills.personal': 'Compétences personnelles',
    'skills.languages': 'Langues',
    'skills.tools': 'Outils informatiques',
    
    // Media
    'media.title': 'Médias',
    'media.subtitle': 'Presse et apparitions médiatiques',
    'media.coming': 'Contenu à venir',
    'media.description': 'Cette section présentera les futures apparitions presse, interviews et couvertures médiatiques.',
    
    // Contact
    'contact.title': 'Contact',
    'contact.subtitle': 'Restons en contact',
    'contact.email': 'Email',
    'contact.phone': 'Téléphone',
    'contact.website': 'Site web',
    
    // Common
    'common.darkMode': 'Mode sombre',
    'common.lightMode': 'Mode clair',
    'common.language': 'Langue',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.experience': 'Experience',
    'nav.projects': 'Projects',
    'nav.skills': 'Skills',
    'nav.media': 'Media',
    'nav.contact': 'Contact',
    
    // Home
    'home.quote': 'Act with excellence, serve with conscience',
    'home.intro': 'Dynamic and versatile entrepreneur from Geneva, specialized in electronics, watchmaking, and new technologies. Recognized for my speaking skills and community engagement, I constantly train to master the latest technological innovations such as artificial intelligence and prompt engineering.',
    'home.cta': 'Learn more',
    
    // About
    'about.title': 'About',
    'about.subtitle': 'Entrepreneur & Innovator',
    'about.bio.title': 'Biography',
    'about.bio.content': 'Graduate of Collège Voltaire with a high school diploma with honors in Biochemistry (2020-2024), Safwan Abdirahman specialized in emerging technologies. His diverse training includes Scala & IoT programming from the University of Geneva, a cantonal café owner diploma, and Arabic language training. An accomplished polyglot and natural leader, he chairs the Les GEunes association and actively participates in the Geneva Debate Club.',
    'about.qualities.title': 'Personal qualities',
    'about.qualities.items': 'Natural leader • Rigorous • Committed • Polyglot • Innovator • Communicator',
    'about.languages.title': 'Languages',
    'about.languages.french': 'French (native)',
    'about.languages.arabic': 'Arabic (native)',
    'about.languages.english': 'English (B2)',
    'about.languages.italian': 'Italian (B2)',
    'about.languages.german': 'German (A2)',
    
    // Experience
    'experience.title': 'Experience',
    'experience.subtitle': 'Professional and academic journey',
    
    // Projects
    'projects.title': 'Projects',
    'projects.subtitle': 'Innovations and achievements',
    
    // Skills
    'skills.title': 'Skills',
    'skills.subtitle': 'Technical and personal expertise',
    'skills.technical': 'Technical skills',
    'skills.personal': 'Personal skills',
    'skills.languages': 'Languages',
    'skills.tools': 'Software tools',
    
    // Media
    'media.title': 'Media',
    'media.subtitle': 'Press and media appearances',
    'media.coming': 'Content coming soon',
    'media.description': 'This section will showcase future press appearances, interviews, and media coverage.',
    
    // Contact
    'contact.title': 'Contact',
    'contact.subtitle': 'Let\'s stay in touch',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.website': 'Website',
    
    // Common
    'common.darkMode': 'Dark mode',
    'common.lightMode': 'Light mode',
    'common.language': 'Language',
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