// Checks the internal links of the built site (dist/), after `npm run build`:
// - every internal href and src, and the https://lore.dada-core.com/... links (canonical, hreflang,
//   sitemap), point to an existing file;
// - anchors (#id) exist in the target page;
// - the documentation search index points to existing pages and anchors;
// - links to the demos (/demo/#/... in French, /en/demo/#/... in English) match a route of that demo's
//   router, and ?open= an existing window;
// - the French and English demos declare the same routes and the same windows.
// Usage: npm run links
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(site, 'dist');
const SITE_URL = 'https://lore.dada-core.com';

if (!existsSync(dist)) {
  console.error('No dist/ folder: run npm run build first.');
  process.exit(1);
}

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const files = walk(dist);
const rel = (path) => '/' + path.slice(dist.length + 1).split('\\').join('/');
const htmlFiles = files.filter((file) => file.endsWith('.html'));

/** URL path to file in dist, or null. */
function fileFor(path) {
  path = decodeURI(path);
  const candidates = path.endsWith('/') ? [path + 'index.html'] : [path, path + '/index.html', path + '.html'];
  for (const candidate of candidates) {
    const file = join(dist, ...candidate.split('/').filter(Boolean));
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

const idCache = new Map();
function idsOf(file) {
  if (!idCache.has(file)) {
    const html = readFileSync(file, 'utf8');
    const ids = new Set();
    for (const match of html.matchAll(/\s(?:id|name)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) ids.add(match[1] ?? match[2] ?? match[3]);
    idCache.set(file, ids);
  }
  return idCache.get(file);
}

/* Demo routers: route patterns and window names, read from the app.js of each demo. */
function readDemo(dir) {
  const appJs = readFileSync(join(site, 'public', dir, 'assets/app.js'), 'utf8');
  const routesStart = appJs.indexOf('const ROUTES = [');
  const routesBlock = appJs.slice(routesStart, appJs.indexOf('];', routesStart));
  const routes = [...routesBlock.matchAll(/\[\/(\^.*?\$)\/, (screen\w+)\]/g)].map((match) => [new RegExp(match[1]), match[2]]);
  const overlaysBlock = appJs.slice(appJs.indexOf('const OVERLAYS = {'), appJs.indexOf('function openOverlay'));
  const overlays = new Set([...overlaysBlock.matchAll(/^ {4}'([\w-]+)': /gm)].map((match) => match[1]));
  const common = readFileSync(join(site, 'public', dir, 'assets/common.js'), 'utf8');
  return { dir, appJs, source: [appJs, common].join('\n'), routes, overlays };
}
const DEMOS = { fr: readDemo('demo'), en: readDemo('en/demo') };
const demoOf = (path) => (path.startsWith('/en/demo/') ? DEMOS.en : DEMOS.fr);

function checkDemoHash(hash, demo) {
  const fragment = hash.replace(/^#/, '');
  const at = fragment.indexOf('?');
  const path = (at < 0 ? fragment : fragment.slice(0, at)) || '/';
  const params = new URLSearchParams(at < 0 ? '' : fragment.slice(at + 1));
  if (!demo.routes.some(([pattern]) => pattern.test(path))) return `no demo route for ${path}`;
  const open = params.get('open');
  if (open && !demo.overlays.has(open)) return `no demo window "${open}"`;
  return null;
}

const problems = [];
let links = 0;
let anchors = 0;
let demoLinks = 0;

function check(from, raw, kind) {
  let url = raw.trim().replace(/&amp;/g, '&');
  if (!url || /^(mailto:|tel:|javascript:|data:)/i.test(url)) return;
  if (url.startsWith(SITE_URL + '/')) url = url.slice(SITE_URL.length);
  else if (/^[a-z]+:\/\//i.test(url) || url.startsWith('//')) return; // external
  links++;
  const hashAt = url.indexOf('#');
  const hash = hashAt >= 0 ? url.slice(hashAt + 1) : '';
  let path = (hashAt >= 0 ? url.slice(0, hashAt) : url).split('?')[0];
  const fromPath = rel(from);
  if (!path) path = fromPath;
  else if (!path.startsWith('/')) path = posix.join(posix.dirname(fromPath), path) + (path.endsWith('/') ? '/' : '');
  const target = fileFor(path);
  if (!target) {
    problems.push(`${fromPath}: ${kind} ${raw} -> missing ${path}`);
    return;
  }
  if (!hash) return;
  if (path.startsWith('/demo/') || path.startsWith('/en/demo/')) {
    demoLinks++;
    if (hash.startsWith('/')) {
      const error = checkDemoHash(hash, demoOf(path));
      if (error) problems.push(`${fromPath}: ${raw} -> ${error}`);
    }
    return;
  }
  if (extname(target) !== '.html') return;
  anchors++;
  const id = decodeURIComponent(hash);
  if (!idsOf(target).has(id)) problems.push(`${fromPath}: ${kind} ${raw} -> no #${id} in ${rel(target)}`);
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const tag of html.matchAll(/<([a-zA-Z][\w-]*)\b([^>]*)>/g)) {
    const attributes = tag[2];
    for (const attribute of attributes.matchAll(/\s(href|src)=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      check(file, attribute[2] ?? attribute[3] ?? attribute[4], `<${tag[1]} ${attribute[1]}>`);
    }
    const content = /\scontent="(https:\/\/lore\.dada-core\.com\/[^"]*)"/.exec(attributes);
    if (content) check(file, content[1], `<${tag[1]} content>`);
  }
}

/* Documentation search indexes. */
let indexed = 0;
for (const index of ['docs/search.json', 'en/docs/search.json']) {
  const file = join(dist, ...index.split('/'));
  for (const entry of JSON.parse(readFileSync(file, 'utf8'))) {
    indexed++;
    check(file.replace(/search\.json$/, 'index.html'), entry.u, 'search.json u');
  }
}

/* Sitemap. */
let inSitemap = 0;
for (const file of files.filter((path) => /sitemap.*\.xml$/.test(path))) {
  for (const match of readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    inSitemap++;
    check(join(dist, 'index.html'), match[1], 'sitemap');
  }
}

/* Every fragment route written in each demo itself (a ${...} or a trailing prefix gets a sample id). */
let demoInternal = 0;
for (const demo of Object.values(DEMOS)) {
  for (const match of demo.source.matchAll(/(['"`])(#\/[^'"`\s]*)\1(\s*\+)?/g)) {
    const hash = match[2].replace(/\$\{[^}]*\}/g, 'x') + (match[3] && match[2].endsWith('/') ? 'x' : '');
    demoInternal++;
    const error = checkDemoHash(hash.replace(/x(?=\/|$|\?)/g, 'infrastructure'), demo);
    if (error) problems.push(`${demo.dir} app.js: ${match[2]} -> ${error}`);
  }
  for (const match of demo.appJs.matchAll(/data-overlay="([\w-]+)"/g)) {
    if (!demo.overlays.has(match[1])) problems.push(`${demo.dir} app.js: data-overlay="${match[1]}" has no window`);
  }
  for (const match of demo.appJs.matchAll(/openOverlay\('([\w-]+)'/g)) {
    if (!demo.overlays.has(match[1])) problems.push(`${demo.dir} app.js: openOverlay('${match[1]}') has no window`);
  }
}

/* The two demos are the same application in two languages: same routes, same windows. */
const routeList = (demo) => demo.routes.map(([pattern, screen]) => `${pattern.source} ${screen}`).join('\n');
if (routeList(DEMOS.fr) !== routeList(DEMOS.en)) problems.push('the French and English demos do not declare the same routes');
if ([...DEMOS.fr.overlays].join() !== [...DEMOS.en.overlays].join()) problems.push('the French and English demos do not declare the same windows');

console.log(`HTML pages: ${htmlFiles.length}`);
console.log(`Internal links checked: ${links} (anchors: ${anchors}, demo links: ${demoLinks})`);
console.log(`Search index entries: ${indexed}, sitemap URLs: ${inSitemap}`);
console.log(`Demo routes: ${DEMOS.fr.routes.length} (fr) and ${DEMOS.en.routes.length} (en), demo windows: ${DEMOS.fr.overlays.size} (fr) and ${DEMOS.en.overlays.size} (en), fragment links in the demo sources: ${demoInternal}`);
console.log(problems.length ? `${problems.length} problem(s):\n${problems.join('\n')}` : 'No broken link.');
process.exit(problems.length ? 1 : 0);
