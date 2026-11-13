/* Lore demo: screens, navigation and interactions.
   English version of site/public/demo/assets/app.js: both files must stay in sync
   (same routes, overlays, ids and behavior; only the language differs). */
(function () {
  'use strict';
  var D = window.SL;
  /* Every passage gets an anchor, to open the document at the right place. */
  D.docs.forEach((d) => d.passages.forEach((p, i) => { if (!p.anchor) p.anchor = 'p-' + i; }));

  /* =========================================================
     Utilities
     ========================================================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const enc = encodeURIComponent;
  const ico = (n, cls) => `<svg class="ico${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const person = (id) => D.people[id];
  const initials = (name) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const avatar = (id, lg) => { const p = person(id); return `<span class="avatar${lg ? ' avatar-lg' : ''}" style="--av:${p.color}" aria-hidden="true">${initials(p.name)}</span>`; };
  const who = (id) => `<span class="who">${avatar(id)}<span>${esc(person(id).name)}</span></span>`;
  const docById = (id) => D.docs.find((d) => d.id === id);
  const spaceById = (id) => D.spaces.find((s) => s.id === id);
  const folderName = (d) => { const f = (D.folders[d.space] || []).find((x) => x.id === d.folder); return f ? f.name : ''; };
  const spaceIco = (s, lg) => `<span class="space-ico${lg ? ' space-ico-lg' : ''}" style="--c:${s.color}" aria-hidden="true">${esc(s.name[0])}</span>`;
  const fmtIco = (d) => (d.format === 'PDF' ? 'file' : 'file-text');
  const pill = (t, c) => `<span class="pill ${c || 'p-gray'}">${esc(t)}</span>`;
  const vb = (v) => {
    const title = v === 'Later' ? 'Planned after v0.3' : v.indexOf('v0') === 0 ? 'Planned for ' + v : v === 'Paid plans' ? 'Paid plans only' : 'Planned ' + v.toLowerCase();
    return `<span class="vb" title="${title}">${esc(v)}</span>`;
  };
  const DEFAULT_Q = 'pg_restore role "does not exist"';
  /* Button that collapses or reopens a side panel (handled by common.js). */
  const panelBtn = (panel, label, icon, key) => `<button class="icon-btn" type="button" data-action="toggle-panel" data-panel="${panel}" data-label="${label}"${key ? ` data-key="${key}"` : ''} aria-expanded="true">${ico(icon)}</button>`;

  /* English typography needs no rewriting: the French version adds no-break spaces here. */
  function fr(html) {
    return html;
  }

  const ST = {
    draft: { label: 'Draft', c: 'var(--st-draft)' },
    review: { label: 'Awaiting review', c: 'var(--st-review)' },
    published: { label: 'Published', c: 'var(--st-published)' },
    validated: { label: 'Approved', c: 'var(--st-published)' },
    obsolete: { label: 'Outdated', c: 'var(--st-obsolete)' },
    archived: { label: 'Archived', c: 'var(--st-archived)' }
  };
  function stIcon(s) {
    const c = ST[s].c;
    const open = '<svg class="st-ico" viewBox="0 0 14 14" aria-hidden="true">';
    if (s === 'draft') return `${open}<circle cx="7" cy="7" r="5.5" fill="none" stroke="${c}" stroke-width="1.5" stroke-dasharray="2.3 1.9"/></svg>`;
    if (s === 'review') return `${open}<circle cx="7" cy="7" r="5.5" fill="none" stroke="${c}" stroke-width="1.5"/><path d="M7 3.6a3.4 3.4 0 0 1 0 6.8z" fill="${c}"/></svg>`;
    if (s === 'published' || s === 'validated') return `${open}<circle cx="7" cy="7" r="6.25" fill="${c}"/><path d="m4.4 7.2 1.8 1.8 3.5-3.7" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    if (s === 'obsolete') return `${open}<circle cx="7" cy="7" r="5.5" fill="none" stroke="${c}" stroke-width="1.5"/><path d="M3.4 10.6 10.6 3.4" stroke="${c}" stroke-width="1.5"/></svg>`;
    return `${open}<circle cx="7" cy="7" r="6.25" fill="${c}"/><path d="M4.6 7h4.8" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  }
  const status = (s) => `<span class="status">${stIcon(s)}${ST[s].label}</span>`;

  const CAT = { 'Runbook': 'p-blue', 'Operating procedure': 'p-teal', 'Incident report': 'p-red', 'Security documentation': 'p-purple', 'Vendor documentation': 'p-yellow', 'Architecture documentation': 'p-cyan', 'Technical documentation': 'p-gray' };
  const ROLE = { 'Owner': 'p-purple', 'Contributor': 'p-blue', 'Reader': 'p-gray', 'Administrator': 'p-purple', 'Member': 'p-gray' };
  const TECH = { 'PostgreSQL': 'p-blue', 'NFS': 'p-gray', 'IPsec': 'p-teal', 'Network': 'p-cyan', 'Kubernetes': 'p-purple', 'TLS': 'p-green', 'LDAP': 'p-orange' };
  const AUDIT = { 'Permissions': 'p-purple', 'Import': 'p-blue', 'View': 'p-gray', 'Sign-in': 'p-red', 'Organization': 'p-orange', 'Members': 'p-teal', 'Status': 'p-yellow', 'Download': 'p-cyan' };
  const STATE = { 'Active': 'p-green', 'Invitation pending': 'p-yellow', 'Disabled': 'p-gray' };
  const catPill = (c) => pill(c, CAT[c]);
  const LANG = { fr: 'French', en: 'English' };

  function indexPill(d) {
    if (d.flags && d.flags.indexing) return `<span class="pill p-blue">${ico('spinner', 'spin')}In progress</span>`;
    if (d.flags && d.flags.scanned) return `<span class="pill p-yellow" title="Only the title and the metadata are searchable">${ico('scan')}Scanned</span>`;
    return `<span class="pill p-green">${ico('check')}Indexed</span>`;
  }

  function logo(size) {
    size = size || 20;
    return `<svg width="${size}" height="${size}" viewBox="0 0 28 28" aria-hidden="true"><rect x="2" y="19" width="23" height="6" rx="1.5" fill="var(--s2)"/><rect x="6" y="11.5" width="20" height="6" rx="1.5" fill="var(--s3)"/><rect x="2" y="4" width="17" height="6" rx="1.5" fill="var(--accent)"/></svg>`;
  }

  function crumbs(items) {
    return items.map((it, i) => {
      const last = i === items.length - 1;
      const pre = it.pre || '';
      if (last) return `<span class="current">${pre}<span>${esc(it.label)}</span>${it.badge || ''}</span>`;
      return `<a href="${it.href}">${pre}<span>${esc(it.label)}</span></a><span class="sep" aria-hidden="true">›</span>`;
    }).join('');
  }

  /* =========================================================
     Simulated search (ignores accents and case)
     ========================================================= */
  const STOP = new Set('le la les un une des de du d l et a au aux en sur pour par avec dans ce cette ces est sont qui que quoi comment quel quelle quels quelles se si on il elle ne pas plus faut the an of to in on for is are how what do'.split(' '));
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const isWord = (ch) => !!ch && /[a-z0-9_]/.test(ch);

  function parseGroups(q) {
    const groups = [[]];
    const re = /(-?)"([^"]+)"|(\S+)/g;
    let m;
    while ((m = re.exec(q || ''))) {
      if (m[2] !== undefined) {
        const t = norm(m[2]).trim();
        if (t) groups[groups.length - 1].push({ t, neg: m[1] === '-', phrase: true });
        continue;
      }
      let w = m[3];
      if (w.toLowerCase() === 'or') { groups.push([]); continue; }
      let neg = false;
      if (w.length > 1 && w[0] === '-') { neg = true; w = w.slice(1); }
      let t = norm(w).replace(/^[^a-z0-9_]+|[^a-z0-9_]+$/g, '');
      if (!t || STOP.has(t)) continue;
      if (t.length > 4 && /[sx]$/.test(t)) t = t.slice(0, -1);
      groups[groups.length - 1].push({ t, neg });
    }
    return groups.filter((g) => g.some((x) => !x.neg));
  }
  const flatTerms = (q) => parseGroups(q).flat().filter((x) => !x.neg);

  function hasTerm(n, t) {
    let from = 0, idx;
    while ((idx = n.indexOf(t, from)) !== -1) {
      if (!isWord(n[idx - 1])) return true;
      from = idx + 1;
    }
    return false;
  }
  const groupMatch = (n, g) => g.every((x) => (x.neg ? !hasTerm(n, x.t) : hasTerm(n, x.t)));
  const plain = (s) => String(s).replace(/`/g, '');

  function findRanges(text, terms) {
    let n = '';
    const map = [];
    for (let i = 0; i < text.length; i++) {
      const c = norm(text[i]);
      for (let k = 0; k < c.length; k++) { n += c[k]; map.push(i); }
    }
    const ranges = [];
    terms.forEach((term) => {
      let from = 0, idx;
      while ((idx = n.indexOf(term.t, from)) !== -1) {
        if (!isWord(n[idx - 1])) {
          let end = idx + term.t.length;
          if (!term.phrase) while (end < n.length && isWord(n[end])) end++;
          ranges.push([map[idx], map[end - 1] + 1]);
        }
        from = idx + term.t.length;
      }
    });
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [];
    ranges.forEach((r) => {
      const last = merged[merged.length - 1];
      if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
      else merged.push(r.slice());
    });
    return merged;
  }
  function markText(seg, terms) {
    if (!terms || !terms.length) return esc(seg);
    let out = '', pos = 0;
    findRanges(seg, terms).forEach(([a, b]) => {
      out += esc(seg.slice(pos, a)) + '<mark>' + esc(seg.slice(a, b)) + '</mark>';
      pos = b;
    });
    return out + esc(seg.slice(pos));
  }
  /* Text with `code` segments and highlighted terms. */
  function hl(text, terms) {
    return String(text).split('`').map((seg, i) => (i % 2 ? `<code>${markText(seg, terms)}</code>` : markText(seg, terms))).join('');
  }
  function highlightIn(root, terms) {
    if (!root || !terms.length) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const t = node.nodeValue;
      const rs = findRanges(t, terms);
      if (!rs.length) return;
      const frag = document.createDocumentFragment();
      let pos = 0;
      rs.forEach(([a, b]) => {
        if (a > pos) frag.appendChild(document.createTextNode(t.slice(pos, a)));
        const mk = document.createElement('mark');
        mk.textContent = t.slice(a, b);
        frag.appendChild(mk);
        pos = b;
      });
      if (pos < t.length) frag.appendChild(document.createTextNode(t.slice(pos)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function computeResults(q) {
    const groups = parseGroups(q);
    if (!groups.length) return [];
    const out = [];
    D.docs.forEach((d) => {
      if ((d.flags && d.flags.indexing) || d.status === 'archived') return;
      const titleMatch = groups.some((g) => groupMatch(norm(d.title), g));
      const matches = d.passages.filter((p) => groups.some((g) => groupMatch(norm(plain(p.text)), g)));
      if (!titleMatch && !matches.length) return;
      out.push({ doc: d, matches, titleMatch, score: matches.length * 2 + (titleMatch ? 3 : 0) });
    });
    out.sort((a, b) => (a.doc.status === 'obsolete') - (b.doc.status === 'obsolete') || b.score - a.score);
    return out;
  }
  function relatedDocs(q, limit) {
    const terms = flatTerms(q);
    return D.docs
      .filter((d) => !(d.flags && d.flags.indexing) && d.status !== 'obsolete')
      .map((d) => {
        const n = norm(d.title + ' ' + d.passages.map((p) => plain(p.text)).join(' '));
        return { d, s: terms.filter((t) => hasTerm(n, t.t)).length };
      })
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, limit || 3)
      .map((x) => x.d);
  }

  /* =========================================================
     State and routing
     ========================================================= */
  const state = { lastQ: null, ex: { space: new Set(), category: new Set(), status: new Set() }, date: 'all', pdfPage: {}, lastFocus: null, pal: { items: [], sel: 0 } };

  /* Same addresses as the application: home is the root (#/). */
  const ROUTES = [
    [/^\/setup$/, screenSetup],
    [/^\/login$/, screenLogin],
    [/^\/join$/, screenInvitation],
    [/^\/forgot-password$/, screenForgot],
    [/^\/reset-password$/, screenReset],
    [/^\/$/, screenHome],
    [/^\/spaces$/, screenSpaces],
    [/^\/spaces\/([\w-]+)$/, screenLibrary],
    [/^\/spaces\/([\w-]+)\/members$/, screenSpaceMembers],
    [/^\/spaces\/([\w-]+)\/settings$/, screenSpaceSettings],
    [/^\/documents\/([\w-]+)$/, screenDocument],
    [/^\/search$/, screenSearch],
    [/^\/knowledge$/, screenKnowledge],
    [/^\/knowledge\/new$/, screenNewFiche],
    [/^\/knowledge\/([\w-]+)$/, screenFiche],
    [/^\/dashboard$/, screenDashboard],
    [/^\/assistant$/, screenAssistant],
    [/^\/assistant\/([\w-]+)$/, screenAssistant],
    [/^\/sources$/, screenSources],
    [/^\/account$/, screenAccount],
    [/^\/admin\/([\w-]+)$/, screenAdmin],
    [/^\/not-found$/, screen404]
  ];

  function currentRoute() {
    const h = location.hash.replace(/^#/, '');
    const i = h.indexOf('?');
    const path = (i < 0 ? h : h.slice(0, i)) || '/';
    return { path, params: new URLSearchParams(i < 0 ? '' : h.slice(i + 1)) };
  }
  function go(h) {
    if (location.hash === h) render();
    else location.hash = h;
  }

  function render() {
    const { path, params } = currentRoute();
    let view = null;
    for (const [re, fn] of ROUTES) {
      const m = path.match(re);
      if (m) { view = fn(m, params); break; }
    }
    if (!view) view = screen404();
    closeOverlay(true);
    $('#root').innerHTML = fr(view.auth ? view.html : shell(view));
    document.title = (view.title ? view.title + ' – ' : '') + 'Lore demo';
    window.scrollTo(0, 0);
    const h1 = $('#root h1');
    if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    if (view.after) view.after();
    syncTheme();
    const o = params.get('open');
    if (o) openOverlay(o, params);
  }

  /* =========================================================
     Layout: sidebar and view header
     ========================================================= */
  function shell(view) {
    return `<div class="app">${sidebar(view.nav || '')}<div class="scrim" data-action="sidebar-close" hidden></div>
      <div class="main">
        <header class="view-header">
          <button class="icon-btn menu-btn" type="button" data-action="nav-open" aria-label="Show the sidebar" title="Show the sidebar ([)">${ico('sidebar-left')}</button>
          <nav class="crumbs" aria-label="Breadcrumb">${view.crumbs || ''}</nav>
          <div class="vh-actions">${view.actions || ''}</div>
        </header>
        <main class="view-body" id="content">${view.html}</main>
      </div></div>`;
  }

  function sidebar(active) {
    const parts = active.split(':');
    const link = (href, key, icon, label, extra) => `<li><a class="nav-link" href="${href}"${active === key ? ' aria-current="page"' : ''}>${ico(icon)}<span class="label">${label}</span>${extra || ''}</a></li>`;
    const spaces = D.spaces.map((s) => {
      const on = parts[0] === 'space' && parts[1] === s.id;
      const sub = parts[2] || 'docs';
      const subList = on ? `<ul class="nav-sub">
          <li><a class="nav-link" href="#/spaces/${s.id}"${sub === 'docs' ? ' aria-current="page"' : ''}>${ico('file-text')}<span class="label">Documents</span></a></li>
          <li><a class="nav-link" href="#/spaces/${s.id}/members"${sub === 'members' ? ' aria-current="page"' : ''}>${ico('users')}<span class="label">Members</span></a></li>
          <li><a class="nav-link" href="#/spaces/${s.id}/settings"${sub === 'settings' ? ' aria-current="page"' : ''}>${ico('settings')}<span class="label">Settings</span></a></li>
        </ul>` : '';
      return `<li><a class="nav-link" href="#/spaces/${s.id}">${spaceIco(s)}<span class="label">${esc(s.name)}</span><span class="count">${s.docs}</span></a>${subList}</li>`;
    }).join('');
    return `<aside class="sidebar" id="sidebar" aria-label="Main navigation">
      <div class="ws">
        <div class="menu" style="flex:1;min-width:0">
          <button class="ws-btn" type="button" data-action="menu" aria-expanded="false" aria-haspopup="true"><span class="ws-logo" aria-hidden="true">DG</span><span class="name">${esc(D.org.name)}</span>${ico('chevron')}</button>
          <div class="popover" hidden>
            <a class="menu-item" href="#/admin/general">${ico('settings')}Organization settings</a>
            <button class="menu-item" type="button" data-action="open" data-overlay="invite">${ico('users')}Invite people</button>
            <div class="menu-sep"></div>
            <a class="menu-item" href="#/login">${ico('logout')}Sign out</a>
          </div>
        </div>
        <button class="icon-btn" type="button" data-action="open" data-overlay="import" title="Import documents (I)" aria-label="Import documents">${ico('upload')}</button>
        <button class="icon-btn side-collapse" type="button" data-action="toggle-panel" data-panel="nav" data-label="the sidebar" data-key="[">${ico('sidebar-left')}</button>
      </div>
      <button class="search-trigger" type="button" data-action="palette">${ico('search')}<span>Search</span><span class="kbd">Ctrl K</span></button>
      <div class="side-scroll">
      <nav aria-label="Workspace"><ul class="nav">
        ${link('#/', 'home', 'home', 'Home')}
        ${link('#/search', 'search', 'search', 'Search')}
        ${link('#/knowledge', 'knowledge', 'book', 'Knowledge base', vb('v0.2'))}
        ${link('#/dashboard', 'dashboard', 'chart', 'Dashboard', vb('v0.2'))}
        ${link('#/assistant', 'assistant', 'ask', 'Assistant', vb('v0.3'))}
      </ul></nav>
      <nav aria-labelledby="nav-spaces">
        <div class="nav-head"><h2 id="nav-spaces">Spaces</h2><span><a class="icon-btn" href="#/spaces" title="All spaces" aria-label="All spaces">${ico('grid')}</a><button class="icon-btn" type="button" data-action="open" data-overlay="create-space" title="Create a space" aria-label="Create a space">${ico('plus')}</button></span></div>
        <ul class="nav">${spaces}</ul>
      </nav>
      <nav aria-labelledby="nav-org">
        <div class="nav-head"><h2 id="nav-org">Organization</h2></div>
        <ul class="nav">
          ${link('#/admin/general', 'admin', 'settings', 'Administration')}
          ${link('#/sources', 'sources', 'plug', 'Connected sources', vb('Later'))}
        </ul>
      </nav>
      </div>
      <div class="side-foot">
        <a class="me" href="#/account"${active === 'account' ? ' aria-current="page"' : ''}>${avatar('as')}<span>Amenan Souaga</span></a>
        <button class="icon-btn" type="button" data-action="theme" aria-label="Change theme" title="Change theme">${ico('theme')}</button>
        <a class="icon-btn" href="#/login" aria-label="Sign out" title="Sign out">${ico('logout')}</a>
      </div>
    </aside>`;
  }

  /* =========================================================
     Access screens
     ========================================================= */
  function authPage(title, inner, wide) {
    return { auth: true, title, html: `<div class="auth"><div class="auth-card${wide ? ' auth-wide' : ''}"><div class="auth-logo">${logo(36)}</div>${inner}</div></div>` };
  }

  function screenSetup(m, p) {
    const step = Math.min(3, Math.max(1, parseInt(p.get('step') || '1', 10) || 1));
    const names = ['Organization', 'Administrator account', 'Done'];
    const stepper = `<ol class="steps">${names.map((n, i) => `<li${i + 1 === step ? ' aria-current="step"' : ''}${i + 1 < step ? ' class="done"' : ''}><span class="n">${i + 1 < step ? '✓' : i + 1}</span>${n}</li>`).join('')}</ol>`;
    let inner;
    if (step === 1) {
      inner = `<h1>Set up Lore</h1><p class="lead">First launch of this installation.</p>${stepper}
        <div class="auth-panel"><form class="form" data-form="setup1">
          <div class="field"><label for="o-name">Organization name</label><input class="input" id="o-name" value="DadaGroup" required></div>
          <div class="field"><label for="o-url">Public address</label><input class="input input-mono" id="o-url" value="${D.org.url}"><span class="help">The address your team will use to open Lore. Invitation links use it too.</span></div>
          <div class="field"><label for="o-lang">Interface language</label><select class="select" id="o-lang"><option>English</option><option>Français</option></select></div>
          <div class="callout">${ico('info')}<p>This screen only appears at the first launch. Lore has no default account or password.</p></div>
          <button class="btn btn-primary btn-lg btn-block" type="submit">Continue</button>
        </form></div>`;
    } else if (step === 2) {
      inner = `<h1>Create the administrator account</h1><p class="lead">This account will own the organization.</p>${stepper}
        <div class="auth-panel"><form class="form" data-form="setup2">
          <div class="field"><label for="a-name">Full name</label><input class="input" id="a-name" value="Wilfried Kouakou" required></div>
          <div class="field"><label for="a-mail">E-mail</label><input class="input" id="a-mail" type="email" value="wilfried.kouakou@dada.group" required></div>
          <div class="form-2">
            <div class="field"><label for="a-pw">Password</label><input class="input" id="a-pw" type="password" value="example-password"><span class="help">At least 12 characters.</span></div>
            <div class="field"><label for="a-pw2">Confirmation</label><input class="input" id="a-pw2" type="password" value="example-password"></div>
          </div>
          <div class="row-between"><a class="btn btn-ghost" href="#/setup">Back</a><button class="btn btn-primary btn-lg" type="submit">Create the account</button></div>
        </form></div>`;
    } else {
      inner = `<h1>DadaGroup is ready</h1><p class="lead">Here are the first three things to do.</p>${stepper}
        <div class="auth-panel"><ul class="next-list">
          <li><a href="#/spaces?open=create-space"><span class="cat-ico">${ico('grid')}</span><span><strong>Create a first space</strong><span class="help">One space per team or domain: Infrastructure, Network, Support…</span></span></a></li>
          <li><a href="#/admin/members?open=invite"><span class="cat-ico">${ico('users')}</span><span><strong>Invite your team</strong><span class="help">With a link, no mail server needed.</span></span></a></li>
          <li><a href="#/?open=import"><span class="cat-ico">${ico('upload')}</span><span><strong>Import documents</strong><span class="help">PDF, Word, text and Markdown.</span></span></a></li>
        </ul></div>
        <a class="btn btn-primary btn-lg btn-block" href="#/">Open Lore</a>`;
    }
    return authPage('Initial setup', inner, true);
  }

  function screenLogin(m, p) {
    const err = p.get('error');
    return authPage('Sign in', `<h1>Sign in to Lore</h1><p class="lead">${esc(D.org.name)}</p>
      <div class="auth-panel"><form class="form" data-form="login">
        ${err ? `<div class="callout callout-warn" role="alert">${ico('alert')}<p>Incorrect e-mail or password. After 2 more attempts, the account will be locked for 15 minutes.</p></div>` : ''}
        <div class="field"><label for="l-mail">E-mail</label><input class="input" id="l-mail" type="email" value="amenan.souaga@dada.group" autocomplete="username"></div>
        <div class="field"><div class="label-row"><label class="field-label" for="l-pw">Password</label><a class="link" href="#/forgot-password" style="font-size:12.5px">Forgot your password?</a></div><input class="input" id="l-pw" type="password" value="example-password" autocomplete="current-password"></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Sign in</button>
        <div class="or">or</div>
        <button class="btn btn-lg btn-block" type="button" data-mock="After v0.1: sign-in through the organization’s identity provider (OpenID Connect).">${ico('key')}Continue with the identity provider ${vb('After v0.1')}</button>
      </form></div>
      <p class="auth-alt">No account yet? Ask an administrator for an invitation link.</p>`);
  }

  function screenInvitation() {
    const s = spaceById('infrastructure');
    return authPage('Invitation', `<h1>Join ${esc(D.org.name)}</h1><p class="lead">Amenan Souaga invites you to the ${esc(s.name)} space, with the Contributor role.</p>
      <div class="auth-panel"><form class="form" data-form="join">
        <div class="list-row" style="border:1px solid var(--border);border-radius:8px">${spaceIco(s, true)}<div class="list-main"><div class="list-title">${esc(s.name)}</div><div class="list-sub">${s.docs} documents, ${s.members} members</div></div>${pill('Contributor', ROLE.Contributor)}</div>
        <div class="field"><label for="i-name">Full name</label><input class="input" id="i-name" placeholder="First name Last name"></div>
        <div class="field"><label for="i-mail">Work e-mail</label><input class="input" id="i-mail" type="email" placeholder="first.last@dada.group"></div>
        <div class="field"><label for="i-pw">Password</label><input class="input" id="i-pw" type="password"><span class="help">At least 12 characters.</span></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Create my account and join the space</button>
      </form></div>
      <p class="auth-alt">This link works only once and expires on Nov 18, 2026.</p>`);
  }

  function screenForgot() {
    return authPage('Forgot your password', `<h1>Forgot your password</h1><p class="lead">An administrator can give you a reset link.</p>
      <div class="auth-panel"><div class="form">
        <div class="callout">${ico('info')}<p>Sending e-mails is not configured on this installation. Ask one of these people to create a reset link for your account.</p></div>
        <ul class="list">
          <li><div class="list-row">${avatar('wk', true)}<div class="list-main"><div class="list-title">Wilfried Kouakou</div><div class="list-sub">wilfried.kouakou@dada.group</div></div>${pill('Owner', ROLE.Owner)}</div></li>
          <li><div class="list-row">${avatar('as', true)}<div class="list-main"><div class="list-title">Amenan Souaga</div><div class="list-sub">amenan.souaga@dada.group</div></div>${pill('Administrator', ROLE.Administrator)}</div></li>
        </ul>
        <p class="help">If sending e-mails is configured (SMTP option), this page offers to receive the link directly.</p>
      </div></div>
      <p class="auth-alt"><a class="link" href="#/login">Back to sign-in</a></p>`);
  }

  function screenReset() {
    return authPage('New password', `<h1>Choose a new password</h1><p class="lead">For Hervé Coulibaly (herve.coulibaly@dada.group)</p>
      <div class="auth-panel"><form class="form" data-form="reset">
        <div class="field"><label for="r-pw">New password</label><input class="input" id="r-pw" type="password"><span class="help">At least 12 characters.</span></div>
        <div class="field"><label for="r-pw2">Confirmation</label><input class="input" id="r-pw2" type="password"></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Save and sign in</button>
      </form></div>
      <p class="auth-alt">This link, created by Amenan Souaga, works only once and expires in 24 hours.</p>`);
  }

  /* =========================================================
     Home and spaces
     ========================================================= */
  function docRowLink(d, side) {
    const s = spaceById(d.space);
    return `<li><a class="list-row" href="#/documents/${d.id}">${ico(fmtIco(d))}<div class="list-main"><div class="list-title">${esc(d.title)}</div><div class="list-sub">${esc(s.name)} › ${esc(folderName(d))}</div></div><div class="list-side">${status(d.status)}<span>${side}</span></div></a></li>`;
  }

  function screenHome() {
    const recent = [['restaurer-pg', 'Viewed 2 hours ago'], ['inc-2291', 'Viewed yesterday'], ['guide-baie', 'Viewed on Nov 8']];
    const tiles = D.spaces.map((s) => `<a class="tile" href="#/spaces/${s.id}">${spaceIco(s, true)}<div><div class="tile-name">${esc(s.name)}</div><div class="tile-sub">${s.docs} documents</div><div class="tile-sub">Your role: ${s.role}</div></div></a>`).join('');
    const feed = D.audit.filter((a) => a.who && a.type !== 'View').slice(0, 6).map((a) => `<li>${avatar(a.who)}<span><b>${esc(person(a.who).name)}</b> ${esc(a.text)}</span><time>${esc(a.when.split(',')[0])}</time></li>`).join('');
    return {
      nav: 'home', title: 'Home',
      crumbs: crumbs([{ label: 'Home' }]),
      actions: `<button class="btn btn-primary" type="button" data-action="open" data-overlay="import">${ico('upload')}<span class="btn-label">Import</span></button>`,
      html: `<div class="pad"><div class="home">
        <div class="stack">
          <div><h1 class="page-title">Hello, Amenan</h1><p class="page-intro">Wednesday, November 11, 2026</p></div>
          <section><h2 class="section-title">Pick up where you left off</h2><ul class="list">${recent.map(([id, w]) => docRowLink(docById(id), w)).join('')}</ul></section>
          <section><div class="row-between"><h2 class="section-title">Your spaces</h2><a class="link" href="#/spaces">All spaces</a></div>
            <div class="tiles">${tiles}<button class="tile tile-new" type="button" data-action="open" data-overlay="create-space"><span class="space-ico space-ico-lg">${ico('plus')}</span><span>Create a space</span></button></div></section>
          <section><h2 class="section-title">Recent activity in your spaces</h2><ul class="feed">${feed}</ul></section>
        </div>
        <aside class="stack">
          <section><h2 class="section-title">To do</h2><div class="inbox">
            <a href="#/?open=import">${ico('alert')}<span>Failed import</span><span class="n">2</span></a>
            <a href="#/documents/plan-reprise">${ico('spinner', 'spin')}<span>Indexing in progress</span><span class="n">1</span></a>
            <a href="#/knowledge">${stIcon('review')}<span>Articles to approve</span>${vb('v0.2')}<span class="n">2</span></a>
            <a href="#/dashboard">${ico('clock')}<span>Overdue reviews</span>${vb('v0.2')}<span class="n">2</span></a>
          </div></section>
          <section><h2 class="section-title">Keyboard shortcuts</h2><ul class="shortcuts">
            <li><span>Search or go to</span><span><span class="kbd">Ctrl K</span></span></li>
            <li><span>Search</span><span class="kbd">/</span></li>
            <li><span>Import documents</span><span class="kbd">I</span></li>
            <li><span>Show or hide the sidebar</span><span class="kbd">[</span></li>
            <li><span>Show or hide the right panel</span><span class="kbd">]</span></li>
            <li><span>Close a window</span><span class="kbd">Esc</span></li>
          </ul></section>
        </aside>
      </div></div>`
    };
  }

  function screenSpaces() {
    const rows = D.spaces.map((s, i) => `<tr><td class="rn">${i + 1}</td><td class="primary"><div class="cell-title">${spaceIco(s)}<a href="#/spaces/${s.id}">${esc(s.name)}</a><a class="expand" href="#/spaces/${s.id}" aria-label="Open ${esc(s.name)}">${ico('expand')}</a></div></td><td>${esc(s.desc)}</td><td class="num">${s.docs}</td><td class="num">${s.members}</td><td>${pill(s.role, ROLE[s.role])}</td><td>${esc(s.activity)}</td></tr>`).join('');
    return {
      nav: 'spaces', title: 'Spaces',
      crumbs: crumbs([{ label: 'Spaces' }]),
      actions: `<button class="btn btn-primary" type="button" data-action="open" data-overlay="create-space">${ico('plus')}<span class="btn-label">Create a space</span></button>`,
      html: `<h1 class="sr-only">Spaces</h1>
        <div class="toolbar"><div class="views"><a class="view-tab" href="#/spaces" aria-current="page">${ico('grid')}All spaces</a></div>
          <div class="tools"><button class="tool" type="button" data-mock>${ico('filter')}Filter</button><button class="tool" type="button" data-mock>${ico('sort')}Sort</button></div></div>
        <div class="grid-wrap"><table class="grid"><thead><tr><th class="rn"></th><th class="primary"><span class="th">${ico('text')}Name</span></th><th><span class="th">${ico('text')}Description</span></th><th><span class="th">${ico('hash')}Documents</span></th><th><span class="th">${ico('hash')}Members</span></th><th><span class="th">${ico('tag')}Your role</span></th><th><span class="th">${ico('calendar')}Last activity</span></th></tr></thead><tbody>${rows}</tbody></table></div>
        <div class="grid-foot"><span>${D.spaces.length} spaces</span><span>${D.org.docs} documents</span></div>`
    };
  }

  function spaceCrumbs(s, last) {
    const items = [{ label: 'Spaces', href: '#/spaces' }, { label: s.name, href: '#/spaces/' + s.id, pre: spaceIco(s) }];
    if (last) items.push({ label: last });
    return crumbs(items);
  }

  function libRow(d, n) {
    return `<tr class="${d.status === 'obsolete' ? 'is-obsolete' : ''}"><td class="rn">${n}</td>
      <td class="primary"><div class="cell-title">${ico(fmtIco(d))}<a href="#/documents/${d.id}"${d.lang === 'fr' ? ' lang="fr"' : ''}>${esc(d.title)}</a>${d.restricted ? `<svg class="ico lock" role="img" aria-label="Restricted access"><use href="#i-lock"/></svg>` : ''}<a class="expand" href="#/documents/${d.id}" aria-label="Open the document">${ico('expand')}</a></div></td>
      <td>${status(d.status)}</td><td>${catPill(d.category)}</td><td>${who(d.owner)}</td><td>${esc(d.updated)}</td><td class="num">${d.version}</td>
      <td>${indexPill(d)}</td><td>${d.lang === 'fr' ? '<span class="tag-lang">FR</span> French' : 'English'}</td><td>${esc(d.format)}</td></tr>`;
  }

  function screenLibrary(m, p) {
    const s = spaceById(m[1]);
    if (!s) return screen404();
    const actions = `<button class="btn" type="button" data-action="open" data-overlay="new-folder">${ico('folder-plus')}<span class="btn-label">New folder</span></button><button class="btn btn-primary" type="button" data-action="open" data-overlay="import">${ico('upload')}<span class="btn-label">Import</span></button>`;
    const base = { nav: 'space:' + s.id + ':docs', title: s.name, crumbs: spaceCrumbs(s), actions };
    if (s.empty) {
      base.html = `<div class="empty">${spaceIco(s, true)}<h1 class="page-title">${esc(s.name)} is empty</h1><p>Import your first documents or invite colleagues. PDF, Word, text and Markdown files are indexed as soon as they are imported.</p>
        <div class="actions"><button class="btn btn-primary btn-lg" type="button" data-action="open" data-overlay="import">${ico('upload')}Import documents</button><a class="btn btn-lg" href="#/spaces/${s.id}/members">${ico('users')}Invite members</a></div>
        <p class="help">Tip: create folders (Runbooks, Procedures, Incident reports…) so everyone finds their way.</p></div>`;
      return base;
    }
    if (s.id !== 'infrastructure') {
      base.html = `<div class="pad narrow"><h1 class="page-title">${esc(s.name)}</h1><p class="page-intro">${esc(s.desc)}</p><div class="callout callout-mock" style="margin-top:18px">${ico('info')}<p>Demo: only the Infrastructure space is detailed. The other spaces have the same structure.</p><a class="btn" href="#/spaces/infrastructure">Open Infrastructure</a></div></div>`;
      return base;
    }
    const view = p.get('view') === 'kanban' ? 'kanban' : 'grid';
    const folder = p.get('folder');
    const grouped = p.get('group') !== 'none';
    const folders = D.folders[s.id];
    const docs = D.docs.filter((d) => d.space === s.id && (!folder || d.folder === folder));
    const fName = folder ? (folders.find((f) => f.id === folder) || {}).name : '';
    const qs = (extra) => {
      const o = new URLSearchParams();
      if (view === 'kanban') o.set('view', 'kanban');
      if (folder) o.set('folder', folder);
      if (!grouped) o.set('group', 'none');
      Object.entries(extra || {}).forEach(([k, v]) => (v === null ? o.delete(k) : o.set(k, v)));
      const str = o.toString();
      return '#/spaces/' + s.id + (str ? '?' + str : '');
    };
    const toolbar = `<div class="toolbar">
      <div class="views">
        <a class="view-tab" href="${qs({ view: null })}"${view === 'grid' ? ' aria-current="page"' : ''}>${ico('grid')}Grid</a>
        <a class="view-tab" href="${qs({ view: 'kanban' })}"${view === 'kanban' ? ' aria-current="page"' : ''}>${ico('kanban')}Kanban by status</a>
      </div>
      <div class="tools">
        <button class="tool" type="button" data-mock="Choosing the visible columns: not simulated.">${ico('eye-off')}Hide columns</button>
        <div class="menu"><button class="tool${folder ? ' is-on-blue' : ''}" type="button" data-action="menu" aria-expanded="false">${ico('filter')}${folder ? 'Folder: ' + esc(fName) : 'Filter'}</button>
          <div class="popover popover-right" hidden>
            <a class="menu-item" href="${qs({ folder: null })}">${ico('file-text')}All documents<span class="kbd">${D.docs.filter((d) => d.space === s.id).length}</span></a>
            <div class="menu-sep"></div>
            ${folders.map((f) => `<a class="menu-item" href="${qs({ folder: f.id })}">${ico('folder')}${esc(f.name)}<span class="kbd">${D.docs.filter((d) => d.folder === f.id).length}</span></a>`).join('')}
          </div></div>
        ${view === 'grid' ? `<div class="menu"><button class="tool${grouped ? ' is-on' : ''}" type="button" data-action="menu" aria-expanded="false">${ico('group')}${grouped ? 'Grouped by folder' : 'Group'}</button>
          <div class="popover popover-right" hidden><a class="menu-item" href="${qs({ group: null })}">${ico('folder')}By folder</a><a class="menu-item" href="${qs({ group: 'none' })}">${ico('x')}No grouping</a></div></div>` : ''}
        <button class="tool is-on-green" type="button" data-mock="Sorting: not simulated.">${ico('sort')}Sorted by update</button>
        <span class="divider-v"></span>
        <button class="tool" type="button" data-action="palette" aria-label="Search">${ico('search')}</button>
      </div></div>`;
    let body;
    if (view === 'kanban') {
      const cols = ['draft', 'published', 'obsolete', 'archived'].map((st) => {
        const list = docs.filter((d) => d.status === st);
        return `<section class="column"><div class="column-head">${stIcon(st)}${ST[st].label}<span class="count">${list.length}</span></div><div class="cards">${list.map((d) => `<a class="card" href="#/documents/${d.id}"><div class="card-title">${esc(d.title)}${d.restricted ? ` <svg class="ico lock" aria-hidden="true"><use href="#i-lock"/></svg>` : ''}</div><div class="card-pills">${catPill(d.category)}${(d.flags && (d.flags.indexing || d.flags.scanned)) ? indexPill(d) : ''}</div><div class="card-meta">${who(d.owner)}<span>Version ${d.version}, ${esc(d.updated)}</span></div></a>`).join('') || '<p class="column-empty">No documents</p>'}</div></section>`;
      }).join('');
      body = `<div class="board">${cols}</div>`;
    } else {
      let n = 0, rows = '';
      const head = `<thead><tr><th class="rn"></th><th class="primary"><span class="th">${ico('text')}Title</span></th><th><span class="th">${ico('tag')}Status</span></th><th><span class="th">${ico('tag')}Category</span></th><th><span class="th">${ico('user')}Owner</span></th><th><span class="th">${ico('calendar')}Updated</span></th><th><span class="th">${ico('hash')}Version</span></th><th><span class="th">${ico('tag')}Indexing</span></th><th><span class="th">${ico('globe')}Language</span></th><th><span class="th">${ico('file')}Format</span></th></tr></thead>`;
      if (grouped) {
        folders.forEach((f) => {
          const list = docs.filter((d) => d.folder === f.id);
          if (!list.length) return;
          rows += `<tr class="group-row"><td colspan="10"><div class="group-head">${ico('chevron')}<span class="lbl">Folder</span><strong>${esc(f.name)}</strong><span class="count">${list.length}</span></div></td></tr>`;
          list.forEach((d) => { rows += libRow(d, ++n); });
        });
      } else docs.forEach((d) => { rows += libRow(d, ++n); });
      body = `<div class="grid-wrap"><table class="grid">${head}<tbody>${rows}</tbody></table></div><div class="grid-foot"><span>${docs.length} document${docs.length > 1 ? 's' : ''}</span><span>1 being indexed</span><span>1 scanned, not searchable</span></div>`;
    }
    base.html = `<h1 class="sr-only">${esc(s.name)}: documents</h1>${toolbar}${body}`;
    return base;
  }

  /* =========================================================
     Document: content, properties, versions
     ========================================================= */
  function strata(d) {
    const n = d.versions.length;
    const bands = d.versions.map((v, i) => {
      const color = i === 0 ? 'var(--accent)' : i === n - 1 ? 'var(--s2)' : i % 2 ? 'var(--s4)' : 'var(--s3)';
      return `<button class="stratum" type="button" data-action="stratum" data-doc="${d.id}" data-v="${v.n}" aria-pressed="${i === 0}" style="--h:${v.w}px;--c:${color}"><span class="band" aria-hidden="true"></span><span class="stratum-label"><span>Version ${v.n}</span><span>${esc(v.short)}</span></span></button>`;
    }).join('');
    return `<div class="strata" role="group" aria-label="Version history, from the most recent to the oldest">${bands}</div><div class="version-detail" id="vd" aria-live="polite">${versionDetail(d, d.versions[0])}</div><p class="caption">The thickness of a stratum shows how much the version changed.</p>`;
  }
  function versionDetail(d, v) {
    const cur = v.n === d.version;
    return `<strong>Version ${v.n}${cur ? ', current' : ''}</strong><p>Imported on ${esc(v.date)} by ${esc(person(v.by).name)}</p><p>${esc(v.note)}</p><div class="actions">${cur ? '' : `<button class="btn" type="button" data-mock="Showing version ${v.n}: not simulated in the demo.">Show</button>`}<button class="btn" type="button" data-mock="Download: not simulated in the demo.">${ico('download')}Download</button></div>`;
  }

  function bodyRestaurer() {
    return {
      toc: [['s-1', '1. Prerequisites', 1], ['s-2', '2. Find the backup', 1], ['s-3', '3. Restore the database', 1], ['s-4', '4. Check the restore', 1], ['s-4-1', '4.1 Checks', 2], ['s-4-2', '4.2 Common errors', 2]],
      html: `<div class="prose">
        <p class="lede">This procedure restores a production database from the latest full backup. Allow 30 to 45 minutes for a 50 GB database.</p>
        <section id="s-1" class="found-target"><h2>1. Prerequisites</h2><ul><li>SSH access to the restore server <code>pg-restore-01</code>.</li><li>The <code>dba</code> role on the target cluster.</li><li>A change ticket approved by the on-call team.</li></ul></section>
        <section id="s-2" class="found-target"><h2>2. Find the backup</h2><p>Full backups of the billing database are produced every night at 2 AM in <code>/backups/pg-prod/billing/</code>. Find the most recent one:</p><pre><code>ls -lh /backups/pg-prod/billing/ | tail -n 5</code></pre></section>
        <section id="s-3" class="found-target"><h2>3. Restore the database</h2><p>Create an empty database, then restore the backup with <code>pg_restore</code> and four parallel jobs (<code>--jobs=4</code>):</p><pre><code>createdb -U postgres billing_restore
pg_restore -U postgres -d billing_restore \\
  --jobs=4 --no-owner \\
  /backups/pg-prod/billing/billing_2026-11-10.dump</code></pre><p>With <code>--no-owner</code>, object ownership is not restored: the objects belong to the user who runs the restore.</p></section>
        <h2 id="s-4">4. Check the restore</h2>
        <section id="s-4-1" class="found-target"><h3>4.1 Checks</h3><p>Compare the row counts of the main tables with production before handing the database back to the teams:</p><pre><code>psql -U postgres -d billing_restore \\
  -c "SELECT count(*) FROM invoices;"</code></pre></section>
        <section id="s-4-2" class="found-target"><h3>4.2 Common errors</h3><p>Access rights (<code>GRANT</code>) always refer to the original roles. If <code>pg_restore</code> reports <code>ERROR: role "app_rw" does not exist</code>, the role does not exist on the target server: create it, then run the restore again.</p><pre><code>CREATE ROLE app_rw LOGIN;</code></pre><p>If the original rights are not needed on this server, run it again with the <code>--no-privileges</code> option instead.</p></section>
      </div>`
    };
  }
  function bodyIncident() {
    return {
      toc: [['i-resume', 'Summary', 1], ['i-impact', 'Impact', 1], ['i-chrono', 'Timeline', 1], ['i-cause', 'Cause', 1], ['i-resol', 'Resolution', 1], ['i-actions', 'Corrective actions', 1]],
      html: `<div class="prose">
        <table><tbody><tr><th>Date</th><td>November 2, 2026</td></tr><tr><th>Severity</th><td>Major</td></tr><tr><th>Duration</th><td>1 hr 48 min</td></tr><tr><th>Affected service</th><td>Billing</td></tr></tbody></table>
        <section id="i-resume" class="found-target"><h2>Summary</h2><p>On November 2, the data disk of pg-prod-02 filled up, which stopped invoicing for 1 hr 48 min.</p></section>
        <section id="i-impact" class="found-target"><h2>Impact</h2><p>No invoice could be issued between 2:05 PM and 3:53 PM. Pending invoices were issued automatically when service resumed.</p></section>
        <section id="i-chrono" class="found-target"><h2>Timeline</h2><ul>
          <li>8:10 AM: the NFS mount used to archive the WAL becomes unavailable; no alert is raised.</li>
          <li>2:05 PM: the disk of pg-prod-02 is full; the database switches to read-only.</li>
          <li>2:32 PM: the restore on pg-prod-03 fails with <code>pg_restore: error: role "reporting" does not exist</code>. The role had been deleted during the October 28 cleanup.</li>
          <li>2:50 PM: the role is created again and the restore restarted.</li>
          <li>3:20 PM: the NFS mount is back and the archived WAL files are purged.</li>
          <li>3:53 PM: back to normal; billing resumes on pg-prod-02.</li></ul></section>
        <section id="i-cause" class="found-target"><h2>Cause</h2><p>The transaction logs (WAL) had not been archived since the NFS mount failed: the disk of pg-prod-02 filled up in six hours.</p></section>
        <section id="i-resol" class="found-target"><h2>Resolution</h2><p>The service was brought back online after purging the archived WAL files and restoring the NFS mount. Total downtime: 1 hr 48 min.</p></section>
        <section id="i-actions" class="found-target"><h2>Corrective actions</h2><ul><li>Alert when WAL archiving fails (Christ Koffi, Nov 15).</li><li>Document how to recreate the roles in the restore runbook: done, see <a class="link" href="#/documents/restaurer-pg">version 4</a>.</li><li>Lower the disk alert threshold to 80% on the database servers.</li></ul></section>
      </div>`
    };
  }
  function bodyTls() {
    return {
      toc: [['t-1', '1. When to renew', 1], ['t-2', '2. Generate the certificates', 1], ['t-3', '3. Deploy and check', 1]],
      html: `<div class="prose">
        <p class="lede">Renewal of the internal services’ certificates. Draft in progress.</p>
        <section id="t-1" class="found-target"><h2>1. When to renew</h2><p>Internal certificates are issued by the <code>dadagroup-int-ca</code> authority and renewed every 90 days. An alert is sent 21 days before expiry.</p></section>
        <section id="t-2" class="found-target"><h2>2. Generate the certificates</h2><pre><code>step ca certificate api.billing.int api.crt api.key \\
  --not-after 2160h</code></pre></section>
        <section id="t-3" class="found-target"><h2>3. Deploy and check</h2><p>Deploy the certificate on both nodes of the service, reload the configuration, then check the expiry date being served.</p></section>
      </div>`
    };
  }
  function bodyBarman() {
    return {
      toc: [['b-1', 'How it works', 1], ['b-2', 'Manual restore', 1]],
      html: `<div class="prose">
        <section id="b-1" class="found-target"><h2>How it works</h2><p>Every night, Barman takes a full backup of the production databases and continuously archives the transaction logs.</p></section>
        <section id="b-2" class="found-target"><h2>Manual restore</h2><p>If <code>pg_restore</code> fails with <code>role "barman_ro" does not exist</code>, create the role again from the initialization script.</p><pre><code>barman recover pg-prod latest /var/lib/postgresql/16/main</code></pre></section>
      </div>`
    };
  }
  function bodyGeneric(d) {
    return {
      toc: d.passages.map((p) => [p.anchor, p.loc.replace(/^Section\s+/, ''), 1]),
      html: `<div class="prose"><div class="callout callout-mock" style="margin-bottom:16px">${ico('info')}<p>Simplified preview: the full content of this document is not reproduced in the demo.</p></div>
        ${d.passages.map((p) => `<section id="${p.anchor}" class="found-target"><h2>${esc(p.loc.replace(/^Section\s+/, ''))}</h2><p>${hl(p.text, [])}</p></section>`).join('')}</div>`
    };
  }
  function pdfViewer(d, page) {
    const pg = d.pages && d.pages[page];
    let inner;
    if (pg && pg.cover) inner = `<div class="pdf-page cover" id="page-${page}"${d.lang === 'fr' ? ' lang="fr"' : ''}><h3>${esc(pg.heading)}</h3><p>${esc(pg.sub)}</p></div>`;
    else if (pg) inner = `<div class="pdf-page found-target" id="page-${page}"${d.lang === 'fr' ? ' lang="fr"' : ''}><h3>${esc(pg.heading)}</h3>${pg.paras.map((x) => `<p>${esc(x)}</p>`).join('')}<div class="pdf-foot">${page}</div></div>`;
    else {
      let lines = '';
      for (let i = 0; i < 22; i++) lines += `<div class="skel" style="width:${60 + ((page * 7 + i * 13) % 38)}%"></div>`;
      inner = `<div class="pdf-page" id="page-${page}"><div class="skel" style="width:45%;height:12px;margin-bottom:18px"></div>${lines}<div class="pdf-foot">${page}</div></div>`;
    }
    return `<div class="pdf" id="pdf-viewer"><div class="pdf-bar">
        <div class="pager"><button class="icon-btn" type="button" data-action="pdf-page" data-doc="${d.id}" data-delta="-1" aria-label="Previous page"${page <= 1 ? ' disabled' : ''}>${ico('chevron-left')}</button><span>Page <b class="num">${page}</b> of ${d.pagesCount}</span><button class="icon-btn" type="button" data-action="pdf-page" data-doc="${d.id}" data-delta="1" aria-label="Next page"${page >= d.pagesCount ? ' disabled' : ''}>${ico('chevron-right')}</button></div>
        <div class="pager"><button class="icon-btn" type="button" data-mock="Zoom: not simulated." aria-label="Zoom out">−</button><span>100%</span><button class="icon-btn" type="button" data-mock="Zoom: not simulated." aria-label="Zoom in">+</button></div>
      </div><div class="pdf-stage">${inner}</div></div>`;
  }
  function scanViewer() {
    const racks = [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${70 + i * 78}" y="150" width="58" height="150" fill="none" stroke="#27324A" stroke-width="2.2" rx="2"/><text x="${99 + i * 78}" y="322" font-size="15" text-anchor="middle" fill="#27324A" font-family="Comic Sans MS, Segoe Print, cursive">B${i + 1}</text><path d="M${99 + i * 78} 150 L${99 + i * 78} 112 L300 112" fill="none" stroke="#27324A" stroke-width="1.6"/>`).join('');
    return `<div class="pdf"><div class="pdf-bar"><div class="pager"><button class="icon-btn" type="button" disabled aria-label="Previous page">${ico('chevron-left')}</button><span>Page <b class="num">1</b> of 4</span><button class="icon-btn" type="button" data-mock="Next pages: not simulated." aria-label="Next page">${ico('chevron-right')}</button></div><span>Scanned image, no text layer</span></div>
      <div class="pdf-stage"><div class="scan-page"><svg viewBox="0 0 600 424" role="img" aria-label="Scanned handwritten diagram: six racks linked to the network core">
        <text x="40" y="52" font-size="22" fill="#27324A" font-family="Comic Sans MS, Segoe Print, cursive">Room B, racks and cabling</text>
        <rect x="250" y="70" width="100" height="40" fill="none" stroke="#27324A" stroke-width="2.2" rx="3"/><text x="300" y="95" font-size="13" text-anchor="middle" fill="#27324A" font-family="Comic Sans MS, Segoe Print, cursive">Network core</text>
        ${racks}
        <text x="40" y="380" font-size="13" fill="#27324A" font-family="Comic Sans MS, Segoe Print, cursive">OM4 fiber between B3 and B4, to redo. Updated by E.Y.</text>
      </svg></div></div></div>`;
  }
  function renderBody(d, p) {
    if (d.body === 'restaurer') return bodyRestaurer();
    if (d.body === 'incident') return bodyIncident();
    if (d.body === 'tls') return bodyTls();
    if (d.body === 'barman') return bodyBarman();
    if (d.body === 'pdf') {
      const anchor = p.get('anchor') || '';
      const fromAnchor = /^page-(\d+)$/.test(anchor) ? parseInt(anchor.slice(5), 10) : null;
      const page = fromAnchor || state.pdfPage[d.id] || 1;
      state.pdfPage[d.id] = page;
      return { toc: null, html: pdfViewer(d, page) };
    }
    if (d.body === 'scan') return { toc: null, html: scanViewer(d) };
    return bodyGeneric(d);
  }

  function docActivity(d) {
    const items = d.versions.map((v) => `<li>${avatar(v.by)}<span><b>${esc(person(v.by).name)}</b> imported version ${v.n}<time>${esc(v.date)}</time></span></li>`);
    if (d.status === 'obsolete') items.unshift(`<li>${avatar('hc')}<span><b>Hervé Coulibaly</b> marked the document as outdated<time>${esc(d.obsoleteSince)}</time></span></li>`);
    if (d.restricted) items.unshift(`<li>${avatar('as')}<span><b>Amenan Souaga</b> restricted access to 2 people<time>Nov 11, 2026</time></span></li>`);
    if (d.id === 'restaurer-pg') items.unshift(`<li>${avatar('eb')}<span><b>Eli Brou</b> viewed the document<time>Today</time></span></li>`);
    return `<section class="activity"><h2 class="section-title">Activity</h2><ol>${items.join('')}</ol></section>`;
  }

  function screenDocument(m, p) {
    const d = docById(m[1]);
    if (!d) return screen404();
    const s = spaceById(d.space);
    const from = p.get('from');
    const q = p.get('q') || '';
    const anchor = p.get('anchor') || '';
    const body = renderBody(d, p);
    const passage = d.passages.find((x) => x.anchor === anchor);
    const banners = [];
    if ((from === 'search' || from === 'assistant') && anchor) {
      const what = from === 'assistant' ? 'Passage cited by the assistant' : `Passage found for <q>${esc(q)}</q>`;
      banners.push(`<div class="callout callout-found">${ico('highlight')}<p>${what}${passage ? ', ' + esc(passage.loc) : ''}. It is highlighted below.</p><a class="btn" href="${from === 'assistant' ? '#/assistant/c1' : '#/search?q=' + enc(q)}">${from === 'assistant' ? 'Back to the answer' : 'Back to the results'}</a></div>`);
    }
    if (d.status === 'obsolete') {
      const r = docById(d.replacedBy);
      banners.push(`<div class="callout callout-warn">${ico('alert')}<p>This document has been outdated since ${esc(d.obsoleteSince)}. Use <a class="link" href="#/documents/${r.id}">${esc(r.title)}</a> instead.</p></div>`);
    }
    if (d.flags && d.flags.scanned) banners.push(`<div class="callout callout-warn">${ico('scan')}<p>Scanned document: its content is not searchable. Only its title, description and metadata are.</p><button class="btn" type="button" data-mock="Adding a description: not simulated.">Add a description</button></div>`);
    if (d.flags && d.flags.indexing) banners.push(`<div class="callout">${ico('spinner', 'spin')}<p>Text extraction in progress: this document will appear in search results in a few moments.</p></div>`);

    const members = D.spaceMembers[d.space] || [];
    const access = d.restricted
      ? `<p class="access-note">Restricted access: only these people, the space owners and the administrators see this document.</p>${d.grants.map((g) => `<div class="grant">${avatar(g)}${esc(person(g).name)}</div>`).join('')}<button class="btn" type="button" data-action="open" data-overlay="access" data-params="doc=${d.id}" style="margin-top:8px">${ico('lock')}Change access</button>`
      : `<p class="access-note">Visible to ${members.length ? 'the ' + members.length + ' members' : 'the members'} of the ${esc(s.name)} space.</p><button class="btn" type="button" data-action="open" data-overlay="access" data-params="doc=${d.id}">${ico('lock')}Restrict access</button>`;
    const fmt = d.format === 'PDF' ? `PDF, ${d.pagesCount} pages, ${d.size}` : `${d.format}, ${d.size}`;
    const props = `<aside class="props" aria-label="Document properties">
      <section><h2>Properties</h2><dl>
        <div class="prop"><dt>Status</dt><dd><button class="prop-val" type="button" data-action="open" data-overlay="status" data-params="doc=${d.id}">${status(d.status)}</button></dd></div>
        <div class="prop"><dt>Owner</dt><dd><button class="prop-val" type="button" data-mock="Changing the owner: not simulated.">${who(d.owner)}</button></dd></div>
        <div class="prop"><dt>Category</dt><dd><button class="prop-val" type="button" data-mock="Changing the category: not simulated.">${catPill(d.category)}</button></dd></div>
        <div class="prop"><dt>Space</dt><dd><a class="prop-val" href="#/spaces/${s.id}">${spaceIco(s)}${esc(s.name)}</a></dd></div>
        <div class="prop"><dt>Folder</dt><dd><a class="prop-val" href="#/spaces/${s.id}?folder=${d.folder}">${ico('folder')}${esc(folderName(d))}</a></dd></div>
        <div class="prop"><dt>Language</dt><dd><button class="prop-val" type="button" data-mock="Changing the language indexes the document again, so that search takes the new language into account.">${LANG[d.lang]}</button></dd></div>
        <div class="prop"><dt>Format</dt><dd><span class="prop-val prop-static">${esc(fmt)}</span></dd></div>
        <div class="prop"><dt>Indexing</dt><dd><span class="prop-val prop-static">${indexPill(d)}</span></dd></div>
        <div class="prop"><dt>Next review</dt><dd><span class="prop-val prop-static">${esc(d.review)} ${vb('v0.2')}</span></dd></div>
      </dl></section>
      <section><h2>Access</h2>${access}</section>
      <section><h2>Versions</h2>${strata(d)}</section>
      ${body.toc ? `<section><h2>On this page</h2><ul class="toc">${body.toc.map(([id, label, lvl]) => `<li${lvl > 1 ? ' class="sub"' : ''}><a href="#${id}" data-action="anchor" data-target="${id}"${id === anchor ? ' class="is-found"' : ''}>${esc(label)}</a></li>`).join('')}</ul></section>` : ''}
    </aside>`;

    const menu = `<div class="menu"><button class="icon-btn" type="button" data-action="menu" aria-expanded="false" aria-label="More actions">${ico('dots')}</button>
      <div class="popover popover-right" hidden>
        <button class="menu-item" type="button" data-action="open" data-overlay="status" data-params="doc=${d.id}">${stIcon(d.status)}Change the status</button>
        <button class="menu-item" type="button" data-action="open" data-overlay="access" data-params="doc=${d.id}">${ico('lock')}Manage access</button>
        <button class="menu-item" type="button" data-mock="Moving: not simulated.">${ico('folder')}Move</button>
        <a class="menu-item" href="#/knowledge/new?from=document&doc=${d.id}">${ico('book')}Create an article from the document ${vb('v0.2')}</a>
        <button class="menu-item" type="button" data-mock="Link copied.">${ico('link')}Copy the link</button>
        <div class="menu-sep"></div>
        <button class="menu-item" type="button" data-mock="Archiving: not simulated.">${ico('archive')}Archive</button>
        <button class="menu-item danger" type="button" data-mock="Deleting: not simulated.">${ico('trash')}Delete</button>
      </div></div>`;

    return {
      nav: 'space:' + s.id + ':docs', title: d.title,
      crumbs: crumbs([{ label: s.name, href: '#/spaces/' + s.id, pre: spaceIco(s) }, { label: folderName(d), href: '#/spaces/' + s.id + '?folder=' + d.folder }, { label: d.title }]),
      actions: `<button class="icon-btn" type="button" data-mock="Downloading the original: not simulated." aria-label="Download the original" title="Download the original">${ico('download')}</button><button class="btn" type="button" data-action="open" data-overlay="version" data-params="doc=${d.id}">${ico('upload')}<span class="btn-label">New version</span></button>${menu}${panelBtn('props', 'the properties', 'sidebar-right', ']')}`,
      html: `<div class="doc-view"><div class="doc-main"><div class="doc-inner">
          ${banners.join('')}
          <h1 class="doc-title"${d.lang === 'fr' ? ' lang="fr"' : ''}>${esc(d.title)}</h1>
          <div class="doc-sub">${status(d.status)}<span>Version ${d.version}</span><span>Updated ${esc(d.updatedRel)} by ${esc(person(d.versions[0].by).name)}</span>${d.restricted ? `<span class="status">${ico('lock')}Restricted access</span>` : ''}${d.lang === 'fr' ? '<span class="tag-lang">FR</span>' : ''}</div>
          <div style="margin-top:10px">${body.html}</div>
          ${docActivity(d)}
        </div></div>${props}</div>`,
      after() {
        if (!anchor) return;
        const el = document.getElementById(anchor);
        if (!el) return;
        if (from === 'search' || from === 'assistant') {
          el.classList.add('is-found');
          highlightIn(el, flatTerms(q));
        }
        requestAnimationFrame(() => el.scrollIntoView({ block: 'center' }));
      }
    };
  }

  /* =========================================================
     Search
     ========================================================= */
  const FACETS = {
    space: { label: 'Space', get: (d) => spaceById(d.space).name },
    category: { label: 'Category', get: (d) => d.category },
    status: { label: 'Status', get: (d) => ST[d.status].label }
  };
  const dateOk = (d) => state.date === 'all' || d.age <= parseInt(state.date, 10);

  function screenSearch(m, p) {
    const q = (p.get('q') || '').trim();
    const mode = p.get('mode') === 'semantic' ? 'semantic' : 'keywords';
    if (q !== state.lastQ) { state.ex = { space: new Set(), category: new Set(), status: new Set() }; state.date = 'all'; state.lastQ = q; }
    const seg = `<div class="seg" role="group" aria-label="Type of search"><a href="#/search${mode === 'semantic' ? '?q=' + enc(DEFAULT_Q) : q ? '?q=' + enc(q) : ''}"${mode === 'keywords' ? ' aria-current="page"' : ''}>Keywords</a><a href="#/search?mode=semantic&q=${enc(D.semantic.question)}"${mode === 'semantic' ? ' aria-current="page"' : ''}>Keywords and meaning ${vb('v0.2')}</a></div>`;
    const head = `<div class="search-head"><h1 class="sr-only">Search</h1>
      <form class="search-box" role="search" data-form="search">${ico('search')}<label class="sr-only" for="sq">Search your documents</label><input id="sq" name="q" type="search" value="${esc(q)}" placeholder="Search your documents" autocomplete="off">${mode === 'semantic' ? '<input type="hidden" name="mode" value="semantic">' : ''}<button class="btn btn-primary" type="submit">Search</button></form>
      <div class="chips">${seg}${mode === 'keywords' && q ? '<span id="chips" style="display:contents"></span>' : ''}<span style="flex:1"></span>${q ? `<a class="btn" href="#/assistant?q=${enc(q)}">${ico('ask')}<span class="btn-label">Ask the assistant</span>${vb('v0.3')}</a>` : ''}</div></div>`;
    const base = { nav: 'search', title: q ? 'Search: ' + q : 'Search', crumbs: crumbs([{ label: 'Search' }]) };

    if (!q) {
      const recent = [DEFAULT_Q, 'kubernetes failover', 'ceph quota', 'certificate -vpn'];
      base.html = `${head}<div class="results"><div class="home" style="margin-top:24px">
        <section><h2 class="section-title">Recent searches</h2><ul class="list">${recent.map((r) => `<li><a class="list-row" href="#/search?q=${enc(r)}">${ico('clock')}<div class="list-main"><div class="list-title" style="font-family:var(--mono);font-size:13px">${esc(r)}</div></div>${ico('chevron-right')}</a></li>`).join('')}</ul></section>
        <section><h2 class="section-title">Syntax</h2><div class="syntax">
          <code>"does not exist"</code><span>Exact phrase</span>
          <code>-barman</code><span>Exclude a word</span>
          <code>pg_restore or pg_dump</code><span>Either one</span>
          <code>ERR_CONNECTION_REFUSED</code><span>Technical identifiers are found as they are</span>
          <code>role</code><span>Accents and case are ignored: also finds “Role”</span>
        </div></section></div></div>`;
      base.title = 'Search';
      return base;
    }

    if (mode === 'semantic') {
      const items = D.semantic.results.map((r) => {
        const d = docById(r.doc);
        const pass = d.passages.find((x) => x.anchor === r.anchor) || d.passages[0];
        return `<article class="result">${ico(fmtIco(d))}<div class="result-body"><a class="result-title" href="#/documents/${d.id}?from=search&q=${enc(q)}&anchor=${r.anchor}">${esc(d.title)}</a>
          <div class="result-where"><span>${esc(spaceById(d.space).name)} › ${esc(folderName(d))}</span><span>${esc(pass.loc)}</span>${pill(r.both ? 'Keywords and meaning' : 'Close in meaning', r.both ? 'p-purple' : 'p-blue')}</div>
          <p class="why">${esc(r.why)}</p><p class="excerpt">${hl(pass.text, [])}</p>
          <div class="result-meta">${status(d.status)}<span>Version ${d.version}</span><span>Updated ${esc(d.updatedRel)}</span></div></div></article>`;
      }).join('');
      base.html = `${head}<div class="results"><div class="callout" style="margin-top:16px">${ico('info')}<p>Preview of v0.2: search combines exact word matching and closeness in meaning. The results below are examples for the question asked.</p></div>
        <div class="results-meta"><span>4 documents close to your question</span></div>${items}</div>`;
      return base;
    }

    base.html = `${head}<div class="results" id="results"></div>`;
    base.after = () => { renderChips(); renderList(); };
    return base;
  }

  function renderChips() {
    const host = $('#chips');
    if (!host) return;
    const all = computeResults(state.lastQ);
    if (!all.length) { host.innerHTML = ''; return; }
    let html = '';
    Object.keys(FACETS).forEach((k) => {
      const counts = {};
      all.forEach((r) => { const v = FACETS[k].get(r.doc); counts[v] = (counts[v] || 0) + 1; });
      html += `<div class="chip menu"><button class="chip-btn" type="button" data-action="menu" data-chip="${k}" aria-expanded="false"></button><div class="popover" hidden>${Object.entries(counts).map(([v, c]) => `<label class="check"><input type="checkbox" data-facet="${k}" value="${esc(v)}"${state.ex[k].has(v) ? '' : ' checked'}>${esc(v)}<span class="count">${c}</span></label>`).join('')}</div></div>`;
    });
    const dates = [['all', 'Any time'], ['30', 'Last 30 days'], ['365', 'Last 12 months']];
    html += `<div class="chip menu"><button class="chip-btn" type="button" data-action="menu" data-chip="date" aria-expanded="false"></button><div class="popover" hidden>${dates.map(([v, l]) => `<label class="check"><input type="radio" name="sdate" data-date value="${v}"${state.date === v ? ' checked' : ''}>${l}</label>`).join('')}</div></div>`;
    host.innerHTML = fr(html);
    updateChipLabels(all);
  }
  function updateChipLabels(all) {
    all = all || computeResults(state.lastQ);
    Object.keys(FACETS).forEach((k) => {
      const btn = $(`[data-chip="${k}"]`);
      if (!btn) return;
      const values = new Set(all.map((r) => FACETS[k].get(r.doc)));
      const ex = [...state.ex[k]].filter((v) => values.has(v)).length;
      btn.classList.toggle('is-set', ex > 0);
      btn.innerHTML = fr(`${FACETS[k].label}${ex ? ': ' + (values.size - ex) + ' of ' + values.size : ''}${ico('chevron')}`);
    });
    const db = $('[data-chip="date"]');
    if (db) {
      db.classList.toggle('is-set', state.date !== 'all');
      db.innerHTML = fr(`${state.date === 'all' ? 'Date' : state.date === '30' ? 'Last 30 days' : 'Last 12 months'}${ico('chevron')}`);
    }
  }
  function renderList() {
    const host = $('#results');
    if (!host) return;
    const q = state.lastQ;
    const terms = flatTerms(q);
    const all = computeResults(q);
    if (!all.length) {
      host.innerHTML = fr(`<div class="empty">${ico('search')}<h2>No document matches “${esc(q)}”</h2><p>Check the spelling of identifiers, remove a word or the quotation marks. Scanned documents are only searchable by their title.</p>
        <div class="actions"><a class="btn" href="#/search?mode=semantic&q=${enc(D.semantic.question)}">Search by meaning ${vb('v0.2')}</a><a class="btn" href="#/assistant?q=${enc(q)}">${ico('ask')}Ask the assistant ${vb('v0.3')}</a></div>
        <p class="help">Searches without results are counted in the dashboard to spot documentation gaps. ${vb('v0.2')}</p></div>`);
      return;
    }
    const visible = all.filter((r) => Object.keys(FACETS).every((k) => !state.ex[k].has(FACETS[k].get(r.doc))) && dateOk(r.doc));
    const items = visible.map((r) => {
      const d = r.doc;
      const s = spaceById(d.space);
      const best = r.matches[0];
      const href = `#/documents/${d.id}?from=search&q=${enc(q)}${best ? '&anchor=' + best.anchor : ''}`;
      const excerpt = best ? `<p class="excerpt">… ${hl(best.text, terms)} …</p>` : `<p class="excerpt excerpt-meta">${d.flags && d.flags.scanned ? 'Scanned document: only its title matches.' : 'Match in the title.'}</p>`;
      const others = r.matches.slice(1);
      return `<article class="result${d.status === 'obsolete' ? ' is-obsolete' : ''}">${ico(fmtIco(d))}<div class="result-body">
        <a class="result-title" href="${href}"${d.lang === 'fr' ? ' lang="fr"' : ''}>${markText(d.title, terms)}</a>
        <div class="result-where"><span>${esc(s.name)} › ${esc(folderName(d))}</span>${best ? `<span>${esc(best.loc)}</span>` : ''}${catPill(d.category)}</div>
        ${excerpt}
        <div class="result-meta">${status(d.status)}<span>Version ${d.version}</span><span>Updated ${esc(d.updatedRel)}</span>${d.status === 'obsolete' && d.replacedBy ? `<span>Replaced by <a class="link" href="#/documents/${d.replacedBy}">${esc(docById(d.replacedBy).title)}</a></span>` : ''}${d.restricted ? `<span class="status">${ico('lock')}Restricted access</span>` : ''}</div>
        ${others.length ? `<div class="more"><button class="link" type="button" data-action="toggle" data-target="more-${d.id}" aria-expanded="false" style="font-size:12.5px">${others.length} other passage${others.length > 1 ? 's' : ''} in this document</button><ul id="more-${d.id}" hidden>${others.map((x) => `<li><a href="#/documents/${d.id}?from=search&q=${enc(q)}&anchor=${x.anchor}">${esc(x.loc)}</a></li>`).join('')}</ul></div>` : ''}
      </div></article>`;
    }).join('');
    host.innerHTML = fr(`<div class="results-meta"><span>${visible.length} document${visible.length === 1 ? '' : 's'}${visible.length < all.length ? ' of ' + all.length : ''}</span><span>Sorted by relevance. Outdated documents come last.</span></div>
      ${items || `<p class="help" style="padding:16px 0">No results with these filters.</p>`}
      <ul class="notes"><li>${ico('lock')}Only the documents you have access to appear.</li><li>${ico('scan')}Scanned documents are only searchable by their title and metadata.</li></ul>`);
    updateChipLabels(all);
  }

  /* =========================================================
     Members and settings of a space
     ========================================================= */
  function roleCell(role, roles) {
    return `<div class="menu"><button class="pill ${ROLE[role]}" type="button" data-action="menu" aria-expanded="false" style="border:0;cursor:pointer">${esc(role)}${ico('chevron')}</button><div class="popover" hidden>${roles.map((r) => `<button class="menu-item" type="button" data-action="set-role" data-role="${r}">${pill(r, ROLE[r])}</button>`).join('')}</div></div>`;
  }

  function invitePanel(roles, def) {
    return `<div class="set-box" id="invite-panel" hidden style="margin:0 0 16px;padding:16px">
      <h3 style="font-size:14px">Invite with a link</h3><p class="help" style="margin:2px 0 12px">Create a link and pass it on yourself, by chat or by e-mail. No mail server is needed.</p>
      <div class="target-chips"><label class="help" for="inv-role">Role</label><select class="select select-sm" id="inv-role">${roles.map((r) => `<option${r === def ? ' selected' : ''}>${r}</option>`).join('')}</select><button class="btn" type="button" data-action="invite-create">${ico('link')}Create the link</button></div>
      <div id="invite-result" hidden style="margin-top:12px"><div class="target-chips"><label class="sr-only" for="inv-url">Invitation link</label><input class="input input-mono" id="inv-url" readonly value="${D.org.url}/join#K7q2-vX9m-4TzR" style="flex:1;min-width:220px"><button class="btn" type="button" data-action="copy" data-target="inv-url">${ico('copy')}Copy</button></div><p class="help" style="margin-top:6px">This link works only once and expires in 7 days.</p></div>
    </div>`;
  }

  function screenSpaceMembers(m) {
    const s = spaceById(m[1]);
    if (!s) return screen404();
    const list = D.spaceMembers[s.id] || [{ id: 'as', role: 'Owner', added: 'Nov 11, 2026' }];
    const roles = ['Reader', 'Contributor', 'Owner'];
    const rows = list.map((x, i) => `<tr><td class="rn">${i + 1}</td><td class="primary"><span class="who">${avatar(x.id)}${esc(person(x.id).name)}</span></td><td>${esc(person(x.id).email)}</td><td style="overflow:visible">${roleCell(x.role, roles)}</td><td>${esc(x.added)}</td><td><button class="btn btn-ghost" type="button" data-mock="Removing a member: not simulated.">Remove</button></td></tr>`).join('');
    const restricted = D.docs.filter((d) => d.space === s.id && d.restricted);
    return {
      nav: 'space:' + s.id + ':members', title: s.name + ': members',
      crumbs: spaceCrumbs(s, 'Members'),
      actions: `<button class="btn btn-primary" type="button" data-action="toggle" data-target="invite-panel" aria-expanded="false">${ico('plus')}<span class="btn-label">Invite</span></button>`,
      html: `<div class="pad"><div class="stack" style="max-width:1040px;gap:0">
        <div><h1 class="page-title">Members of ${esc(s.name)}</h1><p class="page-intro" style="margin-bottom:18px">${list.length} members. The organization’s administrators can also access the whole space.</p>
          ${invitePanel(roles, 'Contributor')}
          <div class="set-box" style="overflow:hidden"><div class="grid-wrap"><table class="grid" style="min-width:680px"><thead><tr><th class="rn"></th><th class="primary"><span class="th">${ico('user')}Member</span></th><th><span class="th">${ico('mail')}E-mail</span></th><th><span class="th">${ico('tag')}Role</span></th><th><span class="th">${ico('calendar')}Added on</span></th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>
          <section style="margin-top:28px"><h2 class="section-title">Restricted documents in this space <span class="muted">${restricted.length}</span></h2>
            ${restricted.length ? `<ul class="list">${restricted.map((d) => `<li><a class="list-row" href="#/documents/${d.id}">${ico('lock')}<div class="list-main"><div class="list-title">${esc(d.title)}</div><div class="list-sub">Visible to ${d.grants.map((g) => esc(person(g).name)).join(' and ')}, as well as the space owners and the administrators</div></div>${ico('chevron-right')}</a></li>`).join('')}</ul>` : '<p class="help">No restricted documents.</p>'}
          </section>
        </div>
        <section style="margin-top:28px"><h2 class="section-title">What each role can do</h2>
          <dl class="roles">
            <div><dt>${pill('Reader', ROLE.Reader)}</dt><dd>Reads, searches and downloads the documents of the space.</dd></div>
            <div><dt>${pill('Contributor', ROLE.Contributor)}</dt><dd>Imports documents, edits them and creates new versions.</dd></div>
            <div><dt>${pill('Owner', ROLE.Owner)}</dt><dd>Also manages the members, archives and deletes. Sees the restricted documents of the space.</dd></div>
          </dl>
          <p class="help" style="margin-top:10px">To keep a document from the space owners too, put it in a dedicated space with hand-picked members.</p>
        </section>
      </div></div>`
    };
  }

  function screenSpaceSettings(m) {
    const s = spaceById(m[1]);
    if (!s) return screen404();
    return {
      nav: 'space:' + s.id + ':settings', title: s.name + ': settings',
      crumbs: spaceCrumbs(s, 'Settings'),
      html: `<div class="pad"><div class="settings-inner">
        <h1 class="page-title">Space settings</h1>
        <form class="set-sec" data-form="save"><h2>General</h2><div class="set-box">
          <div class="set-row"><div class="lbl"><strong>Name</strong></div><div class="ctl"><input class="input" value="${esc(s.name)}" aria-label="Space name"></div></div>
          <div class="set-row"><div class="lbl"><strong>Description</strong><p class="help">Shown at the top of the library.</p></div><div class="ctl"><input class="input" value="${esc(s.desc)}" aria-label="Description"></div></div>
          <div class="set-row"><div class="lbl"><strong>Address</strong><p class="help">${D.org.url}/spaces/${s.id}</p></div><div class="ctl"><input class="input input-mono" value="${s.id}" aria-label="Space address"></div></div>
          <div class="set-row"><div class="lbl"><strong>Color</strong></div><div class="ctl">${spaceIco(s, true)}<button class="btn" type="button" data-mock="Choosing the color: not simulated.">Change</button></div></div>
        </div><div style="margin-top:12px"><button class="btn btn-primary" type="submit">Save</button></div></form>
        <section class="set-sec"><h2>Danger zone</h2><div class="set-box danger-box">
          <div class="set-row"><div class="lbl"><strong>Archive the space</strong><p class="help">The space owners can still read the documents, but they disappear from navigation and search.</p></div><div class="ctl"><button class="btn" type="button" data-mock="Archiving: not simulated.">${ico('archive')}Archive</button></div></div>
          <div class="set-row"><div class="lbl"><strong>Delete the space</strong><p class="help">Permanently deletes its ${s.docs} documents, their versions and their files.</p></div><div class="ctl"><button class="btn btn-danger" type="button" data-action="open" data-overlay="delete-space" data-params="space=${s.id}">${ico('trash')}Delete</button></div></div>
        </div></section>
      </div></div>`
    };
  }

  /* =========================================================
     Settings: account and administration
     ========================================================= */
  function settingsNav(active) {
    const l = (href, key, icon, label, extra) => `<a class="nav-link" href="${href}"${active === key ? ' aria-current="page"' : ''}>${ico(icon)}<span class="label">${label}</span>${extra || ''}</a>`;
    return `<nav class="settings-nav" aria-label="Settings">
      <h2>My account</h2>${l('#/account', 'account', 'user', 'Profile and preferences')}
      <h2>Organization</h2>
      ${l('#/admin/general', 'general', 'settings', 'General')}
      ${l('#/admin/members', 'members', 'users', 'Members')}
      ${l('#/admin/security', 'security', 'shield', 'Security and sign-in')}
      ${l('#/admin/storage', 'storage', 'database', 'Storage and import')}
      ${l('#/admin/audit', 'audit', 'list', 'Audit log')}
      ${l('#/admin/assistant', 'assistant', 'ask', 'Assistant', vb('v0.3'))}
      ${l('#/sources', 'sources', 'plug', 'Connected sources', vb('Later'))}
    </nav>`;
  }
  function settingsPage(key, title, inner, opts) {
    opts = opts || {};
    return {
      nav: opts.nav || 'admin', title,
      crumbs: crumbs([{ label: key === 'account' ? 'My account' : 'Administration', href: key === 'account' ? '#/account' : '#/admin/general' }, { label: title, badge: opts.badge || '' }]),
      actions: panelBtn('settings', 'the settings menu', 'sidebar-left') + (opts.actions || ''),
      html: `<div class="settings">${settingsNav(key)}<div class="settings-main"><div class="settings-inner"${opts.wide ? ' style="max-width:none"' : ''}><h1 class="page-title">${esc(title)}</h1>${opts.intro ? `<p class="page-intro">${opts.intro}</p>` : ''}${inner}</div></div></div>`,
      after: opts.after
    };
  }
  const row = (label, help, ctl, extra) => `<div class="set-row"><div class="lbl"><strong>${label}${extra || ''}</strong>${help ? `<p class="help">${help}</p>` : ''}</div><div class="ctl">${ctl}</div></div>`;
  const sw = (on, dis, label) => `<label class="switch"><input class="sw" type="checkbox"${on ? ' checked' : ''}${dis ? ' disabled' : ''} aria-label="${label}"></label>`;

  function screenAccount() {
    return settingsPage('account', 'Profile and preferences', `
      <form class="set-sec" data-form="save"><h2>Profile</h2><div class="set-box">
        ${row('Photo', '', `${avatar('as', true)}<button class="btn" type="button" data-mock="Uploading a photo: not simulated.">Change</button>`)}
        ${row('Full name', '', '<input class="input" value="Amenan Souaga" aria-label="Full name">')}
        ${row('E-mail', 'Used to sign in.', '<input class="input" value="amenan.souaga@dada.group" aria-label="E-mail">')}
      </div><div style="margin-top:12px"><button class="btn btn-primary" type="submit">Save</button></div></form>
      <section class="set-sec"><h2>Preferences</h2><div class="set-box">
        ${row('Interface language', '', '<select class="select" aria-label="Interface language"><option>English</option><option>Français</option></select>')}
        ${row('Theme', 'Follows your system setting by default.', '<select class="select" data-theme-select aria-label="Theme"><option value="auto">System</option><option value="light">Light</option><option value="dark">Dark</option></select>')}
      </div></section>
      <form class="set-sec" data-form="save"><h2>Password</h2><div class="set-box">
        ${row('Current password', '', '<input class="input" type="password" aria-label="Current password">')}
        ${row('New password', 'At least 12 characters.', '<input class="input" type="password" aria-label="New password">')}
      </div><div style="margin-top:12px"><button class="btn" type="submit">Change the password</button></div></form>
      <section class="set-sec"><h2>Open sessions</h2><div class="set-box">
        ${row('Chrome on Windows', 'This session, Abidjan, active now.', pill('This session', 'p-green'))}
        ${row('Firefox on Ubuntu', 'Opened 2 days ago.', '<button class="btn" type="button" data-mock="Session closed.">Sign out</button>')}
      </div><div style="margin-top:12px"><button class="btn" type="button" data-mock="All the other sessions are closed.">Sign out of all other sessions</button></div></section>`,
      { nav: 'account' });
  }

  function screenAdmin(m) {
    const k = m[1];
    if (k === 'general') {
      return settingsPage('general', 'General', `
        <form class="set-sec" data-form="save"><h2>Organization</h2><div class="set-box">
          ${row('Name', '', `<input class="input" value="${esc(D.org.name)}" aria-label="Organization name">`)}
          ${row('Public address', 'Used in invitation and reset links.', `<input class="input input-mono" value="${D.org.url}" aria-label="Public address">`)}
          ${row('Default language', 'For new accounts.', '<select class="select" aria-label="Default language"><option>English</option><option>Français</option></select>')}
          ${row('Time zone', '', '<select class="select" aria-label="Time zone"><option>GMT (UTC)</option><option>Europe/London</option></select>')}
        </div><div style="margin-top:12px"><button class="btn btn-primary" type="submit">Save</button></div></form>
        <section class="set-sec"><h2>Modules</h2><p class="help">Lore works fully without these modules.</p><div class="set-box">
          ${row('Search by meaning', 'Combines exact word matching and closeness in meaning.', sw(false, true, 'Search by meaning'), vb('v0.2'))}
          ${row('Assistant', 'Off by default. Requires a language model approved by the organization.', `${sw(false, true, 'Assistant')}<a class="btn" href="#/admin/assistant">Configure</a>`, vb('v0.3'))}
        </div></section>`);
    }
    if (k === 'members') {
      const roles = ['Member', 'Administrator', 'Owner'];
      const rows = D.orgMembers.map((x, i) => `<tr><td class="rn">${i + 1}</td><td class="primary"><span class="who">${avatar(x.id)}${esc(person(x.id).name)}</span></td><td>${esc(person(x.id).email)}</td><td style="overflow:visible">${roleCell(x.role, roles)}</td><td>${pill(x.state, STATE[x.state])}</td><td>${esc(x.spaces)}</td><td>${esc(x.last)}</td>
        <td style="overflow:visible"><div class="menu"><button class="icon-btn" type="button" data-action="menu" aria-expanded="false" aria-label="Actions for ${esc(person(x.id).name)}">${ico('dots')}</button><div class="popover popover-right" hidden>
          <button class="menu-item" type="button" data-action="open" data-overlay="reset-link" data-params="for=${x.id}">${ico('key')}Create a reset link</button>
          <button class="menu-item" type="button" data-mock="Disabling: not simulated.">${ico('x')}Disable the account</button>
          <div class="menu-sep"></div><button class="menu-item danger" type="button" data-mock="Removing: not simulated.">${ico('trash')}Remove from the organization</button></div></div></td></tr>`).join('');
      return settingsPage('members', 'Members', `
        <div class="row-between" style="margin-top:20px"><div class="search-box" style="height:34px;max-width:300px;flex:1">${ico('search')}<input placeholder="Search for a member" aria-label="Search for a member"></div><button class="btn btn-primary" type="button" data-action="open" data-overlay="invite">${ico('plus')}Invite</button></div>
        <div class="set-box" style="overflow:hidden"><div class="grid-wrap"><table class="grid" style="min-width:900px"><thead><tr><th class="rn"></th><th class="primary"><span class="th">${ico('user')}Member</span></th><th><span class="th">${ico('mail')}E-mail</span></th><th><span class="th">${ico('tag')}Role</span></th><th><span class="th">${ico('tag')}State</span></th><th><span class="th">${ico('grid')}Spaces</span></th><th><span class="th">${ico('clock')}Last sign-in</span></th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
        <div class="grid-foot" style="border-bottom:0"><span>Showing 6 of ${D.org.members} members</span></div></div>`,
        { wide: true, intro: `${D.org.members} members. Owners and administrators can access every space.` });
    }
    if (k === 'security') {
      return settingsPage('security', 'Security and sign-in', `
        <form class="set-sec" data-form="save"><h2>Passwords and sessions</h2><div class="set-box">
          ${row('Minimum length', 'Passwords are hashed with Argon2id.', '<input class="input" type="number" value="12" aria-label="Minimum length" style="width:90px"> characters')}
          ${row('Attempts before lockout', '', '<input class="input" type="number" value="5" aria-label="Attempts before lockout" style="width:90px">')}
          ${row('Lockout duration', '', '<select class="select" aria-label="Lockout duration"><option>15 minutes</option><option>1 hour</option></select>')}
          ${row('Expiry after inactivity', '', '<select class="select" aria-label="Expiry after inactivity"><option>8 hours</option><option>24 hours</option><option>7 days</option></select>')}
          ${row('Invitation link validity', '', '<select class="select" aria-label="Invitation link validity"><option>7 days</option><option>48 hours</option><option>30 days</option></select>')}
        </div><div style="margin-top:12px"><button class="btn btn-primary" type="submit">Save</button></div></form>
        <section class="set-sec"><h2 style="display:flex;align-items:center;gap:8px">Identity provider ${vb('After v0.1')}</h2><p class="help">Sign-in with the company account through OpenID Connect: Keycloak, Authentik, Google, GitLab, Entra ID… Included in the Community edition.</p><div class="set-box">
          ${row('Enable OpenID Connect', '', sw(false, true, 'Enable OpenID Connect'))}
          ${row('Issuer URL', '', '<input class="input input-mono" disabled placeholder="https://sso.dada.group/realms/dadagroup" aria-label="Issuer URL">')}
          ${row('Client ID', '', '<input class="input input-mono" disabled placeholder="lore" aria-label="Client ID">')}
        </div></section>
        <section class="set-sec"><h2 style="display:flex;align-items:center;gap:8px">Enterprise SSO ${vb('Paid plans')}</h2><div class="set-box">
          ${row('SAML, LDAP and Active Directory', 'Sign-in with the company directory.', `<button class="btn" type="button" data-mock="Paid plans.">Learn more</button>`)}
          ${row('SCIM provisioning and group sync', 'Accounts created and disabled automatically.', `<button class="btn" type="button" data-mock="Paid plans.">Learn more</button>`)}
          ${row('Mandatory SSO', 'Blocks password sign-in.', `<button class="btn" type="button" data-mock="Paid plans.">Learn more</button>`)}
        </div></section>`);
    }
    if (k === 'storage') {
      return settingsPage('storage', 'Storage and import', `
        <section class="set-sec"><h2>Usage</h2><div class="set-box">
          ${row('Stored volume', 'No quota when self-hosted.', `<strong class="num">${D.org.storage}</strong>`)}
          ${row('Documents', `In ${D.spaces.length} spaces.`, `<strong class="num">${D.org.docs}</strong>`)}
          ${row('Scanned documents', 'Content not searchable: only the title and the metadata are.', `<strong class="num">${D.org.scanned}</strong><a class="btn" href="#/documents/schema-cablage">See an example</a>`)}
        </div></section>
        <form class="set-sec" data-form="save"><h2>Import</h2><div class="set-box">
          ${row('Maximum file size', 'Above it, the import is refused with a clear message.', '<input class="input" type="number" value="50" aria-label="Maximum size in megabytes" style="width:90px"> MB')}
          ${row('Accepted formats', '', 'PDF, Word (DOCX), text and Markdown')}
        </div><div style="margin-top:12px"><button class="btn btn-primary" type="submit">Save</button></div></form>
        <section class="set-sec"><h2>Text extraction</h2><div class="set-box">
          ${row('Apache Tika', 'Built in. Runs in an isolated process: a malicious file cannot bring the application down.', pill('Active', 'p-green'))}
          ${row('External extractor', 'Optional service, for example for OCR or complex PDF files. Its installation and license are up to your organization.', `<button class="btn" type="button" data-mock="Adding an external extractor: not simulated.">${ico('plus')}Add</button>`)}
          ${row('Text recognition (OCR)', 'Not in v0.1: PDF files without text are detected and reported.', pill('Not available', 'p-gray'))}
        </div></section>
        <section class="set-sec"><h2>Files</h2><div class="set-box">
          ${row('Location', 'Local volume of the container.', '<code style="font-size:12.5px">/var/lib/lore/files</code>')}
          ${row('S3-compatible storage', '', sw(false, true, 'S3-compatible storage'), vb('Later'))}
        </div></section>`);
    }
    if (k === 'audit') {
      const types = [...new Set(D.audit.map((a) => a.type))];
      return settingsPage('audit', 'Audit log', `
        <div class="target-chips" style="margin:18px 0 12px">
          <select class="select select-sm" data-audit="type" aria-label="Type of action"><option value="">All actions</option>${types.map((t) => `<option>${t}</option>`).join('')}</select>
          <select class="select select-sm" data-audit="who" aria-label="Person"><option value="">Everyone</option>${[...new Set(D.audit.filter((a) => a.who).map((a) => a.who))].map((w) => `<option value="${w}">${esc(person(w).name)}</option>`).join('')}</select>
          <select class="select select-sm" aria-label="Period"><option>Last 7 days</option><option>Last 30 days</option></select>
          <span style="flex:1"></span><button class="btn" type="button" data-mock="CSV export: not simulated.">${ico('download')}Export as CSV</button>
        </div>
        <div class="set-box" style="overflow:hidden"><div class="grid-wrap"><table class="grid" style="min-width:820px"><thead><tr><th><span class="th">${ico('clock')}Date</span></th><th><span class="th">${ico('user')}Person</span></th><th><span class="th">${ico('tag')}Action</span></th><th><span class="th">${ico('text')}Detail</span></th></tr></thead><tbody id="audit-rows"></tbody></table></div></div>
        <p class="help" style="margin-top:10px">Views, imports, downloads, changes of status, permissions and members, sign-ins. Kept for 1 year.</p>`,
        { wide: true, intro: 'The sensitive operations of the whole organization.', after: renderAudit });
    }
    if (k === 'assistant') {
      return settingsPage('assistant', 'Assistant', `
        <div class="callout" style="margin-top:18px">${ico('info')}<p>Optional module, off by default. The rest of Lore works without it.</p></div>
        <section class="set-sec"><h2>Activation</h2><div class="set-box">${row('Enable the assistant', 'Members will be able to ask questions about the documents they have access to.', sw(false, false, 'Enable the assistant'))}</div></section>
        <form class="set-sec" data-form="save"><h2>Language model</h2><div class="set-box">
          ${row('Provider', '', '<select class="select" aria-label="Provider"><option>Local server</option><option>External provider</option></select>')}
          ${row('Server address', '', '<input class="input input-mono" value="https://llm.dada.group" aria-label="Server address">')}
          ${row('Model', '', '<input class="input input-mono" value="example-local-model" aria-label="Model">')}
        </div><div style="margin-top:12px"><button class="btn btn-primary" type="submit">Save</button></div></form>
        <section class="set-sec"><h2>Privacy</h2><div class="set-box">
          ${row('Content sent to the model', 'Only the passages of the documents the person asking has access to.', pill('Always', 'p-green'))}
          ${row('Outdated documents', 'Never used to build an answer.', pill('Excluded', 'p-green'))}
          ${row('Conversation retention', '', '<select class="select" aria-label="Conversation retention"><option>90 days</option><option>30 days</option><option>Do not keep</option></select>')}
        </div></section>`, { badge: vb('v0.3') });
    }
    return screen404();
  }
  function renderAudit() {
    const tb = $('#audit-rows');
    if (!tb) return;
    const t = ($('[data-audit="type"]') || {}).value || '';
    const w = ($('[data-audit="who"]') || {}).value || '';
    const rows = D.audit.filter((a) => (!t || a.type === t) && (!w || a.who === w)).map((a) => `<tr><td>${esc(a.when)}</td><td>${a.who ? who(a.who) : '<span class="muted">System</span>'}</td><td>${pill(a.type, AUDIT[a.type])}</td><td style="max-width:520px">${esc(a.text)}</td></tr>`).join('');
    tb.innerHTML = fr(rows || '<tr><td colspan="4" class="muted">No operation with these filters.</td></tr>');
  }

  function screenSources() {
    const rows = D.sources.map((s) => `<li><div class="list-row">${ico(s.kind === 'GitLab' ? 'branch' : 'server')}<div class="list-main"><div class="list-title">${esc(s.kind)}: <span style="font-family:var(--mono);font-size:13px">${esc(s.name)}</span></div><div class="list-sub">${esc(s.detail)}, into ${esc(s.target)}. ${s.files.toLocaleString('en-US')} files.</div></div><div class="list-side">${s.state === 'ok' ? pill('Synced ' + s.sync, 'p-green') : pill(s.warn, 'p-yellow')}<button class="btn" type="button" data-mock="Sync started.">${ico('refresh')}Sync</button></div></div></li>`).join('');
    const cat = [['GitLab', 'branch', ''], ['GitHub', 'branch', ''], ['Shared folder', 'server', ''], ['Confluence', 'book', 'Paid plans'], ['SharePoint', 'folder', 'Paid plans'], ['Google Drive', 'folder', 'Paid plans'], ['OneDrive', 'folder', 'Paid plans']];
    return settingsPage('sources', 'Connected sources', `
      <div class="callout" style="margin-top:18px">${ico('info')}<p>Planned after v0.3. First source planned: the Markdown files of Git repositories.</p></div>
      <section class="set-sec"><h2>Sources of the organization</h2><ul class="list" style="margin-top:12px">${rows}</ul></section>
      <section class="set-sec"><h2>Add a source</h2><p class="help">Synced documents are indexed and follow the same permissions as the others.</p>
        <div class="catalog">${cat.map(([n, i, b]) => `<button class="cat-item" type="button" data-mock="Connecting to ${n}: not simulated."><span class="cat-ico">${ico(i)}</span>${n}${b ? vb(b) : ''}</button>`).join('')}</div></section>`,
      { nav: 'sources', badge: vb('Later') });
  }

  /* =========================================================
     Knowledge base (v0.2)
     ========================================================= */
  const techPills = (f) => f.tech.map((t) => pill(t, TECH[t])).join(' ');

  function screenKnowledge(m, p) {
    const view = p.get('view') === 'grid' ? 'grid' : 'kanban';
    const toolbar = `<div class="toolbar"><div class="views">
        <a class="view-tab" href="#/knowledge"${view === 'kanban' ? ' aria-current="page"' : ''}>${ico('kanban')}Kanban by status</a>
        <a class="view-tab" href="#/knowledge?view=grid"${view === 'grid' ? ' aria-current="page"' : ''}>${ico('grid')}Grid</a></div>
      <div class="tools"><button class="tool" type="button" data-mock="Filter: not simulated.">${ico('filter')}Filter</button><button class="tool is-on" type="button" data-mock="Grouping: not simulated.">${ico('group')}Grouped by status</button><button class="tool" type="button" data-mock="Sorting: not simulated.">${ico('sort')}Sort</button></div></div>`;
    let body;
    if (view === 'kanban') {
      body = `<div class="board">${['draft', 'review', 'validated'].map((st) => {
        const list = D.fiches.filter((f) => f.status === st);
        return `<section class="column"><div class="column-head">${stIcon(st)}${st === 'draft' ? 'Drafts' : st === 'review' ? 'Awaiting review' : 'Approved'}<span class="count">${list.length}</span></div><div class="cards">${list.map((f) => `<a class="card" href="#/knowledge/${f.id}"><div class="card-title">${esc(f.title)}</div><div class="card-pills">${techPills(f)}</div><div class="card-meta">${who(f.author)}<span>${esc(spaceById(f.space).name)}, ${esc(f.updated)}</span></div></a>`).join('')}</div></section>`;
      }).join('')}</div>`;
    } else {
      const rows = D.fiches.map((f, i) => `<tr><td class="rn">${i + 1}</td><td class="primary"><div class="cell-title">${ico('book')}<a href="#/knowledge/${f.id}">${esc(f.title)}</a><a class="expand" href="#/knowledge/${f.id}" aria-label="Open the article">${ico('expand')}</a></div></td><td>${status(f.status)}</td><td>${techPills(f)}</td><td>${esc(spaceById(f.space).name)}</td><td>${who(f.author)}</td><td>${f.validator ? who(f.validator) : '<span class="muted">Not yet</span>'}</td><td>${esc(f.updated)}</td><td class="num">${f.resources.length}</td></tr>`).join('');
      body = `<div class="grid-wrap"><table class="grid"><thead><tr><th class="rn"></th><th class="primary"><span class="th">${ico('text')}Problem</span></th><th><span class="th">${ico('tag')}Status</span></th><th><span class="th">${ico('tag')}Technologies</span></th><th><span class="th">${ico('grid')}Space</span></th><th><span class="th">${ico('user')}Author</span></th><th><span class="th">${ico('user')}Approved by</span></th><th><span class="th">${ico('calendar')}Updated</span></th><th><span class="th">${ico('link')}Resources</span></th></tr></thead><tbody>${rows}</tbody></table></div><div class="grid-foot"><span>${D.fiches.length} articles</span></div>`;
    }
    return {
      nav: 'knowledge', title: 'Knowledge base',
      crumbs: crumbs([{ label: 'Knowledge base', badge: ' ' + vb('v0.2') }]),
      actions: `<a class="btn btn-primary" href="#/knowledge/new">${ico('plus')}<span class="btn-label">New article</span></a>`,
      html: `<h1 class="sr-only">Knowledge base</h1>${toolbar}${body}`
    };
  }

  function screenFiche(m) {
    const f = D.fiches.find((x) => x.id === m[1]);
    if (!f) return screen404();
    const s = spaceById(f.space);
    const field = (icon, label, val) => `<div class="rfield"><div class="rfield-label">${ico(icon)}${label}</div><div class="rfield-value">${val ? hl(val, []) : '<span class="muted">Not detailed in the demo.</span>'}</div></div>`;
    const review = f.status === 'review';
    return {
      nav: 'knowledge', title: f.title,
      crumbs: crumbs([{ label: 'Knowledge base', href: '#/knowledge' }, { label: f.title }]),
      actions: (review
        ? `<button class="btn" type="button" data-mock="Change request sent to the author." title="Request changes">${ico('edit')}<span class="btn-label">Request changes</span></button><button class="btn btn-primary" type="button" data-mock="Article approved: it is now suggested in search." title="Approve the article">${ico('check')}<span class="btn-label">Approve the article</span></button>`
        : `<button class="btn" type="button" data-mock="Editing: not simulated.">${ico('edit')}<span class="btn-label">Edit</span></button>`) + panelBtn('props', 'the properties', 'sidebar-right', ']'),
      html: `<div class="record"><div class="record-main"><div class="record-inner">
          ${review ? `<div class="callout" style="margin-bottom:14px">${stIcon('review')}<p>This article is awaiting approval. The owners of the ${esc(s.name)} space can approve it or request changes.</p></div>` : ''}
          <h1 class="doc-title">${esc(f.title)}</h1>
          <div class="doc-sub" style="margin-bottom:12px">${status(f.status)}<span>By ${esc(person(f.author).name)}</span><span>Updated ${esc(f.updated)}</span></div>
          ${field('info', 'Context', f.context)}${field('eye', 'Symptoms', f.symptoms)}${field('search', 'Causes', f.causes)}${field('check', 'Solution', f.solution)}${field('alert', 'Precautions', f.precautions)}
        </div></div>
        <aside class="props" aria-label="Article properties">
          <section><h2>Properties</h2><dl>
            <div class="prop"><dt>Status</dt><dd><span class="prop-val prop-static">${status(f.status)}</span></dd></div>
            <div class="prop"><dt>Technologies</dt><dd><span class="prop-val prop-static" style="flex-wrap:wrap">${techPills(f)}</span></dd></div>
            <div class="prop"><dt>Space</dt><dd><a class="prop-val" href="#/spaces/${s.id}">${spaceIco(s)}${esc(s.name)}</a></dd></div>
            <div class="prop"><dt>Author</dt><dd><span class="prop-val prop-static">${who(f.author)}</span></dd></div>
            <div class="prop"><dt>Approved by</dt><dd><span class="prop-val prop-static">${f.validator ? who(f.validator) : '<span class="muted">Pending</span>'}</span></dd></div>
          </dl></section>
          <section><h2>Origin</h2><p class="access-note">${esc(f.origin || 'Written directly.')}</p></section>
          <section><h2>Related resources</h2>${f.resources.length ? f.resources.map((id) => { const d = docById(id); return `<a class="prop-val" href="#/documents/${d.id}" style="height:auto;padding:6px">${ico(fmtIco(d))}<span>${esc(d.title)}</span></a>`; }).join('') : '<p class="access-note">No related resources.</p>'}</section>
        </aside></div>`
    };
  }

  function screenNewFiche(m, p) {
    const fromA = p.get('from') === 'assistant';
    const fromD = p.get('from') === 'document' ? docById(p.get('doc')) : null;
    const s = spaceById('infrastructure');
    const v = fromA ? {
      title: 'Restore the billing database when pg_restore reports a missing role',
      symptoms: 'pg_restore stops with ERROR: role "…" does not exist.',
      causes: 'The role named in the error does not exist on the restore server, for example after a cleanup of the roles.',
      solution: '1. Create an empty database and run pg_restore with four parallel jobs.\n2. Create the missing role (CREATE ROLE … LOGIN;).\n3. Run the restore again, or use --no-privileges if the original rights are not needed.',
      res: ['restaurer-pg', 'inc-2291']
    } : { title: '', symptoms: '', causes: '', solution: '', res: fromD ? [fromD.id] : [] };
    const ta = (id, label, icon, val, help) => `<div class="field"><label for="${id}">${ico(icon)}${label}</label><textarea class="textarea" id="${id}">${esc(val || '')}</textarea>${help ? `<span class="help">${help}</span>` : ''}</div>`;
    return {
      nav: 'knowledge', title: 'New article',
      crumbs: crumbs([{ label: 'Knowledge base', href: '#/knowledge' }, { label: 'New article', badge: ' ' + vb('v0.2') }]),
      html: `<div class="form-view"><div class="form-cover" style="--c:${s.color}"></div><form class="form-card" data-form="knowledge">
        <div><h1 class="page-title">New knowledge article</h1><p class="page-intro">A problem, its symptoms, its cause and the solution applied. The article is suggested in search once approved.</p></div>
        ${fromA ? `<div class="callout">${ico('ask')}<p>Prefilled from an assistant answer ${vb('v0.3')}. Check every section before submitting it.</p></div>` : ''}
        ${fromD ? `<div class="callout">${ico('file-text')}<p>Created from the document “${esc(fromD.title)}”.</p></div>` : ''}
        <div class="field"><label for="f-title">${ico('text')}Problem or question</label><input class="input" id="f-title" value="${esc(v.title)}" placeholder="Example: pods stuck in Pending after the site failover"></div>
        <div class="form-2"><div class="field"><label for="f-space">${ico('grid')}Space</label><select class="select" id="f-space">${D.spaces.filter((x) => !x.empty).map((x) => `<option${x.id === 'infrastructure' ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
          <div class="field"><label for="f-tech">${ico('tag')}Technologies</label><input class="input" id="f-tech" value="${fromA ? 'PostgreSQL' : ''}" placeholder="PostgreSQL, Kubernetes…"></div></div>
        ${ta('f-ctx', 'Context', 'info', '', 'System involved, environment, circumstances.')}
        ${ta('f-sym', 'Symptoms', 'eye', v.symptoms)}
        ${ta('f-cause', 'Causes', 'search', v.causes)}
        ${ta('f-sol', 'Solution', 'check', v.solution)}
        ${ta('f-pre', 'Precautions', 'alert', '')}
        <div class="field"><span class="field-label" style="display:flex;align-items:center;gap:6px">${ico('link')}Related resources</span><div class="target-chips">${v.res.map((id) => `<span class="pill p-gray">${ico('file-text')}${esc(docById(id).title)}</span>`).join('')}<button class="btn" type="button" data-mock="Choosing a document: not simulated.">${ico('plus')}Add a document</button></div></div>
        <div class="row-between" style="margin-top:6px"><button class="btn" type="button" data-mock="Draft saved.">Save the draft</button><button class="btn btn-primary btn-lg" type="submit">Submit for approval</button></div>
      </form></div>`
    };
  }

  /* =========================================================
     Dashboard (v0.2)
     ========================================================= */
  function screenDashboard() {
    const T = D.dashboard;
    const max = 300;
    const bars = T.weeks.map(([w, v]) => `<div class="vcol" tabindex="0" style="--v:${(v / max * 100).toFixed(1)}%" aria-label="Week of ${w}: ${v} searches"><div class="vbar"></div><div class="tip" role="tooltip">Week of ${w}<br><b>${v}</b> searches</div></div>`).join('');
    const xl = T.weeks.map(([w], i) => `<span>${i % 3 === 0 ? w : ''}</span>`).join('');
    const hmax = Math.max(...T.perSpace.map((x) => x[1]));
    const hrows = T.perSpace.map(([n, v]) => `<div class="hrow" title="${n}: ${v} documents"><span>${n}</span><div class="track"><div class="hbar" style="--v:${(v / hmax * 100).toFixed(1)}%;${v ? '' : 'min-width:0'}"></div></div><span class="val">${v}</span></div>`).join('');
    const kpi = (label, value, note) => `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div><div class="kpi-note">${note}</div></div>`;
    return {
      nav: 'dashboard', title: 'Dashboard',
      crumbs: crumbs([{ label: 'Dashboard', badge: ' ' + vb('v0.2') }]),
      actions: `<select class="select select-sm" aria-label="Period"><option>Last 30 days</option><option>Last 90 days</option></select><button class="btn" type="button" data-mock="Export: not simulated.">${ico('download')}<span class="btn-label">Export</span></button>`,
      html: `<div class="pad"><h1 class="page-title" style="margin-bottom:16px">Dashboard</h1>
        <div class="kpis">
          ${kpi('Documents', D.org.docs, D.org.scanned + ' scanned, not searchable')}
          ${kpi('Active members', '41', 'of ' + D.org.members + ' members')}
          ${kpi('Searches', '944', 'Last 30 days')}
          ${kpi('No results', '6%', '57 searches')}
          ${kpi('Outdated documents', '23', 'including 4 still viewed')}
          ${kpi('Overdue reviews', String(T.overdue.length), 'review date passed')}
        </div>
        <div class="dash">
          <section class="panel"><div class="panel-head"><h2>Searches per week</h2></div><p class="panel-sub">Last 12 weeks</p>
            <div class="vchart"><div class="vchart-y" aria-hidden="true"><span>300</span><span>200</span><span>100</span><span>0</span></div><div class="vchart-plot">${bars}</div><div class="vchart-x" aria-hidden="true">${xl}</div></div>
            <details class="data-table"><summary>See the data</summary><table><thead><tr><th>Week of</th><th>Searches</th></tr></thead><tbody>${T.weeks.map(([w, v]) => `<tr><td>${w}</td><td class="num">${v}</td></tr>`).join('')}</tbody></table></details></section>
          <section class="panel"><div class="panel-head"><h2>Documents per space</h2></div><p class="panel-sub">${D.org.docs} documents in total</p><div class="hchart">${hrows}</div></section>
          <section class="panel"><div class="panel-head"><h2>Searches without results</h2><a class="link" href="#/search?q=ceph%20quota" style="font-size:12.5px">Try it</a></div><p class="panel-sub">Possible documentation gaps</p>
            <ol class="rank">${T.gaps.map(([q, n]) => `<li>${ico('search')}<span style="font-family:var(--mono);font-size:12.5px">${esc(q)}</span><span class="v">${n} times</span><a class="btn" href="#/knowledge/new" style="margin-left:8px">Write an article</a></li>`).join('')}</ol></section>
          <section class="panel"><div class="panel-head"><h2>Most viewed documents</h2></div><p class="panel-sub">Last 30 days</p>
            <ol class="rank">${T.topDocs.map(([id, n]) => { const d = docById(id); return `<li>${ico(fmtIco(d))}<a href="#/documents/${d.id}">${esc(d.title)}</a><span class="v">${n}</span></li>`; }).join('')}</ol></section>
          <section class="panel"><div class="panel-head"><h2>Overdue reviews</h2></div><p class="panel-sub">Documents whose planned review date has passed</p>
            <ol class="rank">${T.overdue.map(([id, when]) => { const d = docById(id); return `<li>${avatar(d.owner)}<a href="#/documents/${d.id}">${esc(d.title)}</a><span class="v">due ${esc(when)}</span></li>`; }).join('')}</ol></section>
          <section class="panel"><div class="panel-head"><h2 style="display:flex;align-items:center;gap:8px">Assistant ${vb('v0.3')}</h2></div><p class="panel-sub">Last 30 days</p>
            <div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))">${kpi('Questions', '312', '')}${kpi('Helpful answers', '81%', 'according to feedback')}${kpi('No reliable answer', '9%', '28 questions')}</div>
            <p class="panel-sub" style="margin:14px 0 6px">Frequent questions</p>
            <ol class="rank"><li>${ico('ask')}<span>How do I restore the billing database?</span><span class="v">18</span></li><li>${ico('ask')}<span>What is the site failover procedure?</span><span class="v">11</span></li><li>${ico('ask')}<span>Who is on call this weekend?</span><span class="v">9</span></li></ol></section>
        </div></div>`
    };
  }

  /* =========================================================
     Assistant (v0.3)
     ========================================================= */
  const citeHref = (s) => `#/documents/${s.doc}?from=assistant&anchor=${s.anchor}`;
  const cite = (src, n) => { const s = src.find((x) => x.n === n); return `<a class="cite" href="${citeHref(s)}" title="${esc(docById(s.doc).title)}, ${esc(s.loc)}">${n}</a>`; };

  function answerHtml(c) {
    if (c.kind === 'none') {
      return `<div class="answer"><div class="answer-label">${ico('alert')}No reliable answer</div>
        <p>The documents you have access to do not describe this procedure. Rather than suggesting an unverified procedure, here are the documents that come closest.</p>
        ${c.near && c.near.indexOf('rotation-tls') >= 0 ? '<p>“Rotating the internal TLS certificates” is about the certificates of the internal services, not the partner VPN.</p>' : ''}
        <div class="answer-foot"><button class="btn" type="button" data-mock="Gap reported: it will appear in the dashboard.">${ico('flag')}Report a documentation gap</button><a class="btn" href="#/knowledge/new">${ico('book')}Write an article ${vb('v0.2')}</a></div></div>`;
    }
    const S = c.sources;
    const body = c.short
      ? `<p>Full backups are kept for 35 days on the main storage array, then 12 months on the object storage of the backup site${cite(S, 1)}.</p>`
      : `<p>The message means that the role named in the permissions does not exist on the restore server. Create this role, then run <code>pg_restore</code> again${cite(S, 1)}.</p>
         <ol><li>Create an empty database and run the restore with <code>pg_restore</code> and four parallel jobs${cite(S, 2)}.</li>
         <li>If the error <code>role "…" does not exist</code> appears, create the role it names, for example <code>CREATE ROLE app_rw LOGIN;</code>${cite(S, 1)}.</li>
         <li>Run the restore again. If the original rights are not needed on this server, use the <code>--no-privileges</code> option instead${cite(S, 1)}.</li></ol>
         <p>This already happened during incident INC-2291: the <code>reporting</code> role had been deleted during a cleanup${cite(S, 3)}.</p>`;
    const docs = new Set(S.map((x) => x.doc)).size;
    return `<div class="answer"><div class="answer-label">${ico('ask')}Answer, based on ${docs} document${docs > 1 ? 's' : ''}</div>${body}
      ${c.ignored && c.ignored.length ? `<div class="callout callout-mock">${ico('info')}<p>An outdated document also matched the question and was not used: “${esc(docById(c.ignored[0].doc).title)}”.</p></div>` : ''}
      <div class="answer-foot"><span>Was this answer helpful?</span><button class="btn" type="button" data-action="feedback" aria-pressed="false">${ico('thumbs-up')}Yes</button><button class="btn" type="button" data-action="feedback" aria-pressed="false">${ico('thumbs-down')}No</button><span class="sp"></span>
      <a class="btn" href="#/knowledge/new?from=assistant">${ico('book')}Create an article</a><button class="btn" type="button" data-mock="Answer copied.">${ico('copy')}Copy</button></div></div>`;
  }

  function screenAssistant(m, p) {
    const q = (p.get('q') || '').trim();
    let c = m[1] ? D.conversations.find((x) => x.id === m[1]) : null;
    if (!c && q) {
      if (/pg_restore|role|restor/i.test(q)) c = Object.assign({}, D.conversations[0], { question: q, when: 'Just now', id: 'c1' });
      else if (/certif|vpn/i.test(q)) c = Object.assign({}, D.conversations[1], { question: q, when: 'Just now' });
      else c = { id: 'tmp', question: q, when: 'Just now', kind: 'none', near: relatedDocs(q, 3).map((d) => d.id) };
    }
    const hist = D.conversations.map((x) => `<a class="conv-link" href="#/assistant/${x.id}"${c && c.id === x.id && !q ? ' aria-current="page"' : ''}>${esc(x.question)}<span>${esc(x.when)}</span></a>`).join('');
    let center, side;
    if (!c) {
      const ex = ['Which procedure restores the PostgreSQL database?', 'How do I renew the certificate of the billing API?', 'What has caused full disks before?'];
      center = `<div class="empty" style="padding-top:40px">${ico('ask')}<h1 class="page-title">Ask a question about your documents</h1><p>The assistant answers from the documents you have access to, and cites its sources. It ignores outdated documents.</p></div>
        <div class="suggest">${ex.map((x) => `<a href="#/assistant?q=${enc(x)}">${esc(x)}</a>`).join('')}</div>`;
      side = `<h2>Sources</h2><p class="help">The cited documents will appear here, with their version and status.</p>`;
    } else {
      center = `<div class="q">${avatar('as', true)}<div><h1 class="q-text">${esc(c.question)}</h1><div class="q-meta">${esc(c.when)}</div></div></div>${answerHtml(c)}`;
      if (c.kind === 'none') {
        const near = (c.near || []).map(docById).filter(Boolean);
        side = `<h2>Close documents</h2>${near.length ? near.map((d) => `<a class="src" href="#/documents/${d.id}"><div class="src-top">${ico(fmtIco(d))}${esc(d.title)}</div><div class="src-meta">${status(d.status)}<span>Version ${d.version}</span></div></a>`).join('') : '<p class="help">No similar documents.</p>'}`;
      } else {
        side = `<h2>Cited sources</h2><p class="help">Only documents you have access to.</p>${c.sources.map((s) => { const d = docById(s.doc); return `<a class="src" href="${citeHref(s)}"><div class="src-top"><span class="cite">${s.n}</span>${esc(d.title)}</div><div class="src-loc">${esc(s.loc)}</div><q>${esc(s.quote)}</q><div class="src-meta">${status(d.status)}<span>Version ${d.version}</span><span>${esc(d.updated)}</span></div></a>`; }).join('')}`;
      }
    }
    return {
      nav: 'assistant', title: 'Assistant',
      crumbs: crumbs([{ label: 'Assistant', badge: ' ' + vb('v0.3') }]),
      actions: `${panelBtn('history', 'the history', 'history')}<a class="btn" href="#/assistant">${ico('plus')}<span class="btn-label">New question</span></a>${panelBtn('sources', 'the sources', 'sidebar-right', ']')}`,
      html: `<div class="assist">
        <nav class="conv-side" aria-label="Conversation history"><a class="btn btn-block" href="#/assistant">${ico('plus')}New question</a><h2>History</h2>${hist}</nav>
        <div class="thread"><div class="thread-inner">${center}</div>
          <form class="composer" data-form="ask"><div class="composer-box"><label class="sr-only" for="ask">Your question</label><textarea id="ask" name="q" rows="2" placeholder="Ask a question about your documents"></textarea>
            <div class="composer-row"><span>Answers cite their sources: check them before applying a procedure.</span><button class="btn btn-primary" type="submit">${ico('send')}Send</button></div></div></form></div>
        <aside class="src-side">${side}</aside></div>`
    };
  }

  /* =========================================================
     Page not found
     ========================================================= */
  function screen404() {
    return {
      nav: '', title: 'Not found',
      crumbs: crumbs([{ label: 'Not found' }]),
      html: `<div class="empty" style="padding-top:96px">${logo(34)}<h1 class="page-title">This page cannot be found</h1><p>The document or the space does not exist, was deleted, or you do not have access to it.</p>
        <div class="actions"><a class="btn btn-primary" href="#/">Back to home</a><button class="btn" type="button" data-action="palette">${ico('search')}Search</button></div>
        <p class="help">For security, Lore does not tell a missing document apart from a document you cannot access.</p></div>`
    };
  }

  /* =========================================================
     Windows: import, version, access, status…
     ========================================================= */
  function modal(title, body, foot, opts) {
    opts = opts || {};
    const tag = opts.form ? 'form' : 'div';
    return `<div class="overlay-backdrop" data-action="close"></div><div class="modal-wrap" data-action="close-wrap"><${tag} class="modal ${opts.size || ''}" role="dialog" aria-modal="true" aria-labelledby="mt"${opts.form ? ` data-form="${opts.form}"` : ''}>
      <div class="modal-head"><h2 id="mt">${title}</h2><button type="button" class="icon-btn" data-action="close" aria-label="Close">${ico('x')}</button></div>
      <div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}</${tag}></div>`;
  }
  const cancelBtn = '<button class="btn" type="button" data-action="close">Cancel</button>';

  const OVERLAYS = {
    'import': () => {
      const s = spaceById('infrastructure');
      const file = (icon, name, size, st) => `<div class="file">${ico(icon)}<span class="file-name">${name}</span><span class="file-size">${size}</span>${st}</div>`;
      return modal('Import documents', `
        <div class="target-chips"><span class="pill p-gray">${spaceIco(s)}${esc(s.name)}</span><span class="muted">›</span>
          <select class="select select-sm" aria-label="Folder">${D.folders.infrastructure.map((f) => `<option>${esc(f.name)}</option>`).join('')}</select>
          <select class="select select-sm" aria-label="Status on import"><option>Draft</option><option>Published</option></select>
          <select class="select select-sm" aria-label="Category">${Object.keys(CAT).map((c) => `<option>${esc(c)}</option>`).join('')}</select></div>
        <div class="drop">${ico('upload')}<p>Drop your files here, or <button class="link" type="button" data-mock="File picker: not simulated.">choose them on your computer</button>.</p><p class="help">PDF, Word (DOCX), text and Markdown. 50 MB per file at most.</p></div>
        <label class="check"><input type="checkbox">Restrict access to some people</label>
        <div><div class="row-between"><strong style="font-size:13.5px">5 files dropped</strong><span class="help">Imported as soon as they are dropped</span></div>
          ${file('file-text', 'recovery-plan-2026.docx', '1.2 MB', `<span class="file-state is-ok">${ico('check')}Indexed: 14 sections</span>`)}
          ${file('file-text', 'runbook-redis.md', '14 KB', `<span class="file-state is-busy">${ico('spinner', 'spin')}Text extraction in progress</span><span class="progress" aria-hidden="true"><span></span></span>`)}
          ${file('file', 'room-b-cabling-diagram.pdf', '8.7 MB', `<span class="file-state is-warn">${ico('scan')}Scanned document: imported, but only its title and metadata are searchable.</span>`)}
          ${file('file', 'logs-export-october.pdf', '72 MB', `<span class="file-state is-err">${ico('alert')}Not imported: the file is 72 MB, the limit is 50 MB.</span>`)}
          ${file('file-text', 'vpn-procedure.docx', '340 KB', `<span class="file-state is-err" id="retry-state">${ico('alert')}Extraction failed: the file is password protected. <button class="link" type="button" data-action="retry">Retry</button></span>`)}
        </div>`,
        `<span class="left">Shortcut: I key</span><button class="btn btn-primary" type="button" data-action="close">Done</button>`, { size: 'modal-lg' });
    },
    'version': (p) => {
      const d = docById(p.get('doc') || 'restaurer-pg');
      return modal(`New version of “${esc(d.title)}”`, `
        <div class="drop">${ico('upload')}<p>Drop the file of version ${d.version + 1}, or <button class="link" type="button" data-mock="File picker: not simulated.">choose it</button>.</p><p class="help">Same format recommended: ${esc(d.format)}. 50 MB at most.</p></div>
        <div class="field"><label for="v-note">What changes</label><textarea class="textarea" id="v-note" placeholder="Example: check the roles before restoring"></textarea><span class="help">Shown in the version history.</span></div>
        <label class="check"><input type="checkbox" checked>Keep the ${ST[d.status].label} status</label>
        <div class="callout callout-mock">${ico('info')}<p>Version ${d.version} can still be read and downloaded in the history.</p></div>`,
        `${cancelBtn}<button class="btn btn-primary" type="submit">Import version ${d.version + 1}</button>`, { form: 'version' });
    },
    'access': (p) => {
      const d = docById(p.get('doc') || 'rotation-tls');
      const members = D.spaceMembers[d.space] || [];
      const grants = d.grants || [];
      return modal('Document access', `
        <p class="help" style="margin-top:-4px">${esc(d.title)}</p>
        <label class="radio-card"><input type="radio" name="access" value="all"${d.restricted ? '' : ' checked'}><span><strong>${ico('users')}All the members of the space</strong><span class="help">${members.length} people</span></span></label>
        <label class="radio-card"><input type="radio" name="access" value="restricted"${d.restricted ? ' checked' : ''}><span><strong>${ico('lock')}Only some people</strong><span class="help">The other members never see the document: not in the lists, not in search.</span></span></label>
        <div class="people-pick" id="people-pick"${d.restricted ? '' : ' aria-disabled="true" style="opacity:.5;pointer-events:none"'}>${members.map((x) => `<label><input type="checkbox"${grants.indexOf(x.id) >= 0 || x.role === 'Owner' ? ' checked' : ''}${x.role === 'Owner' ? ' disabled' : ''}>${avatar(x.id)}${esc(person(x.id).name)}<span class="role">${pill(x.role, ROLE[x.role])}</span></label>`).join('')}</div>
        <p class="help">The space owners and the organization’s administrators always keep access.</p>`,
        `${cancelBtn}<button class="btn btn-primary" type="submit">Save</button>`, { form: 'access' });
    },
    'status': (p) => {
      const d = docById(p.get('doc') || 'restaurer-pg');
      const opt = (st, help, extra, dis) => `<label class="radio-card"${dis ? ' style="opacity:.55;cursor:not-allowed"' : ''}><input type="radio" name="st" value="${st}"${d.status === st ? ' checked' : ''}${dis ? ' disabled' : ''}><span><strong>${stIcon(st)}${ST[st].label}${extra || ''}</strong><span class="help">${help}</span></span></label>`;
      return modal('Change the status', `
        <p class="help" style="margin-top:-4px">${esc(d.title)}</p>
        ${opt('draft', 'Visible to the members of the space, flagged as unfinished.')}
        ${opt('review', 'Submitted to the space owners before publication.', ' ' + vb('v0.2'), true)}
        ${opt('published', 'Reference version.')}
        ${opt('obsolete', 'Can still be read and searched, but ranked last. The assistant does not use it.')}
        <div class="field" style="margin-left:34px"><label for="repl">Replaced by</label><select class="select" id="repl"><option>No document</option>${D.docs.filter((x) => x.id !== d.id && x.space === d.space).map((x) => `<option>${esc(x.title)}</option>`).join('')}</select></div>
        ${opt('archived', 'Removed from the lists and from search. The space owners can still read it.')}`,
        `${cancelBtn}<button class="btn btn-primary" type="submit">Save</button>`, { form: 'status' });
    },
    'create-space': () => {
      const colors = ['#13705E', '#3F6C9A', '#8A6A1F', '#6B5A8E', '#8E4B44', '#4E7A5A', '#5B5FD6'];
      return modal('Create a space', `
        <div class="field"><label for="cs-name">Name</label><input class="input" id="cs-name" value="Business applications" required></div>
        <div class="field"><label for="cs-desc">Description</label><input class="input" id="cs-desc" value="Documentation of the internal applications."></div>
        <div class="field"><label for="cs-slug">Address</label><input class="input input-mono" id="cs-slug" value="applications"><span class="help">${D.org.url}/spaces/applications</span></div>
        <div class="field"><span class="field-label">Color</span><div class="target-chips">${colors.map((c, i) => `<label style="cursor:pointer"><input class="sr-only" type="radio" name="cs-color"${i === 5 ? ' checked' : ''}><span class="space-ico space-ico-lg" style="--c:${c};width:28px;height:28px;border-radius:7px${i === 5 ? ';box-shadow:0 0 0 2px var(--bg-raised),0 0 0 4px ' + c : ''}"></span></label>`).join('')}</div></div>
        <p class="help">You will be its owner. You can invite members afterwards.</p>`,
        `${cancelBtn}<button class="btn btn-primary" type="submit">Create the space</button>`, { form: 'create-space' });
    },
    'delete-space': (p) => {
      const s = spaceById(p.get('space') || 'infrastructure');
      return modal('Delete the space', `
        <div class="callout callout-warn">${ico('alert')}<p>Deletion is permanent: ${s.docs} documents, their versions and their files will be deleted. The members will lose access.</p></div>
        <div class="field"><label for="del-name">To confirm, type <strong>${esc(s.name)}</strong></label><input class="input" id="del-name" data-confirm-name="${esc(s.name)}" autocomplete="off"></div>`,
        `${cancelBtn}<button class="btn btn-primary" type="submit" id="confirm-delete" disabled style="background:var(--danger);border-color:var(--danger);color:#fff">Delete permanently</button>`, { form: 'delete-space' });
    },
    'new-folder': () => modal('New folder', `<div class="field"><label for="nf">Folder name</label><input class="input" id="nf" placeholder="Example: On-call procedures"></div><p class="help">In the Infrastructure space.</p>`,
      `${cancelBtn}<button class="btn btn-primary" type="submit">Create the folder</button>`, { form: 'new-folder' }),
    'invite': () => modal('Invite to the organization', `
      <p class="help" style="margin-top:-4px">Create a link and pass it on yourself. No mail server is needed.</p>
      <div class="form-2"><div class="field"><label for="io-role">Role in the organization</label><select class="select" id="io-role"><option>Member</option><option>Administrator</option></select></div>
        <div class="field"><label for="io-exp">Validity</label><select class="select" id="io-exp"><option>7 days, single use</option><option>48 hours, single use</option></select></div></div>
      <div class="field"><span class="field-label">Spaces to join</span><div class="people-pick">${D.spaces.filter((s) => !s.empty).map((s, i) => `<label><input type="checkbox"${i === 0 ? ' checked' : ''}>${spaceIco(s)}${esc(s.name)}<span class="role"><select class="select select-sm" aria-label="Role in ${esc(s.name)}"><option>Reader</option><option selected>Contributor</option><option>Owner</option></select></span></label>`).join('')}</div></div>
      <div id="invite-result" hidden><div class="target-chips"><label class="sr-only" for="inv-url">Invitation link</label><input class="input input-mono" id="inv-url" readonly value="${D.org.url}/join#P3n8-Lw2c-9QxA" style="flex:1"><button class="btn" type="button" data-action="copy" data-target="inv-url">${ico('copy')}Copy</button></div></div>`,
      `${cancelBtn}<button class="btn btn-primary" type="button" data-action="invite-create">${ico('link')}Create the link</button>`),
    'reset-link': (p) => {
      const pp = person(p.get('for') || 'hc');
      return modal('Reset link', `
        <p>Send this link to ${esc(pp.name)} through a safe channel. It lets them choose a new password.</p>
        <div class="target-chips"><label class="sr-only" for="rl">Reset link</label><input class="input input-mono" id="rl" readonly value="${D.org.url}/reset-password#Zt4K-0pRm-7HcE" style="flex:1"><button class="btn" type="button" data-action="copy" data-target="rl">${ico('copy')}Copy</button></div>
        <p class="help">Valid for 24 hours, once. The operation is recorded in the audit log. <a class="link" href="#/reset-password">See the page they receive</a></p>`,
        `<button class="btn btn-primary" type="button" data-action="close">Close</button>`);
    },
    'plan': () => {
      const enc2 = enc(DEFAULT_Q);
      const groups = [
        ['Access', 'v0.1', [['Setup: organization', '#/setup'], ['Setup: administrator account', '#/setup?step=2'], ['Setup: done', '#/setup?step=3'], ['Sign in', '#/login'], ['Sign-in refused', '#/login?error=1'], ['Join with an invitation', '#/join'], ['Forgot your password', '#/forgot-password'], ['New password', '#/reset-password']]],
        ['Workspace', 'v0.1', [['Home', '#/'], ['All spaces', '#/spaces'], ['Library, grid view', '#/spaces/infrastructure'], ['Library, kanban view', '#/spaces/infrastructure?view=kanban'], ['Library filtered on a folder', '#/spaces/infrastructure?folder=runbooks'], ['Empty space', '#/spaces/applications'], ['Space members', '#/spaces/infrastructure/members'], ['Space settings', '#/spaces/infrastructure/settings'], ['My account', '#/account'], ['Page not found', '#/not-found']]],
        ['Documents', 'v0.1', [['Markdown', '#/documents/restaurer-pg'], ['Converted Word file', '#/documents/inc-2291'], ['PDF', '#/documents/guide-baie'], ['Scanned PDF', '#/documents/schema-cablage'], ['Restricted access', '#/documents/rotation-tls'], ['Outdated', '#/documents/barman'], ['Extraction in progress', '#/documents/plan-reprise'], ['Opened from search', `#/documents/restaurer-pg?from=search&q=${enc2}&anchor=s-4-2`], ['PDF opened at the page found', '#/documents/guide-baie?from=search&q=snapshot%20restore&anchor=page-112']]],
        ['Search', 'v0.1', [['Search page', '#/search'], ['Results and filters', `#/search?q=${enc2}`], ['No results', '#/search?q=ceph%20quota'], ['Command palette (Ctrl K)', 'palette']]],
        ['Windows', 'v0.1', [['Import documents', '#/spaces/infrastructure?open=import'], ['New version', '#/documents/restaurer-pg?open=version&doc=restaurer-pg'], ['Document access', '#/documents/rotation-tls?open=access&doc=rotation-tls'], ['Change the status', '#/documents/restaurer-pg?open=status&doc=restaurer-pg'], ['Create a space', '#/spaces?open=create-space'], ['New folder', '#/spaces/infrastructure?open=new-folder'], ['Delete a space', '#/spaces/infrastructure/settings?open=delete-space&space=infrastructure'], ['Invite to the organization', '#/admin/members?open=invite'], ['Reset link', '#/admin/members?open=reset-link&for=hc']]],
        ['Administration', 'v0.1', [['General', '#/admin/general'], ['Members', '#/admin/members'], ['Security and sign-in', '#/admin/security'], ['Storage and import', '#/admin/storage'], ['Audit log', '#/admin/audit']]],
        ['Knowledge base', 'v0.2', [['Kanban of the articles', '#/knowledge'], ['Grid of the articles', '#/knowledge?view=grid'], ['Approved article', '#/knowledge/pg-role-manquant'], ['Article to approve', '#/knowledge/vpn-mtu'], ['New article', '#/knowledge/new']]],
        ['Insights and search', 'v0.2', [['Dashboard', '#/dashboard'], ['Search by keywords and meaning', `#/search?mode=semantic&q=${enc(D.semantic.question)}`]]],
        ['Assistant', 'v0.3', [['New question', '#/assistant'], ['Sourced answer', '#/assistant/c1'], ['Short answer', '#/assistant/c3'], ['No reliable answer', '#/assistant/c2'], ['Article prefilled by the assistant', '#/knowledge/new?from=assistant'], ['Assistant settings', '#/admin/assistant']]],
        ['Connected sources', 'Later', [['Connected sources', '#/sources']]],
        ['Website', '', [['Back to the Lore website', '/en/']]]
      ];
      const total = groups.reduce((n, g) => n + g[2].length, 0);
      return modal('Demo map', `<p class="help" style="margin-top:-4px">${total} screens and windows, grouped by version. The data is fictitious.</p>
        <div class="plan-cols">${groups.map(([t, v, items]) => `<div class="plan-group"><h3>${t} ${v ? vb(v) : ''}</h3><ul>${items.map(([l, h]) => h === 'palette' ? `<li><a href="#" data-action="palette">${ico('command')}${l}</a></li>` : h.indexOf('#') !== 0 ? `<li><a href="${h}" target="_top">${ico('external')}${l}</a></li>` : `<li><a href="${h}" data-action="go" data-href="${h}">${ico('chevron-right')}${l}</a></li>`).join('')}</ul></div>`).join('')}</div>`,
        '', { size: 'modal-xl' });
    },
    'palette': () => `<div class="overlay-backdrop" data-action="close"></div><div class="modal-wrap" data-action="close-wrap"><div class="palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div class="palette-input">${ico('search')}<input id="pal-in" placeholder="Search for a document, a space or an action…" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-label="Search or go to"></div>
        <div class="palette-list" id="pal-list" role="listbox"></div>
        <div class="palette-foot"><span><span class="kbd">↑</span><span class="kbd">↓</span>navigate</span><span><span class="kbd">Enter</span>open</span><span><span class="kbd">Esc</span>close</span></div></div></div>`
  };

  function openOverlay(kind, params) {
    const fn = OVERLAYS[kind];
    if (!fn) return;
    if ($('#overlay').hidden) state.lastFocus = document.activeElement;
    closeMenus();
    const o = $('#overlay');
    o.innerHTML = fr(fn(params instanceof URLSearchParams ? params : new URLSearchParams(params || '')));
    o.hidden = false;
    document.body.style.overflow = 'hidden';
    if (kind === 'palette') { initPalette(); return; }
    const first = o.querySelector('.modal-body input:not([type=checkbox]):not([type=radio]):not([readonly]), .modal-body textarea') || o.querySelector('[data-action="close"].icon-btn');
    if (first) first.focus();
  }
  function closeOverlay(silent) {
    const o = $('#overlay');
    if (!o || o.hidden) return;
    o.hidden = true;
    o.innerHTML = '';
    document.body.style.overflow = '';
    if (!silent && state.lastFocus && document.contains(state.lastFocus)) state.lastFocus.focus();
  }

  /* Command palette */
  function paletteItems() {
    const items = [];
    const add = (group, icon, label, run, hint) => items.push({ group, icon, label, run, hint: hint || '' });
    add('Actions', 'upload', 'Import documents', () => openOverlay('import'), '<span class="kbd">I</span>');
    add('Actions', 'plus', 'Create a space', () => openOverlay('create-space'));
    add('Actions', 'book', 'New knowledge article', () => go('#/knowledge/new'), vb('v0.2'));
    add('Actions', 'ask', 'Ask the assistant a question', () => go('#/assistant'), vb('v0.3'));
    add('Actions', 'theme', 'Change theme', () => { closeOverlay(); cycleTheme(); });
    add('Actions', 'map', 'Demo map', () => openOverlay('plan'));
    [['home', 'Home', '#/'], ['search', 'Search', '#/search'], ['grid', 'All spaces', '#/spaces'], ['book', 'Knowledge base', '#/knowledge'], ['chart', 'Dashboard', '#/dashboard'], ['settings', 'Administration', '#/admin/general'], ['list', 'Audit log', '#/admin/audit'], ['user', 'My account', '#/account']].forEach(([i, l, h]) => add('Go to', i, l, () => go(h)));
    D.spaces.forEach((s) => add('Spaces', null, s.name, () => go('#/spaces/' + s.id), `${s.docs} documents`));
    D.docs.forEach((d) => add('Documents', fmtIco(d), d.title, () => go('#/documents/' + d.id), esc(spaceById(d.space).name)));
    return items;
  }
  function initPalette() {
    state.pal.all = paletteItems();
    const input = $('#pal-in');
    input.focus();
    renderPalette('');
  }
  function renderPalette(q) {
    const nq = norm(q.trim());
    let items = state.pal.all.filter((it) => !nq || norm(it.label).indexOf(nq) >= 0);
    if (nq) {
      items = items.slice(0, 12);
      items.unshift({ group: 'Search', icon: 'search', label: `Search for “${q.trim()}” in the documents`, run: () => go('#/search?q=' + enc(q.trim())), hint: '<span class="kbd">Enter</span>' });
    } else items = items.filter((it) => it.group !== 'Documents' || ['restaurer-pg', 'inc-2291', 'bascule-k8s'].some((id) => docById(id).title === it.label));
    state.pal.items = items;
    state.pal.sel = 0;
    let html = '', last = '';
    items.forEach((it, i) => {
      if (it.group !== last) { html += `<div class="palette-group">${it.group}</div>`; last = it.group; }
      const icon = it.icon ? ico(it.icon) : spaceIco(D.spaces.find((s) => s.name === it.label) || D.spaces[0]);
      html += `<button class="palette-item" type="button" role="option" id="pal-${i}" data-action="pal-run" data-i="${i}" aria-selected="${i === 0}">${icon}<span>${esc(it.label)}</span><span class="hint">${it.hint}</span></button>`;
    });
    $('#pal-list').innerHTML = fr(html || '<div class="palette-empty">No results.</div>');
    $('#pal-in').setAttribute('aria-activedescendant', items.length ? 'pal-0' : '');
  }
  function palMove(delta) {
    const n = state.pal.items.length;
    if (!n) return;
    state.pal.sel = (state.pal.sel + delta + n) % n;
    $$('.palette-item').forEach((b, i) => b.setAttribute('aria-selected', String(i === state.pal.sel)));
    const el = $('#pal-' + state.pal.sel);
    if (el) el.scrollIntoView({ block: 'nearest' });
    $('#pal-in').setAttribute('aria-activedescendant', 'pal-' + state.pal.sel);
  }
  function palRun(i) {
    const it = state.pal.items[i];
    if (!it) return;
    closeOverlay(true);
    it.run();
  }

  /* =========================================================
     Theme
     ========================================================= */
  const THEMES = ['auto', 'light', 'dark'];
  const THEME_LABEL = { auto: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' };
  function getTheme() { try { return localStorage.getItem('lore-theme') || 'auto'; } catch (e) { return 'auto'; } }
  function setTheme(t) {
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('lore-theme', t); } catch (e) { /* storage unavailable */ }
    syncTheme();
  }
  function syncTheme() { $$('[data-theme-select]').forEach((s) => { s.value = getTheme(); }); }
  function cycleTheme() { setTheme(THEMES[(THEMES.indexOf(getTheme()) + 1) % 3]); toast(THEME_LABEL[getTheme()]); }

  /* =========================================================
     Interactions
     ========================================================= */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
  }
  function closeMenus() {
    $$('.popover').forEach((pp) => {
      if (pp.hidden) return;
      pp.hidden = true;
      const b = pp.parentElement.querySelector(':scope > [data-action="menu"]');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  /* In a scrolling grid, the menu is placed relative to the window so that it is not cut off. */
  function placePopover(btn, pop) {
    if (!btn.closest('.grid-wrap')) return;
    const r = btn.getBoundingClientRect();
    pop.style.position = 'fixed';
    pop.style.top = (r.bottom + 6) + 'px';
    if (pop.classList.contains('popover-right')) { pop.style.left = 'auto'; pop.style.right = (window.innerWidth - r.right) + 'px'; }
    else { pop.style.left = r.left + 'px'; pop.style.right = 'auto'; }
  }
  window.addEventListener('scroll', (e) => { if (!(e.target instanceof Element && e.target.closest('.popover, .palette-list'))) closeMenus(); }, true);
  window.addEventListener('resize', () => closeMenus());

  function openSidebar() { const s = $('#sidebar'); if (s) { s.classList.add('is-open'); $('.scrim').hidden = false; } }
  function closeSidebar() { const s = $('#sidebar'); if (s) { s.classList.remove('is-open'); $('.scrim').hidden = true; } }

  const ACTIONS = {
    'open': (el) => openOverlay(el.dataset.overlay, el.dataset.params || ''),
    'close': () => closeOverlay(),
    'close-wrap': (el, e) => { if (e.target === el) closeOverlay(); },
    'palette': () => openOverlay('palette'),
    'plan': () => openOverlay('plan'),
    'go': (el) => { closeOverlay(true); go(el.dataset.href); },
    'theme': () => cycleTheme(),
    'sidebar-open': () => openSidebar(),
    'nav-open': () => { if (window.matchMedia('(max-width: 960px)').matches) openSidebar(); else window.SLC.togglePanel('nav', true); },
    'sidebar-close': () => closeSidebar(),
    'menu': (el) => {
      const pop = el.parentElement.querySelector(':scope > .popover');
      const wasOpen = !pop.hidden;
      closeMenus();
      if (!wasOpen) { pop.hidden = false; el.setAttribute('aria-expanded', 'true'); placePopover(el, pop); }
    },
    'stratum': (el) => {
      const d = docById(el.dataset.doc);
      const v = d.versions.find((x) => String(x.n) === el.dataset.v);
      $$('.stratum').forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
      $('#vd').innerHTML = fr(versionDetail(d, v));
    },
    'pdf-page': (el) => {
      const d = docById(el.dataset.doc);
      const page = Math.min(d.pagesCount, Math.max(1, (state.pdfPage[d.id] || 1) + parseInt(el.dataset.delta, 10)));
      state.pdfPage[d.id] = page;
      const viewer = $('#pdf-viewer');
      viewer.outerHTML = fr(pdfViewer(d, page));
    },
    'anchor': (el) => { const t = document.getElementById(el.dataset.target); if (t) t.scrollIntoView({ block: 'start', behavior: 'smooth' }); },
    'toggle': (el) => {
      const t = document.getElementById(el.dataset.target);
      if (!t) return;
      t.hidden = !t.hidden;
      el.setAttribute('aria-expanded', String(!t.hidden));
    },
    'invite-create': () => { const r = $('#invite-result'); if (r) { r.hidden = false; const u = $('#inv-url'); if (u) u.select(); } },
    'copy': (el) => {
      const input = document.getElementById(el.dataset.target);
      if (!input) return;
      const done = () => toast('Link copied');
      const fail = () => { input.select(); toast('Select the link, then copy it.'); };
      try { navigator.clipboard.writeText(input.value).then(done, fail); } catch (err) { fail(); }
    },
    'retry': () => {
      const st = $('#retry-state');
      if (!st) return;
      st.className = 'file-state is-busy';
      st.innerHTML = fr(`${ico('spinner', 'spin')}Extraction restarted`);
      setTimeout(() => {
        if (!document.contains(st)) return;
        st.className = 'file-state is-err';
        st.innerHTML = fr(`${ico('alert')}Extraction failed: the file is still password protected. Remove the protection, then import a new version.`);
      }, 1500);
    },
    'set-role': (el) => {
      const menu = el.closest('.menu');
      const btn = menu.querySelector(':scope > [data-action="menu"]');
      const r = el.dataset.role;
      btn.className = 'pill ' + ROLE[r];
      btn.innerHTML = esc(r) + ico('chevron');
      toast('Role updated: ' + r);
    },
    'feedback': (el) => {
      el.parentElement.querySelectorAll('[data-action="feedback"]').forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
      toast('Thank you. Your feedback counts toward the helpful-answer rate on the dashboard.');
    },
    'pal-run': (el) => palRun(parseInt(el.dataset.i, 10))
  };

  const FORMS = {
    'search': (f) => { const q = f.q.value.trim(); const sens = f.mode ? 'mode=semantic&' : ''; go(`#/search?${sens}q=${enc(q)}`); },
    'login': () => go('#/'),
    'setup1': () => go('#/setup?step=2'),
    'setup2': () => go('#/setup?step=3'),
    'join': () => { go('#/spaces/infrastructure'); toast('Welcome to the Infrastructure space'); },
    'reset': () => { go('#/'); toast('Password saved'); },
    'ask': (f) => { const q = f.q.value.trim(); if (q) go('#/assistant?q=' + enc(q)); },
    'create-space': () => { closeOverlay(true); go('#/spaces/applications'); toast('Space created'); },
    'delete-space': () => { closeOverlay(); toast('Demo: deleting is not simulated.'); },
    'save': () => toast('Changes saved'),
    'knowledge': () => { go('#/knowledge'); toast('Article submitted for approval'); },
    'version': () => { closeOverlay(); toast('Version imported: text extraction in progress'); },
    'access': () => { closeOverlay(); toast('Access updated'); },
    'status': () => { closeOverlay(); toast('Status updated'); },
    'new-folder': () => { closeOverlay(); toast('Folder created'); }
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (a && !a.disabled) {
      const act = a.dataset.action;
      if (ACTIONS[act]) {
        if (act !== 'close-wrap') e.preventDefault();
        ACTIONS[act](a, e);
        if (act !== 'menu' && act !== 'close-wrap') closeMenus();
        return;
      }
    }
    const mk = e.target.closest('[data-mock]');
    if (mk) {
      e.preventDefault();
      toast(mk.dataset.mock || 'Demo: this action is not simulated.');
      closeMenus();
      return;
    }
    if (!e.target.closest('.menu')) closeMenus();
    if (e.target.closest('#sidebar a')) closeSidebar();
  });

  document.addEventListener('submit', (e) => {
    const f = e.target;
    const kind = f.dataset.form;
    if (!kind || !FORMS[kind]) return;
    e.preventDefault();
    FORMS[kind](f);
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-facet]')) {
      const set = state.ex[t.dataset.facet];
      if (t.checked) set.delete(t.value); else set.add(t.value);
      renderList();
    } else if (t.matches('[data-date]')) {
      state.date = t.value;
      renderList();
    } else if (t.matches('[data-audit]')) {
      renderAudit();
    } else if (t.matches('[data-theme-select]')) {
      setTheme(t.value);
    } else if (t.name === 'access') {
      const pick = $('#people-pick');
      const on = t.value === 'restricted';
      pick.style.opacity = on ? '' : '.5';
      pick.style.pointerEvents = on ? '' : 'none';
      pick.setAttribute('aria-disabled', String(!on));
    }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.matches('[data-confirm-name]')) $('#confirm-delete').disabled = t.value.trim() !== t.dataset.confirmName;
    if (t.id === 'pal-in') renderPalette(t.value);
  });

  document.addEventListener('keydown', (e) => {
    const ae = document.activeElement;
    const typing = ae && (/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) || ae.isContentEditable);
    const overlayOpen = !$('#overlay').hidden;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openOverlay('palette'); return; }
    if (e.key === 'Escape') {
      if (overlayOpen) { closeOverlay(); return; }
      closeMenus();
      closeSidebar();
      return;
    }
    if (ae && ae.id === 'pal-in') {
      if (e.key === 'ArrowDown') { e.preventDefault(); palMove(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); palMove(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); palRun(state.pal.sel); }
      return;
    }
    if (ae && ae.id === 'ask' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ae.form.requestSubmit(); return; }
    if (overlayOpen && e.key === 'Tab') {
      const f = $$('#overlay button:not([disabled]), #overlay a[href], #overlay input:not([disabled]), #overlay select:not([disabled]), #overlay textarea').filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && ae === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && ae === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      return;
    }
    if (typing || e.ctrlKey || e.metaKey || e.altKey || overlayOpen) return;
    if (e.key === '/') { e.preventDefault(); openOverlay('palette'); }
    else if ((e.key === 'i' || e.key === 'I') && $('.app')) { e.preventDefault(); openOverlay('import'); }
  });

  window.addEventListener('hashchange', render);
  render();
})();
