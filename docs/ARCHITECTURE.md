# safwan.ch · Architecture

Document de référence de la refonte. Il explique ce qui existait, ce qui a été conservé,
comment le site est organisé et comment il se construit.

## 1. Inventaire du site précédent (avant refonte)

| Élément | Ancien site | Dans la refonte |
|---|---|---|
| Pages | `/` (accueil), `/cv`, `/card` | Conservées aux mêmes adresses, + `/en/...`, `/projects/<slug>`, `/notes`, page 404 |
| Accueil | Hero, À propos, Services, Projets, Parcours, Compétences, Contact | Hero, Identité, Chiffres, Ce que je construis, Projets, Timeline, Expérience, Formation, Compétences, Langues, Services, Médias, Philosophie, Contact |
| Composant `Media.tsx` (non affiché) | RTS 2024, interview YouTube 2024 | Section Médias, alimentée par `src/data/recognition.ts` |
| Données | `src/data/cv.ts`, `experiences.ts`, `projects.ts`, `services.ts`, `skills.ts` + textes en dur dans les composants | Tout est fusionné dans `src/data/*` (source unique) |
| FR / EN | Bascule en mémoire (localStorage), même URL | URL dédiées (`/` et `/en`), préférence mémorisée, bascule dans la navigation |
| Mode sombre | Classe `dark`, localStorage, `prefers-color-scheme` | Idem, sans flash au chargement (`public/theme-init.js`), clés localStorage identiques |
| Barre de progression, retour en haut, section active dans le menu, menu mobile | Oui | Oui (redessinés) |
| Compteurs animés, apparitions au scroll | Oui | Oui (sans masquer le contenu sans JavaScript) |
| CV web + impression A4, « voir plus / voir moins » | Oui | Oui + téléchargement PDF FR/EN généré automatiquement |
| Carte de visite `/card` + QR code | Oui | Oui + vCard, « Ajouter aux contacts », partage |
| Formulaires | Aucun (Netlify Forms activé mais inutilisé) | Formulaire de contact Netlify Forms (anti-spam, validation, repli e-mail) |
| Liens | mailto, tel, wa.me, LinkedIn, neuronia.ch, sbsa.agency, RTS, YouTube | Tous conservés |
| Assets | `IMG_8964.JPG`, `Favicon.jpg`, `favicon.svg` | Conservés (l'ancien `CV Safwan .pdf` est supprimé et redirigé vers le CV FR) ; portrait décliné en AVIF/WebP/JPEG (`public/images`) ; nouveau favicon |
| SEO | title, meta, OG, Twitter, 5 blocs JSON-LD (dont 2 ProfilePage en double), canonical en double, hreflang incorrect, sitemap (3 URL), robots.txt, llms.txt | Head par page, JSON-LD `@graph` (Person, WebSite, ProfilePage, projets, fil d'Ariane), hreflang corrects, sitemap et llms.txt générés depuis les données |
| Déploiement | Netlify (build lancé depuis Bolt.new), en-têtes de sécurité, repli SPA | Netlify direct (`npm run build`), en-têtes renforcés, vraie 404 |
| Phrase « Agir avec excellence, servir avec conscience. » | Footer + Contact | Supprimée partout (demande explicite) |

## 2. Architecture UX

L'accueil raconte une histoire dans l'ordre où un visiteur se pose les questions :

1. **Qui ?** Hero : nom, phrase de positionnement, localisation, heure de Genève, CTA.
2. **Pourquoi c'est intéressant ?** Identité : « Je ne rentre pas dans une seule case », les 4 univers, puis le parcours en 4 temps (réparer → entreprendre → coder → combiner).
3. **Preuves.** Chiffres calculés depuis les données, « Ce que je construis », explorateur de projets.
4. **Comment j'en suis arrivé là.** Timeline interactive, expérience, formation.
5. **Ce que je sais faire.** Carte des compétences (chaque compétence renvoie à ses preuves), langues, services.
6. **Comment je communique.** Médias et prise de parole, philosophie « Build. Learn. Improve. ».
7. **Conversion.** « Let's build something. », canaux directs et formulaire.

Priorité : clarté → identité → crédibilité → expérience → conversion. Le CV (web + PDF) est accessible en permanence depuis la navigation.

## 3. Système visuel

- **Concept** : précision suisse. L'horlogerie, la micro-soudure et Genève donnent le fil : cadran, graduations, filets fins, typographie d'ingénieur.
- **Couleurs** (tokens CSS dans `src/styles/index.css`, clair et sombre) : papier `#F3F1EC`, encre `#0E0E0F`, une seule couleur signal, vermillon `#E23D1E`. Contrastes AA vérifiés (texte secondaire ≥ 4,5:1).
- **Typographie** : Archivo variable (axe de largeur 62 → 125 %) pour tout ; les très grands titres utilisent la largeur 125 % en capitales. JetBrains Mono pour les métadonnées (étiquettes, dates, index). Polices auto-hébergées.
- **Grille** : 12 colonnes, marges 16 px sur mobile, filets de 1 px au lieu de cartes et d'ombres, angles droits.
- **Mouvement** : transitions courtes (ease-out-expo), transformations et opacité uniquement, tout est désactivé avec `prefers-reduced-motion`.

## 4. Composants

```
src/
  data/            source unique du contenu (typée, FR/EN)
  i18n/            textes d'interface par espace de noms (strings/*.ts), typés
  components/
    layout/        Nav (menu CV, FR/EN, thème), Footer, SiteLayout
    ui/            SmartLink, ButtonLink, SectionHeader, Portrait, ProjectCover
    home/          une section par fichier (Hero, Identity, Proof, WhatIBuild, ProjectExplorer, Timeline, ...)
    projects/ journey/ skills/ offer/ contact/ notes/ card/ cv/   sous-composants
  pages/           HomePage, ProjectPage, CvPage, CardPage, NotesPage, NotePage, NotFoundPage
  hooks/           reveal au scroll, media queries, horloge de Genève, section active...
  lib/             dates, typographie, analytics, vcard, notes (Markdown), contactIntent
  seo/             head par route (title, meta, OG, JSON-LD), sitemap, llms.txt
  content/notes/   notes en Markdown
scripts/           build, prerender, générateurs (PDF, OG, favicons, vCard), vérification du contenu, serveur de prévisualisation
```

## 5. Données

Chaque fait est écrit une seule fois dans `src/data` et réutilisé partout : accueil, pages projet, CV web,
CV PDF, vCard, JSON-LD, sitemap, llms.txt, images Open Graph.

- `profile.ts` : identité, contact, univers, parcours en 4 temps
- `projects.ts` : projets (une page par projet est générée automatiquement)
- `experience.ts`, `education.ts`, `languages.ts`, `skills.ts`
- `services.ts` : services et « Ce que je construis »
- `recognition.ts` : médias, distinctions, engagement, publications, permis, centres d'intérêt
- `timeline.ts` : titres des années ; les entrées sont collectées automatiquement depuis toutes les données datées
- `stats.ts` : chiffres dérivés (jamais saisis à la main)
- `entities.ts` : index de tout ce qui peut servir de preuve (compétence → projets, expériences, cours...)

`npm run check` vérifie les références croisées, les traductions et l'absence de tirets cadratins.

## 6. Build et déploiement

`npm run build` (lancé par Netlify) :

1. vérifie le contenu (`scripts/check-content.ts`) ;
2. génère la vCard, le CV PDF FR/EN, les images Open Graph et les favicons (`scripts/generate.ts`, non bloquant : en cas d'échec, les fichiers déjà commités restent en place) ;
3. construit le bundle client (Vite) ;
4. construit le bundle de pré-rendu et génère une page HTML statique par route et par langue (`scripts/prerender.ts`), plus `404.html`, `sitemap.xml`, `llms.txt` et `_redirects`.

Le HTML contient le vrai contenu (SEO, aperçus de liens, robots IA, affichage sans JavaScript) ; React « hydrate » ensuite la page.
`npm run preview` sert `dist/` comme Netlify (URL propres, 404, en-têtes de sécurité, CSP, compression).
`SKIP_GENERATE=1 npm run build` saute l'étape 2 (utile pour itérer vite sur l'interface).

Déploiement Netlify : commande `npm run build`, dossier `dist`, Node 22 (tout est dans `netlify.toml`).
Le formulaire de contact est détecté par Netlify dans le HTML pré-rendu ; les notifications
(e-mail à chaque message) se règlent dans l'interface Netlify, rubrique *Forms*.

### Performance

- Pages pré-rendues : le contenu s'affiche avant le JavaScript.
- Hydratation dans une transition (`startTransition`) : la page reste fluide pendant que React s'attache.
- Hydratation progressive de l'accueil (`HydrateOnVisible`) : chaque section garde son HTML serveur et
  ne devient interactive qu'à l'approche de l'écran, au premier clavier, ou quand le navigateur est inactif.
- Thème lu depuis un store externe (`useSyncExternalStore`) : aucun rendu racine pendant l'hydratation.
- Code découpé par page (CV, carte, notes), polices variables auto-hébergées et préchargées, portrait AVIF/WebP.
- Coordonnées SVG arrondies : le rendu serveur (Node) et navigateur sont identiques au caractère près.

Lighthouse (build de production, serveur de prévisualisation) : bureau 100 / 100 / 100 / 100 ;
mobile (4G simulée, CPU ×4) performance 89 à 96 selon la page, accessibilité, bonnes pratiques et SEO 100.

## 7. SEO et partage

- Title, description, canonical, hreflang (fr, en, x-default), Open Graph et Twitter par page (`src/seo/head.ts`).
- JSON-LD : `Person` (avec langues, compétences, entreprises fondées), `WebSite`, `ProfilePage`, `SoftwareApplication` / `CreativeWork` par projet, `BreadcrumbList`.
- Images Open Graph 1200×630 : une pour le site, une par projet (`public/og`).
- `robots.txt` autorise les moteurs et les robots IA ; `llms.txt` résume le profil.

## 8. Analytics (respect de la vie privée)

`src/lib/analytics.ts` : aucune mesure par défaut. Pour activer Plausible ou Umami (sans cookies) :

```
VITE_ANALYTICS_PROVIDER=plausible
VITE_ANALYTICS_DOMAIN=safwan.ch
```

puis autoriser le domaine du script dans la CSP de `netlify.toml` (`script-src` et `connect-src`).
Événements prévus : pages vues, projets consultés, CV vu / téléchargé / imprimé, vCard, clics e-mail / téléphone / WhatsApp / LinkedIn,
formulaire envoyé / réussi / en erreur, CTA des services, filtres de projets, changement de langue et de thème.
« Do Not Track » et « Global Privacy Control » sont respectés.
Alternative sans script : Netlify Analytics (côté serveur).

## 9. Sécurité

- CSP stricte (`script-src 'self'`, aucune ressource tierce), `X-Frame-Options: DENY`, HSTS, COOP, CORP, Permissions-Policy.
- Aucun script inline (le script de thème est un fichier externe) ; JSON-LD échappé.
- Formulaire : validation côté client, champ piège anti-robot, filtre anti-spam Netlify, nettoyage des entrées, aucune donnée rendue en HTML.
- Aucune clé d'API dans le code ; variables d'environnement `VITE_*` uniquement pour des identifiants publics.

## 10. Évolutions prévues

- **Notes / Journal** : ajouter un fichier `src/content/notes/<slug>.fr.md` (modèle : `_template.fr.md`). La page, le sitemap et l'aperçu sur l'accueil suivent automatiquement.
- **CMS** : les données étant typées et séparées du code d'affichage, un CMS basé sur Git (Decap CMS, TinaCMS) peut être branché plus tard en convertissant `src/data/*.ts` en JSON/Markdown, sans toucher aux composants.
