# Lore website

Source of [lore.dada-core.com](https://lore.dada-core.com), the Lore website and its documentation, in French (default) and English. The application itself lives in [dada-core/lore](https://github.com/dada-core/lore).

Built with [Astro](https://astro.build): every page is rendered to static HTML at build time. There is no server-side code, no cookie, no analytics and no third-party request (fonts are self-hosted).

## Run it locally

Requires Node.js 22.23.4 or later.

```sh
npm install
npm run dev       # development server on http://localhost:4321
npm run check     # type-checks pages, components and scripts
npm run build     # static site in dist/
npm run preview   # serves dist/ to check the build
```

## Structure

| Path | Content |
|---|---|
| `src/config.ts` | Addresses and links: GitHub repository, contact email, legal information |
| `src/content/docs/` | The documentation, in Markdown: `fr/` and `en/`, one file per page |
| `src/docs/` | Documentation menu and addresses (`nav.ts`), Markdown extensions (`markdown.ts`), search index (`search.ts`) |
| `src/i18n/routes.ts` | Every page and its address: one English path, the same in both languages |
| `src/i18n/ui.ts` | Words shared by all pages (menu, footer, buttons) |
| `src/views/` | One file per page, holding its French and English text side by side |
| `src/pages/` | Routes: French at the root, English under `/en/`, with the same English path (`/features/`, `/en/features/`); each one renders a view |
| `src/data/` | Content shared by several pages: use cases, modules, code samples |
| `src/components/` | Header, footer, interface previews and other building blocks |
| `src/styles/` | Design tokens (`base.css`), layout (`site.css`), motion (`motion.css`) |
| `src/scripts/` | Theme, mobile menu, tabs, copy buttons (`site.ts`) and reveal animations (`motion.ts`, `reveal.ts`) |
| `src/middleware.ts` | French typography (no-break spaces before `: ; ! ?` and inside « ») applied to French pages at build time |
| `public/demo/`, `public/en/demo/` | Interactive demo of the application, with sample data, served as static files |
| `public/video/` | The presentation video, in English, and its poster: a lighter copy of the render (H.264, playable while it downloads), opened by "See the demo" and shown on the home page |
| `public/fonts/` | Inter and JetBrains Mono, under the SIL Open Font License 1.1 |

## Editing content

- Change a sentence: open the page's file in `src/views/` and edit both languages.
- Add a page: add its English path to `src/i18n/routes.ts`, write its view in `src/views/`, then create `src/pages/<path>.astro` and `src/pages/en/<path>.astro`.
## Editing the documentation

The documentation is served at `/docs/` (French) and `/en/docs/` (English), with the same English path in both languages: `/docs/first-steps/` and `/en/docs/first-steps/`. Each page is a Markdown file, once per language, named after its key: `src/content/docs/fr/installation.md` and `src/content/docs/en/installation.md`.

- Change a page: edit both language files. The frontmatter holds the `title`, the `description` shown under it, and an optional `release` badge (`v0.2`) for a feature planned after version 0.1. Quote values that contain a colon.
- Add a page: create both files, then add its key, its section and its address to `src/docs/nav.ts`. The build stops if a page is missing in one language.
- A page written ahead of its feature goes in `DRAFTS`, in `src/docs/nav.ts`: it stays in the repository but out of the site. Take it out of the list in the release that brings the feature. `npm run links` reports a published page that links to a draft.
- Link to another page by its file name, `[Installation](installation.md#check)`: the link points to the page in the same language, and works on GitHub too.

The pages stay plain Markdown, readable on GitHub. The site adds a few presentations (`src/docs/markdown.ts`):

| Write | Shown as |
|---|---|
| ` ```sh title="Terminal" ` | A code block with this title and a copy button |
| ` ```sh tab="Windows" `, several in a row | Tabs, one per code block |
| `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]` | A callout |
| A numbered list | Steps; start each item with its title in bold |
| A paragraph holding only `` `GET /api/v1/…` `` | An API endpoint |
| `<kbd>Ctrl K</kbd>`, `<span class="vb">v0.2</span>` | A key, a release badge |
| A link to `https://lore.dada-core.com/…` | A link within the site (the demo, for instance) |

The search window reads `/docs/search.json` and `/en/docs/search.json`, built with the site from the same files.

## Branches and publication

| Branch | Role |
|---|---|
| `dev-<name>` | Personal development branch, for example `dev-wil`: merged into `develop` through a pull request |
| `develop` | Reference branch, and the default one: every change arrives through a pull request |
| `deploy` | Published branch: a pull request from `develop` publishes the site on lore.dada-core.com |

The CI/CD workflow (`.github/workflows/ci-cd.yml`) checks every push and every pull request: no em dash in the sources, types, build and internal links. A push to `deploy`, that is a merged pull request, then publishes `dist/` with GitHub Pages.

In the repository settings: Pages served by GitHub Actions with the `lore.dada-core.com` domain, the `github-pages` environment limited to the `deploy` branch, and merge commits only, so that the branches keep their history.

## Before going live

- Keep the `LEGAL` fields of `src/config.ts` up to date (publisher, publication director, host). The build prints a warning if one is empty.
- Point the `lore.dada-core.com` domain to GitHub Pages: a CNAME record to `dada-core.github.io`.

Motion respects the system's reduced motion setting: when it is on, every element is shown directly.

## License

The code of the website is published under the [AGPL-3.0](LICENSE) license, like Lore. Inter and JetBrains Mono, in `public/fonts/`, are under the SIL Open Font License 1.1.
