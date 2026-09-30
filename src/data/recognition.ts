import type { Award, Engagement, L, MediaItem, Permit, Publication } from './types';

/**
 * Media, public speaking, awards, engagement, publications, permits, interests.
 * To add an appearance: add an entry to `media` (newest first).
 */

export const media: MediaItem[] = [
  {
    id: 'ai-workshop-2025',
    type: 'workshop',
    title: { fr: "Atelier interactif sur l'intelligence artificielle", en: 'Interactive workshop on artificial intelligence' },
    outlet: { fr: 'Genève', en: 'Geneva' },
    date: '2025-10',
    description: {
      fr: 'Une trentaine de participants. Au programme : prompting, Whisper, Quillbot, Perplexity, NotebookLM et automatisation de workflows.',
      en: 'Around thirty participants. On the agenda: prompting, Whisper, Quillbot, Perplexity, NotebookLM and workflow automation.',
    },
    related: ['ai-projects'],
  },
  {
    id: 'osint-2025',
    type: 'article',
    title: { fr: 'Protection des données personnelles et OSINT', en: 'Personal data protection and OSINT' },
    outlet: { fr: 'LinkedIn', en: 'LinkedIn' },
    date: '2025-04',
    description: {
      fr: 'Article sur l’OSINT, les fuites de données, la surveillance numérique et la protection des données.',
      en: 'An article on OSINT, data leaks, digital surveillance and data protection.',
    },
  },
  {
    id: 'rts-2024',
    type: 'tv',
    title: { fr: 'Le témoignage de Safwan Abdirahman', en: 'The testimony of Safwan Abdirahman' },
    outlet: { fr: 'RTS · L’actu en vidéo', en: 'RTS (Swiss national TV)' },
    date: '2024',
    description: {
      fr: 'Témoignage télévisé sur l’engagement politique des jeunes.',
      en: "A TV testimony on young people's political engagement.",
    },
    url: 'https://www.rts.ch/play/tv/lactu-en-video/video/le-temoignage-de-safwan-abdirahman?urn=urn:rts:video:14370758',
    cta: { fr: 'Voir sur RTS', en: 'Watch on RTS' },
  },
  {
    id: 'youtube-2024',
    type: 'video',
    title: { fr: 'Interview entrepreneuriat', en: 'Entrepreneurship interview' },
    outlet: { fr: 'YouTube', en: 'YouTube' },
    date: '2024',
    description: {
      fr: 'Discussion sur mon parcours d’entrepreneur et mes projets.',
      en: 'A conversation about my path as an entrepreneur and my projects.',
    },
    url: 'https://www.youtube.com/watch?v=4KK-bxnwAUo',
    cta: { fr: 'Voir sur YouTube', en: 'Watch on YouTube' },
  },
  {
    id: 'eloquence-stage-2024',
    type: 'stage',
    title: { fr: "Concours genevois d'éloquence 2024", en: 'Geneva Eloquence Contest 2024' },
    outlet: { fr: '2e prix du meilleur discours', en: '2nd prize for best speech' },
    date: '2024-03',
    description: {
      fr: 'Sujet défendu à la positive : « Qu’importe le flacon, pourvu qu’on ait l’ivresse » (Alfred de Musset). Jury : Me Tamim Mahmoud, Me Mitra Sohrabi, M. Ziad El May.',
      en: 'Argued in favour of: "What matters the bottle, as long as there is intoxication" (Alfred de Musset). Jury: Tamim Mahmoud, Mitra Sohrabi, Ziad El May.',
    },
    related: ['eloquence-2024'],
  },
  {
    id: 'geunes-2023',
    type: 'civic',
    title: { fr: 'Président des GEunes', en: 'President of Les GEunes' },
    outlet: {
      fr: "Association faîtière des associations d'élèves du Secondaire II",
      en: 'Umbrella body of Geneva upper secondary student associations',
    },
    date: '2023-09',
    description: {
      fr: "Organisation du Cortège de l'Escalade (le Picoulet) et de la Soirée de la Maturité. Rencontre avec la Conseillère d'État Anne Hiltpold sur la santé mentale en milieu scolaire.",
      en: 'Organised the Escalade procession (le Picoulet) and the Matura evening. Met State Councillor Anne Hiltpold on mental health in schools.',
    },
    related: ['geunes'],
  },
  {
    id: 'session-des-jeunes',
    type: 'civic',
    title: { fr: 'Session des Jeunes', en: 'Youth Session' },
    outlet: { fr: 'Participation en 2022 et 2024', en: 'Took part in 2022 and 2024' },
    date: '2022',
    description: {
      fr: 'Participation à la Session des Jeunes en 2022 puis en 2024.',
      en: 'Took part in the Youth Session in 2022 and again in 2024.',
    },
  },
];

export const awards: Award[] = [
  {
    id: 'eloquence-2024',
    title: { fr: '2e prix du meilleur discours', en: '2nd prize for best speech' },
    event: { fr: "Concours genevois d'éloquence 2024", en: 'Geneva Eloquence Contest 2024' },
    date: '2024-03-28',
    details: {
      fr: "Sujet : « Qu'importe le flacon, pourvu qu'on ait l'ivresse » (Alfred de Musset), défendu à la positive.",
      en: 'Topic: "What matters the bottle, as long as there is intoxication" (Alfred de Musset), argued in favour.',
    },
  },
  {
    id: 'maturite-mention',
    title: { fr: 'Maturité gymnasiale avec mention', en: 'Swiss Matura with honours' },
    event: { fr: 'Collège Voltaire', en: 'Collège Voltaire' },
    date: '2024-06-22',
    details: { fr: 'Moyenne générale : 5.1/6', en: 'Overall average: 5.1/6' },
  },
  {
    id: 'tm-2023',
    title: { fr: 'Meilleure note au travail de maturité', en: 'Top grade for the Matura thesis' },
    event: { fr: 'Collège Voltaire', en: 'Collège Voltaire' },
    date: '2023',
    details: {
      fr: "6/6 · « Construire une montre automatique à l'aide de pièces détachées »",
      en: '6/6 · "Building an automatic watch from spare parts"',
    },
  },
];

