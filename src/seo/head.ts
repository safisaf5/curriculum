import { education, experience, getProject, languages, profile, skillGroups } from '../data';
import type { Lang, Project } from '../data/types';
import { getStrings } from '../i18n';
import { BUILD_DATE } from '../lib/build';
import { getNote } from '../lib/notes';
import { localize } from '../lib/text';
import { absoluteUrl, FILES, LANGS, localizePath, parsePath, SITE_URL } from '../site';

/**
 * Everything that goes in <head> for a given URL. Used by the prerender
 * (static HTML) and by the client on navigation (document.title, meta...).
 */
export interface HeadData {
  lang: Lang;
  title: string;
  description: string;
  canonical: string;
  alternates: { hreflang: string; href: string }[];
  ogType: 'website' | 'profile' | 'article';
  ogImage: string;
  ogImageAlt: string;
  robots: string;
  jsonLd: object[];
  status: 200 | 404;
}

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const personLd = (lang: Lang) => {
  const tech = skillGroups.flatMap((g) => g.items.map((s) => s.name.en));
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: profile.name,
    givenName: profile.givenName,
    familyName: profile.familyName,
    url: `${SITE_URL}/`,
    image: absoluteUrl('/images/portrait-square-600.jpg'),
    jobTitle: localize(profile.title, lang),
    description: localize(profile.summary, lang),
    email: `mailto:${profile.contact.email}`,
    telephone: profile.contact.phoneE164,
    nationality: { '@type': 'Country', name: 'Switzerland' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: localize(profile.location.city, lang),
      addressRegion: profile.location.region,
      addressCountry: profile.location.countryCode,
    },
    homeLocation: {
      '@type': 'Place',
      name: 'Geneva, Switzerland',
      geo: { '@type': 'GeoCoordinates', latitude: profile.location.lat, longitude: profile.location.lng },
    },
    knowsLanguage: languages.map((l) => l.code.toLowerCase()),
    knowsAbout: [...new Set(['Artificial intelligence', 'AI automation', 'Digital transformation', ...tech])],
    alumniOf: education
      .filter((e) => e.kind === 'degree' && !e.status)
      .map((e) => ({ '@type': 'EducationalOrganization', name: localize(e.institution, 'fr') })),
    founder: experience
      .filter((x) => x.venture === 'founded' || x.venture === 'cofounded')
      .map((x) => ({ '@type': 'Organization', name: localize(x.company, 'fr').split(' · ')[0], ...(x.link ? { url: x.link } : {}) })),
    sameAs: [profile.contact.linkedin],
  };
};

const websiteLd = () => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: profile.name,
  inLanguage: ['fr', 'en'],
  publisher: { '@id': PERSON_ID },
});

const breadcrumbs = (lang: Lang, items: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: absoluteUrl(localizePath(it.path, lang)),
  })),
});

const projectLd = (p: Project, lang: Lang) => {
  const software = p.categories.includes('software');
  return {
    '@type': software ? 'SoftwareApplication' : 'CreativeWork',
    '@id': `${absoluteUrl(`/projects/${p.slug}`)}#project`,
    name: localize(p.name, lang),
    headline: localize(p.tagline, lang),
    description: localize(p.summary, lang),
    url: absoluteUrl(localizePath(`/projects/${p.slug}`, lang)),
    image: absoluteUrl(FILES.ogProject(p.slug)),
    creator: { '@id': PERSON_ID },
    ...(p.period ? { dateCreated: p.period.start } : {}),
    keywords: p.tags.join(', '),
    inLanguage: lang,
    ...(software ? { applicationCategory: 'BusinessApplication', operatingSystem: 'Web' } : {}),
    ...(p.links?.[0] ? { sameAs: p.links.map((l) => l.href) } : {}),
  };
};

const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });

