# Modifier le contenu

Tout le contenu du site vient de `src/data`. Modifier un fichier suffit : l'accueil, les pages projet,
le CV web, le CV PDF, la vCard, le sitemap, `llms.txt` et les images Open Graph se mettent à jour au prochain build.

## Règles

- **Des faits, rien que des faits.** Pas de client, de chiffre, de résultat ou de titre qui ne soit pas vrai et vérifiable.
  Un champ inconnu reste vide : il n'est simplement pas affiché.
- **Toujours en deux langues** : chaque texte est un objet `{ fr: '...', en: '...' }`.
- **Pas de tiret cadratin ni demi-cadratin.** Utiliser `·`, `:`, `→` ou une virgule. `npm run check` bloque le build sinon.
- Apostrophes droites acceptées : la typographie (apostrophe courbe, espaces fines avant `:` en français) est appliquée automatiquement.

## Ajouter un projet

Dans `src/data/projects.ts`, copier un bloc et adapter :

```ts
{
  slug: 'mon-projet',                    // adresse : /projects/mon-projet
  name: { fr: 'Mon projet', en: 'My project' },
  tagline: { fr: '...', en: '...' },     // une ligne
  summary: { fr: '...', en: '...' },     // 1 à 2 phrases (cartes + SEO)
  period: { start: '2026-03', end: 'present' },
  status: 'active',                      // active | completed | ongoing | acquired
  categories: ['ai', 'software'],        // filtres : ai, software, hardware, business, automation, creative
  tags: ['AI', 'SOFTWARE'],
  order: 9,
  overview, problem, idea, role, results, technologies, links, milestones, media  // tous facultatifs
  cover: { motif: 'network' },           // visuel généré ; ou { motif: 'network', image: '/images/mon-projet.jpg' }
}
```

Images et vidéos : déposer les fichiers dans `public/images/` puis les référencer dans `media`
(`{ type: 'image', src: '/images/x.jpg', alt: { fr, en }, width, height }`). Les images externes sont bloquées par la CSP.

## Ajouter une expérience, une formation, une langue

`src/data/experience.ts`, `education.ts`, `languages.ts`. Les dates s'écrivent `'2025-06'` (mois) ou `'2025'` (année) ;
`end: 'present'` pour une activité en cours. Mettre `highlight: true` pour qu'une expérience apparaisse avant « Tout afficher ».
La timeline et les chiffres se recalculent seuls.

## Ajouter une apparition média ou une conférence

`src/data/recognition.ts`, tableau `media`, en tête de liste :

```ts
{ id: 'conference-2026', type: 'stage', title: {...}, outlet: {...}, date: '2026-05', description: {...}, url: 'https://...', cta: {...} }
```

Types : `tv`, `video`, `stage`, `workshop`, `article`, `civic`.

## Publier une note

Copier `src/content/notes/_template.fr.md` en `mon-sujet.fr.md` (et `mon-sujet.en.md` si traduite), remplir l'en-tête,
retirer `draft: true`. La note apparaît sur `/notes`, dans le sitemap et en aperçu sur l'accueil.

## Textes d'interface

Titres de sections, boutons, messages du formulaire : `src/i18n/strings/*.ts` (un fichier par zone du site).

## Vérifier avant de publier

```bash
npm run check     # contenu
npm run build     # build complet
npm run preview   # http://localhost:4173, comme en production
```

## Points à confirmer (repérés pendant la refonte)

Les anciennes données se contredisaient sur quelques points. Le choix retenu est indiqué ; à corriger dans `src/data` si besoin.

| Sujet | Versions trouvées | Retenu |
|---|---|---|
| URL LinkedIn | `/in/safwanab` (CV) et `/in/safwan-abdirahman` (footer, JSON-LD) | `/in/safwanab` |
| Concours d'éloquence 2024 | « premier prix / vainqueur » et « 2e prix du meilleur discours, 28 mars 2024 » | 2e prix du meilleur discours |
| Cirque du Soleil | 2024, « Vendeur » et mai-juin 2025, « Opérations concessions & merchandising » | mai → juin 2025 |
| Collège Voltaire | 2019-2024 et 2020-2024 | 2020 → 2024 (Cycle : 2017 → 2020) |
| Arabe | « natif » et « courant B2-C1 » | Courant, B2-C1 |
| Allemand | A2 et A2-B1 | A2 |
| Patente de cafetier | 2024 et 2025 | Formation sept. → nov. 2024 |
| Participants à l'atelier IA | « 30+ » et « ~30 » | environ 30 |
| Rôle dans Neuron IA | non précisé | « Conception du produit et développement de la plateforme » |
| Site de Heal ElectroniX | absent de l'ancien site | `helectronix.com` (trouvé sur le compte Netlify) |
| CMS EPFL (sept. 2025 → juil. 2026) | « en cours » | période affichée sans statut (ajouter le résultat) |
| Ancien PDF `/CV Safwan .pdf` | ancien CV, plus à jour | laissé en place pour ne pas casser d'anciens liens ; peut être supprimé |
