export interface Language {
  code: 'fr' | 'en';
  name: string;
}

export interface NavigationItem {
  id: string;
  label: {
    fr: string;
    en: string;
  };
}

export interface Experience {
  id: string;
  title: {
    fr: string;
    en: string;
  };
  company: {
    fr: string;
    en: string;
  };
  period: string;
  description: {
    fr: string;
    en: string;
  };
  type: 'work' | 'education' | 'achievement';
}

export interface Project {
  id: string;
  title: {
    fr: string;
    en: string;
  };
  description: {
    fr: string;
    en: string;
  };
  technologies: string[];
  year: string;
  icon?: string;
  featured?: boolean;
  link?: string;
}

export interface Skill {
  category: {
    fr: string;
    en: string;
  };
  items: string[];
}

export interface Service {
  id: string;
  icon: string;
  title: {
    fr: string;
    en: string;
  };
  description: {
    fr: string;
    en: string;
  };
  features: {
    fr: string;
    en: string;
  }[];
  accent: string;
}
