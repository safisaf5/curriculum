import {
  awards,
  education,
  experience,
  languages,
  media,
  profile,
  services,
  sortedProjects,
} from '../data';
import { BUILD_DATE } from '../lib/build';
import { formatPeriod } from '../lib/dates';
import { localize } from '../lib/text';
import { absoluteUrl, FILES, localizePath, parsePath } from '../site';

/** sitemap.xml with hreflang alternates, generated from the prerendered routes. */
export const buildSitemap = (routes: string[]): string => {
  const lastmod = BUILD_DATE.slice(0, 10);
  const neutral = [...new Set(routes.map((r) => parsePath(r).path))];
  const priority = (p: string) => (p === '/' ? '1.0' : p.startsWith('/projects/') ? '0.8' : p === '/cv' ? '0.8' : '0.6');
  const urls = neutral.flatMap((p) =>
    (['fr', 'en'] as const).map((lang) => {
      const loc = absoluteUrl(localizePath(p, lang));
      const alts = (['fr', 'en'] as const)
        .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${absoluteUrl(localizePath(p, l))}" />`)
        .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(localizePath(p, 'fr'))}" />`)
        .join('\n');
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority(p)}</priority>\n${alts}\n  </url>`;
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
};

/** llms.txt: a plain summary for AI assistants and answer engines (https://llmstxt.org). */
export const buildLlmsTxt = (): string => {
  const l = (v: Parameters<typeof localize>[0]) => localize(v, 'fr');
  const lines: string[] = [];
  lines.push(`# ${profile.name}`, '');
  lines.push(`> ${l(profile.subline)} ${l(profile.headline)}`, '');
  lines.push('## Profil');
  lines.push(`- Nom : ${profile.name}`);
  lines.push(`- Positionnement : ${profile.positioning}`);
  lines.push(`- Localisation : ${l(profile.location.city)}, ${l(profile.location.country)}`);
  lines.push(`- Résumé : ${l(profile.summary)}`);
  lines.push(
    `- Langues : ${languages.map((x) => `${l(x.name)} (${x.cefr === 'native' ? l(x.level) : x.cefrLabel})`).join(', ')}`,
    '',
  );
  lines.push('## Projets');
  for (const p of sortedProjects) {
    lines.push(`- [${l(p.name)}](${absoluteUrl(`/projects/${p.slug}`)}) : ${l(p.summary)}`);
  }
  lines.push('', '## Expérience');
  for (const x of experience) {
    lines.push(`- ${l(x.role)}, ${l(x.company)} (${formatPeriod(x.period, 'fr')})`);
  }
  lines.push('', '## Formation');
  for (const e of education.filter((e) => e.kind !== 'school')) {
    lines.push(`- ${l(e.program)}, ${l(e.institution)} (${formatPeriod(e.period, 'fr')})`);
  }
  lines.push('', '## Distinctions et médias');
  for (const a of awards) lines.push(`- ${l(a.title)} : ${l(a.event)}`);
  for (const m of media.filter((m) => m.url)) lines.push(`- [${l(m.title)}](${m.url}) : ${l(m.outlet)}`);
  lines.push('', '## Services');
  for (const s of services) lines.push(`- ${l(s.title)} : ${l(s.short)}`);
  lines.push('', '## Pages');
  lines.push(`- [Accueil](${absoluteUrl('/')}) · [English](${absoluteUrl('/en')})`);
  lines.push(`- [CV](${absoluteUrl('/cv')}) · [PDF](${absoluteUrl(FILES.cvPdf.fr)}) · [PDF (EN)](${absoluteUrl(FILES.cvPdf.en)})`);
  lines.push(`- [Carte de visite](${absoluteUrl('/card')}) · [vCard](${absoluteUrl(FILES.vcard)})`);
  lines.push('', '## Contact');
  lines.push(`- E-mail : ${profile.contact.email}`);
  lines.push(`- Téléphone / WhatsApp : ${profile.contact.phone}`);
  lines.push(`- LinkedIn : ${profile.contact.linkedin}`);
  lines.push(`- Site : ${profile.contact.website}`, '');
  return lines.join('\n');
};
