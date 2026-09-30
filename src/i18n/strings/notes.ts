import { defineStrings } from '../define';

/** Notes / journal pages, home teaser and the 404 page. */
export default defineStrings({
  fr: {
    notesLabel: 'Notes',
    notesTitle: 'Journal',
    notesIntro: "Projets, réflexions sur l'IA, entrepreneuriat et apprentissages. Écrit quand il y a quelque chose d'utile à partager.",
    notesEmpty: 'Les premières notes arrivent bientôt. En attendant, voici mes publications récentes.',
    notesExternal: (platform: string) => `Publié sur ${platform}`,
    notesBack: 'Toutes les notes',
    notesReadingTime: (min: number) => `${min} min de lecture`,
    notesNotFound: "Cette note n'existe pas ou a été déplacée.",

    // 404
    notFoundCode: '404',
    notFoundTitle: "Looks like this project doesn't exist.",
    notFoundBody: "La page demandée est introuvable. Elle a peut-être été déplacée, ou l'adresse contient une faute de frappe.",
    notFoundHome: "Retour à l'accueil",
    notFoundProjects: 'Voir les projets',
  },
  en: {
    notesLabel: 'Notes',
    notesTitle: 'Journal',
    notesIntro: 'Projects, thoughts on AI, entrepreneurship and lessons learned. Written when there is something useful to share.',
    notesEmpty: 'The first notes are on their way. Meanwhile, here are my recent posts.',
    notesExternal: (platform: string) => `Published on ${platform}`,
    notesBack: 'All notes',
    notesReadingTime: (min: number) => `${min} min read`,
    notesNotFound: 'This note does not exist or has moved.',

    notFoundCode: '404',
    notFoundTitle: "Looks like this project doesn't exist.",
    notFoundBody: 'The page you asked for cannot be found. It may have moved, or the address has a typo.',
    notFoundHome: 'Back to home',
    notFoundProjects: 'See the projects',
  },
});
