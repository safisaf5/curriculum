/**
 * Content model for safwan.ch.
 *
 * Everything the site, the web CV, the PDF CV, the vCard, the sitemap,
 * llms.txt and the Open Graph images display comes from /src/data.
 * Edit a fact once here and it updates everywhere.
 *
 * Writing rules (see docs/CONTENT.md):
 *  - facts only: no invented clients, figures, results or titles;
 *  - no em dash or en dash in visible text (use "·", ":", "→" or a comma);
 *  - every visible string is localised: { fr, en }.
 */

export type Lang = 'fr' | 'en';

/** A localised string. */
export interface L {
  fr: string;
  en: string;
}

/** Month precision date: '2020-07', or year only: '2020'. */
export type YearMonth = string;

export interface Period {
  start: YearMonth;
  /** Omit for a single point in time. 'present' for ongoing. */
  end?: YearMonth | 'present';
  /** Optional precise detail shown next to the period, e.g. "22-23 oct." */
  detail?: L;
}

/** Any entity can point to others by id to prove a skill or build the timeline. */
export type EntityRef = string;

// ── Profile ──────────────────────────────────────────────────

export interface ContactInfo {
  email: string;
  /** Human readable, e.g. "+41 78 963 62 23" */
  phone: string;
  /** E.164, e.g. "+41789636223" */
  phoneE164: string;
  whatsapp: string;
  linkedin: string;
  website: string;
}

export interface Universe {
  id: 'tech' | 'business' | 'creative' | 'communication';
  label: L;
  /** Short list of domains, displayed as a line. */
  domains: L;
  /** One concrete sentence, with proof in `evidence`. */
  body: L;
  evidence: EntityRef[];
}

export interface StoryChapter {
  id: string;
  period: string;
  title: L;
  body: L;
  evidence: EntityRef[];
}

export interface Profile {
  name: string;
  givenName: string;
  familyName: string;
  initials: string;
  /** Short positioning line, English on purpose (brand line). */
  positioning: string;
  roles: string[];
  title: L;
  headline: L;
  subline: L;
  availability: L;
  responseTime: L;
  location: {
    city: L;
    country: L;
    region: string;
    countryCode: string;
    lat: number;
    lng: number;
    timeZone: string;
  };
  nationality: L;
  origin: L;
  contact: ContactInfo;
  /** Year the first company was founded. */
  buildingSince: number;
  summary: L;
  universesIntro: { title: L; body: L };
  universes: Universe[];
  story: StoryChapter[];
  qualities: L[];
  portrait: {
    alt: L;
    /** Base path without extension/size, see public/images. */
    base: string;
    width: number;
    height: number;
    fallback: string;
  };
}

// ── Projects ────────────────────────────────────────────────

export type ProjectCategory =
  | 'ai'
  | 'software'
  | 'hardware'
  | 'business'
  | 'automation'
  | 'creative';

export type ProjectTag =
  | 'AI'
  | 'AUTOMATION'
  | 'BUSINESS'
  | 'HARDWARE'
  | 'SOFTWARE'
  | 'ENTREPRENEURSHIP'
  | 'CREATIVE';

export type ProjectStatus = 'active' | 'completed' | 'ongoing' | 'acquired';

export interface ProjectLink {
  label: L;
  href: string;
}

export interface ProjectMedia {
  type: 'image' | 'video';
  src: string;
  alt: L;
  width?: number;
  height?: number;
  poster?: string;
}

export interface ProjectMilestone {
  date: YearMonth;
  title: L;
}

/** Visual motif for the generated cover when no image exists. */
export type CoverMotif = 'network' | 'circuit' | 'dial' | 'scan' | 'grid' | 'thread' | 'flame';

