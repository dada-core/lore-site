---
title: "Development environment"
description: "Run Lore from source, to contribute to the code."
---

> [!NOTE]
> **Lore is under development.** Accounts, the initial setup, sign-in and the administration of the organization work; spaces, import and search come next.

## Requirements

| Tool | Version |
| --- | --- |
| Java | 21 |
| Maven | Provided by the repository (`./mvnw`) |
| Node.js | 22.12 or later, for the interface |
| Docker | For PostgreSQL and the integration tests |

## Run locally

```sh
# Development database (port 5433)
docker compose -f compose.dev.yml up -d postgres

# Application, on http://localhost:8080
./mvnw spring-boot:run

# Interface, with live reload, on http://localhost:5173
cd web
npm install
npm run dev
```

Open `http://localhost:5173`: the interface forwards API calls to the server. In development, the initial setup code is set in `src/main/resources/application-dev.yml`.

## Build the image

```sh
echo "DB_PASSWORD=$(openssl rand -base64 24)" > .env
docker compose up -d --build
```

The repository’s `docker-compose.yml` builds the image from source. The initial setup code is shown by `docker compose logs lore`.

## Build the archive and the packages

The `packaging/` folder builds the universal archive and the `.deb` and `.rpm` packages, with their Java runtime. On any machine with Docker:

```sh
docker build -f packaging/Dockerfile --output build/dist .
```

The files land in `build/dist/`. Add `--platform linux/arm64` for the arm64 packages. The details are in the repository’s `CONTRIBUTING.md` file.

## Tests

| Command | What it checks |
| --- | --- |
| `./mvnw verify` | Server tests, on a real PostgreSQL database (Testcontainers), and the boundaries between modules |
| `npm test` | Interface tests |
| `npm run lint` | Code rules of the interface, including no em dash |
| `npm run typecheck` | TypeScript types |

Continuous integration runs these commands, then installs Lore with Docker Compose, with the archive, and with the packages on every supported distribution (on arm64, on some of them): each fresh installation must start and ask for the initial setup.

## API and interface types

The interface’s TypeScript types are generated from the API description (`/api/v1/openapi.json`). After changing a controller, run in `web/`:

```sh
npm run api
```

The command regenerates `web/openapi.json` and `web/src/api/schema.d.ts`. Continuous integration rejects a description that no longer matches the code.

## Code layout

Lore is a single application split into modules, one per Java package. An automated test checks that no module reaches into another module’s data.

| Module | Role |
| --- | --- |
| `identity` | Organization, accounts, sign-in, sessions, invitations, settings |
| `audit` | Log of sensitive operations |
| `web` | Serving the interface, API errors, OpenAPI description |

`access`, `library`, `storage`, `ingestion` and `search` will follow. The interface, in React and TypeScript, lives in `web/`.

Every address is in English, whatever the interface language: `/login`, `/admin/members`.

## Website and documentation

The website and this documentation have their own repository, [dada-core/lore-site](https://github.com/dada-core/lore-site). They are built with Astro and need Node.js 22.23.4 or later:

```sh
git clone https://github.com/dada-core/lore-site.git
cd lore-site
npm install
npm run dev       # on http://localhost:4321
npm run check     # types
npm run build     # static site in dist/
npm run links     # internal links of the built site
```

Changes arrive through a pull request to the `develop` branch, and continuous integration runs these checks on each one. Merging `develop` into the `deploy` branch publishes the site to lore.dada-core.com.
