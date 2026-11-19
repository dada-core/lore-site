---
title: "Development environment"
description: "Run Lore from source, to contribute to the code."
---

> [!NOTE]
> **Lore is under development.** Every feature of version 0.1 is in place: accounts, the initial setup, sign-in, the administration of the organization, spaces, document import, reading, search, versions, statuses and the audit log.

## Requirements

| Tool | Version |
| --- | --- |
| Java | 21 |
| Maven | Provided by the repository (`./mvnw`) |
| Node.js | 24.15 or later (24 LTS), for the interface |
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

Open `http://localhost:5173`: the interface forwards API calls to the server. In development, the initial setup code is set in `src/main/resources/application-dev.yml`. Imported files go to `data/files`, ignored by Git: delete it together with the database to start over.

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
| `npm run lint` | Code rules of the interface, and no em dash or en dash anywhere in the repository |
| `npm run typecheck` | TypeScript types |
| `npm run e2e` | The end-to-end journeys in Chromium, with an accessibility audit (axe) of each screen of version 0.1, about fifty with the windows; those of reading, search, the keyboard and the phone in Firefox and WebKit too |

Continuous integration runs these commands, then installs Lore with Docker Compose, with the archive, and with the packages on every supported distribution (on arm64, on some of them): each fresh installation must start and ask for the initial setup.

### End-to-end journeys

`npm run e2e`, in `web/`, runs the journeys (`web/e2e/`) against a fresh installation of Lore: in continuous integration, the Docker image of the branch. All of them run in Chromium; those of reading, search, the keyboard and the phone in Firefox and WebKit too, where the display of PDF files, selection and keys differ. The first journey performs the initial setup in the browser, with the code read from the logs:

```sh
docker compose -p lore-e2e up -d --build --wait
cd web && npm ci && npx playwright install --with-deps chromium firefox webkit
LORE_SETUP_CODE=$(docker compose -p lore-e2e logs --no-log-prefix lore | grep -A2 "enter this setup code" | tail -1 | tr -d ' ') npm run e2e
```

Here, `LORE_SETUP_CODE` is read by the journeys, not by Lore. `LORE_E2E_URL` points them to another address than `http://localhost:8080`. The journeys have their own Docker Compose project, `lore-e2e`, with its own data; it publishes port 8080: first stop another installation that uses it. To run them again, start from an empty installation: `docker compose -p lore-e2e down --volumes`, then the first command again.

`sh packaging/five-minutes.sh docker-compose.yml` times the first journey from the download of `docker-compose.yml`, as continuous integration does, and fails above three minutes of machine time. It reuses the `lore:local` image built above and publishes port 8080: stop the installation of the journeys first (`docker compose -p lore-e2e down --volumes`).

## API and interface types

The interface’s TypeScript types are generated from the API description (`/api/v1/openapi.json`). After changing a controller, run in `web/`:

```sh
npm run api
```

The command regenerates `web/openapi.json` and `web/src/api/schema.d.ts`. Continuous integration rejects a description that no longer matches the code.

## Code layout

Lore is a single application split into modules, one per Java package. An automated test (Spring Modulith) checks that each module only uses the public types of the others, those of their base package, without any cycle between modules. No module reads the tables of another: this is a design rule, which the test does not check.

| Module | Role |
| --- | --- |
| `identity` | Organization, accounts, sign-in, sessions, invitations, settings |
| `access` | Who sees and does what: roles in spaces, restricted documents |
| `library` | Spaces, folders and documents |
| `storage` | Imported files on disk |
| `ingestion` | Text extraction from the files, in separate processes |
| `search` | Search in the documents: routes, analysis of what is typed, form of the results, limits |
| `audit` | Log of sensitive operations |
| `web` | Serving the interface, API errors, OpenAPI description |
| `shared` | Types shared by every module: API errors, pagination, server commands |

The interface, in React and TypeScript, lives in `web/`.

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