export interface Project {
  slug: string;
  name: L;
  /** One line under the name. */
  tagline: L;
  /** 1-2 sentences for cards and meta description. */
  summary: L;
  /** Omit when the dates are unknown (displayed as "ongoing"). */
  period?: Period;
  /** Omit when unknown. */
  status?: ProjectStatus;
  categories: ProjectCategory[];
  tags: ProjectTag[];
  featured?: boolean;
  /** Display order (lower first). */
  order: number;
  /** Detail page sections. Every field is optional: missing = not shown. */
  overview?: L;
  problem?: L;
  idea?: L;
  role?: L;
  results?: L[];
  technologies?: string[];
  links?: ProjectLink[];
  media?: ProjectMedia[];
  milestones?: ProjectMilestone[];
  cover: { motif: CoverMotif; image?: string };
  /** Related entities (experience, education, awards...). */
  related?: EntityRef[];
}

// ── Experience ──────────────────────────────────────────────

export type ExperienceType = 'founder' | 'work' | 'military' | 'internship';

export interface Experience {
  id: string;
  role: L;
  company: L;
  period: Period;
  location?: L;
  type: ExperienceType;
  /** For founder entries: how the company or brand was obtained. */
  venture?: 'founded' | 'cofounded' | 'acquired';
  /** Sector, used to count how many fields have been explored. */
  sector: L;
  description?: L;
  skills?: L[];
  /** Shown in the main list before "show all". */
  highlight?: boolean;
  link?: string;
  project?: string;
}

// ── Education ───────────────────────────────────────────────

export type EducationKind = 'degree' | 'program' | 'course' | 'certificate' | 'school';

export interface Education {
  id: string;
  institution: L;
  program: L;
  period: Period;
  kind: EducationKind;
  field?: L;
  location?: L;
  /** Result or grade. */
  result?: L;
  /** Explicit status. If absent, derived from dates (only "in progress" is ever shown). */
  status?: L;
  description?: L;
  highlight?: boolean;
}

// ── Skills ──────────────────────────────────────────────────

export interface Skill {
  id: string;
  name: L;
  evidence: EntityRef[];
}

export interface SkillGroup {
  id: 'tech' | 'business' | 'communication' | 'creative';
  label: L;
  items: Skill[];
}

export interface ToolGroup {
  id: string;
  label: L;
  items: string[];
}

// ── Languages ───────────────────────────────────────────────

export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'native';

export interface SpokenLanguage {
  code: string;
  name: L;
  level: L;
  /** Highest CEFR reached, used for the graphic. */
  cefr: Cefr;
  /** Displayed CEFR label, e.g. "B2-C1". */
  cefrLabel: string;
  certification?: { name: string; detail: L; date: YearMonth };
  note?: L;
}

// ── Services & capabilities ─────────────────────────────────

export interface Service {
  id: string;
  index: string;
  title: L;
  short: L;
  description: L;
  examples: L[];
  deliverables: L[];
  /** Pre-selected subject in the contact form. */
  subject: ContactSubject;
  related: EntityRef[];
}

export interface Capability {
  id: string;
  title: L;
  body: L;
  items: L[];
  evidence: EntityRef[];
  glyph: 'agents' | 'product' | 'system' | 'hardware';
}

// ── Recognition, engagement, media ─────────────────────────

export interface Award {
  id: string;
  title: L;
  event: L;
  date: YearMonth | string;
  details?: L;
}

export interface Engagement {
  id: string;
  name: L;
  role: L;
  period?: Period;
  description?: L;
  kind: L;
}

export type MediaType = 'tv' | 'video' | 'stage' | 'workshop' | 'article' | 'civic';

export interface MediaItem {
  id: string;
  type: MediaType;
  title: L;
  outlet: L;
  date: YearMonth;
  description: L;
  url?: string;
  cta?: L;
  related?: EntityRef[];
}

export interface Publication {
  id: string;
  date: YearMonth;
  platform: string;
  title: L;
  summary: L;
  url?: string;
}

export interface Permit {
  name: L;
  category: L;
}

// ── Timeline ────────────────────────────────────────────────

export interface TimelineChapter {
  year: number;
  title: L;
  body: L;
  /** Entities listed under that year, in order. */
  items: EntityRef[];
}

// ── Contact ─────────────────────────────────────────────────

export type ContactSubject = 'ai' | 'digital' | 'hardware' | 'speaking' | 'other';
