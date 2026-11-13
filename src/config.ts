/* Everything that depends on the outside world lives here: addresses, links, legal information. */
import type { Lang } from './i18n/routes';

/* The application repository, and the repository of this website (with its documentation and demo). */
const REPO = 'https://github.com/dada-core/lore';
const SITE_REPO = 'https://github.com/dada-core/lore-site';

export const SITE = {
  url: 'https://lore.dada-core.com',
  email: 'wpoka@dada-core.com'
};

export const GITHUB = {
  repo: REPO,
  site: SITE_REPO,
  siteIssues: `${SITE_REPO}/issues/new`,
  discussions: `${REPO}/discussions`,
  issues: `${REPO}/issues/new/choose`,
  security: `${REPO}/security/advisories/new`,
  contributing: `${REPO}/blob/main/CONTRIBUTING.md`
};

/* Interactive demo with sample data, served as static files: public/demo/ in French,
   public/en/demo/ in English. Same screens and routes in both languages. */
const demoLinks = (base: string) => ({
  home: `${base}#/`,
  setup: `${base}#/setup`
});
export const demo = (lang: Lang) => demoLinks(lang === 'en' ? '/en/demo/' : '/demo/');

/* Presentation video, in English on both sites: the "See the demo" button and the frame of the home page
   play it. A lighter copy of the Remotion render (H.264, playable while it downloads), with its poster. */
export const VIDEO = {
  src: '/video/lore-presentation-en.mp4',
  poster: '/video/lore-presentation-en.jpg'
};

/* Legal notice: publisher (established in Côte d’Ivoire), publication director and host, the server that
   serves the website. Every empty field is shown as "to be completed" and reported when the site is built. */
export const LEGAL = {
  publisher: 'Wilfried POKA',
  address: 'Abidjan, Côte d’Ivoire',
  phone: '+225 07 01 60 33 09',
  director: 'Wilfried POKA',
  host: 'GitHub, Inc. (GitHub Pages)',
  hostAddress: { fr: '88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis', en: '88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States' },
  hostPhone: '+1 877 448 4820',
  updated: '2026-11-13'
};

/* Edit a file of the website repository on GitHub, on its reference branch. */
export const githubEdit = (path: string) => `${SITE_REPO}/edit/develop/${path}`;
