/**
 * Single source of truth for all content.
 * Import from here: `import { profile, projects } from '@/data'`.
 */
export * from './types';
export { profile } from './profile';
export { projects, sortedProjects, getProject, projectCategories } from './projects';
export { experience } from './experience';
export { education } from './education';
export { skillGroups, toolGroups, personalSkills } from './skills';
export { languages, cefrScale, languageCertificates } from './languages';
export { services, capabilities } from './services';
export { media, awards, engagement, publications, permits, interests } from './recognition';
export { getEntity, allEntities, resolveEntities } from './entities';
export type { EntityInfo, EntityKind } from './entities';
export { getTimeline, timelineChapters } from './timeline';
export type { TimelineYear } from './timeline';
export { stats } from './stats';
