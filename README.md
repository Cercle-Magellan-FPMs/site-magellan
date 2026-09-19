# Site du Cercle Magellan

Site statique Astro : https://magellan.fpms.ac.be.
Node 24 LTS est utilisé en CI et dans le build Docker (`.nvmrc`).

Résultats des builds, tests navigateur et Lighthouse : [rapport de validation](docs/validation.md).

Pour la passation annuelle : [guide de mise à jour du comité](maj-comite.md).

## Développement et validation

```sh
npm ci
npm run dev
npm run build
```

Le build exécute `astro check`, génère `dist/`, puis produit
`.nginx/csp.conf`. Il échoue si une de ces étapes échoue.

```sh
docker build -t site-magellan:local .
docker run --rm -d --name site-magellan-local -p 127.0.0.1:8080:80 site-magellan:local
# Attendre le statut healthy avant le test HTTP :
docker inspect --format '{{.State.Health.Status}}' site-magellan-local
npm test -- http://127.0.0.1:8080
docker stop site-magellan-local
```

Le contrôle HTTP vérifie les pages, la 404, les hashes CSP, les headers,
les caches, gzip, les polices, le sitemap et les redirections relatives.
`astro preview` sert à vérifier le rendu ; les headers de production sont
à vérifier dans le conteneur Nginx.

## Déploiement Dokploy

Réglages à appliquer uniquement dans l'application Dokploy :

1. Source GitHub : `Cercle-Magellan-FPMs/site-magellan`, branche `main`.
   Activer **Auto Deploy** via l'intégration GitHub native.
2. Build type **Dockerfile**, chemin `Dockerfile`, contexte à la racine (`.`).
3. Conserver le raccordement réseau et le port publié existants ; le port
   **cible du conteneur est 80 en HTTP**. L'ancien workflow publiait `8080:80` :
   conserver cette correspondance si elle est encore celle de l'application.
4. Retirer dans Dokploy les éventuels anciens montages sur
   `/usr/share/nginx/html` et `/etc/nginx` : l'image fournit ces fichiers.
   Retirer aussi les anciennes commandes de copie ou de lancement manuel.
5. Conserver le `HEALTHCHECK` de l'image (`wget` sur `http://127.0.0.1/`).
   Si Dokploy le surcharge, utiliser cette même commande, intervalle 30 s,
   délai initial 5 s, timeout 3 s, 3 tentatives.
6. Dans **Advanced → Cluster Settings → Swarm Settings**, configurer
   **Update Config** avec `FailureAction: rollback`, `Monitor: 120000000000`
   (120 s), `Parallelism: 1` et `MaxFailureRatio: 0`.
   Utiliser `Order: start-first` si le mode de publication existant permet
   deux tâches simultanées ; un port hôte exclusif peut l'empêcher.
   Laisser Dokploy gérer la politique de redémarrage.
7. Déployer et vérifier que la nouvelle tâche devient **healthy**.

L'image est entièrement construite et `nginx -t` est exécuté avant son
lancement. Un build en échec ne modifie pas l'image ni les fichiers du
conteneur en service. Le rollback et la continuité pendant le remplacement
relèvent des réglages Dokploy ci-dessus ; ils ne sont pas activés par le dépôt.

Le serveur de ce dépôt écoute uniquement sur HTTP/80. La terminaison HTTPS
reste entièrement gérée par l'infrastructure existante.

Références : [Auto Deploy](https://docs.dokploy.com/docs/core/auto-deploy),
[réglages Swarm](https://docs.dokploy.com/docs/core/applications/advanced),
[healthchecks](https://docs.dokploy.com/docs/core/applications/zero-downtime).

## CSP et ressources

`ClientRouter` conserve les transitions et la navigation Astro existantes.
La [CSP native Astro](https://docs.astro.build/en/reference/configuration-reference/#securitycsp)
ne supporte pas ce routeur. `scripts/build-csp.mjs` calcule donc les hashes
SHA-256 des blocs script/style du HTML compilé. Leur union couvre toutes
les pages, car une navigation conserve la politique de la page d'entrée.
Nginx envoie la politique en header, y compris `frame-ancestors 'none'`.
Aucune autorisation `unsafe-inline` ou `unsafe-eval` n'est utilisée.
La configuration générée reste hors de la racine publique.

Les fichiers `/_astro/` sont hashés et mis en cache un an avec `immutable`.
Le HTML et les erreurs utilisent `no-cache`. Les polices non hashées ont
un cache d'une semaine. Les types MIME proviennent de l'image Nginx.

Poppins est livré dans `public/fonts/` : latin normal 400, 600 et 700,
les seuls poids affichés par les pages actuelles. Aucun italique n'est utilisé.
Les fichiers proviennent de `@fontsource/poppins` 5.3.0, sous licence OFL
jointe dans `public/fonts/OFL.txt`. Aucune requête Google Fonts n'est nécessaire,
ni au build ni dans le navigateur. Le composant `Links.astro`, actuellement
inutilisé, demanderait aussi le poids 500 s'il était intégré à une page.

Les photos utilisent `astro:assets` avec des variantes WebP et des `sizes`
adaptés aux conteneurs. Le hero est prioritaire (640/960/1280/1920 px).
Les photos de comité et le logo du pied de page sont chargés à la demande.

GitHub Actions fait uniquement la CI sur un runner hébergé avec
`contents: read`. Aucun secret de déploiement ni accès à la VM n'est requis.
