import { experience } from './experience';
import { languages } from './languages';
import { profile } from './profile';
import { projects } from './projects';
import { BUILD_YEAR } from '../lib/build';

/**
 * Numbers derived from the data (never typed by hand), so they stay true
 * when an entry is added or removed.
 */
const ventures = experience.filter((x) => x.type === 'founder');

export const stats = {
  since: profile.buildingSince,
  yearsBuilding: BUILD_YEAR - profile.buildingSince,
  companies: ventures.filter((x) => x.venture === 'founded' || x.venture === 'cofounded').length,
  brandsAcquired: ventures.filter((x) => x.venture === 'acquired').length,
  languages: languages.length,
  experiences: experience.length,
  sectors: new Set(experience.map((x) => x.sector.fr)).size,
  projects: projects.length,
  /** From the Oct 2025 workshop entry (media: ai-workshop-2025). */
  workshopParticipants: 30,
};
