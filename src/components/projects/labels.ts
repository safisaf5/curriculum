import { sortedProjects, type ContactSubject, type EntityKind, type Project, type ProjectCategory, type ProjectStatus } from '../../data';
import type projectStrings from '../../i18n/strings/projects';
import { pad2 } from '../../lib/text';

export type ProjectStrings = (typeof projectStrings)['fr'];

export const categoryLabel = (t: ProjectStrings, category: ProjectCategory): string =>
  ({
    ai: t.catAi,
    software: t.catSoftware,
    hardware: t.catHardware,
    business: t.catBusiness,
    automation: t.catAutomation,
    creative: t.catCreative,
  })[category];

export const statusLabel = (t: ProjectStrings, status: ProjectStatus): string =>
  ({
    active: t.statusActive,
    completed: t.statusCompleted,
    ongoing: t.statusOngoing,
    acquired: t.statusAcquired,
  })[status];

/** Label of a related entry (experience, education, award...). */
export const kindLabel = (t: ProjectStrings, kind: EntityKind): string =>
  ({
    project: t.kindProject,
    experience: t.kindExperience,
    education: t.kindEducation,
    award: t.kindAward,
    engagement: t.kindEngagement,
    media: t.kindMedia,
    certificate: t.kindCertificate,
  })[kind];

/** Live statuses get a small accent dot. */
export const isLiveStatus = (status?: ProjectStatus) => status === 'active' || status === 'ongoing';

/** Stable project number in display order: "01", "02"... */
export const projectNumber = (project: Project) => pad2(sortedProjects.findIndex((p) => p.slug === project.slug) + 1);

export const projectTotal = pad2(sortedProjects.length);

/** Contact form subject suggested by a project's first category. */
export const contactSubjectFor = (project: Project): ContactSubject => {
  const first = project.categories[0];
  if (first === 'hardware') return 'hardware';
  if (first === 'business' || first === 'creative') return 'digital';
  return 'ai';
};
