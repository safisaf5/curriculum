# safwan.ch

Site personnel de Safwan Abdirahman : portfolio, CV, carte de visite et présentation des projets.

- React 18, TypeScript, Tailwind CSS, Vite
- Pré-rendu statique de chaque page en français et en anglais, hydratation React
- Contenu centralisé dans `src/data`, textes d'interface dans `src/i18n`
- CV PDF, vCard, images Open Graph, sitemap et `llms.txt` générés depuis les données
- Hébergement Netlify (`netlify.toml`)

## Commandes

```bash
npm install
npm run dev        # développement, http://localhost:5173
npm run check      # vérifie le contenu (références, traductions, typographie)
npm run generate   # régénère CV PDF, vCard, images Open Graph et favicons
npm run build      # build de production dans dist/
npm run preview    # sert dist/ comme Netlify, http://localhost:4173
npm run typecheck
npm run lint
```

## Documentation

- [docs/CONTENT.md](docs/CONTENT.md) : modifier le contenu, ajouter un projet, une expérience, une note
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : inventaire de l'ancien site, architecture, système visuel, build, SEO, sécurité, analytics
