import { defineStrings } from '../define';

const plural = (n: number, one: string, many: string) => (n > 1 ? many : one);

/** Timeline, experience and education. */
export default defineStrings({
  fr: {
    timelineLabel: 'Timeline',
    timelineTitle: 'Dix ans en un coup d’œil.',
    timelineIntro: 'Chaque année, ce qui a compté. Les entrées sont tirées directement des données du site.',
    timelineHint: 'Faites défiler',
    timelinePrev: 'Année précédente',
    timelineNext: 'Année suivante',
    timelineIndex: 'Aller à une année',
    timelineCount: (n: number) => `${n} ${plural(n, 'entrée', 'entrées')}`,
    kindProject: 'Projet',
    kindExperience: 'Expérience',
    kindEducation: 'Formation',
    kindAward: 'Distinction',
    kindEngagement: 'Engagement',
    kindMedia: 'Médias',
    kindCertificate: 'Certificat',

    // Experience
    experienceLabel: 'Expérience',
    experienceTitle: 'Du terrain avant tout.',
    experienceIntro: 'Entreprises créées, emplois, armée, stages : chaque poste a laissé une compétence concrète.',
    typeFounder: 'Entrepreneuriat',
    typeWork: 'Emploi',
    typeMilitary: 'Service militaire',
    typeInternship: 'Stage',
    skillsGained: 'Compétences',
    moreExperience: (n: number) => `Voir les ${n} autres expériences`,
    lessExperience: 'Réduire la liste',
    filterLabel: 'Filtrer par type de poste',
    filterAll: 'Tout',
    resultsCount: (n: number) => `${n} ${plural(n, 'poste affiché', 'postes affichés')}`,
    projectLink: 'Voir le projet',
    duration: (months: number) => {
      if (months < 12) return `${months} mois`;
      const y = Math.floor(months / 12);
      const m = months % 12;
      return `${y} ${plural(y, 'an', 'ans')}${m ? ` ${m} mois` : ''}`;
    },

    // Education
    educationLabel: 'Formation',
    educationTitle: 'Apprendre ce que le prochain projet demande.',
    groupMain: 'Formations',
    groupCourses: 'Cours & certifications',
    groupLanguages: 'Certificats de langue',
    groupSchool: 'Scolarité',
    inProgress: 'En cours',
    showSchooling: 'Afficher la scolarité',
    hideSchooling: 'Masquer la scolarité',
    colPeriod: 'Période',
    colProgram: 'Formation',
    colResult: 'Résultat / statut',
  },
  en: {
    timelineLabel: 'Timeline',
    timelineTitle: 'Ten years at a glance.',
    timelineIntro: 'What mattered, year by year. Entries come straight from the data behind this site.',
    timelineHint: 'Scroll',
    timelinePrev: 'Previous year',
    timelineNext: 'Next year',
    timelineIndex: 'Jump to a year',
    timelineCount: (n: number) => `${n} ${plural(n, 'entry', 'entries')}`,
    kindProject: 'Project',
    kindExperience: 'Experience',
    kindEducation: 'Education',
    kindAward: 'Award',
    kindEngagement: 'Engagement',
    kindMedia: 'Media',
    kindCertificate: 'Certificate',

    experienceLabel: 'Experience',
    experienceTitle: 'Field work first.',
    experienceIntro: 'Companies started, jobs, the army, internships: every role left a concrete skill.',
    typeFounder: 'Entrepreneurship',
    typeWork: 'Employment',
    typeMilitary: 'Military service',
    typeInternship: 'Internship',
    skillsGained: 'Skills',
    moreExperience: (n: number) => `Show the ${n} other roles`,
    lessExperience: 'Show fewer roles',
    filterLabel: 'Filter by type of role',
    filterAll: 'All',
    resultsCount: (n: number) => `${n} ${plural(n, 'role', 'roles')} shown`,
    projectLink: 'View the project',
    duration: (months: number) => {
      if (months < 12) return `${months} ${plural(months, 'month', 'months')}`;
      const y = Math.floor(months / 12);
      const m = months % 12;
      return `${y} ${plural(y, 'year', 'years')}${m ? ` ${m} ${plural(m, 'month', 'months')}` : ''}`;
    },

    educationLabel: 'Education',
    educationTitle: 'Learning what the next project needs.',
    groupMain: 'Programmes',
    groupCourses: 'Courses & certificates',
    groupLanguages: 'Language certificates',
    groupSchool: 'Schooling',
    inProgress: 'In progress',
    showSchooling: 'Show schooling',
    hideSchooling: 'Hide schooling',
    colPeriod: 'Period',
    colProgram: 'Programme',
    colResult: 'Result / status',
  },
});
