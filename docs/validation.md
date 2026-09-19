# Validation de la modernisation — 19 septembre 2026

Validation locale du dépôt et de son image Docker. Aucun déploiement sur la
VM ni modification de l'infrastructure distante n'a été effectué.

## Changements

- Migration contrôlée d'Astro 4.6.4 vers 5.18.2, 6.4.8 puis 7.3.3.
- `ClientRouter`, Tailwind 4.3.3 via Vite, TypeScript 6.0.3 compatible avec
  `@astrojs/check` 0.9.10, intégration officielle sitemap 3.7.4.
- Suppression de `@astrojs/tailwind`, `astro-font`, `astro-robots-txt`.
- Polices locales Poppins 400/600/700, licence OFL, sans appel Google Fonts.
- WebP responsive, dimensions explicites, hero prioritaire et photos de
  comité différées ; conservation des contenus, couleurs et mises en page.
- Nginx 1.30.5 sur HTTP/80, gzip, caches distincts HTML/assets et CSP par
  hashes compatible avec les transitions. Aucun TLS, HSTS ou certificat ajouté.
- Image multi-stage Node 24.21.0 → Nginx ; CI GitHub hébergée, lecture seule,
  sans déploiement manuel. Documentation des réglages Dokploy dans le README.

## Commandes et contrôles

| Contrôle                                             | Résultat                                                                   |
| ---------------------------------------------------- | -------------------------------------------------------------------------- |
| `npm ci` puis `npm run build`, à chaque palier Astro | Succès                                                                     |
| Dernier `npm ci` puis `npm run build`                | Succès ; 4 pages, 33 variantes WebP                                        |
| `astro check`, inclus dans `build`                   | 29 fichiers, 0 erreur, 0 warning, 0 hint                                   |
| `npm audit`                                          | 0 vulnérabilité (27 avant migration)                                       |
| `docker build -t magellan-validation:final .`        | Succès, `nginx -t` exécuté dans l'image                                    |
| Lancement local, port `127.0.0.1:18081` → `80`       | Succès, statut `healthy`                                                   |
| `npm test -- http://127.0.0.1:18081`                 | Succès : pages, 404, headers, hashes CSP, cache, gzip, polices et sitemap  |
| Contenu final du conteneur                           | Environ 95,7 Mo ; ni Node.js, npm, Git, `/app` ou `node_modules` du projet |
| `git diff --check`                                   | Succès                                                                     |

Les pages `/`, `/admins/`, `/anciens-comités/` et la 404 ont été chargées
dans Chrome 152 à 390, 768 et 1440 px. Le menu mobile, les images différées
et les navigations entre pages ont été testés avec les transitions natives
puis avec leur mode de repli : aucune erreur JavaScript, violation CSP ou
requête externe. Les images ont toutes `width`, `height`, `srcset` et `sizes`.

Douze captures et mesures avant/après ont été comparées. La différence
maximale de géométrie mesurée est de 0,36 px, due à l'arrondi des dimensions
d'images ; tailles typographiques, graisses et couleurs sont conservées.
Les deux écarts de marges introduits par Tailwind 4 ont été corrigés.
Les boutons mobiles ont un nom accessible et un état `aria-expanded`.
Les titres du footer sont des `h2`, avec le même style qu'avant.

Le hero produit des WebP de 640/960/1280/1920 px (9,2/15,7/23,3/41,5 ko).
Le comité 188 produit des variantes de 320 à 1920 px (4,7 à 47 ko), contre
186 ko pour l'unique fichier précédent. Les trois polices totalisent environ
24 ko sur disque.

Les réponses HTML et 404 portent `Cache-Control: no-cache`. Les ressources
`/_astro/` portent `public, max-age=31536000, immutable`. Les headers de
sécurité restent présents sur les assets et erreurs. Les redirections de
répertoire sont relatives, sans imposer un schéma HTTP ou HTTPS.

## Lighthouse

Les rapports finaux mobile et desktop sont enregistrés dans
`/tmp/magellan-validation/lighthouse-*.html` et `.json`.
Les scores mesurent l'image servie sur localhost ; ils ne constituent pas
une mesure de la latence de la VM ni du réseau public.

| Page            | Profil  | Performance | Accessibilité | Bonnes pratiques | SEO |    LCP |    CLS |
| --------------- | ------- | ----------: | ------------: | ---------------: | --: | -----: | -----: |
| Accueil         | mobile  |         100 |           100 |              100 | 100 | 1.49 s | 0.0012 |
| Admins          | mobile  |         100 |           100 |              100 | 100 | 1.88 s | 0.0147 |
| Anciens comités | mobile  |         100 |           100 |              100 | 100 | 1.36 s | 0.0039 |
| Accueil         | desktop |         100 |           100 |              100 | 100 | 0.39 s | 0.0057 |
| Admins          | desktop |         100 |           100 |              100 | 100 | 0.39 s | 0.0079 |
| Anciens comités | desktop |         100 |           100 |              100 | 100 | 0.39 s | 0.0143 |

## Mise en service

Les opérations manuelles restent exclusivement dans Dokploy : sélectionner
`main`, le Dockerfile à la racine, activer Auto Deploy, conserver le
raccordement HTTP existant vers le port interne 80, retirer les anciens
montages de fichiers servis, reprendre le healthcheck de l'image et régler
le rollback des mises à jour. Voir les valeurs précises dans [README](../README.md#déploiement-dokploy).

Un échec de build empêche la création de la nouvelle image et laisse
le conteneur actif intact. La continuité pendant le remplacement et le
rollback après échec au démarrage nécessitent les réglages Dokploy documentés.
Ces réglages distants n'ont pas été appliqués durant cette intervention.

La route `/contact`, déjà absente au départ, continue d'afficher la page 404
« site en cours de construction ». Aucune nouvelle page ou destination de
contact n'a été inventée.

## Fichiers modifiés, ajoutés ou supprimés

- `.dockerignore` — ajouté.
- `.github/workflows/deploy.yml` — modifié.
- `.gitignore` — modifié.
- `.nvmrc` — ajouté.
- `.prettierrc` — modifié.
- `Dockerfile` — ajouté.
- `README.md` — modifié.
- `astro.config.mjs` — modifié.
- `docs/validation.md` — ajouté.
- `maj-comite.md` — ajouté.
- `nginx/config/mime.types` — supprimé.
- `nginx/config/nginx.conf` — modifié.
- `package-lock.json` — modifié.
- `package.json` — modifié.
- `public/fonts/OFL.txt` — ajouté.
- `public/fonts/poppins-bold.woff2` — ajouté.
- `public/fonts/poppins-regular.woff2` — ajouté.
- `public/fonts/poppins-semibold.woff2` — ajouté.
- `public/robots.txt` — ajouté.
- `scripts/build-csp.mjs` — ajouté.
- `scripts/check-site.mjs` — ajouté.
- `src/components/Footer.astro` — modifié.
- `src/components/Nav.astro` — modifié.
- `src/layouts/Layout.astro` — modifié.
- `src/pages/admins.astro` — modifié.
- `src/pages/anciens-comités.astro` — modifié.
- `src/pages/index.astro` — modifié.
- `src/styles/base.css` — modifié.
- `tailwind.config.mjs` — supprimé.
- `tsconfig.json` — modifié.
