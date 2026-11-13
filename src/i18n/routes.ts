/* Pages and their address. Every page has one English path, the same in both languages:
   French, the default language, is at the root (/features/), English under /en/ (/en/features/). */

export type Lang = 'fr' | 'en';
export const LANGS: Lang[] = ['fr', 'en'];

const PATHS = {
  home: '/',
  features: '/features/',
  cases: '/use-cases/',
  security: '/security/',
  selfhost: '/self-hosting/',
  opensource: '/open-source/',
  legal: '/legal-notice/',
  privacy: '/privacy/',
  docs: '/docs/'
} as const;

export type PageId = keyof typeof PATHS;

/* A path in a language: unchanged in French, under /en/ in English. */
export const localize = (path: string, lang: Lang) => (lang === 'en' ? '/en' + path : path);

/* Address of every page in each language. */
export const ROUTES = Object.fromEntries(
  Object.entries(PATHS).map(([id, path]) => [id, { fr: localize(path, 'fr'), en: localize(path, 'en') }])
) as Record<PageId, Record<Lang, string>>;

export const href = (id: PageId, lang: Lang, hash?: string) => ROUTES[id][lang] + (hash ? '#' + hash : '');
export const otherLang = (lang: Lang): Lang => (lang === 'fr' ? 'en' : 'fr');

/* Anchor of the "report a vulnerability" section on the security page, the same in both languages. */
export const REPORT_ANCHOR = 'report';
