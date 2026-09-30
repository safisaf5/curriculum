import type { SkillGroup, ToolGroup, L } from './types';

/**
 * Skills grouped in four universes. `evidence` lists the projects, jobs,
 * courses or awards that prove each skill (ids from the other data files).
 */
export const skillGroups: SkillGroup[] = [
  {
    id: 'tech',
    label: { fr: 'Tech', en: 'Tech' },
    items: [
      { id: 'ai', name: { fr: 'Intelligence artificielle', en: 'Artificial intelligence' }, evidence: ['neuron-ia', 'mrz-scanner', 'ai-projects', 'ai-workshop-2025'] },
      { id: 'prompt', name: { fr: 'Prompt engineering', en: 'Prompt engineering' }, evidence: ['ai-projects', 'ai-workshop-2025'] },
      { id: 'programming', name: { fr: 'Programmation', en: 'Programming' }, evidence: ['heg-scala-iot', 'mrz-scanner', 'neuron-ia', 'mamajah'] },
      { id: 'scala', name: { fr: 'Scala', en: 'Scala' }, evidence: ['heg-scala-iot'] },
      { id: 'iot', name: { fr: 'IoT', en: 'IoT' }, evidence: ['heg-scala-iot', 'lab'] },
      { id: 'computer-vision', name: { fr: 'Vision par ordinateur', en: 'Computer vision' }, evidence: ['mrz-scanner'] },
      { id: 'automation', name: { fr: 'Automatisation', en: 'Automation' }, evidence: ['neuron-ia', 'ai-projects', 'lab'] },
      { id: 'electronics', name: { fr: 'Électronique', en: 'Electronics' }, evidence: ['heal-electronix', 'phonelab', 'golden-dreams'] },
      { id: 'micro-soldering', name: { fr: 'Micro-soudure', en: 'Micro-soldering' }, evidence: ['heal-electronix'] },
      { id: 'watchmaking', name: { fr: 'Horlogerie', en: 'Watchmaking' }, evidence: ['mechanical-watch', 'rolex'] },
    ],
  },
  {
    id: 'business',
    label: { fr: 'Business', en: 'Business' },
    items: [
      { id: 'entrepreneurship', name: { fr: 'Entrepreneuriat', en: 'Entrepreneurship' }, evidence: ['heal-electronix', 'sbsa', 'pepe-chicken'] },
      { id: 'project-management', name: { fr: 'Gestion de projet', en: 'Project management' }, evidence: ['sbsa', 'geunes'] },
      { id: 'strategy', name: { fr: 'Stratégie', en: 'Strategy' }, evidence: ['pepe-chicken', 'neuron-ia'] },
      { id: 'negotiation', name: { fr: 'Négociation', en: 'Negotiation' }, evidence: ['pepe-chicken', 'sbsa'] },
      { id: 'sales', name: { fr: 'Vente', en: 'Sales' }, evidence: ['cirque-du-soleil', 'sbsa', 'heal-electronix'] },
      { id: 'digital-transformation', name: { fr: 'Transformation digitale', en: 'Digital transformation' }, evidence: ['neuron-ia', 'mamajah', 'google-seo'] },
      { id: 'restaurant-management', name: { fr: 'Gestion de restaurant', en: 'Restaurant management' }, evidence: ['ifage-cafetier', 'pepe-chicken'] },
    ],
  },
  {
    id: 'communication',
    label: { fr: 'Communication', en: 'Communication' },
    items: [
      { id: 'eloquence', name: { fr: 'Éloquence', en: 'Public speaking' }, evidence: ['eloquence-2024', 'debate-club', 'debate-training'] },
      { id: 'presentation', name: { fr: 'Présentation', en: 'Presenting' }, evidence: ['ai-workshop-2025', 'rts-2024'] },
      { id: 'leadership', name: { fr: 'Leadership', en: 'Leadership' }, evidence: ['geunes', 'heal-electronix'] },
      { id: 'client-relations', name: { fr: 'Relation client', en: 'Client relations' }, evidence: ['heal-electronix', 'cirque-du-soleil', 'notime'] },
      { id: 'languages', name: { fr: 'Cinq langues', en: 'Five languages' }, evidence: ['cambridge-fce', 'dili-b2'] },
    ],
  },
  {
    id: 'creative',
    label: { fr: 'Création', en: 'Creative' },
    items: [
      { id: 'product-design', name: { fr: 'Création de produits', en: 'Product making' }, evidence: ['mechanical-watch', 'sbsa'] },
      { id: 'dtp', name: { fr: 'Design & PAO', en: 'Design & DTP' }, evidence: ['sbsa'] },
      { id: 'digital-fabrication', name: { fr: 'Broderie numérique', en: 'Digital embroidery' }, evidence: ['faclab', 'sbsa'] },
      { id: '3d-printing', name: { fr: 'Impression 3D', en: '3D printing' }, evidence: ['lab'] },
    ],
  },
];

/** Everyday tools, grouped. Shown as a compact toolbox. */
export const toolGroups: ToolGroup[] = [
  {
    id: 'dev-ai',
    label: { fr: 'Développement & IA', en: 'Development & AI' },
    items: ['React', 'TypeScript', 'Python', 'Scala', 'HTML5/CSS3', 'Tailwind CSS', 'Supabase', 'Git/GitHub', 'VS Code', 'Hugging Face', 'LLMs', 'Whisper', 'NotebookLM', 'Perplexity'],
  },
  {
    id: 'automation',
    label: { fr: 'Automatisation', en: 'Automation' },
    items: ['n8n', 'Make', 'HomeLink'],
  },
  {
    id: 'electronics-iot',
    label: { fr: 'Électronique & IoT', en: 'Electronics & IoT' },
    items: ['Micro-soudure', 'Arduino', 'Raspberry Pi', 'Serveurs NAS', 'Plex', 'Kodi'],
  },
  {
    id: 'design',
    label: { fr: 'Digital & création', en: 'Digital & design' },
    items: ['SEO', 'Réseaux sociaux', 'PAO (vectorisation)', 'Suite Adobe', 'Photoshop', 'Premiere Pro', 'Inkscape', 'Rhino', 'Cura', 'CAO'],
  },
  {
    id: 'systems',
    label: { fr: 'Systèmes', en: 'Systems' },
    items: ['Windows', 'Linux', 'macOS', 'iOS/Android', 'Root/Jailbreak', 'Hard reset', 'Microsoft 365'],
  },
];

/** Personal strengths listed on the CV. */
export const personalSkills: L[] = [
  { fr: 'Leadership', en: 'Leadership' },
  { fr: 'Communication', en: 'Communication' },
  { fr: 'Art oratoire', en: 'Oratory' },
  { fr: 'Gestion de projet', en: 'Project management' },
  { fr: 'Relation client', en: 'Client relations' },
  { fr: 'Entrepreneuriat', en: 'Entrepreneurship' },
  { fr: 'Négociation', en: 'Negotiation' },
  { fr: 'Vente directe', en: 'Direct sales' },
  { fr: "Esprit d'équipe", en: 'Team spirit' },
  { fr: 'Rigueur', en: 'Rigour' },
  { fr: 'Adaptabilité', en: 'Adaptability' },
  { fr: 'Esprit analytique', en: 'Analytical thinking' },
  { fr: 'Minutie & précision', en: 'Care & precision' },
];
