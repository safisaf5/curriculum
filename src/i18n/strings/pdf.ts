import { defineStrings } from '../define';

/**
 * Labels used only by the build-time generators: the PDF CV
 * (scripts/lib/cv-pdf.tsx) and the Open Graph images (scripts/lib/og.tsx).
 * Section titles shared with the web CV live in the `cv` namespace.
 */
export default defineStrings({
  fr: {
    pageOf: (page: number, total: number) => `${page} / ${total}`,
    internships: 'Stages',
    schooling: 'Scolarité',
    inProgress: 'En cours',
    subject: (name: string) => `Curriculum vitae de ${name}`,
    ogProject: 'Projet',
    ogBy: 'Un projet de',
  },
  en: {
    pageOf: (page: number, total: number) => `${page} / ${total}`,
    internships: 'Internships',
    schooling: 'Schooling',
    inProgress: 'In progress',
    subject: (name: string) => `Curriculum vitae of ${name}`,
    ogProject: 'Project',
    ogBy: 'A project by',
  },
});
