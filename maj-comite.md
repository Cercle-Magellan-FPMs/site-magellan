# Mettre à jour le comité Magellan

Les informations du comité sont présentes dans trois fichiers : l'accueil,
la page des comités et le pied de page. Les mettre à jour ensemble.
L'exemple ci-dessous utilise la promotion **189** ; remplacer ce numéro
et les noms par ceux du comité à publier.

## Fichiers à modifier

| Fichier                           | Modification                                                      |
| --------------------------------- | ----------------------------------------------------------------- |
| `src/images/comité189.jpg`        | Ajouter la photo du nouveau comité.                               |
| `src/pages/index.astro`           | Changer l'import de la photo et les données de `const comité`.    |
| `src/pages/anciens-comités.astro` | Ajouter l'import et le nouveau comité en tête de `const comités`. |
| `src/components/Footer.astro`     | Actualiser le numéro de comité et les trois noms du pied de page. |

## 1. Ajouter la photo

Ajouter la photo dans `src/images/`, par exemple `comité189.jpg`.
Choisir une photo de groupe en paysage, idéalement d'au moins 1920 px de large,
et vérifier que le recadrage laisse tous les membres visibles sur mobile.
Le nom du fichier et l'import doivent correspondre exactement, accents,
majuscules et extension compris.

Conserver les photos précédentes : elles servent à l'historique.
Astro génère les variantes WebP au build ; il suffit d'ajouter la photo source.

## 2. Actualiser l'accueil

Dans [src/pages/index.astro](src/pages/index.astro), remplacer l'import
de la photo du comité actuel et les valeurs de l'objet `comité` :

```astro
import comité189 from "@images/comité189.jpg";

const comité = {
  promo: "189",
  président: "Prénom Nom du président",
  trésorier: "Prénom Nom du trésorier",
  secretaire: "Prénom Nom du secrétaire",
  imageComite: comité189,
};
```

Conserver les noms de propriétés tels quels, notamment `secretaire` sans accent.
Les titres et textes alternatifs utilisent automatiquement `promo`.
Les réglages du composant `<Image>` restent identiques : tailles responsives,
WebP, dimensions et chargement différé sont déjà configurés.

## 3. Compléter l'historique

Dans [src/pages/anciens-comités.astro](src/pages/anciens-comités.astro) :

1. Ajouter `import comité189 from "@images/comité189.jpg";` aux imports existants.
2. Ajouter au début du tableau `comités` un objet avec les mêmes informations
   que l'exemple ci-dessus, suivi d'une virgule.
3. Conserver les entrées existantes, leurs photos et leurs éventuelles annotations.

Cette page affiche actuellement **le comité en fonction et les précédents**,
du plus récent au plus ancien. Lors du passage de 188 à 189, l'entrée 188
reste donc dans le tableau. Ne pas remplacer globalement l'ancien numéro
ou les anciens noms dans tout le dépôt.

## 4. Actualiser le pied de page

Dans [src/components/Footer.astro](src/components/Footer.astro) :

- Remplacer `Comité Magellan 188` par le nouveau numéro.
- Actualiser les trois `<li>` avec les noms du président, du trésorier et du secrétaire,
  dans cet ordre, comme sur l'accueil.

La mention « Site développé par » désigne l'auteur du site : elle n'est pas
à remplacer à chaque changement de comité.

## 5. Vérifier les informations qui peuvent changer

Seulement si elles ont changé :

- Photo ou présentation des admins : `src/images/admins.jpg` et
  [src/pages/admins.astro](src/pages/admins.astro).
- Réseaux sociaux et adresse de contact : tableau `links` de
  `src/components/Footer.astro`.
- Liens de navigation et contact : tableau `navItems` de
  [src/components/Nav.astro](src/components/Nav.astro).
- Services proposés : section « Nos services » de `src/pages/index.astro`.

L'auteur des métadonnées est « Cercle Magellan » dans `Layout.astro` : aucune
mise à jour annuelle n'est nécessaire. Le sitemap et les hashes CSP sont générés
au build. Les dossiers `dist/`, `.astro/` et `.nginx/` ne se modifient pas à la main
et ne se commitent pas.

## 6. Vérifier et publier

Depuis la racine du dépôt, avec Node 24 :

```sh
npm ci
npm run build
npm run preview
```

Vérifier sur l'adresse affichée par Astro :

- `/` : numéro, fonctions, noms et nouvelle photo corrects ;
- `/anciens-comit%C3%A9s/` : nouveau comité en premier, précédents conservés ;
- le pied de page des différentes pages : numéro et noms cohérents ;
- sur mobile et ordinateur : photo bien cadrée, texte lisible et menu fonctionnel.

Le build inclut `astro check` et doit réussir avant publication. Pour vérifier
également l'image Docker et ses headers, suivre les commandes du [README](README.md#développement-et-validation).

Relire `git diff`, commiter les sources et la photo, puis pousser sur `main`.
La CI GitHub vérifie le build. Si Auto Deploy est activé, Dokploy construit
et déploie la nouvelle image ; vérifier ensuite le statut `healthy` et les
pages publiées. Sinon, lancer le déploiement depuis l'application Dokploy.
Les réglages initiaux sont décrits dans le [README](README.md#déploiement-dokploy) ;
une mise à jour du comité ne nécessite aucun changement de l'infrastructure HTTPS.