export const getHead = (pathname: string): HeadData => {
  const { lang, path } = parsePath(pathname.replace(/\/+$/, '') || '/');
  const s = getStrings('seo', lang);
  const nav = getStrings('nav', lang);
  const alternatesFor = (p: string) => [
    ...LANGS.map((l) => ({ hreflang: l, href: absoluteUrl(localizePath(p, l)) })),
    { hreflang: 'x-default', href: absoluteUrl(localizePath(p, 'fr')) },
  ];

  const base = {
    lang,
    canonical: absoluteUrl(localizePath(path, lang)),
    alternates: alternatesFor(path),
    ogType: 'website' as const,
    ogImage: absoluteUrl(FILES.ogDefault),
    ogImageAlt: s.ogTitle,
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    status: 200 as const,
  };

  if (path === '/') {
    return {
      ...base,
      title: s.homeTitle,
      description: s.homeDescription,
      ogType: 'profile',
      jsonLd: [
        graph(
          personLd(lang),
          websiteLd(),
          {
            '@type': 'ProfilePage',
            '@id': `${base.canonical}#profilepage`,
            url: base.canonical,
            name: s.homeTitle,
            inLanguage: lang,
            dateCreated: '2024-01-01T00:00:00+01:00',
            dateModified: BUILD_DATE,
            isPartOf: { '@id': WEBSITE_ID },
            mainEntity: { '@id': PERSON_ID },
          },
        ),
      ],
    };
  }

  if (path === '/cv') {
    return {
      ...base,
      title: s.cvTitle,
      description: s.cvDescription,
      ogType: 'profile',
      jsonLd: [
        graph(
          personLd(lang),
          {
            '@type': 'ProfilePage',
            url: base.canonical,
            name: s.cvTitle,
            inLanguage: lang,
            dateModified: BUILD_DATE,
            mainEntity: { '@id': PERSON_ID },
          },
          breadcrumbs(lang, [
            { name: profile.name, path: '/' },
            { name: nav.cv, path: '/cv' },
          ]),
        ),
      ],
    };
  }

  if (path === '/card') {
    return {
      ...base,
      title: s.cardTitle,
      description: s.cardDescription,
      ogType: 'profile',
      jsonLd: [
        graph(
          personLd(lang),
          breadcrumbs(lang, [
            { name: profile.name, path: '/' },
            { name: nav.card, path: '/card' },
          ]),
        ),
      ],
    };
  }

  if (path === '/notes') {
    return {
      ...base,
      title: s.notesTitle,
      description: s.notesDescription,
      jsonLd: [
        graph(
          { '@type': 'Blog', url: base.canonical, name: s.notesTitle, inLanguage: lang, author: { '@id': PERSON_ID } },
          breadcrumbs(lang, [
            { name: profile.name, path: '/' },
            { name: nav.notes, path: '/notes' },
          ]),
        ),
      ],
    };
  }

  const noteMatch = path.match(/^\/notes\/([a-z0-9-]+)$/);
  if (noteMatch) {
    const note = getNote(noteMatch[1], lang);
    if (note) {
      return {
        ...base,
        title: `${note.title} · ${profile.name}`,
        description: note.description,
        ogType: 'article',
        jsonLd: [
          graph(
            {
              '@type': 'BlogPosting',
              headline: note.title,
              description: note.description,
              datePublished: note.date,
              inLanguage: note.lang,
              url: base.canonical,
              author: { '@id': PERSON_ID },
              publisher: { '@id': PERSON_ID },
            },
            breadcrumbs(lang, [
              { name: profile.name, path: '/' },
              { name: nav.notes, path: '/notes' },
              { name: note.title, path },
            ]),
          ),
        ],
      };
    }
  }

  const projectMatch = path.match(/^\/projects\/([a-z0-9-]+)$/);
  if (projectMatch) {
    const project = getProject(projectMatch[1]);
    if (project) {
      const name = localize(project.name, lang);
      return {
        ...base,
        title: s.projectTitle(name),
        description: localize(project.summary, lang),
        ogType: 'article',
        ogImage: absoluteUrl(FILES.ogProject(project.slug)),
        ogImageAlt: `${name} · ${localize(project.tagline, lang)}`,
        jsonLd: [
          graph(
            projectLd(project, lang),
            breadcrumbs(lang, [
              { name: profile.name, path: '/' },
              { name: nav.projects, path: '/#projects' },
              { name, path },
            ]),
          ),
        ],
      };
    }
  }

  return {
    ...base,
    title: s.notFoundTitle,
    description: getStrings('notes', lang).notFoundBody,
    robots: 'noindex, follow',
    alternates: [],
    jsonLd: [],
    status: 404,
  };
};

/** Serialise head data to HTML (prerender only). Values are escaped. */
export const renderHeadTags = (h: HeadData): string => {
  const esc = (v: string) =>
    v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const locale = h.lang === 'fr' ? 'fr_CH' : 'en_US';
  const altLocale = h.lang === 'fr' ? 'en_US' : 'fr_CH';
  const tags = [
    `<title>${esc(h.title)}</title>`,
    `<meta name="description" content="${esc(h.description)}" />`,
    `<meta name="robots" content="${esc(h.robots)}" />`,
    `<link rel="canonical" href="${esc(h.canonical)}" />`,
    ...h.alternates.map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}" />`),
    `<meta property="og:type" content="${h.ogType}" />`,
    `<meta property="og:site_name" content="${esc(profile.name)}" />`,
    `<meta property="og:title" content="${esc(h.title)}" />`,
    `<meta property="og:description" content="${esc(h.description)}" />`,
    `<meta property="og:url" content="${esc(h.canonical)}" />`,
    `<meta property="og:image" content="${esc(h.ogImage)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(h.ogImageAlt)}" />`,
    `<meta property="og:locale" content="${locale}" />`,
    `<meta property="og:locale:alternate" content="${altLocale}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(h.title)}" />`,
    `<meta name="twitter:description" content="${esc(h.description)}" />`,
    `<meta name="twitter:image" content="${esc(h.ogImage)}" />`,
    `<meta name="twitter:image:alt" content="${esc(h.ogImageAlt)}" />`,
    ...h.jsonLd.map(
      (j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`,
    ),
  ];
  return tags.join('\n    ');
};
