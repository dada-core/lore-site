---
title: "Environnement de développement"
description: "Lancer Lore depuis les sources, pour contribuer au code."
---

> [!NOTE]
> **Lore est en cours de développement.** Toutes les fonctions de la version 0.1 sont en place : les comptes, la configuration initiale, la connexion, l’administration de l’organisation, les espaces, l’import de documents, leur lecture, la recherche, les versions, les statuts et le journal d’audit.

## Prérequis

| Outil | Version |
| --- | --- |
| Java | 21 |
| Maven | Fourni par le dépôt (`./mvnw`) |
| Node.js | 24.15 ou plus récent (24 LTS), pour l’interface |
| Docker | Pour PostgreSQL et les tests d’intégration |

## Lancer en local

```sh
# Base de données de développement (port 5433)
docker compose -f compose.dev.yml up -d postgres

# Application, sur http://localhost:8080
./mvnw spring-boot:run

# Interface, avec rechargement automatique, sur http://localhost:5173
cd web
npm install
npm run dev
```

Ouvrez `http://localhost:5173` : l’interface transmet les appels de l’API au serveur. En développement, le code de configuration initiale est fixé dans `src/main/resources/application-dev.yml`. Les fichiers importés vont dans `data/files`, ignoré par Git : supprimez-le avec la base pour repartir de zéro.

## Construire l’image

```sh
echo "DB_PASSWORD=$(openssl rand -base64 24)" > .env
docker compose up -d --build
```

Le fichier `docker-compose.yml` du dépôt construit l’image à partir des sources. Le code de configuration initiale s’affiche avec `docker compose logs lore`.

## Construire l’archive et les paquets

Le dossier `packaging/` construit l’archive universelle et les paquets `.deb` et `.rpm`, avec leur environnement Java. Sur toute machine qui dispose de Docker :

```sh
docker build -f packaging/Dockerfile --output build/dist .
```

Les fichiers arrivent dans `build/dist/`. Ajoutez `--platform linux/arm64` pour les paquets arm64. Le détail est dans le fichier `CONTRIBUTING.md` du dépôt.

## Tests

| Commande | Ce qu’elle vérifie |
| --- | --- |
| `./mvnw verify` | Tests du serveur, sur une vraie base PostgreSQL (Testcontainers), et frontières entre les modules |
| `npm test` | Tests de l’interface |
| `npm run lint` | Règles du code de l’interface, et l’absence de tiret cadratin et demi-cadratin dans tout le dépôt |
| `npm run typecheck` | Types TypeScript |
| `npm run e2e` | Les parcours de bout en bout dans Chromium, avec un audit d’accessibilité (axe) de chaque écran de la version 0.1, une cinquantaine avec les fenêtres ; ceux de la lecture, de la recherche, du clavier et du téléphone aussi dans Firefox et WebKit |

L’intégration continue lance ces commandes, puis installe Lore avec Docker Compose, avec l’archive, et avec les paquets sur chaque distribution prise en charge (en arm64, sur une partie d’entre elles) : chaque installation neuve doit démarrer et demander la configuration initiale.

### Parcours de bout en bout

`npm run e2e`, dans `web/`, lance les parcours (`web/e2e/`) contre une installation neuve de Lore : dans l’intégration continue, l’image Docker de la branche. Tous tournent dans Chromium ; ceux de la lecture, de la recherche, du clavier et du téléphone aussi dans Firefox et WebKit, où l’affichage des PDF, la sélection et les touches diffèrent. Le premier parcours fait la configuration initiale dans le navigateur, avec le code lu dans les journaux :

```sh
docker compose -p lore-e2e up -d --build --wait
cd web && npm ci && npx playwright install --with-deps chromium firefox webkit
LORE_SETUP_CODE=$(docker compose -p lore-e2e logs --no-log-prefix lore | grep -A2 "enter this setup code" | tail -1 | tr -d ' ') npm run e2e
```

Ici, `LORE_SETUP_CODE` est lu par les parcours, pas par Lore. `LORE_E2E_URL` les dirige vers une autre adresse que `http://localhost:8080`. Les parcours ont leur propre projet Docker Compose, `lore-e2e`, avec ses propres données ; il publie le port 8080 : arrêtez d’abord une autre installation qui l’occupe. Pour les relancer, repartez d’une installation vide : `docker compose -p lore-e2e down --volumes`, puis de nouveau la première commande.

`sh packaging/five-minutes.sh docker-compose.yml` chronomètre le premier parcours depuis le téléchargement de `docker-compose.yml`, comme l’intégration continue, et échoue au-delà de trois minutes de temps machine. Il reprend l’image `lore:local` construite plus haut et publie le port 8080 : arrêtez d’abord l’installation des parcours (`docker compose -p lore-e2e down --volumes`).

## API et types de l’interface

Les types TypeScript de l’interface sont générés à partir de la description de l’API (`/api/v1/openapi.json`). Après avoir modifié un contrôleur, lancez dans `web/` :

```sh
npm run api
```

La commande régénère `web/openapi.json` et `web/src/api/schema.d.ts`. L’intégration continue refuse une description qui ne correspond plus au code.

## Organisation du code

Lore est une seule application découpée en modules, un par paquet Java. Un test automatisé (Spring Modulith) vérifie que chaque module n’utilise que les types publics des autres, ceux de leur paquet de base, sans dépendance circulaire entre modules. Aucun module ne lit les tables d’un autre : c’est une règle de conception, que ce test ne contrôle pas.

| Module | Rôle |
| --- | --- |
| `identity` | Organisation, comptes, connexion, sessions, invitations, réglages |
| `access` | Qui voit et fait quoi : rôles dans les espaces, documents restreints |
| `library` | Espaces, dossiers et documents |
| `storage` | Fichiers importés sur le disque |
| `ingestion` | Extraction du texte des fichiers, dans des processus séparés |
| `search` | Recherche dans les documents : routes, analyse de ce qui est tapé, forme des résultats, limites |
| `audit` | Journal des opérations sensibles |
| `web` | Service de l’interface, erreurs de l’API, description OpenAPI |
| `shared` | Types communs à tous les modules : erreurs de l’API, pagination, commandes du serveur |

L’interface, en React et TypeScript, se trouve dans `web/`.

Toutes les adresses sont en anglais, quelle que soit la langue de l’interface : `/login`, `/admin/members`.

## Site web et documentation

Le site et cette documentation ont leur propre dépôt, [dada-core/lore-site](https://github.com/dada-core/lore-site). Ils sont construits avec Astro et demandent Node.js 22.23.4 ou plus récent :

```sh
git clone https://github.com/dada-core/lore-site.git
cd lore-site
npm install
npm run dev       # sur http://localhost:4321
npm run check     # types
npm run build     # site statique dans dist/
npm run links     # liens internes du site construit
```

Les modifications arrivent par une demande de fusion vers la branche `develop`, et l’intégration continue lance ces vérifications sur chacune. Une fusion de `develop` dans la branche `deploy` publie le site sur lore.dada-core.com.
