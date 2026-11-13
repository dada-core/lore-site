/* What reveals itself as it enters the screen, and how.
   [selector, type, gap between siblings (ms), base delay (ms)]
   Types: rise (blurred rise), slap (sticker slapped on), toss (card tossed in), wipe (curtain), words (word by word).
   Shared by the page head (elements are hidden before the script runs, to avoid a flash) and by motion.ts. */
export type Reveal = [selector: string, type: 'rise' | 'slap' | 'toss' | 'wipe' | 'words', step: number, base: number];

export const REVEAL: Reveal[] = [
  ['[data-reveal="words"]', 'words', 0, 0],
  ['.s-hero .s-lead, .s-hero .s-cmd', 'rise', 0, 0],
  ['.s-page-hero .s-kicker', 'rise', 0, 0],
  ['.s-page-hero .s-lead', 'rise', 0, 380],
  ['.s-page-hero .s-notice', 'rise', 0, 520],
  ['.s-h2', 'rise', 0, 0],
  ['.s-intro', 'rise', 90, 140],
  ['.s-audience .pill', 'slap', 70, 0],
  ['.s-scatter .pill', 'slap', 90, 150],
  ['.s-point', 'rise', 110, 0],
  ['.s-tile', 'rise', 90, 0],
  ['.s-tile .vb, .s-feature .vb, .s-card .vb', 'slap', 0, 450],
  ['.s-vis, .s-code, .s-frame', 'wipe', 0, 250],
  ['.s-check li', 'rise', 70, 100],
  ['.s-card', 'toss', 80, 0],
  ['.s-case, .s-feature > div:first-child', 'rise', 0, 0],
  ['.s-steps > li', 'rise', 110, 0],
  ['.s-req, .s-versions, .s-mail, .s-cta', 'rise', 0, 0],
  ['.s-faq details', 'rise', 60, 0],
  ['.s-subnav', 'rise', 0, 250],
  ['.s-ctas', 'rise', 0, 120],
  ['.s-footer-grid > *', 'rise', 70, 0]
];

/* Home opening: a fixed order, easier to read than scroll detection. */
export const HERO: [selector: string, delay: number][] = [
  ['.s-hero .s-h1', 0],
  ['.s-hero .s-lead', 480],
  ['.s-hero .s-ctas', 600],
  ['.s-hero .s-cmd', 700],
  ['.s-hero .s-frame', 820]
];

/* CSS that hides the elements to reveal until motion.ts has prepared them. */
export const PRE_HIDE = `.motion:not(.mo-ready) :is(${REVEAL.filter(([, t]) => t !== 'words').map(([s]) => s).join(', ')}){opacity:0}`;
