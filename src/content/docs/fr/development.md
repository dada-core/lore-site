---
title: "Environnement de développement"
description: "Lancer Lore depuis les sources, pour contribuer au code."
---

> [!NOTE]
> **Lore est en cours de développement.** Les comptes, la configuration initiale, la connexion et l’administration de l’organisation fonctionnent ; les espaces, l’import et la recherche arrivent ensuite.

## Prérequis

| Outil | Version |
| --- | --- |
| Java | 21 |
| Maven | Fourni par le dépôt (`./mvnw`) |
| Node.js | 22.12 ou plus récent, pour l’interface |
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

Ouvrez `http://localhost:5173` : l’interface transmet les appels de l’API au serveur. En développement, le code de configuration initiale est fixé dans `src/main/resources/application-dev.yml`.

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
| `npm run lint` | Règles du code de l’interface, dont l’absence de tiret cadratin |
| `npm run typecheck` | Types TypeScript |

L’intégration continue lance ces commandes, puis installe Lore avec Docker Compose, avec l’archive, et avec les paquets sur chaque distribution prise en charge (en arm64, sur une partie d’entre elles) : chaque installation neuve doit démarrer et demander la configuration initiale.

## API et types de l’interface

Les types TypeScript de l’interface sont générés à partir de la description de l’API (`/api/v1/openapi.json`). Après avoir modifié un contrôleur, lancez dans `web/` :

```sh
npm run api
```

La commande régénère `web/openapi.json` et `web/src/api/schema.d.ts`. L’intégration continue refuse une description qui ne correspond plus au code.

## Organisation du code

Lore est une seule application découpée en modules, un par paquet Java. Un test automatisé vérifie qu’aucun module n’accède aux données d’un autre.

| Module | Rôle |
| --- | --- |
| `identity` | Organisation, comptes, connexion, sessions, invitations, réglages |
| `audit` | Journal des opérations sensibles |
| `web` | Service de l’interface, erreurs de l’API, description OpenAPI |

Suivront `access`, `library`, `storage`, `ingestion` et `search`. L’interface, en React et TypeScript, se trouve dans `web/`.

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
