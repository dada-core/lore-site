/* Markdown extensions for the documentation (src/content/docs/).
   Pages stay plain Markdown, readable as is on GitHub; these plugins give them the site's presentation:
   - a code block gets a header with its title and a copy button:   ```sh title="Terminal"
   - consecutive code blocks with a tab name become tabs:          ```sh tab="Windows"
   - GitHub alerts become callouts:                                > [!NOTE]  > [!TIP]  > [!WARNING]
   - a link to another page (installation.md#anchor) points to that page in the same language;
     a link to https://lore.dada-core.com/… becomes a link within the site;
   - a paragraph holding only `GET /api/v1/…` is shown as an API endpoint;
   - <span class="vb">v0.2</span> is a release badge, and stays out of the heading's anchor;
   - tables scroll sideways when they do not fit.
   They run on the Sätteri processor (Astro's Markdown engine), after code highlighting. */
import { ICONS, type IconName } from '../lib/icons';
import { docHref, isDocKey, type DocLang } from './nav';

/* Minimal shapes of the HTML tree the plugins read and build. */
type Props = Record<string, unknown>;
interface Text { type: 'text'; value: string }
interface El { type: 'element'; tagName: string; properties: Props; children: Node[] }
type Node = El | Text | { type: string; [k: string]: unknown };
interface Ctx {
  fileURL: URL | undefined;
  data: Record<string, unknown>;
  replaceNode(node: Node, next: Node | Node[]): void;
  removeNode(node: Node): void;
  setProperty(node: Node, key: string, value: unknown): void;
  textContent(node: Node): string;
  parent(node: Node): El | undefined;
  indexOf(node: Node): number | undefined;
  report(opts: { message: string; node?: Node; severity?: 'error' | 'warning' | 'info' }): void;
}

const WORDS = {
  fr: { copy: 'Copier le code', variants: 'Variantes', planned: 'Prévu en ' },
  en: { copy: 'Copy code', variants: 'Variants', planned: 'Planned for ' }
};

