/* Words shared by every page: menu, footer, buttons, labels. Page texts live in each page. */
import type { Lang } from './routes';

const fr = {
  locale: 'fr_FR',
  skip: 'Aller au contenu',
  siteTitle: 'Lore, la mémoire technique de votre équipe',
  nav: {
    label: 'Navigation principale',
    home: 'Accueil',
    features: 'Fonctionnalités',
    cases: 'Cas d’usage',
    security: 'Sécurité',
    selfhost: 'Auto-hébergement',
    opensource: 'Open source',
    docs: 'Documentation'
  },
  github: 'Code source sur GitHub',
  lang: { name: 'English', short: 'EN', label: 'Read this page in English', code: 'en' },
  theme: {
    toggle: 'Changer de thème',
    toast: { auto: 'Thème : système', light: 'Thème : clair', dark: 'Thème : sombre' },
    select: 'Thème',
    auto: 'Thème du système',
    light: 'Clair',
    dark: 'Sombre'
  },
  menu: { open: 'Ouvrir le menu', close: 'Fermer le menu', label: 'Menu' },
  seeDemo: 'Voir la démo',
  openDemo: 'Ouvrir la démo',
  install: 'Installer',
  installLong: 'Installer Lore',
  follow: 'Suivre sur GitHub',
  copy: { label: 'Copier', done: 'Copié', command: 'Copier la commande', commandDone: 'Commande copiée', fail: 'Sélectionnez le texte, puis copiez-le.' },
  frame: { full: 'Plein écran', title: 'Vidéo de présentation de Lore, en anglais' },
  video: { label: 'Vidéo de présentation de Lore', close: 'Fermer la vidéo', play: 'Lire la vidéo', pause: 'Mettre la vidéo en pause', soundOn: 'Activer le son', soundOff: 'Couper le son' },
  badge: { later: 'Plus tard', laterTitle: 'Prévu après la v0.3', planned: 'Prévu en ' },
  cta: {
    title: 'Lore arrive en version 0.1.',
    text: 'Les comptes, les invitations et l’administration fonctionnent déjà. Les espaces, l’import, la recherche et les versions arrivent. Essayez la démo, et suivez le projet sur GitHub.'
  },
  footer: {
    about: 'L’environnement open source où les équipes techniques rassemblent et entretiennent leur documentation.',
    product: 'Produit',
    resources: 'Ressources',
    community: 'Communauté',
    demo: 'Démo',
    releases: 'Notes de version',
    source: 'Code source',
    contribute: 'Contribuer',
    discussions: 'Discussions',
    report: 'Signaler une vulnérabilité',
    legal: 'Mentions légales',
    privacy: 'Confidentialité',
    rights: '© 2026 Lore. Code publié sous licence AGPL-3.0.'
  },
  status: { draft: 'Brouillon', published: 'Publié', obsolete: 'Obsolète', review: 'En attente de validation', validated: 'Validée' }
};

type UI = typeof fr;

const en: UI = {
  locale: 'en_US',
  skip: 'Skip to content',
  siteTitle: 'Lore, your team’s technical memory',
  nav: {
    label: 'Main navigation',
    home: 'Home',
    features: 'Features',
    cases: 'Use cases',
    security: 'Security',
    selfhost: 'Self-hosting',
    opensource: 'Open source',
    docs: 'Documentation'
  },
  github: 'Source code on GitHub',
  lang: { name: 'Français', short: 'FR', label: 'Lire cette page en français', code: 'fr' },
  theme: {
    toggle: 'Change theme',
    toast: { auto: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' },
    select: 'Theme',
    auto: 'System theme',
    light: 'Light',
    dark: 'Dark'
  },
  menu: { open: 'Open menu', close: 'Close menu', label: 'Menu' },
  seeDemo: 'See the demo',
  openDemo: 'Open the demo',
  install: 'Install',
  installLong: 'Install Lore',
  follow: 'Follow on GitHub',
  copy: { label: 'Copy', done: 'Copied', command: 'Copy the command', commandDone: 'Command copied', fail: 'Select the text, then copy it.' },
  frame: { full: 'Full screen', title: 'Lore presentation video' },
  video: { label: 'Lore presentation video', close: 'Close the video', play: 'Play the video', pause: 'Pause the video', soundOn: 'Turn the sound on', soundOff: 'Turn the sound off' },
  badge: { later: 'Later', laterTitle: 'Planned after v0.3', planned: 'Planned for ' },
  cta: {
    title: 'Lore is on its way to version 0.1.',
    text: 'Accounts, invitations and administration already work. Spaces, import, search and versions are coming. Try the demo, and follow the project on GitHub.'
  },
  footer: {
    about: 'The open source workspace where technical teams gather and maintain their documentation.',
    product: 'Product',
    resources: 'Resources',
    community: 'Community',
    demo: 'Demo',
    releases: 'Release notes',
    source: 'Source code',
    contribute: 'Contribute',
    discussions: 'Discussions',
    report: 'Report a vulnerability',
    legal: 'Legal notice',
    privacy: 'Privacy',
    rights: '© 2026 Lore. Code published under the AGPL-3.0 license.'
  },
  status: { draft: 'Draft', published: 'Published', obsolete: 'Outdated', review: 'Awaiting review', validated: 'Approved' }
};

export const UI_TEXT: Record<Lang, UI> = { fr, en };
export const ui = (lang: Lang) => UI_TEXT[lang];
