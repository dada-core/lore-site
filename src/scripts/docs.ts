/* Documentation pages: collapsible menu and outline, section anchors, outline that follows the reading, search window. */

const layout = document.querySelector<HTMLElement>('[data-doc]');
if (layout) init(layout);

interface Words { none: string; count: [string, string, string]; anchor: string; index: string }
interface Entry { t: string; g: string; h: string; u: string; x: string }
interface Indexed extends Entry { nt: string; nh: string; nx: string }

function init(layout: HTMLElement) {
  const words = JSON.parse(layout.dataset.doc || '{}') as Words;
  const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
  const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
  const store = {
    get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage unavailable: the choice lasts until the page closes */ } }
  };
  const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

  /* ---------- Menu and outline: hidden with a button or [ and ] on large screens; the menu opens on demand on phones ---------- */
  const small = window.matchMedia('(max-width: 860px)');
  const navBtn = $('[data-doc-nav]');
  const tocBtn = $('[data-doc-toc]');
  if (store.get('lore-doc-nav') === '0') layout.classList.add('no-nav');
  if (store.get('lore-doc-toc') === '0') layout.classList.add('no-toc');
  layout.setAttribute('data-ready', '');
  const sync = () => {
    navBtn?.setAttribute('aria-expanded', String(small.matches ? layout.classList.contains('nav-open') : !layout.classList.contains('no-nav')));
    tocBtn?.setAttribute('aria-expanded', String(!layout.classList.contains('no-toc')));
  };
  const toggleNav = () => {
    if (small.matches) layout.classList.toggle('nav-open');
    else store.set('lore-doc-nav', layout.classList.toggle('no-nav') ? '0' : '1');
    sync();
  };
  const toggleToc = () => {
    store.set('lore-doc-toc', layout.classList.toggle('no-toc') ? '0' : '1');
    sync();
  };
  navBtn?.addEventListener('click', toggleNav);
  tocBtn?.addEventListener('click', toggleToc);
  small.addEventListener('change', sync);
  sync();

  /* ---------- Anchor next to each heading, to copy a link to a section ---------- */
  $$('.d-content :is(h2, h3)[id]').forEach((h) => {
    const a = document.createElement('a');
    a.className = 'd-hash';
    a.href = '#' + h.id;
    a.textContent = '#';
    a.tabIndex = -1;
    a.setAttribute('aria-hidden', 'true');
    a.title = words.anchor;
    h.append(a);
  });

  /* ---------- The outline shows the section being read ---------- */
  const tocLinks = $$<HTMLAnchorElement>('.d-toc a[href^="#"]').filter((a) => a.hash.length > 1);
  const targets = tocLinks.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))));
  let frame = 0;
  const spy = () => {
    frame = 0;
    let active = -1;
    targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < 150) active = i; });
    if (active < 0 && targets.length) active = 0;
    tocLinks.forEach((a, i) => a.classList.toggle('is-active', i === active));
  };
  if (tocLinks.length) {
    window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(spy); }, { passive: true });
    spy();
  }

  /* ---------- Search ---------- */
  const dialog = $<HTMLDialogElement>('#d-search');
  const input = dialog && $<HTMLInputElement>('input', dialog);
  const list = dialog && $<HTMLUListElement>('.d-hits', dialog);
  const empty = dialog && $<HTMLElement>('.d-search-empty', dialog);
  const live = dialog && $<HTMLElement>('[data-live]', dialog);
  if (!dialog || !input || !list || !empty || !live) return;

  /* Accents and capitals are ignored, and typographic apostrophes, quotation marks and no-break spaces
     count as the ones typed on a keyboard, in the index as in the query.
     Each character is folded alone, so positions match the original text. */
  const SAME: Record<string, string> = {
    '\u2019': "'", '\u2018': "'", '\u02bc': "'",
    '\u201c': '"', '\u201d': '"', '\u201e': '"', '\u00ab': '"', '\u00bb': '"',
    '\u00a0': ' ', '\u202f': ' '
  };
  const fold = (s: string) => Array.from(s, (c) => SAME[c] ?? (c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().slice(0, 1) || c)).join('');
  /* Searched words; quotation marks and apostrophes around a word are left out (« barman » holds no-break spaces). */
  const termsOf = (q: string) => fold(q).split(/\s+/).map((t) => t.replace(/^["']+|["']+$/g, '')).filter(Boolean);
  let index: Indexed[] | null = null;
  let loading: Promise<Indexed[]> | null = null;
  const load = () => (loading ??= fetch(words.index)
    .then((r) => r.json() as Promise<Entry[]>)
    .then((data) => (index = data.map((e) => ({ ...e, nt: fold(e.t), nh: fold(e.h), nx: fold(e.x) })))));

  function search(q: string): Indexed[] {
    if (!index) return [];
    const terms = termsOf(q);
    if (!terms.length) return index.filter((e) => !e.h);
    return index
      .map((e) => {
        const all = e.nt + ' ' + e.nh + ' ' + e.nx;
        if (!terms.every((t) => all.includes(t))) return null;
        let score = e.h ? 0 : 1;
        for (const t of terms) score += (e.nt.includes(t) ? 10 : 0) + (e.nh.includes(t) ? 6 : 0) + (e.nx.includes(t) ? 1 : 0);
        return { e, score };
      })
      .filter((r): r is { e: Indexed; score: number } => !!r)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((r) => r.e);
  }

  /* Text with the searched words highlighted. */
  function marked(text: string, folded: string, terms: string[]): DocumentFragment {
    const out = document.createDocumentFragment();
    const ranges: [number, number][] = [];
    for (const t of terms) {
      if (t.length < 2) continue;
      for (let p = folded.indexOf(t); p >= 0; p = folded.indexOf(t, p + t.length)) ranges.push([p, p + t.length]);
    }
    ranges.sort((a, b) => a[0] - b[0]);
    let at = 0;
    for (const [s, e] of ranges) {
      if (s < at) continue;
      out.append(text.slice(at, s));
      const m = document.createElement('mark');
      m.textContent = text.slice(s, e);
      out.append(m);
      at = e;
    }
    out.append(text.slice(at));
    return out;
  }

  /* Passage around the first searched word. */
  function excerpt(e: Indexed, terms: string[]): [string, string] {
    const pos = Math.max(0, ...terms.map((t) => e.nx.indexOf(t)).filter((p) => p >= 0).slice(0, 1));
    let start = Math.max(0, pos - 60);
    if (start > 0) start = e.x.indexOf(' ', start) + 1 || start;
    const end = Math.min(e.x.length, start + 170);
    const cut = (s: string) => (start > 0 ? '… ' : '') + s.slice(start, end) + (end < e.x.length ? ' …' : '');
    return [cut(e.x), cut(e.nx)];
  }

  function show() {
    const q = input!.value;
    const terms = termsOf(q);
    const hits = search(q);
    list!.replaceChildren(...hits.map((e, i) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = e.u;
      if (i === 0) a.classList.add('is-first');
      const head = document.createElement('span');
      head.className = 'd-hit-title';
      head.append(marked(e.t, e.nt, terms));
      if (e.h) {
        const where = document.createElement('span');
        where.className = 'd-hit-where';
        where.append(marked(e.h, e.nh, terms));
        head.append(where);
      }
      const group = document.createElement('span');
      group.className = 'd-hit-group';
      group.textContent = e.g;
      a.append(head, group);
      if (terms.length) {
        const [text, folded] = excerpt(e, terms);
        const p = document.createElement('span');
        p.className = 'd-hit-text';
        p.append(marked(text, folded, terms));
        a.append(p);
      }
      li.append(a);
      return li;
    }));
    const none = terms.length > 0 && !hits.length;
    empty!.hidden = !none;
    empty!.textContent = none ? words.none.replace('{q}', q.trim()) : '';
    if (terms.length) live!.textContent = (hits.length > 1 ? words.count[2] : words.count[hits.length]).replace('{n}', String(hits.length));
  }

  const links = () => $$<HTMLAnchorElement>('a', list);
  function open() {
    if (dialog!.open) return;
    dialog!.showModal();
    input!.select();
    if (index) show();
    else load().then(show, () => { empty!.hidden = false; empty!.textContent = words.none.replace('{q}', input!.value); });
  }
  $$('[data-doc-search]').forEach((b) => b.addEventListener('click', open));
  $('[data-close]', dialog)?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
    else if ((e.target as Element).closest('a')) dialog.close();
  });
  input.addEventListener('input', () => { if (index) show(); });
  dialog.addEventListener('keydown', (e) => {
    const items = links();
    const at = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = at + (e.key === 'ArrowDown' ? 1 : -1);
      if (next < 0) input.focus();
      else items[Math.min(next, items.length - 1)]?.focus();
    } else if (e.key === 'Enter' && e.target === input && items[0]) {
      e.preventDefault();
      items[0].click();
    } else if (at >= 0 && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      input.focus();
    }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); return; }
    if (dialog.open || typing(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); open(); }
    else if (e.key === '[') toggleNav();
    else if (e.key === ']') toggleToc();
  });
}
