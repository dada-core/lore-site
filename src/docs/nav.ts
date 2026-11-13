/* Documentation: its sections, the order of its pages and their address.
   Each page is a Markdown file named after its key, once per language:
   src/content/docs/fr/<key>.md and src/content/docs/en/<key>.md.
   A page has one English address, the same in both languages: /docs/<path>/ and /en/docs/<path>/.
   Titles and summaries live in the files themselves (frontmatter). */

export type DocLang = 'fr' | 'en';

export const DOC_BASE = { fr: '/docs/', en: '/en/docs/' } as const;

/* Key, then the last part of the address ('' is the documentation home). */
const PAGES = [
  ['introduction', ''],
  ['installation', 'installation'],
  ['initial-setup', 'initial-setup'],
  ['first-steps', 'first-steps'],
  ['spaces', 'spaces'],
  ['import', 'import'],
  ['search', 'search'],
  ['versions', 'versions'],
  ['permissions', 'permissions'],
  ['shortcuts', 'keyboard-shortcuts'],
  ['knowledge', 'knowledge-base'],
  ['assistant', 'assistant'],
  ['members', 'members'],
  ['security', 'security'],
  ['storage', 'storage'],
  ['audit', 'audit-log'],
  ['variables', 'environment-variables'],
  ['reverse-proxy', 'reverse-proxy'],
  ['backup', 'backup'],
  ['upgrade', 'upgrade'],
  ['api', 'api'],
  ['api-documents', 'api-documents'],
  ['api-search', 'api-search'],
  ['contributing', 'contributing'],
  ['development', 'development'],
  ['release-notes', 'release-notes']
] as const;

export type DocKey = (typeof PAGES)[number][0];

const SECTIONS: { title: Record<DocLang, string>; pages: DocKey[] }[] = [
  { title: { fr: 'Démarrage', en: 'Getting started' }, pages: ['introduction', 'installation', 'initial-setup', 'first-steps'] },
  { title: { fr: 'Utiliser Lore', en: 'Using Lore' }, pages: ['spaces', 'import', 'search', 'versions', 'permissions', 'shortcuts', 'knowledge', 'assistant'] },
  { title: { fr: 'Administration', en: 'Administration' }, pages: ['members', 'security', 'storage', 'audit'] },
  { title: { fr: 'Exploitation', en: 'Operations' }, pages: ['variables', 'reverse-proxy', 'backup', 'upgrade'] },
  { title: { fr: 'Référence de l’API', en: 'API reference' }, pages: ['api', 'api-documents', 'api-search'] },
  { title: { fr: 'Contribuer', en: 'Contributing' }, pages: ['contributing', 'development', 'release-notes'] }
];

/* Pages written ahead of their feature: they stay in the repository, but out of the site (menu, addresses,
   search) until the feature ships. Take a page out of this list in the release that brings its feature;
   the link check of the site reports any published page that still links to one of them. */
export const DRAFTS: ReadonlySet<DocKey> = new Set<DocKey>([
  'spaces', 'import', 'search', 'versions', 'permissions', 'shortcuts', 'knowledge', 'assistant',
  'storage', 'audit', 'api-documents', 'api-search'
]);

/* The sections of the site, without the drafts (a section left empty disappears). */
export const DOC_SECTIONS = SECTIONS.map((s) => ({ ...s, pages: s.pages.filter((k) => !DRAFTS.has(k)) })).filter((s) => s.pages.length > 0);

/* Every published page, in reading order. */
export const DOC_ORDER: DocKey[] = DOC_SECTIONS.flatMap((s) => s.pages);

const SLUGS = new Map<string, string>(PAGES);

export const isDocKey = (key: string): key is DocKey => SLUGS.has(key);

/* Last part of a page's address, the same in both languages, as used by the routes ('' for the documentation home). */
export const docSlug = (key: DocKey) => SLUGS.get(key)!;

/* Address of a documentation page, with an optional anchor. */
export function docHref(key: DocKey, lang: DocLang, hash?: string): string {
  const slug = docSlug(key);
  return DOC_BASE[lang] + (slug ? slug + '/' : '') + (hash ? '#' + hash : '');
}

/* Section a page belongs to. */
export const docSection = (key: DocKey) => DOC_SECTIONS.find((s) => s.pages.includes(key))!;

/* Path of a page's source file in the repository, for the "edit this page" link. */
export const docSource = (key: DocKey, lang: DocLang) => `src/content/docs/${lang}/${key}.md`;