export const engagement: Engagement[] = [
  {
    id: 'geunes',
    name: {
      fr: "Les GEunes · association faîtière des associations d'élèves du Secondaire II",
      en: 'Les GEunes · umbrella body of upper secondary student associations',
    },
    role: { fr: 'Président', en: 'President' },
    period: { start: '2023-09', end: '2024-09' },
    kind: { fr: 'Associatif', en: 'Student body' },
    description: {
      fr: "Organisation du Cortège de l'Escalade (le Picoulet) et de la Soirée de la Maturité. Rencontre avec la Conseillère d'État Anne Hiltpold sur la santé mentale en milieu scolaire.",
      en: 'Organised the Escalade procession (le Picoulet) and the Matura evening. Met State Councillor Anne Hiltpold on mental health in schools.',
    },
  },
  {
    id: 'debate-club',
    name: { fr: 'Club Genevois de Débat', en: 'Geneva Debate Club' },
    role: { fr: 'Membre auxiliaire', en: 'Associate member' },
    period: { start: '2022-09', end: 'present' },
    kind: { fr: 'Débat', en: 'Debate' },
  },
  {
    id: 'ai-trainer',
    name: { fr: 'Formateur IA & conférencier', en: 'AI trainer & speaker' },
    role: { fr: 'Animateur', en: 'Facilitator' },
    kind: { fr: 'Transmission', en: 'Teaching' },
    description: {
      fr: "Ateliers interactifs sur l'IA à Genève, 30+ participants : prompting, Whisper, Quillbot, Perplexity, NotebookLM, automatisation de workflows.",
      en: 'Interactive AI workshops in Geneva, 30+ participants: prompting, Whisper, Quillbot, Perplexity, NotebookLM, workflow automation.',
    },
  },
  {
    id: 'parlement-jeunes',
    name: { fr: 'Parlement des Jeunes Genevois', en: 'Geneva Youth Parliament' },
    role: { fr: 'Membre', en: 'Member' },
    period: { start: '2023', end: '2024' },
    kind: { fr: 'Politique', en: 'Politics' },
  },
  {
    id: 'session-jeunes',
    name: { fr: 'Session des Jeunes', en: 'Youth Session' },
    role: { fr: 'Participant (2022 et 2024)', en: 'Participant (2022 and 2024)' },
    kind: { fr: 'Politique', en: 'Politics' },
  },
  {
    id: 'la-trace',
    name: { fr: 'La Trace · groupe solidaire', en: 'La Trace · solidarity group' },
    role: { fr: 'Membre', en: 'Member' },
    period: { start: '2019', end: '2024' },
    kind: { fr: 'Humanitaire', en: 'Humanitarian' },
  },
  {
    id: 'aecv',
    name: { fr: 'AECV · Association des élèves du Collège Voltaire', en: 'AECV · Collège Voltaire student association' },
    role: { fr: 'Membre', en: 'Member' },
    period: { start: '2019', end: '2024' },
    kind: { fr: 'Social', en: 'Social' },
  },
];

export const publications: Publication[] = [
  {
    id: 'pub-ai-workshop',
    date: '2025-10',
    platform: 'LinkedIn',
    title: { fr: "Atelier interactif sur l'intelligence artificielle à Genève", en: 'Interactive workshop on artificial intelligence in Geneva' },
    summary: {
      fr: "Retour sur un atelier IA animé pour une trentaine de participants : prompting, Whisper, Quillbot, Perplexity, NotebookLM, automatisation.",
      en: 'Looking back at an AI workshop for around thirty participants: prompting, Whisper, Quillbot, Perplexity, NotebookLM, automation.',
    },
  },
  {
    id: 'pub-osint',
    date: '2025-04',
    platform: 'LinkedIn',
    title: { fr: 'Protection des données personnelles et OSINT', en: 'Personal data protection and OSINT' },
    summary: {
      fr: "L'OSINT, les fuites de données, la surveillance numérique et la protection des données.",
      en: 'OSINT, data leaks, digital surveillance and data protection.',
    },
  },
];

export const permits: Permit[] = [
  { name: { fr: 'Permis voiture et moto A2', en: 'Car and motorcycle licence (A2)' }, category: { fr: 'Conduite', en: 'Driving' } },
  { name: { fr: 'Permis pilote de drone A1/A3', en: 'Drone pilot licence A1/A3' }, category: { fr: 'Aérien', en: 'Aviation' } },
  { name: { fr: 'Permis chauffeur professionnel', en: 'Professional driver licence' }, category: { fr: 'Conduite professionnelle', en: 'Professional driving' } },
];

export const interests: L[] = [
  { fr: 'Rhétorique & débat', en: 'Rhetoric & debate' },
  { fr: 'Horlogerie', en: 'Watchmaking' },
  { fr: 'Informatique & électronique', en: 'Computing & electronics' },
  { fr: 'Automatisation (HomeLink, Arduino, n8n, Make)', en: 'Automation (HomeLink, Arduino, n8n, Make)' },
  { fr: 'Impression 3D', en: '3D printing' },
  { fr: 'Droit (assistance à divers procès)', en: 'Law (attending court hearings)' },
  { fr: 'Bals & opéra', en: 'Balls & opera' },
];