/* Language of the page being compiled, from its folder. */
const langOf = (ctx: Ctx): DocLang => (ctx.fileURL && /\/content\/docs\/en\//.test(ctx.fileURL.pathname) ? 'en' : 'fr');

const isEl = (n: Node | undefined): n is El => !!n && n.type === 'element';
const classes = (n: El): string[] => {
  const c = n.properties.className ?? n.properties.class;
  return Array.isArray(c) ? c.map(String) : typeof c === 'string' ? c.split(/\s+/) : [];
};
const hasClass = (n: Node | undefined, c: string) => isEl(n) && classes(n).includes(c);
const el = (tagName: string, properties: Props, children: Node[] = []): El => ({ type: 'element', tagName, properties, children });
const text = (value: string): Text => ({ type: 'text', value });
const icon = (name: IconName): Node => ({ type: 'raw', value: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>` });
const prop = (n: El, ...keys: string[]) => {
  for (const k of keys) if (typeof n.properties[k] === 'string') return n.properties[k] as string;
  return undefined;
};
/* Same rule as the heading anchors Astro generates. */
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '').replace(/ /g, '-');

/* ---------- Links between pages ---------- */
const links = {
  name: 'lore:doc-links',
  element: {
    filter: ['a'],
    visit(node: El, ctx: Ctx) {
      const url = prop(node, 'href');
      if (!url) return;
      if (url.startsWith('https://lore.dada-core.com/')) {
        ctx.setProperty(node, 'href', url.slice('https://lore.dada-core.com'.length));
        return;
      }
      const m = /^(?:\.\/)?([a-z0-9-]+)\.md(#[^\s]*)?$/.exec(url);
      if (!m) return;
      if (!isDocKey(m[1])) {
        ctx.report({ message: `Link to an unknown documentation page: ${url}`, node, severity: 'error' });
        return;
      }
      ctx.setProperty(node, 'href', docHref(m[1], langOf(ctx), m[2]?.slice(1)));
    }
  }
};

/* ---------- Code blocks, callouts, endpoints, badges, tables, headings ---------- */
const TITLES: Record<string, string> = { sh: 'Terminal', bash: 'Terminal', shell: 'Terminal', powershell: 'PowerShell', yaml: 'YAML', json: 'JSON', dotenv: '.env', nginx: 'nginx.conf', http: 'HTTP' };
const ALERTS: Record<string, [string, IconName]> = { NOTE: ['note', 'info'], IMPORTANT: ['note', 'info'], TIP: ['tip', 'check-circle'], WARNING: ['warn', 'alert'], CAUTION: ['warn', 'alert'] };
const ENDPOINT = /^(GET|POST|PUT|PATCH|DELETE)\s+(\S+)$/;
const BADGE = /^v\d+\.\d+$/;

const blocks = {
  name: 'lore:doc-blocks',
  element: [
    {
      /* Code: header with the block's title (from the code fence: title="…") and a copy button. */
      filter: ['pre'],
      visit(node: El, ctx: Ctx) {
        if (!hasClass(node, 'astro-code') || hasClass(ctx.parent(node), 'd-code')) return;
        const w = WORDS[langOf(ctx)];
        const lang = prop(node, 'dataLanguage', 'data-language') ?? '';
        const info = (ctx.data.loreCode as CodeInfo | undefined)?.[codeKey(ctx.textContent(node))]?.shift();
        const title = info?.title ?? TITLES[lang] ?? '';
        const tab = info?.tab;
        const head = el('div', { className: ['d-code-head'] }, [
          el('span', {}, [text(title)]),
          el('button', { className: ['icon-btn'], type: 'button', dataCopyPane: '', ariaLabel: w.copy, title: w.copy }, [icon('copy')])
        ]);
        ctx.replaceNode(node, el('div', { className: ['d-code'], ...(tab ? { dataTab: tab } : {}) }, [head, node]));
      }
    },
    {
      /* GitHub alerts: > [!NOTE] / [!TIP] / [!WARNING]. */
      filter: ['blockquote'],
      visit(node: El, ctx: Ctx) {
        const kids = node.children.filter((c) => !(c.type === 'text' && !(c as Text).value.trim()));
        const first = kids[0];
        if (!isEl(first) || first.tagName !== 'p') return;
        const lead = first.children[0];
        const m = lead?.type === 'text' ? /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/.exec((lead as Text).value) : null;
        if (!m) return;
        const [kind, ico] = ALERTS[m[1]];
        const rest = (lead as Text).value.slice(m[0].length);
        const p = el('p', {}, [...(rest ? [text(rest)] : []), ...first.children.slice(1)]);
        ctx.replaceNode(node, el('div', { className: ['d-callout', 'd-callout-' + kind], role: 'note' }, [icon(ico), el('div', {}, [p, ...kids.slice(1)])]));
      }
    },
    {
      /* A paragraph holding only `GET /api/v1/…`: an API endpoint. */
      filter: ['p'],
      visit(node: El, ctx: Ctx) {
        const kids = node.children.filter((c) => !(c.type === 'text' && !(c as Text).value.trim()));
        if (kids.length !== 1 || !isEl(kids[0]) || kids[0].tagName !== 'code') return;
        const m = ENDPOINT.exec(ctx.textContent(kids[0]).trim());
        if (!m) return;
        ctx.replaceNode(node, el('p', { className: ['d-endpoint'] }, [
          el('span', { className: ['d-method', 'd-' + m[1].toLowerCase()] }, [text(m[1])]),
          el('code', {}, [text(m[2])])
        ]));
      }
    },
    {
      /* Release badge: says what it means when hovered. */
      filter: ['span'],
      visit(node: El, ctx: Ctx) {
        if (!hasClass(node, 'vb')) return;
        const v = ctx.textContent(node).trim();
        if (BADGE.test(v)) ctx.setProperty(node, 'title', WORDS[langOf(ctx)].planned + v);
      }
    },
    {
      /* A heading with a release badge: its anchor ignores the badge. */
      filter: ['h2', 'h3'],
      visit(node: El, ctx: Ctx) {
        const badges = node.children.filter((c) => hasClass(c, 'vb'));
        if (!badges.length) return;
        let label = ctx.textContent(node);
        for (const b of badges) label = label.replace(ctx.textContent(b), '');
        ctx.setProperty(node, 'id', slugify(label));
      }
    },
    {
      /* Tables scroll sideways on small screens, with a fade showing there is more. */
      filter: ['table'],
      visit(node: El, ctx: Ctx) {
        if (hasClass(ctx.parent(node), 'd-table')) return;
        ctx.replaceNode(node, el('div', { className: ['hx', 'd-table-wrap'] }, [el('div', { className: ['d-table'] }, [node])]));
      }
    }
  ]
};

/* ---------- Tabs: code blocks that follow one another with a tab name ---------- */
const isTabbed = (n: Node | undefined) => hasClass(n, 'd-code') && typeof (n as El).properties.dataTab === 'string';
const tabs = {
  name: 'lore:doc-tabs',
  element: {
    filter: ['div'],
    visit(node: El, ctx: Ctx) {
      if (!isTabbed(node)) return;
      const parent = ctx.parent(node);
      const index = ctx.indexOf(node);
      if (!parent || index === undefined || hasClass(parent, 'd-tab-panel')) return;
      const blank = (c: Node) => c.type === 'text' && !(c as Text).value.trim();
      /* Only the first block of a run builds the tabs. */
      let k = index - 1;
      while (k >= 0 && blank(parent.children[k])) k--;
      if (k >= 0 && isTabbed(parent.children[k])) return;
      const run: El[] = [];
      for (let j = index; j < parent.children.length; j++) {
        const c = parent.children[j];
        if (blank(c)) continue;
        if (!isTabbed(c)) break;
        run.push(c as El);
      }
      if (run.length < 2) return;
      const seq = ((ctx.data.loreTabs as number | undefined) ?? 0) + 1;
      ctx.data.loreTabs = seq;
      const id = (k: number) => `tabs-${seq}-${k}`;
      const bar = el('div', { className: ['d-tabs-bar'], role: 'tablist', ariaLabel: WORDS[langOf(ctx)].variants }, run.map((r, k) =>
        el('button', { type: 'button', role: 'tab', id: id(k), ariaControls: id(k) + '-panel', ariaSelected: k === 0 ? 'true' : 'false', tabIndex: k === 0 ? 0 : -1 }, [text(String(r.properties.dataTab))])));
      const panels = run.map((r, k) => el('div', { className: ['d-tab-panel'], role: 'tabpanel', id: id(k) + '-panel', ariaLabelledby: id(k), ...(k ? { hidden: true } : {}) }, [{ ...r, properties: { ...r.properties, dataTab: undefined } }]));
      ctx.replaceNode(node, el('div', { className: ['d-tabs'] }, [bar, ...panels]));
      run.slice(1).forEach((r) => ctx.removeNode(r));
    }
  }
};

export const docPlugins = [links, blocks, tabs];

/* Code fence options (title="…", tab="…"). They are read from the Markdown tree, because the HTML tree is
   parsed again for inline HTML and loses them; each code block then finds its options by its content. */
type CodeInfo = Record<string, { title?: string; tab?: string }[]>;
const codeKey = (code: string) => code.replace(/\r\n?/g, '\n').replace(/\n+$/, '');
const codeInfo = {
  name: 'lore:code-info',
  code(node: { value: string; meta?: string | null }, ctx: { data: Record<string, unknown> }) {
    if (!node.meta) return;
    const title = /\btitle="([^"]*)"/.exec(node.meta)?.[1];
    const tab = /\btab="([^"]*)"/.exec(node.meta)?.[1];
    const map = (ctx.data.loreCode ??= {}) as CodeInfo;
    (map[codeKey(node.value)] ??= []).push({ title, tab });
  }
};

export const docMdastPlugins = [codeInfo];

