/* Démo Lore : rendu des écrans, navigation et interactions. */
(function () {
  'use strict';
  var D = window.SL;
  /* Chaque passage reçoit une ancre, pour ouvrir le document au bon endroit. */
  D.docs.forEach((d) => d.passages.forEach((p, i) => { if (!p.anchor) p.anchor = 'p-' + i; }));

  /* =========================================================
     Utilitaires
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
  /* Une date en milieu de phrase : « hier », « aujourd’hui », ou la date elle-même. */
  const inText = (w) => String(w).replace(/^(Hier|Aujourd’hui)/, (m) => m.toLowerCase());
  const folderName = (d) => { const f = (D.folders[d.space] || []).find((x) => x.id === d.folder); return f ? f.name : ''; };
  const spaceIco = (s, lg) => `<span class="space-ico${lg ? ' space-ico-lg' : ''}" style="--c:${s.color}" aria-hidden="true">${esc(s.name[0])}</span>`;
  const fmtIco = (d) => (d.format === 'PDF' ? 'file' : 'file-text');
  const pill = (t, c) => `<span class="pill ${c || 'p-gray'}">${esc(t)}</span>`;
  const vb = (v) => {
    const title = v === 'Plus tard' ? 'Prévu après la v0.3' : v.indexOf('v0') === 0 ? 'Prévu en ' + v : v === 'Offres payantes' ? 'Réservé aux offres payantes' : 'Prévu ' + v.toLowerCase();
    return `<span class="vb" title="${title}">${esc(v)}</span>`;
  };
  const DEFAULT_Q = 'pg_restore role "does not exist"';
  /* Bouton qui replie ou rouvre un panneau latéral (géré par common.js). */
  const panelBtn = (panel, label, icon, key) => `<button class="icon-btn" type="button" data-action="toggle-panel" data-panel="${panel}" data-label="${label}"${key ? ` data-key="${key}"` : ''} aria-expanded="true">${ico(icon)}</button>`;

  /* Typographie française : espaces insécables avant : ; ? ! % » et après «, séparateur de milliers. */
  function fr(html) {
    return html.replace(/ ([:;?!»%])/g, ' $1').replace(/« /g, '« ').replace(/(^|>)([^<]+)/g, (m, open, text) => open + text.replace(/(\d) (\d{3})(?!\d)/g, '$1 $2'));
  }

  const ST = {
    draft: { label: 'Brouillon', c: 'var(--st-draft)' },
    review: { label: 'En attente de validation', c: 'var(--st-review)' },
    published: { label: 'Publié', c: 'var(--st-published)' },
    validated: { label: 'Validée', c: 'var(--st-published)' },
    obsolete: { label: 'Obsolète', c: 'var(--st-obsolete)' },
    archived: { label: 'Archivé', c: 'var(--st-archived)' }
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

  const CAT = { 'Runbook': 'p-blue', 'Procédure d’exploitation': 'p-teal', 'Rapport d’incident': 'p-red', 'Documentation de sécurité': 'p-purple', 'Documentation constructeur': 'p-yellow', 'Documentation d’architecture': 'p-cyan', 'Documentation technique': 'p-gray' };
  const ROLE = { 'Responsable': 'p-purple', 'Contributeur': 'p-blue', 'Lecteur': 'p-gray', 'Propriétaire': 'p-orange', 'Administrateur': 'p-purple', 'Membre': 'p-gray' };
  const TECH = { 'PostgreSQL': 'p-blue', 'NFS': 'p-gray', 'IPsec': 'p-teal', 'Réseau': 'p-cyan', 'Kubernetes': 'p-purple', 'TLS': 'p-green', 'LDAP': 'p-orange' };
  const AUDIT = { 'Droits': 'p-purple', 'Import': 'p-blue', 'Consultation': 'p-gray', 'Connexion': 'p-red', 'Organisation': 'p-orange', 'Membres': 'p-teal', 'Statut': 'p-yellow', 'Téléchargement': 'p-cyan' };
  const STATE = { 'Actif': 'p-green', 'Invitation en attente': 'p-yellow', 'Désactivé': 'p-gray' };
  const catPill = (c) => pill(c, CAT[c]);
  const LANG = { fr: 'Français', en: 'Anglais' };

  function indexPill(d) {
    if (d.flags && d.flags.indexing) return `<span class="pill p-blue">${ico('spinner', 'spin')}En cours</span>`;
    if (d.flags && d.flags.scanned) return `<span class="pill p-yellow" title="Seuls le titre et les métadonnées sont recherchables">${ico('scan')}Numérisé</span>`;
    return `<span class="pill p-green">${ico('check')}Indexé</span>`;
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
     Recherche simulée (insensible aux accents et à la casse)
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
  /* Texte avec segments `code` et surlignage des termes. */
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
     État et routage
     ========================================================= */
  const state = { lastQ: null, ex: { space: new Set(), category: new Set(), status: new Set() }, date: 'all', pdfPage: {}, lastFocus: null, pal: { items: [], sel: 0 } };

  /* Mêmes adresses que l'application : l'accueil est la racine (#/). */
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
    document.title = (view.title ? view.title + ' – ' : '') + 'Démo Lore';
    window.scrollTo(0, 0);
    const h1 = $('#root h1');
    if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    if (view.after) view.after();
    syncTheme();
    const o = params.get('open');
    if (o) openOverlay(o, params);
  }

  /* =========================================================
     Structure : barre latérale et en-tête de vue
     ========================================================= */
  function shell(view) {
    return `<div class="app">${sidebar(view.nav || '')}<div class="scrim" data-action="sidebar-close" hidden></div>
      <div class="main">
        <header class="view-header">
          <button class="icon-btn menu-btn" type="button" data-action="nav-open" aria-label="Afficher la barre latérale" title="Afficher la barre latérale ([)">${ico('sidebar-left')}</button>
          <nav class="crumbs" aria-label="Fil d’Ariane">${view.crumbs || ''}</nav>
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
          <li><a class="nav-link" href="#/spaces/${s.id}/members"${sub === 'members' ? ' aria-current="page"' : ''}>${ico('users')}<span class="label">Membres</span></a></li>
          <li><a class="nav-link" href="#/spaces/${s.id}/settings"${sub === 'settings' ? ' aria-current="page"' : ''}>${ico('settings')}<span class="label">Paramètres</span></a></li>
        </ul>` : '';
      return `<li><a class="nav-link" href="#/spaces/${s.id}">${spaceIco(s)}<span class="label">${esc(s.name)}</span><span class="count">${s.docs}</span></a>${subList}</li>`;
    }).join('');
    return `<aside class="sidebar" id="sidebar" aria-label="Navigation principale">
      <div class="ws">
        <div class="menu" style="flex:1;min-width:0">
          <button class="ws-btn" type="button" data-action="menu" aria-expanded="false" aria-haspopup="true"><span class="ws-logo" aria-hidden="true">DG</span><span class="name">${esc(D.org.name)}</span>${ico('chevron')}</button>
          <div class="popover" hidden>
            <a class="menu-item" href="#/admin/general">${ico('settings')}Paramètres de l’organisation</a>
            <button class="menu-item" type="button" data-action="open" data-overlay="invite">${ico('users')}Inviter des personnes</button>
            <div class="menu-sep"></div>
            <a class="menu-item" href="#/login">${ico('logout')}Se déconnecter</a>
          </div>
        </div>
        <button class="icon-btn" type="button" data-action="open" data-overlay="import" title="Importer des documents (I)" aria-label="Importer des documents">${ico('upload')}</button>
        <button class="icon-btn side-collapse" type="button" data-action="toggle-panel" data-panel="nav" data-label="la barre latérale" data-key="[">${ico('sidebar-left')}</button>
      </div>
      <button class="search-trigger" type="button" data-action="palette">${ico('search')}<span>Rechercher</span><span class="kbd">Ctrl K</span></button>
      <div class="side-scroll">
      <nav aria-label="Environnement"><ul class="nav">
        ${link('#/', 'home', 'home', 'Accueil')}
        ${link('#/search', 'search', 'search', 'Recherche')}
        ${link('#/knowledge', 'knowledge', 'book', 'Base de connaissances', vb('v0.2'))}
        ${link('#/dashboard', 'dashboard', 'chart', 'Tableau de bord', vb('v0.2'))}
        ${link('#/assistant', 'assistant', 'ask', 'Assistant', vb('v0.3'))}
      </ul></nav>
      <nav aria-labelledby="nav-spaces">
        <div class="nav-head"><h2 id="nav-spaces">Espaces</h2><span><a class="icon-btn" href="#/spaces" title="Tous les espaces" aria-label="Tous les espaces">${ico('grid')}</a><button class="icon-btn" type="button" data-action="open" data-overlay="create-space" title="Créer un espace" aria-label="Créer un espace">${ico('plus')}</button></span></div>
        <ul class="nav">${spaces}</ul>
      </nav>
      <nav aria-labelledby="nav-org">
        <div class="nav-head"><h2 id="nav-org">Organisation</h2></div>
        <ul class="nav">
          ${link('#/admin/general', 'admin', 'settings', 'Administration')}
          ${link('#/sources', 'sources', 'plug', 'Sources connectées', vb('Plus tard'))}
        </ul>
      </nav>
      </div>
      <div class="side-foot">
        <a class="me" href="#/account"${active === 'account' ? ' aria-current="page"' : ''}>${avatar('as')}<span>Amenan Souaga</span></a>
        <button class="icon-btn" type="button" data-action="theme" aria-label="Changer de thème" title="Changer de thème">${ico('theme')}</button>
        <a class="icon-btn" href="#/login" aria-label="Se déconnecter" title="Se déconnecter">${ico('logout')}</a>
      </div>
    </aside>`;
  }

  /* =========================================================
     Écrans d'accès
     ========================================================= */
  function authPage(title, inner, wide) {
    return { auth: true, title, html: `<div class="auth"><div class="auth-card${wide ? ' auth-wide' : ''}"><div class="auth-logo">${logo(36)}</div>${inner}</div></div>` };
  }

  function screenSetup(m, p) {
    const step = Math.min(3, Math.max(1, parseInt(p.get('step') || '1', 10) || 1));
    const names = ['Organisation', 'Compte administrateur', 'Terminé'];
    const stepper = `<ol class="steps">${names.map((n, i) => `<li${i + 1 === step ? ' aria-current="step"' : ''}${i + 1 < step ? ' class="done"' : ''}><span class="n">${i + 1 < step ? '✓' : i + 1}</span>${n}</li>`).join('')}</ol>`;
    let inner;
    if (step === 1) {
      inner = `<h1>Configurer Lore</h1><p class="lead">Premier lancement de cette installation.</p>${stepper}
        <div class="auth-panel"><form class="form" data-form="setup1">
          <div class="field"><label for="o-name">Nom de l’organisation</label><input class="input" id="o-name" value="DadaGroup" required></div>
          <div class="field"><label for="o-url">Adresse publique</label><input class="input input-mono" id="o-url" value="${D.org.url}"><span class="help">L’adresse à laquelle votre équipe ouvrira Lore. Elle sert aussi aux liens d’invitation.</span></div>
          <div class="field"><label for="o-lang">Langue de l’interface</label><select class="select" id="o-lang"><option>Français</option><option>English</option></select></div>
          <div class="callout">${ico('info')}<p>Cet écran n’apparaît qu’au premier lancement. Lore n’a aucun compte ni mot de passe par défaut.</p></div>
          <button class="btn btn-primary btn-lg btn-block" type="submit">Continuer</button>
        </form></div>`;
    } else if (step === 2) {
      inner = `<h1>Créer le compte administrateur</h1><p class="lead">Ce compte sera propriétaire de l’organisation.</p>${stepper}
        <div class="auth-panel"><form class="form" data-form="setup2">
          <div class="field"><label for="a-name">Nom complet</label><input class="input" id="a-name" value="Wilfried Kouakou" required></div>
          <div class="field"><label for="a-mail">E-mail</label><input class="input" id="a-mail" type="email" value="wilfried.kouakou@dada.group" required></div>
          <div class="form-2">
            <div class="field"><label for="a-pw">Mot de passe</label><input class="input" id="a-pw" type="password" value="motdepasse-exemple"><span class="help">12 caractères au minimum.</span></div>
            <div class="field"><label for="a-pw2">Confirmation</label><input class="input" id="a-pw2" type="password" value="motdepasse-exemple"></div>
          </div>
          <div class="row-between"><a class="btn btn-ghost" href="#/setup">Retour</a><button class="btn btn-primary btn-lg" type="submit">Créer le compte</button></div>
        </form></div>`;
    } else {
      inner = `<h1>DadaGroup est prête</h1><p class="lead">Voici les trois premières choses à faire.</p>${stepper}
        <div class="auth-panel"><ul class="next-list">
          <li><a href="#/spaces?open=create-space"><span class="cat-ico">${ico('grid')}</span><span><strong>Créer un premier espace</strong><span class="help">Un espace par équipe ou par domaine : Infrastructure, Réseau, Support…</span></span></a></li>
          <li><a href="#/admin/members?open=invite"><span class="cat-ico">${ico('users')}</span><span><strong>Inviter votre équipe</strong><span class="help">Par lien, sans serveur de messagerie.</span></span></a></li>
          <li><a href="#/?open=import"><span class="cat-ico">${ico('upload')}</span><span><strong>Importer des documents</strong><span class="help">PDF, Word, texte et Markdown.</span></span></a></li>
        </ul></div>
        <a class="btn btn-primary btn-lg btn-block" href="#/">Ouvrir Lore</a>`;
    }
    return authPage('Configuration initiale', inner, true);
  }

  function screenLogin(m, p) {
    const err = p.get('error');
    return authPage('Connexion', `<h1>Connexion à Lore</h1><p class="lead">${esc(D.org.name)}</p>
      <div class="auth-panel"><form class="form" data-form="login">
        ${err ? `<div class="callout callout-warn" role="alert">${ico('alert')}<p>E-mail ou mot de passe incorrect. Après 2 nouvelles tentatives, le compte sera bloqué 15 minutes.</p></div>` : ''}
        <div class="field"><label for="l-mail">E-mail</label><input class="input" id="l-mail" type="email" value="amenan.souaga@dada.group" autocomplete="username"></div>
        <div class="field"><div class="label-row"><label class="field-label" for="l-pw">Mot de passe</label><a class="link" href="#/forgot-password" style="font-size:12.5px">Mot de passe oublié ?</a></div><input class="input" id="l-pw" type="password" value="motdepasse-exemple" autocomplete="current-password"></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Se connecter</button>
        <div class="or">ou</div>
        <button class="btn btn-lg btn-block" type="button" data-mock="Après la v0.1 : connexion par le fournisseur d’identité de l’organisation (OpenID Connect).">${ico('key')}Continuer avec le fournisseur d’identité ${vb('Après v0.1')}</button>
      </form></div>
      <p class="auth-alt">Pas encore de compte ? Demandez un lien d’invitation à un administrateur.</p>`);
  }

  function screenInvitation() {
    const s = spaceById('infrastructure');
    return authPage('Invitation', `<h1>Rejoindre ${esc(D.org.name)}</h1><p class="lead">Amenan Souaga vous invite dans l’espace ${esc(s.name)}, avec le rôle Contributeur.</p>
      <div class="auth-panel"><form class="form" data-form="join">
        <div class="list-row" style="border:1px solid var(--border);border-radius:8px">${spaceIco(s, true)}<div class="list-main"><div class="list-title">${esc(s.name)}</div><div class="list-sub">${s.docs} documents, ${s.members} membres</div></div>${pill('Contributeur', ROLE.Contributeur)}</div>
        <div class="field"><label for="i-name">Nom complet</label><input class="input" id="i-name" placeholder="Prénom Nom"></div>
        <div class="field"><label for="i-mail">E-mail professionnel</label><input class="input" id="i-mail" type="email" placeholder="prenom.nom@dada.group"></div>
        <div class="field"><label for="i-pw">Mot de passe</label><input class="input" id="i-pw" type="password"><span class="help">12 caractères au minimum.</span></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Créer mon compte et rejoindre l’espace</button>
      </form></div>
      <p class="auth-alt">Ce lien ne sert qu’une fois et expire le 18 nov. 2026.</p>`);
  }

  function screenForgot() {
    return authPage('Mot de passe oublié', `<h1>Mot de passe oublié</h1><p class="lead">Un administrateur peut vous donner un lien de réinitialisation.</p>
      <div class="auth-panel"><div class="form">
        <div class="callout">${ico('info')}<p>L’envoi d’e-mails n’est pas configuré sur cette installation. Demandez à l’une de ces personnes de générer un lien de réinitialisation pour votre compte.</p></div>
        <ul class="list">
          <li><div class="list-row">${avatar('wk', true)}<div class="list-main"><div class="list-title">Wilfried Kouakou</div><div class="list-sub">wilfried.kouakou@dada.group</div></div>${pill('Propriétaire', ROLE['Propriétaire'])}</div></li>
          <li><div class="list-row">${avatar('as', true)}<div class="list-main"><div class="list-title">Amenan Souaga</div><div class="list-sub">amenan.souaga@dada.group</div></div>${pill('Administrateur', ROLE.Administrateur)}</div></li>
        </ul>
        <p class="help">Si l’envoi d’e-mails est configuré (option SMTP), cette page propose de recevoir le lien directement.</p>
      </div></div>
      <p class="auth-alt"><a class="link" href="#/login">Retour à la connexion</a></p>`);
  }

  function screenReset() {
    return authPage('Nouveau mot de passe', `<h1>Choisir un nouveau mot de passe</h1><p class="lead">Compte d’Hervé Coulibaly, herve.coulibaly@dada.group</p>
      <div class="auth-panel"><form class="form" data-form="reset">
        <div class="field"><label for="r-pw">Nouveau mot de passe</label><input class="input" id="r-pw" type="password"><span class="help">12 caractères au minimum.</span></div>
        <div class="field"><label for="r-pw2">Confirmation</label><input class="input" id="r-pw2" type="password"></div>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Enregistrer et se connecter</button>
      </form></div>
      <p class="auth-alt">Ce lien, généré par Amenan Souaga, ne sert qu’une fois et expire dans 24 heures.</p>`);
  }

  /* =========================================================
     Accueil et espaces
     ========================================================= */
  function docRowLink(d, side) {
    const s = spaceById(d.space);
    return `<li><a class="list-row" href="#/documents/${d.id}">${ico(fmtIco(d))}<div class="list-main"><div class="list-title">${esc(d.title)}</div><div class="list-sub">${esc(s.name)} › ${esc(folderName(d))}</div></div><div class="list-side">${status(d.status)}<span>${side}</span></div></a></li>`;
  }

  function screenHome() {
    const recent = [['restaurer-pg', 'Consulté il y a 2 heures'], ['inc-2291', 'Consulté hier'], ['guide-baie', 'Consulté le 8 nov.']];
    const tiles = D.spaces.map((s) => `<a class="tile" href="#/spaces/${s.id}">${spaceIco(s, true)}<div><div class="tile-name">${esc(s.name)}</div><div class="tile-sub">${s.docs} documents</div><div class="tile-sub">Votre rôle : ${s.role}</div></div></a>`).join('');
    const feed = D.audit.filter((a) => a.who && a.type !== 'Consultation').slice(0, 6).map((a) => `<li>${avatar(a.who)}<span><b>${esc(person(a.who).name)}</b> ${esc(a.text)}</span><time>${esc(a.when.split(',')[0])}</time></li>`).join('');
    return {
      nav: 'home', title: 'Accueil',
      crumbs: crumbs([{ label: 'Accueil' }]),
      actions: `<button class="btn btn-primary" type="button" data-action="open" data-overlay="import">${ico('upload')}<span class="btn-label">Importer</span></button>`,
      html: `<div class="pad"><div class="home">
        <div class="stack">
          <div><h1 class="page-title">Bonjour, Amenan</h1><p class="page-intro">Mercredi 11 novembre 2026</p></div>
          <section><h2 class="section-title">Reprendre</h2><ul class="list">${recent.map(([id, w]) => docRowLink(docById(id), w)).join('')}</ul></section>
          <section><div class="row-between"><h2 class="section-title">Vos espaces</h2><a class="link" href="#/spaces">Tous les espaces</a></div>
            <div class="tiles">${tiles}<button class="tile tile-new" type="button" data-action="open" data-overlay="create-space"><span class="space-ico space-ico-lg">${ico('plus')}</span><span>Créer un espace</span></button></div></section>
          <section><h2 class="section-title">Activité récente dans vos espaces</h2><ul class="feed">${feed}</ul></section>
        </div>
        <aside class="stack">
          <section><h2 class="section-title">À traiter</h2><div class="inbox">
            <a href="#/?open=import">${ico('alert')}<span>Import en échec</span><span class="n">2</span></a>
            <a href="#/documents/plan-reprise">${ico('spinner', 'spin')}<span>Indexation en cours</span><span class="n">1</span></a>
            <a href="#/knowledge">${stIcon('review')}<span>Fiches à valider</span>${vb('v0.2')}<span class="n">2</span></a>
            <a href="#/dashboard">${ico('clock')}<span>Révisions en retard</span>${vb('v0.2')}<span class="n">2</span></a>
          </div></section>
          <section><h2 class="section-title">Raccourcis clavier</h2><ul class="shortcuts">
            <li><span>Rechercher ou aller à</span><span><span class="kbd">Ctrl K</span></span></li>
            <li><span>Rechercher</span><span class="kbd">/</span></li>
            <li><span>Importer des documents</span><span class="kbd">I</span></li>
            <li><span>Afficher ou masquer la barre latérale</span><span class="kbd">[</span></li>
            <li><span>Afficher ou masquer le panneau de droite</span><span class="kbd">]</span></li>
            <li><span>Fermer une fenêtre</span><span class="kbd">Échap</span></li>
          </ul></section>
        </aside>
      </div></div>`
    };
  }

  function screenSpaces() {
    const rows = D.spaces.map((s, i) => `<tr><td class="rn">${i + 1}</td><td class="primary"><div class="cell-title">${spaceIco(s)}<a href="#/spaces/${s.id}">${esc(s.name)}</a><a class="expand" href="#/spaces/${s.id}" aria-label="Ouvrir ${esc(s.name)}">${ico('expand')}</a></div></td><td>${esc(s.desc)}</td><td class="num">${s.docs}</td><td class="num">${s.members}</td><td>${pill(s.role, ROLE[s.role])}</td><td>${esc(s.activity)}</td></tr>`).join('');
    return {
      nav: 'spaces', title: 'Espaces',
      crumbs: crumbs([{ label: 'Espaces' }]),
      actions: `<button class="btn btn-primary" type="button" data-action="open" data-overlay="create-space">${ico('plus')}<span class="btn-label">Créer un espace</span></button>`,
      html: `<h1 class="sr-only">Espaces</h1>
        <div class="toolbar"><div class="views"><a class="view-tab" href="#/spaces" aria-current="page">${ico('grid')}Tous les espaces</a></div>
          <div class="tools"><button class="tool" type="button" data-mock>${ico('filter')}Filtrer</button><button class="tool" type="button" data-mock>${ico('sort')}Trier</button></div></div>
        <div class="grid-wrap"><table class="grid"><thead><tr><th class="rn"></th><th class="primary"><span class="th">${ico('text')}Nom</span></th><th><span class="th">${ico('text')}Description</span></th><th><span class="th">${ico('hash')}Documents</span></th><th><span class="th">${ico('hash')}Membres</span></th><th><span class="th">${ico('tag')}Votre rôle</span></th><th><span class="th">${ico('calendar')}Dernière activité</span></th></tr></thead><tbody>${rows}</tbody></table></div>
        <div class="grid-foot"><span>${D.spaces.length} espaces</span><span>${D.org.docs} documents</span></div>`
    };
  }

  function spaceCrumbs(s, last) {
    const items = [{ label: 'Espaces', href: '#/spaces' }, { label: s.name, href: '#/spaces/' + s.id, pre: spaceIco(s) }];
    if (last) items.push({ label: last });
    return crumbs(items);
  }

  function libRow(d, n) {
    return `<tr class="${d.status === 'obsolete' ? 'is-obsolete' : ''}"><td class="rn">${n}</td>
      <td class="primary"><div class="cell-title">${ico(fmtIco(d))}<a href="#/documents/${d.id}"${d.lang === 'en' ? ' lang="en"' : ''}>${esc(d.title)}</a>${d.restricted ? `<svg class="ico lock" role="img" aria-label="Accès restreint"><use href="#i-lock"/></svg>` : ''}<a class="expand" href="#/documents/${d.id}" aria-label="Ouvrir le document">${ico('expand')}</a></div></td>
      <td>${status(d.status)}</td><td>${catPill(d.category)}</td><td>${who(d.owner)}</td><td>${esc(d.updated)}</td><td class="num">${d.version}</td>
      <td>${indexPill(d)}</td><td>${d.lang === 'en' ? '<span class="tag-lang">EN</span> Anglais' : 'Français'}</td><td>${esc(d.format)}</td></tr>`;
  }

  function screenLibrary(m, p) {
    const s = spaceById(m[1]);
    if (!s) return screen404();
    const actions = `<button class="btn" type="button" data-action="open" data-overlay="new-folder">${ico('folder-plus')}<span class="btn-label">Nouveau dossier</span></button><button class="btn btn-primary" type="button" data-action="open" data-overlay="import">${ico('upload')}<span class="btn-label">Importer</span></button>`;
    const base = { nav: 'space:' + s.id + ':docs', title: s.name, crumbs: spaceCrumbs(s), actions };
    if (s.empty) {
      base.html = `<div class="empty">${spaceIco(s, true)}<h1 class="page-title">${esc(s.name)} est vide</h1><p>Importez vos premiers documents ou invitez des collègues. Les PDF, fichiers Word, textes et Markdown sont indexés dès leur import.</p>
        <div class="actions"><button class="btn btn-primary btn-lg" type="button" data-action="open" data-overlay="import">${ico('upload')}Importer des documents</button><a class="btn btn-lg" href="#/spaces/${s.id}/members">${ico('users')}Inviter des membres</a></div>
        <p class="help">Astuce : créez des dossiers (Runbooks, Procédures, Rapports d’incident…) pour que chacun s’y retrouve.</p></div>`;
      return base;
    }
    if (s.id !== 'infrastructure') {
      base.html = `<div class="pad narrow"><h1 class="page-title">${esc(s.name)}</h1><p class="page-intro">${esc(s.desc)}</p><div class="callout callout-mock" style="margin-top:18px">${ico('info')}<p>Démo : seul l’espace Infrastructure est détaillé. Les autres espaces ont la même structure.</p><a class="btn" href="#/spaces/infrastructure">Ouvrir Infrastructure</a></div></div>`;
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
        <a class="view-tab" href="${qs({ view: null })}"${view === 'grid' ? ' aria-current="page"' : ''}>${ico('grid')}Grille</a>
        <a class="view-tab" href="${qs({ view: 'kanban' })}"${view === 'kanban' ? ' aria-current="page"' : ''}>${ico('kanban')}Kanban par statut</a>
      </div>
      <div class="tools">
        <button class="tool" type="button" data-mock="Choix des colonnes affichées : non simulé.">${ico('eye-off')}Masquer des colonnes</button>
        <div class="menu"><button class="tool${folder ? ' is-on-blue' : ''}" type="button" data-action="menu" aria-expanded="false">${ico('filter')}${folder ? 'Dossier : ' + esc(fName) : 'Filtrer'}</button>
          <div class="popover popover-right" hidden>
            <a class="menu-item" href="${qs({ folder: null })}">${ico('file-text')}Tous les documents<span class="kbd">${D.docs.filter((d) => d.space === s.id).length}</span></a>
            <div class="menu-sep"></div>
            ${folders.map((f) => `<a class="menu-item" href="${qs({ folder: f.id })}">${ico('folder')}${esc(f.name)}<span class="kbd">${D.docs.filter((d) => d.folder === f.id).length}</span></a>`).join('')}
          </div></div>
        ${view === 'grid' ? `<div class="menu"><button class="tool${grouped ? ' is-on' : ''}" type="button" data-action="menu" aria-expanded="false">${ico('group')}${grouped ? 'Regroupé par dossier' : 'Regrouper'}</button>
          <div class="popover popover-right" hidden><a class="menu-item" href="${qs({ group: null })}">${ico('folder')}Par dossier</a><a class="menu-item" href="${qs({ group: 'none' })}">${ico('x')}Aucun regroupement</a></div></div>` : ''}
        <button class="tool is-on-green" type="button" data-mock="Tri : non simulé.">${ico('sort')}Trié par mise à jour</button>
        <span class="divider-v"></span>
        <button class="tool" type="button" data-action="palette" aria-label="Rechercher">${ico('search')}</button>
      </div></div>`;
    let body;
    if (view === 'kanban') {
      const cols = ['draft', 'published', 'obsolete', 'archived'].map((st) => {
        const list = docs.filter((d) => d.status === st);
        return `<section class="column"><div class="column-head">${stIcon(st)}${ST[st].label}<span class="count">${list.length}</span></div><div class="cards">${list.map((d) => `<a class="card" href="#/documents/${d.id}"><div class="card-title">${esc(d.title)}${d.restricted ? ` <svg class="ico lock" aria-hidden="true"><use href="#i-lock"/></svg>` : ''}</div><div class="card-pills">${catPill(d.category)}${(d.flags && (d.flags.indexing || d.flags.scanned)) ? indexPill(d) : ''}</div><div class="card-meta">${who(d.owner)}<span>Version ${d.version}, ${esc(inText(d.updated))}</span></div></a>`).join('') || '<p class="column-empty">Aucun document</p>'}</div></section>`;
      }).join('');
      body = `<div class="board">${cols}</div>`;
    } else {
      let n = 0, rows = '';
      const head = `<thead><tr><th class="rn"></th><th class="primary"><span class="th">${ico('text')}Titre</span></th><th><span class="th">${ico('tag')}Statut</span></th><th><span class="th">${ico('tag')}Catégorie</span></th><th><span class="th">${ico('user')}Responsable</span></th><th><span class="th">${ico('calendar')}Mis à jour</span></th><th><span class="th">${ico('hash')}Version</span></th><th><span class="th">${ico('tag')}Indexation</span></th><th><span class="th">${ico('globe')}Langue</span></th><th><span class="th">${ico('file')}Format</span></th></tr></thead>`;
      if (grouped) {
        folders.forEach((f) => {
          const list = docs.filter((d) => d.folder === f.id);
          if (!list.length) return;
          rows += `<tr class="group-row"><td colspan="10"><div class="group-head">${ico('chevron')}<span class="lbl">Dossier</span><strong>${esc(f.name)}</strong><span class="count">${list.length}</span></div></td></tr>`;
          list.forEach((d) => { rows += libRow(d, ++n); });
        });
      } else docs.forEach((d) => { rows += libRow(d, ++n); });
      body = `<div class="grid-wrap"><table class="grid">${head}<tbody>${rows}</tbody></table></div><div class="grid-foot"><span>${docs.length} document${docs.length > 1 ? 's' : ''}</span>${docs.some((d) => d.flags && d.flags.indexing) ? `<span>${docs.filter((d) => d.flags && d.flags.indexing).length} en cours d’indexation</span>` : ''}${docs.some((d) => d.flags && d.flags.scanned) ? `<span>${docs.filter((d) => d.flags && d.flags.scanned).length} numérisé, non recherchable</span>` : ''}</div>`;
    }
    base.html = `<h1 class="sr-only">${esc(s.name)} : documents</h1>${toolbar}${body}`;
    return base;
  }

  /* =========================================================
     Document : contenu, propriétés, versions
     ========================================================= */
  function strata(d) {
    const n = d.versions.length;
    const bands = d.versions.map((v, i) => {
      const color = i === 0 ? 'var(--accent)' : i === n - 1 ? 'var(--s2)' : i % 2 ? 'var(--s4)' : 'var(--s3)';
      return `<button class="stratum" type="button" data-action="stratum" data-doc="${d.id}" data-v="${v.n}" aria-pressed="${i === 0}" style="--h:${v.w}px;--c:${color}"><span class="band" aria-hidden="true"></span><span class="stratum-label"><span>Version ${v.n}</span><span>${esc(v.short)}</span></span></button>`;
    }).join('');
    return `<div class="strata" role="group" aria-label="Historique des versions, de la plus récente à la plus ancienne">${bands}</div><div class="version-detail" id="vd" aria-live="polite">${versionDetail(d, d.versions[0])}</div><p class="caption">L’épaisseur d’une strate indique l’ampleur des modifications apportées par la version.</p>`;
  }
  function versionDetail(d, v) {
    const cur = v.n === d.version;
    return `<strong>Version ${v.n}${cur ? ', actuelle' : ''}</strong><p>Importée le ${esc(v.date)} par ${esc(person(v.by).name)}</p><p>${esc(v.note)}</p><div class="actions">${cur ? '' : `<button class="btn" type="button" data-mock="Affichage de la version ${v.n} : non simulé dans la démo.">Afficher</button>`}<button class="btn" type="button" data-mock="Téléchargement : non simulé dans la démo.">${ico('download')}Télécharger</button></div>`;
  }

  function bodyRestaurer() {
    return {
      toc: [['s-1', '1. Prérequis', 1], ['s-2', '2. Identifier la sauvegarde', 1], ['s-3', '3. Restaurer la base', 1], ['s-4', '4. Vérifier la restauration', 1], ['s-4-1', '4.1 Contrôles', 2], ['s-4-2', '4.2 Erreurs fréquentes', 2]],
      html: `<div class="prose">
        <p class="lede">Cette procédure restaure une base de production à partir de la dernière sauvegarde complète. Comptez 30 à 45 minutes pour une base de 50 Go.</p>
        <section id="s-1" class="found-target"><h2>1. Prérequis</h2><ul><li>Un accès SSH au serveur de restauration <code>pg-restore-01</code>.</li><li>Le rôle <code>dba</code> sur le cluster cible.</li><li>Un ticket de changement validé par l’astreinte.</li></ul></section>
        <section id="s-2" class="found-target"><h2>2. Identifier la sauvegarde</h2><p>Les sauvegardes complètes de la base de facturation sont produites chaque nuit à 2 h dans <code>/backups/pg-prod/facturation/</code>. Repérez la plus récente :</p><pre><code>ls -lh /backups/pg-prod/facturation/ | tail -n 5</code></pre></section>
        <section id="s-3" class="found-target"><h2>3. Restaurer la base</h2><p>Créez une base vide, puis restaurez la sauvegarde avec <code>pg_restore</code> et quatre processus en parallèle (<code>--jobs=4</code>) :</p><pre><code>createdb -U postgres facturation_restore
pg_restore -U postgres -d facturation_restore \\
  --jobs=4 --no-owner \\
  /backups/pg-prod/facturation/facturation_2026-11-10.dump</code></pre><p>Avec <code>--no-owner</code>, la propriété des objets n’est pas restaurée : ils appartiennent à l’utilisateur qui lance la restauration.</p></section>
        <h2 id="s-4">4. Vérifier la restauration</h2>
        <section id="s-4-1" class="found-target"><h3>4.1 Contrôles</h3><p>Comparez le nombre de lignes des tables principales avec celui de la production avant de rendre la base aux équipes :</p><pre><code>psql -U postgres -d facturation_restore \\
  -c "SELECT count(*) FROM factures;"</code></pre></section>
        <section id="s-4-2" class="found-target"><h3>4.2 Erreurs fréquentes</h3><p>Les droits d’accès (<code>GRANT</code>) font toujours référence aux rôles d’origine. Si <code>pg_restore</code> signale <code>ERROR: role "app_rw" does not exist</code>, le rôle n’existe pas sur le serveur cible : créez-le, puis relancez la restauration.</p><pre><code>CREATE ROLE app_rw LOGIN;</code></pre><p>Si les droits d’origine ne sont pas utiles sur ce serveur, relancez plutôt avec l’option <code>--no-privileges</code>.</p></section>
      </div>`
    };
  }
  function bodyIncident() {
    return {
      toc: [['i-resume', 'Résumé', 1], ['i-impact', 'Impact', 1], ['i-chrono', 'Chronologie', 1], ['i-cause', 'Cause', 1], ['i-resol', 'Résolution', 1], ['i-actions', 'Actions correctives', 1]],
      html: `<div class="prose">
        <table><tbody><tr><th>Date</th><td>2 novembre 2026</td></tr><tr><th>Gravité</th><td>Majeure</td></tr><tr><th>Durée</th><td>1 h 48</td></tr><tr><th>Service touché</th><td>Facturation</td></tr></tbody></table>
        <section id="i-resume" class="found-target"><h2>Résumé</h2><p>Le 2 novembre, le disque de données de pg-prod-02 s’est rempli, ce qui a interrompu l’émission des factures pendant 1 h 48.</p></section>
        <section id="i-impact" class="found-target"><h2>Impact</h2><p>Aucune facture n’a pu être émise entre 14 h 05 et 15 h 53. Les factures en attente ont été émises automatiquement à la reprise.</p></section>
        <section id="i-chrono" class="found-target"><h2>Chronologie</h2><ul>
          <li>8 h 10 : le montage NFS d’archivage des WAL devient indisponible ; aucune alerte n’est levée.</li>
          <li>14 h 05 : le disque de pg-prod-02 est plein ; la base passe en lecture seule.</li>
          <li>14 h 32 : la restauration sur pg-prod-03 échoue avec <code>pg_restore: error: role "reporting" does not exist</code>. Le rôle avait été supprimé lors du nettoyage du 28 octobre.</li>
          <li>14 h 50 : le rôle est recréé et la restauration relancée.</li>
          <li>15 h 20 : le montage NFS est rétabli et les WAL archivés sont purgés.</li>
          <li>15 h 53 : retour à la normale ; la facturation reprend sur pg-prod-02.</li></ul></section>
        <section id="i-cause" class="found-target"><h2>Cause</h2><p>Les journaux de transactions (WAL) n’étaient plus archivés depuis la panne du montage NFS : le disque de pg-prod-02 s’est rempli en six heures.</p></section>
        <section id="i-resol" class="found-target"><h2>Résolution</h2><p>Le service a été remis en route après la purge des WAL archivés et le rétablissement du montage NFS. Durée totale de l’interruption : 1 h 48.</p></section>
        <section id="i-actions" class="found-target"><h2>Actions correctives</h2><ul><li>Alerter en cas d’échec d’archivage des WAL (Christ Koffi, 15 nov.).</li><li>Documenter la recréation des rôles dans le runbook de restauration : fait, voir <a class="link" href="#/documents/restaurer-pg">la version 4</a>.</li><li>Abaisser le seuil d’alerte disque à 80 % sur les serveurs de bases de données.</li></ul></section>
      </div>`
    };
  }
  function bodyTls() {
    return {
      toc: [['t-1', '1. Quand renouveler', 1], ['t-2', '2. Générer les certificats', 1], ['t-3', '3. Déployer et vérifier', 1]],
      html: `<div class="prose">
        <p class="lede">Renouvellement des certificats des services internes. Brouillon en cours de rédaction.</p>
        <section id="t-1" class="found-target"><h2>1. Quand renouveler</h2><p>Les certificats internes sont émis par l’autorité <code>dadagroup-int-ca</code> et renouvelés tous les 90 jours. Une alerte est envoyée 21 jours avant l’expiration.</p></section>
        <section id="t-2" class="found-target"><h2>2. Générer les certificats</h2><pre><code>step ca certificate api.facturation.int api.crt api.key \\
  --not-after 2160h</code></pre></section>
        <section id="t-3" class="found-target"><h2>3. Déployer et vérifier</h2><p>Déployez le certificat sur les deux nœuds du service, rechargez la configuration, puis vérifiez la date d’expiration servie.</p></section>
      </div>`
    };
  }
  function bodyBarman() {
    return {
      toc: [['b-1', 'Principe', 1], ['b-2', 'Restauration manuelle', 1]],
      html: `<div class="prose">
        <section id="b-1" class="found-target"><h2>Principe</h2><p>Barman réalise chaque nuit une sauvegarde complète des bases de production et archive en continu les journaux de transactions.</p></section>
        <section id="b-2" class="found-target"><h2>Restauration manuelle</h2><p>En cas d’échec de <code>pg_restore</code> avec <code>role "barman_ro" does not exist</code>, recréer le rôle depuis le script d’initialisation.</p><pre><code>barman recover pg-prod latest /var/lib/postgresql/16/main</code></pre></section>
      </div>`
    };
  }
  function bodyGeneric(d) {
    return {
      toc: d.passages.map((p) => [p.anchor, p.loc.replace(/^Section\s+/, ''), 1]),
      html: `<div class="prose"><div class="callout callout-mock" style="margin-bottom:16px">${ico('info')}<p>Aperçu simplifié : le contenu complet de ce document n’est pas reproduit dans la démo.</p></div>
        ${d.passages.map((p) => `<section id="${p.anchor}" class="found-target"><h2>${esc(p.loc.replace(/^Section\s+/, ''))}</h2><p>${hl(p.text, [])}</p></section>`).join('')}</div>`
    };
  }
  function pdfViewer(d, page) {
    const pg = d.pages && d.pages[page];
    let inner;
    if (pg && pg.cover) inner = `<div class="pdf-page cover" id="page-${page}"${d.lang === 'en' ? ' lang="en"' : ''}><h3>${esc(pg.heading)}</h3><p>${esc(pg.sub)}</p></div>`;
    else if (pg) inner = `<div class="pdf-page found-target" id="page-${page}"${d.lang === 'en' ? ' lang="en"' : ''}><h3>${esc(pg.heading)}</h3>${pg.paras.map((x) => `<p>${esc(x)}</p>`).join('')}<div class="pdf-foot">${page}</div></div>`;
    else {
      let lines = '';
      for (let i = 0; i < 22; i++) lines += `<div class="skel" style="width:${60 + ((page * 7 + i * 13) % 38)}%"></div>`;
      inner = `<div class="pdf-page" id="page-${page}"><div class="skel" style="width:45%;height:12px;margin-bottom:18px"></div>${lines}<div class="pdf-foot">${page}</div></div>`;
    }
    return `<div class="pdf" id="pdf-viewer"><div class="pdf-bar">
        <div class="pager"><button class="icon-btn" type="button" data-action="pdf-page" data-doc="${d.id}" data-delta="-1" aria-label="Page précédente"${page <= 1 ? ' disabled' : ''}>${ico('chevron-left')}</button><span>Page <b class="num">${page}</b> sur ${d.pagesCount}</span><button class="icon-btn" type="button" data-action="pdf-page" data-doc="${d.id}" data-delta="1" aria-label="Page suivante"${page >= d.pagesCount ? ' disabled' : ''}>${ico('chevron-right')}</button></div>
        <div class="pager"><button class="icon-btn" type="button" data-mock="Zoom : non simulé." aria-label="Réduire">−</button><span>100 %</span><button class="icon-btn" type="button" data-mock="Zoom : non simulé." aria-label="Agrandir">+</button></div>
      </div><div class="pdf-stage">${inner}</div></div>`;
  }
  function scanViewer() {
    const racks = [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${70 + i * 78}" y="150" width="58" height="150" fill="none" stroke="#27324A" stroke-width="2.2" rx="2"/><text x="${99 + i * 78}" y="322" font-size="15" text-anchor="middle" fill="#27324A" font-family="Comic Sans MS, Segoe Print, cursive">B${i + 1}</text><path d="M${99 + i * 78} 150 L${99 + i * 78} 112 L300 112" fill="none" stroke="#27324A" stroke-width="1.6"/>`).join('');
    return `<div class="pdf"><div class="pdf-bar"><div class="pager"><button class="icon-btn" type="button" disabled aria-label="Page précédente">${ico('chevron-left')}</button><span>Page <b class="num">1</b> sur 4</span><button class="icon-btn" type="button" data-mock="Pages suivantes : non simulées." aria-label="Page suivante">${ico('chevron-right')}</button></div><span>Image numérisée, sans couche texte</span></div>
      <div class="pdf-stage"><div class="scan-page"><svg viewBox="0 0 600 424" role="img" aria-label="Schéma manuscrit numérisé : six baies reliées au cœur de réseau">
        <text x="40" y="52" font-size="22" fill="#27324A" font-family="Comic Sans MS, Segoe Print, cursive">Salle B, baies et câblage</text>
        <rect x="250" y="70" width="100" height="40" fill="none" stroke="#27324A" stroke-width="2.2" rx="3"/><text x="300" y="95" font-size="13" text-anchor="middle" fill="#27324A" font-family="Comic Sans MS, Segoe Print, cursive">Cœur réseau</text>
        ${racks}
        <text x="40" y="380" font-size="13" fill="#27324A" font-family="Comic Sans MS, Segoe Print, cursive">Fibre OM4 entre B3 et B4, à refaire. Mis à jour par E.Y.</text>
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
    const items = d.versions.map((v) => `<li>${avatar(v.by)}<span><b>${esc(person(v.by).name)}</b> a importé la version ${v.n}<time>${esc(v.date)}</time></span></li>`);
    if (d.status === 'obsolete') items.unshift(`<li>${avatar('hc')}<span><b>Hervé Coulibaly</b> a marqué le document comme obsolète<time>${esc(d.obsoleteSince)}</time></span></li>`);
    if (d.restricted) items.unshift(`<li>${avatar('as')}<span><b>Amenan Souaga</b> a restreint l’accès à 2 personnes<time>11 nov. 2026</time></span></li>`);
    if (d.id === 'restaurer-pg') items.unshift(`<li>${avatar('eb')}<span><b>Eli Brou</b> a consulté le document<time>aujourd’hui</time></span></li>`);
    return `<section class="activity"><h2 class="section-title">Activité</h2><ol>${items.join('')}</ol></section>`;
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
      const what = from === 'assistant' ? 'Passage cité par l’assistant' : `Passage trouvé pour <q>${esc(q)}</q>`;
      banners.push(`<div class="callout callout-found">${ico('highlight')}<p>${what}${passage ? ', ' + esc(passage.loc) : ''}. Il est surligné ci-dessous.</p><a class="btn" href="${from === 'assistant' ? '#/assistant/c1' : '#/search?q=' + enc(q)}">${from === 'assistant' ? 'Retour à la réponse' : 'Retour aux résultats'}</a></div>`);
    }
    if (d.status === 'obsolete') {
      const r = docById(d.replacedBy);
      banners.push(`<div class="callout callout-warn">${ico('alert')}<p>Ce document est obsolète depuis le ${esc(d.obsoleteSince)}. Utilisez plutôt <a class="link" href="#/documents/${r.id}">${esc(r.title)}</a>.</p></div>`);
    }
    if (d.flags && d.flags.scanned) banners.push(`<div class="callout callout-warn">${ico('scan')}<p>Document numérisé : son contenu n’est pas recherchable. Seuls son titre, sa description et ses métadonnées le sont.</p><button class="btn" type="button" data-mock="Ajout d’une description : non simulé.">Ajouter une description</button></div>`);
    if (d.flags && d.flags.indexing) banners.push(`<div class="callout">${ico('spinner', 'spin')}<p>Extraction du texte en cours : ce document apparaîtra dans les résultats de recherche d’ici quelques instants.</p></div>`);

    const members = D.spaceMembers[d.space] || [];
    const access = d.restricted
      ? `<p class="access-note">Accès restreint : seules ces personnes, les responsables de l’espace et les administrateurs voient ce document.</p>${d.grants.map((g) => `<div class="grant">${avatar(g)}${esc(person(g).name)}</div>`).join('')}<button class="btn" type="button" data-action="open" data-overlay="access" data-params="doc=${d.id}" style="margin-top:8px">${ico('lock')}Modifier l’accès</button>`
      : `<p class="access-note">Visible par ${members.length ? 'les ' + members.length + ' membres' : 'les membres'} de l’espace ${esc(s.name)}.</p><button class="btn" type="button" data-action="open" data-overlay="access" data-params="doc=${d.id}">${ico('lock')}Restreindre l’accès</button>`;
    const fmt = d.format === 'PDF' ? `PDF, ${d.pagesCount} pages, ${d.size}` : `${d.format}, ${d.size}`;
    const props = `<aside class="props" aria-label="Propriétés du document">
      <section><h2>Propriétés</h2><dl>
        <div class="prop"><dt>Statut</dt><dd><button class="prop-val" type="button" data-action="open" data-overlay="status" data-params="doc=${d.id}">${status(d.status)}</button></dd></div>
        <div class="prop"><dt>Responsable</dt><dd><button class="prop-val" type="button" data-mock="Changement de responsable : non simulé.">${who(d.owner)}</button></dd></div>
        <div class="prop"><dt>Catégorie</dt><dd><button class="prop-val" type="button" data-mock="Changement de catégorie : non simulé.">${catPill(d.category)}</button></dd></div>
        <div class="prop"><dt>Espace</dt><dd><a class="prop-val" href="#/spaces/${s.id}">${spaceIco(s)}${esc(s.name)}</a></dd></div>
        <div class="prop"><dt>Dossier</dt><dd><a class="prop-val" href="#/spaces/${s.id}?folder=${d.folder}">${ico('folder')}${esc(folderName(d))}</a></dd></div>
        <div class="prop"><dt>Langue</dt><dd><button class="prop-val" type="button" data-mock="Changer la langue relance l’indexation du document, pour que la recherche tienne compte de la nouvelle langue.">${LANG[d.lang]}</button></dd></div>
        <div class="prop"><dt>Format</dt><dd><span class="prop-val prop-static">${esc(fmt)}</span></dd></div>
        <div class="prop"><dt>Indexation</dt><dd><span class="prop-val prop-static">${indexPill(d)}</span></dd></div>
        <div class="prop"><dt>Révision prévue</dt><dd><span class="prop-val prop-static">${esc(d.review)} ${vb('v0.2')}</span></dd></div>
      </dl></section>
      <section><h2>Accès</h2>${access}</section>
      <section><h2>Versions</h2>${strata(d)}</section>
      ${body.toc ? `<section><h2>Sur cette page</h2><ul class="toc">${body.toc.map(([id, label, lvl]) => `<li${lvl > 1 ? ' class="sub"' : ''}><a href="#${id}" data-action="anchor" data-target="${id}"${id === anchor ? ' class="is-found"' : ''}>${esc(label)}</a></li>`).join('')}</ul></section>` : ''}
    </aside>`;

    const menu = `<div class="menu"><button class="icon-btn" type="button" data-action="menu" aria-expanded="false" aria-label="Autres actions">${ico('dots')}</button>
      <div class="popover popover-right" hidden>
        <button class="menu-item" type="button" data-action="open" data-overlay="status" data-params="doc=${d.id}">${stIcon(d.status)}Changer le statut</button>
        <button class="menu-item" type="button" data-action="open" data-overlay="access" data-params="doc=${d.id}">${ico('lock')}Gérer l’accès</button>
        <button class="menu-item" type="button" data-mock="Déplacement : non simulé.">${ico('folder')}Déplacer</button>
        <a class="menu-item" href="#/knowledge/new?from=document&doc=${d.id}">${ico('book')}Créer une fiche à partir du document ${vb('v0.2')}</a>
        <button class="menu-item" type="button" data-mock="Lien copié.">${ico('link')}Copier le lien</button>
        <div class="menu-sep"></div>
        <button class="menu-item" type="button" data-mock="Archivage : non simulé.">${ico('archive')}Archiver</button>
        <button class="menu-item danger" type="button" data-mock="Suppression : non simulée.">${ico('trash')}Supprimer</button>
      </div></div>`;

    return {
      nav: 'space:' + s.id + ':docs', title: d.title,
      crumbs: crumbs([{ label: s.name, href: '#/spaces/' + s.id, pre: spaceIco(s) }, { label: folderName(d), href: '#/spaces/' + s.id + '?folder=' + d.folder }, { label: d.title }]),
      actions: `<button class="icon-btn" type="button" data-mock="Téléchargement de l’original : non simulé." aria-label="Télécharger l’original" title="Télécharger l’original">${ico('download')}</button><button class="btn" type="button" data-action="open" data-overlay="version" data-params="doc=${d.id}">${ico('upload')}<span class="btn-label">Nouvelle version</span></button>${menu}${panelBtn('props', 'les propriétés', 'sidebar-right', ']')}`,
      html: `<div class="doc-view"><div class="doc-main"><div class="doc-inner">
          ${banners.join('')}
          <h1 class="doc-title"${d.lang === 'en' ? ' lang="en"' : ''}>${esc(d.title)}</h1>
          <div class="doc-sub">${status(d.status)}<span>Version ${d.version}</span><span>Mis à jour ${esc(d.updatedRel)} par ${esc(person(d.versions[0].by).name)}</span>${d.restricted ? `<span class="status">${ico('lock')}Accès restreint</span>` : ''}${d.lang === 'en' ? '<span class="tag-lang">EN</span>' : ''}</div>
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
     Recherche
     ========================================================= */
  const FACETS = {
    space: { label: 'Espace', get: (d) => spaceById(d.space).name },
    category: { label: 'Catégorie', get: (d) => d.category },
    status: { label: 'Statut', get: (d) => ST[d.status].label }
  };
  const dateOk = (d) => state.date === 'all' || d.age <= parseInt(state.date, 10);

  function screenSearch(m, p) {
    const q = (p.get('q') || '').trim();
    const mode = p.get('mode') === 'semantic' ? 'semantic' : 'keywords';
    if (q !== state.lastQ) { state.ex = { space: new Set(), category: new Set(), status: new Set() }; state.date = 'all'; state.lastQ = q; }
    const seg = `<div class="seg" role="group" aria-label="Type de recherche"><a href="#/search${mode === 'semantic' ? '?q=' + enc(DEFAULT_Q) : q ? '?q=' + enc(q) : ''}"${mode === 'keywords' ? ' aria-current="page"' : ''}>Mots-clés</a><a href="#/search?mode=semantic&q=${enc(D.semantic.question)}"${mode === 'semantic' ? ' aria-current="page"' : ''}>Mots-clés et sens ${vb('v0.2')}</a></div>`;
    const head = `<div class="search-head"><h1 class="sr-only">Recherche</h1>
      <form class="search-box" role="search" data-form="search">${ico('search')}<label class="sr-only" for="sq">Rechercher dans vos documents</label><input id="sq" name="q" type="search" value="${esc(q)}" placeholder="Rechercher dans vos documents" autocomplete="off">${mode === 'semantic' ? '<input type="hidden" name="mode" value="semantic">' : ''}<button class="btn btn-primary" type="submit">Rechercher</button></form>
      <div class="chips">${seg}${mode === 'keywords' && q ? '<span id="chips" style="display:contents"></span>' : ''}<span style="flex:1"></span>${q ? `<a class="btn" href="#/assistant?q=${enc(q)}">${ico('ask')}<span class="btn-label">Poser la question à l’assistant</span>${vb('v0.3')}</a>` : ''}</div></div>`;
    const base = { nav: 'search', title: q ? 'Recherche : ' + q : 'Recherche', crumbs: crumbs([{ label: 'Recherche' }]) };

    if (!q) {
      const recent = [DEFAULT_Q, 'bascule kubernetes', 'quota ceph', 'certificat -vpn'];
      base.html = `${head}<div class="results"><div class="home" style="margin-top:24px">
        <section><h2 class="section-title">Recherches récentes</h2><ul class="list">${recent.map((r) => `<li><a class="list-row" href="#/search?q=${enc(r)}">${ico('clock')}<div class="list-main"><div class="list-title" style="font-family:var(--mono);font-size:13px">${esc(r)}</div></div>${ico('chevron-right')}</a></li>`).join('')}</ul></section>
        <section><h2 class="section-title">Syntaxe</h2><div class="syntax">
          <code>"does not exist"</code><span>Expression exacte</span>
          <code>-barman</code><span>Exclure un mot</span>
          <code>pg_restore or pg_dump</code><span>L’un ou l’autre</span>
          <code>ERR_CONNECTION_REFUSED</code><span>Les identifiants techniques sont retrouvés tels quels</span>
          <code>role</code><span>Accents et majuscules ignorés : trouve aussi « rôle »</span>
        </div></section></div></div>`;
      base.title = 'Recherche';
      return base;
    }

    if (mode === 'semantic') {
      const items = D.semantic.results.map((r) => {
        const d = docById(r.doc);
        const pass = d.passages.find((x) => x.anchor === r.anchor) || d.passages[0];
        return `<article class="result">${ico(fmtIco(d))}<div class="result-body"><a class="result-title" href="#/documents/${d.id}?from=search&q=${enc(q)}&anchor=${r.anchor}">${esc(d.title)}</a>
          <div class="result-where"><span>${esc(spaceById(d.space).name)} › ${esc(folderName(d))}</span><span>${esc(pass.loc)}</span>${pill(r.both ? 'Mots-clés et sens' : 'Sens proche', r.both ? 'p-purple' : 'p-blue')}</div>
          <p class="why">${esc(r.why)}</p><p class="excerpt">${hl(pass.text, [])}</p>
          <div class="result-meta">${status(d.status)}<span>Version ${d.version}</span><span>Mis à jour ${esc(d.updatedRel)}</span></div></div></article>`;
      }).join('');
      base.html = `${head}<div class="results"><div class="callout" style="margin-top:16px">${ico('info')}<p>Aperçu de la v0.2 : la recherche combine la correspondance exacte des mots et la proximité de sens. Les résultats ci-dessous sont des exemples pour la question posée.</p></div>
        <div class="results-meta"><span>4 documents proches de votre question</span></div>${items}</div>`;
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
    const dates = [['all', 'À tout moment'], ['30', '30 derniers jours'], ['365', '12 derniers mois']];
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
      btn.innerHTML = fr(`${FACETS[k].label}${ex ? ' : ' + (values.size - ex) + ' sur ' + values.size : ''}${ico('chevron')}`);
    });
    const db = $('[data-chip="date"]');
    if (db) {
      db.classList.toggle('is-set', state.date !== 'all');
      db.innerHTML = fr(`${state.date === 'all' ? 'Date' : state.date === '30' ? '30 derniers jours' : '12 derniers mois'}${ico('chevron')}`);
    }
  }
  function renderList() {
    const host = $('#results');
    if (!host) return;
    const q = state.lastQ;
    const terms = flatTerms(q);
    const all = computeResults(q);
    if (!all.length) {
      host.innerHTML = fr(`<div class="empty">${ico('search')}<h2>Aucun document ne correspond à « ${esc(q)} »</h2><p>Vérifiez l’orthographe des identifiants, retirez un mot ou des guillemets. Les documents numérisés ne sont recherchables que par leur titre.</p>
        <div class="actions"><a class="btn" href="#/search?mode=semantic&q=${enc(D.semantic.question)}">Chercher par le sens ${vb('v0.2')}</a><a class="btn" href="#/assistant?q=${enc(q)}">${ico('ask')}Demander à l’assistant ${vb('v0.3')}</a></div>
        <p class="help">Les recherches sans résultat sont comptées dans le tableau de bord pour repérer les lacunes documentaires. ${vb('v0.2')}</p></div>`);
      return;
    }
    const visible = all.filter((r) => Object.keys(FACETS).every((k) => !state.ex[k].has(FACETS[k].get(r.doc))) && dateOk(r.doc));
    const items = visible.map((r) => {
      const d = r.doc;
      const s = spaceById(d.space);
      const best = r.matches[0];
      const href = `#/documents/${d.id}?from=search&q=${enc(q)}${best ? '&anchor=' + best.anchor : ''}`;
      const excerpt = best ? `<p class="excerpt">… ${hl(best.text, terms)} …</p>` : `<p class="excerpt excerpt-meta">${d.flags && d.flags.scanned ? 'Document numérisé : seul son titre correspond.' : 'Correspondance dans le titre.'}</p>`;
      const others = r.matches.slice(1);
      return `<article class="result${d.status === 'obsolete' ? ' is-obsolete' : ''}">${ico(fmtIco(d))}<div class="result-body">
        <a class="result-title" href="${href}"${d.lang === 'en' ? ' lang="en"' : ''}>${markText(d.title, terms)}</a>
        <div class="result-where"><span>${esc(s.name)} › ${esc(folderName(d))}</span>${best ? `<span>${esc(best.loc)}</span>` : ''}${catPill(d.category)}</div>
        ${excerpt}
        <div class="result-meta">${status(d.status)}<span>Version ${d.version}</span><span>Mis à jour ${esc(d.updatedRel)}</span>${d.status === 'obsolete' && d.replacedBy ? `<span>Remplacé par <a class="link" href="#/documents/${d.replacedBy}">${esc(docById(d.replacedBy).title)}</a></span>` : ''}${d.restricted ? `<span class="status">${ico('lock')}Accès restreint</span>` : ''}</div>
        ${others.length ? `<div class="more"><button class="link" type="button" data-action="toggle" data-target="more-${d.id}" aria-expanded="false" style="font-size:12.5px">${others.length} autre${others.length > 1 ? 's' : ''} passage${others.length > 1 ? 's' : ''} dans ce document</button><ul id="more-${d.id}" hidden>${others.map((x) => `<li><a href="#/documents/${d.id}?from=search&q=${enc(q)}&anchor=${x.anchor}">${esc(x.loc)}</a></li>`).join('')}</ul></div>` : ''}
      </div></article>`;
    }).join('');
    host.innerHTML = fr(`<div class="results-meta"><span>${visible.length} document${visible.length > 1 ? 's' : ''}${visible.length < all.length ? ' sur ' + all.length : ''}</span><span>Classés par pertinence. Les documents obsolètes apparaissent en dernier.</span></div>
      ${items || `<p class="help" style="padding:16px 0">Aucun résultat avec ces filtres.</p>`}
      <ul class="notes"><li>${ico('lock')}Seuls les documents auxquels vous avez accès apparaissent.</li><li>${ico('scan')}Les documents numérisés ne sont recherchables que par leur titre et leurs métadonnées.</li></ul>`);
    updateChipLabels(all);
  }

  /* =========================================================
     Membres et paramètres d'un espace
     ========================================================= */
  function roleCell(role, roles) {
    return `<div class="menu"><button class="pill ${ROLE[role]}" type="button" data-action="menu" aria-expanded="false" style="border:0;cursor:pointer">${esc(role)}${ico('chevron')}</button><div class="popover" hidden>${roles.map((r) => `<button class="menu-item" type="button" data-action="set-role" data-role="${r}">${pill(r, ROLE[r])}</button>`).join('')}</div></div>`;
  }

  function invitePanel(roles, def) {
    return `<div class="set-box" id="invite-panel" hidden style="margin:0 0 16px;padding:16px">
      <h3 style="font-size:14px">Inviter par lien</h3><p class="help" style="margin:2px 0 12px">Créez un lien et transmettez-le vous-même, par messagerie ou par e-mail. Aucun serveur de messagerie n’est nécessaire.</p>
      <div class="target-chips"><label class="help" for="inv-role">Rôle</label><select class="select select-sm" id="inv-role">${roles.map((r) => `<option${r === def ? ' selected' : ''}>${r}</option>`).join('')}</select><button class="btn" type="button" data-action="invite-create">${ico('link')}Créer le lien</button></div>
      <div id="invite-result" hidden style="margin-top:12px"><div class="target-chips"><label class="sr-only" for="inv-url">Lien d’invitation</label><input class="input input-mono" id="inv-url" readonly value="${D.org.url}/join#K7q2-vX9m-4TzR" style="flex:1;min-width:220px"><button class="btn" type="button" data-action="copy" data-target="inv-url">${ico('copy')}Copier</button></div><p class="help" style="margin-top:6px">Ce lien ne sert qu’une fois et expire dans 7 jours.</p></div>
    </div>`;
  }

  function screenSpaceMembers(m) {
    const s = spaceById(m[1]);
    if (!s) return screen404();
    const list = D.spaceMembers[s.id] || [{ id: 'as', role: 'Responsable', added: '11 nov. 2026' }];
    const roles = ['Lecteur', 'Contributeur', 'Responsable'];
    const rows = list.map((x, i) => `<tr><td class="rn">${i + 1}</td><td class="primary"><span class="who">${avatar(x.id)}${esc(person(x.id).name)}</span></td><td>${esc(person(x.id).email)}</td><td style="overflow:visible">${roleCell(x.role, roles)}</td><td>${esc(x.added)}</td><td><button class="btn btn-ghost" type="button" data-mock="Retrait d’un membre : non simulé.">Retirer</button></td></tr>`).join('');
    const restricted = D.docs.filter((d) => d.space === s.id && d.restricted);
    return {
      nav: 'space:' + s.id + ':members', title: s.name + ' : membres',
      crumbs: spaceCrumbs(s, 'Membres'),
      actions: `<button class="btn btn-primary" type="button" data-action="toggle" data-target="invite-panel" aria-expanded="false">${ico('plus')}<span class="btn-label">Inviter</span></button>`,
      html: `<div class="pad"><div class="stack" style="max-width:1040px;gap:0">
        <div><h1 class="page-title">Membres de ${esc(s.name)}</h1><p class="page-intro" style="margin-bottom:18px">${list.length} membres. Les administrateurs de l’organisation ont aussi accès à tout l’espace.</p>
          ${invitePanel(roles, 'Contributeur')}
          <div class="set-box" style="overflow:hidden"><div class="grid-wrap"><table class="grid" style="min-width:680px"><thead><tr><th class="rn"></th><th class="primary"><span class="th">${ico('user')}Membre</span></th><th><span class="th">${ico('mail')}E-mail</span></th><th><span class="th">${ico('tag')}Rôle</span></th><th><span class="th">${ico('calendar')}Ajouté le</span></th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>
          <section style="margin-top:28px"><h2 class="section-title">Documents restreints de cet espace <span class="muted">${restricted.length}</span></h2>
            ${restricted.length ? `<ul class="list">${restricted.map((d) => `<li><a class="list-row" href="#/documents/${d.id}">${ico('lock')}<div class="list-main"><div class="list-title">${esc(d.title)}</div><div class="list-sub">Visible par ${d.grants.map((g) => esc(person(g).name)).join(' et ')}, ainsi que par les responsables et les administrateurs</div></div>${ico('chevron-right')}</a></li>`).join('')}</ul>` : '<p class="help">Aucun document restreint.</p>'}
          </section>
        </div>
        <section style="margin-top:28px"><h2 class="section-title">Ce que permet chaque rôle</h2>
          <dl class="roles">
            <div><dt>${pill('Lecteur', ROLE.Lecteur)}</dt><dd>Consulte, recherche et télécharge les documents de l’espace.</dd></div>
            <div><dt>${pill('Contributeur', ROLE.Contributeur)}</dt><dd>Importe des documents, les modifie et en crée de nouvelles versions.</dd></div>
            <div><dt>${pill('Responsable', ROLE.Responsable)}</dt><dd>Gère aussi les membres, archive et supprime. Voit les documents restreints de l’espace.</dd></div>
          </dl>
          <p class="help" style="margin-top:10px">Pour qu’un document échappe aussi aux responsables, rangez-le dans un espace dédié, aux membres choisis.</p>
        </section>
      </div></div>`
    };
  }

  function screenSpaceSettings(m) {
    const s = spaceById(m[1]);
    if (!s) return screen404();
    return {
      nav: 'space:' + s.id + ':settings', title: s.name + ' : paramètres',
      crumbs: spaceCrumbs(s, 'Paramètres'),
      html: `<div class="pad"><div class="settings-inner">
        <h1 class="page-title">Paramètres de l’espace</h1>
        <form class="set-sec" data-form="save"><h2>Général</h2><div class="set-box">
          <div class="set-row"><div class="lbl"><strong>Nom</strong></div><div class="ctl"><input class="input" value="${esc(s.name)}" aria-label="Nom de l’espace"></div></div>
          <div class="set-row"><div class="lbl"><strong>Description</strong><p class="help">Affichée en tête de la bibliothèque.</p></div><div class="ctl"><input class="input" value="${esc(s.desc)}" aria-label="Description"></div></div>
          <div class="set-row"><div class="lbl"><strong>Adresse</strong><p class="help">${D.org.url}/spaces/${s.id}</p></div><div class="ctl"><input class="input input-mono" value="${s.id}" aria-label="Adresse de l’espace"></div></div>
          <div class="set-row"><div class="lbl"><strong>Couleur</strong></div><div class="ctl">${spaceIco(s, true)}<button class="btn" type="button" data-mock="Choix de la couleur : non simulé.">Changer</button></div></div>
        </div><div style="margin-top:12px"><button class="btn btn-primary" type="submit">Enregistrer</button></div></form>
        <section class="set-sec"><h2>Zone sensible</h2><div class="set-box danger-box">
          <div class="set-row"><div class="lbl"><strong>Archiver l’espace</strong><p class="help">Les documents restent consultables par les responsables, mais disparaissent de la navigation et de la recherche.</p></div><div class="ctl"><button class="btn" type="button" data-mock="Archivage : non simulé.">${ico('archive')}Archiver</button></div></div>
          <div class="set-row"><div class="lbl"><strong>Supprimer l’espace</strong><p class="help">Supprime définitivement ses ${s.docs} documents, leurs versions et leurs fichiers.</p></div><div class="ctl"><button class="btn btn-danger" type="button" data-action="open" data-overlay="delete-space" data-params="space=${s.id}">${ico('trash')}Supprimer</button></div></div>
        </div></section>
      </div></div>`
    };
  }

  /* =========================================================
     Réglages : compte et administration
     ========================================================= */
  function settingsNav(active) {
    const l = (href, key, icon, label, extra) => `<a class="nav-link" href="${href}"${active === key ? ' aria-current="page"' : ''}>${ico(icon)}<span class="label">${label}</span>${extra || ''}</a>`;
    return `<nav class="settings-nav" aria-label="Réglages">
      <h2>Mon compte</h2>${l('#/account', 'account', 'user', 'Profil et préférences')}
      <h2>Organisation</h2>
      ${l('#/admin/general', 'general', 'settings', 'Général')}
      ${l('#/admin/members', 'members', 'users', 'Membres')}
      ${l('#/admin/security', 'security', 'shield', 'Sécurité et connexion')}
      ${l('#/admin/storage', 'storage', 'database', 'Stockage et import')}
      ${l('#/admin/audit', 'audit', 'list', 'Journal d’audit')}
      ${l('#/admin/assistant', 'assistant', 'ask', 'Assistant', vb('v0.3'))}
      ${l('#/sources', 'sources', 'plug', 'Sources connectées', vb('Plus tard'))}
    </nav>`;
  }
  function settingsPage(key, title, inner, opts) {
    opts = opts || {};
    return {
      nav: opts.nav || 'admin', title,
      crumbs: crumbs([{ label: key === 'account' ? 'Mon compte' : 'Administration', href: key === 'account' ? '#/account' : '#/admin/general' }, { label: title, badge: opts.badge || '' }]),
      actions: panelBtn('settings', 'le menu des réglages', 'sidebar-left') + (opts.actions || ''),
      html: `<div class="settings">${settingsNav(key)}<div class="settings-main"><div class="settings-inner"${opts.wide ? ' style="max-width:none"' : ''}><h1 class="page-title">${esc(title)}</h1>${opts.intro ? `<p class="page-intro">${opts.intro}</p>` : ''}${inner}</div></div></div>`,
      after: opts.after
    };
  }
  const row = (label, help, ctl, extra) => `<div class="set-row"><div class="lbl"><strong>${label}${extra || ''}</strong>${help ? `<p class="help">${help}</p>` : ''}</div><div class="ctl">${ctl}</div></div>`;
  const sw = (on, dis, label) => `<label class="switch"><input class="sw" type="checkbox"${on ? ' checked' : ''}${dis ? ' disabled' : ''} aria-label="${label}"></label>`;

  function screenAccount() {
    return settingsPage('account', 'Profil et préférences', `
      <form class="set-sec" data-form="save"><h2>Profil</h2><div class="set-box">
        ${row('Photo', '', `${avatar('as', true)}<button class="btn" type="button" data-mock="Envoi d’une photo : non simulé.">Changer</button>`)}
        ${row('Nom complet', '', '<input class="input" value="Amenan Souaga" aria-label="Nom complet">')}
        ${row('E-mail', 'Sert d’identifiant de connexion.', '<input class="input" value="amenan.souaga@dada.group" aria-label="E-mail">')}
      </div><div style="margin-top:12px"><button class="btn btn-primary" type="submit">Enregistrer</button></div></form>
      <section class="set-sec"><h2>Préférences</h2><div class="set-box">
        ${row('Langue de l’interface', '', '<select class="select" aria-label="Langue de l’interface"><option>Français</option><option>English</option></select>')}
        ${row('Thème', 'Suit le réglage de votre système par défaut.', '<select class="select" data-theme-select aria-label="Thème"><option value="auto">Système</option><option value="light">Clair</option><option value="dark">Sombre</option></select>')}
      </div></section>
      <form class="set-sec" data-form="save"><h2>Mot de passe</h2><div class="set-box">
        ${row('Mot de passe actuel', '', '<input class="input" type="password" aria-label="Mot de passe actuel">')}
        ${row('Nouveau mot de passe', '12 caractères au minimum.', '<input class="input" type="password" aria-label="Nouveau mot de passe">')}
      </div><div style="margin-top:12px"><button class="btn" type="submit">Changer le mot de passe</button></div></form>
      <section class="set-sec"><h2>Sessions ouvertes</h2><div class="set-box">
        ${row('Chrome sur Windows', 'Cette session, Abidjan, active maintenant.', pill('Cette session', 'p-green'))}
        ${row('Firefox sur Ubuntu', 'Ouverte il y a 2 jours.', '<button class="btn" type="button" data-mock="Session fermée.">Déconnecter</button>')}
      </div><div style="margin-top:12px"><button class="btn" type="button" data-mock="Toutes les autres sessions sont fermées.">Déconnecter toutes les autres sessions</button></div></section>`,
      { nav: 'account' });
  }

  function screenAdmin(m) {
    const k = m[1];
    if (k === 'general') {
      return settingsPage('general', 'Général', `
        <form class="set-sec" data-form="save"><h2>Organisation</h2><div class="set-box">
          ${row('Nom', '', `<input class="input" value="${esc(D.org.name)}" aria-label="Nom de l’organisation">`)}
          ${row('Adresse publique', 'Utilisée dans les liens d’invitation et de réinitialisation.', `<input class="input input-mono" value="${D.org.url}" aria-label="Adresse publique">`)}
          ${row('Langue par défaut', 'Pour les nouveaux comptes.', '<select class="select" aria-label="Langue par défaut"><option>Français</option><option>English</option></select>')}
          ${row('Fuseau horaire', '', '<select class="select" aria-label="Fuseau horaire"><option>GMT (UTC)</option><option>Europe/Paris</option></select>')}
        </div><div style="margin-top:12px"><button class="btn btn-primary" type="submit">Enregistrer</button></div></form>
        <section class="set-sec"><h2>Modules</h2><p class="help">Lore fonctionne entièrement sans ces modules.</p><div class="set-box">
          ${row('Recherche par le sens', 'Combine la correspondance exacte des mots et la proximité de sens.', sw(false, true, 'Recherche par le sens'), vb('v0.2'))}
          ${row('Assistant', 'Désactivé par défaut. Nécessite un modèle de langage autorisé par l’organisation.', `${sw(false, true, 'Assistant')}<a class="btn" href="#/admin/assistant">Configurer</a>`, vb('v0.3'))}
        </div></section>`);
    }
    if (k === 'members') {
      const roles = ['Membre', 'Administrateur', 'Propriétaire'];
      const rows = D.orgMembers.map((x, i) => `<tr><td class="rn">${i + 1}</td><td class="primary"><span class="who">${avatar(x.id)}${esc(person(x.id).name)}</span></td><td>${esc(person(x.id).email)}</td><td style="overflow:visible">${roleCell(x.role, roles)}</td><td>${pill(x.state, STATE[x.state])}</td><td>${esc(x.spaces)}</td><td>${esc(x.last)}</td>
        <td style="overflow:visible"><div class="menu"><button class="icon-btn" type="button" data-action="menu" aria-expanded="false" aria-label="Actions pour ${esc(person(x.id).name)}">${ico('dots')}</button><div class="popover popover-right" hidden>
          <button class="menu-item" type="button" data-action="open" data-overlay="reset-link" data-params="for=${x.id}">${ico('key')}Générer un lien de réinitialisation</button>
          <button class="menu-item" type="button" data-mock="Désactivation : non simulée.">${ico('x')}Désactiver le compte</button>
          <div class="menu-sep"></div><button class="menu-item danger" type="button" data-mock="Retrait : non simulé.">${ico('trash')}Retirer de l’organisation</button></div></div></td></tr>`).join('');
      return settingsPage('members', 'Membres', `
        <div class="row-between" style="margin-top:20px"><div class="search-box" style="height:34px;max-width:300px;flex:1">${ico('search')}<input placeholder="Rechercher un membre" aria-label="Rechercher un membre"></div><button class="btn btn-primary" type="button" data-action="open" data-overlay="invite">${ico('plus')}Inviter</button></div>
        <div class="set-box" style="overflow:hidden"><div class="grid-wrap"><table class="grid" style="min-width:900px"><thead><tr><th class="rn"></th><th class="primary"><span class="th">${ico('user')}Membre</span></th><th><span class="th">${ico('mail')}E-mail</span></th><th><span class="th">${ico('tag')}Rôle</span></th><th><span class="th">${ico('tag')}État</span></th><th><span class="th">${ico('grid')}Espaces</span></th><th><span class="th">${ico('clock')}Dernière connexion</span></th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
        <div class="grid-foot" style="border-bottom:0"><span>6 membres affichés sur ${D.org.members}</span></div></div>`,
        { wide: true, intro: `${D.org.members} membres. Les propriétaires et administrateurs ont accès à tous les espaces.` });
    }
    if (k === 'security') {
      return settingsPage('security', 'Sécurité et connexion', `
        <form class="set-sec" data-form="save"><h2>Mots de passe et sessions</h2><div class="set-box">
          ${row('Longueur minimale', 'Les mots de passe sont hachés avec Argon2id.', '<input class="input" type="number" value="12" aria-label="Longueur minimale" style="width:90px"> caractères')}
          ${row('Tentatives avant blocage', '', '<input class="input" type="number" value="5" aria-label="Tentatives avant blocage" style="width:90px">')}
          ${row('Durée du blocage', '', '<select class="select" aria-label="Durée du blocage"><option>15 minutes</option><option>1 heure</option></select>')}
          ${row('Expiration après inactivité', '', '<select class="select" aria-label="Expiration après inactivité"><option>8 heures</option><option>24 heures</option><option>7 jours</option></select>')}
          ${row('Validité des liens d’invitation', '', '<select class="select" aria-label="Validité des liens d’invitation"><option>7 jours</option><option>48 heures</option><option>30 jours</option></select>')}
        </div><div style="margin-top:12px"><button class="btn btn-primary" type="submit">Enregistrer</button></div></form>
        <section class="set-sec"><h2 style="display:flex;align-items:center;gap:8px">Fournisseur d’identité ${vb('Après v0.1')}</h2><p class="help">Connexion avec le compte d’entreprise via OpenID Connect : Keycloak, Authentik, Google, GitLab, Entra ID… Inclus dans l’édition Community.</p><div class="set-box">
          ${row('Activer OpenID Connect', '', sw(false, true, 'Activer OpenID Connect'))}
          ${row('URL de l’émetteur', '', '<input class="input input-mono" disabled placeholder="https://sso.dada.group/realms/dadagroup" aria-label="URL de l’émetteur">')}
          ${row('Identifiant client', '', '<input class="input input-mono" disabled placeholder="lore" aria-label="Identifiant client">')}
        </div></section>
        <section class="set-sec"><h2 style="display:flex;align-items:center;gap:8px">SSO d’entreprise ${vb('Offres payantes')}</h2><div class="set-box">
          ${row('SAML, LDAP et Active Directory', 'Connexion avec l’annuaire de l’entreprise.', `<button class="btn" type="button" data-mock="Offres payantes.">En savoir plus</button>`)}
          ${row('Provisionnement SCIM et synchronisation des groupes', 'Comptes créés et désactivés automatiquement.', `<button class="btn" type="button" data-mock="Offres payantes.">En savoir plus</button>`)}
          ${row('SSO obligatoire', 'Interdit la connexion par mot de passe.', `<button class="btn" type="button" data-mock="Offres payantes.">En savoir plus</button>`)}
        </div></section>`);
    }
    if (k === 'storage') {
      return settingsPage('storage', 'Stockage et import', `
        <section class="set-sec"><h2>Utilisation</h2><div class="set-box">
          ${row('Volume stocké', 'Aucun quota en auto-hébergement.', `<strong class="num">${D.org.storage}</strong>`)}
          ${row('Documents', `Dans ${D.spaces.length} espaces.`, `<strong class="num">${D.org.docs}</strong>`)}
          ${row('Documents numérisés', 'Contenu non recherchable : seuls le titre et les métadonnées le sont.', `<strong class="num">${D.org.scanned}</strong><a class="btn" href="#/documents/schema-cablage">Voir un exemple</a>`)}
        </div></section>
        <form class="set-sec" data-form="save"><h2>Import</h2><div class="set-box">
          ${row('Taille maximale d’un fichier', 'Au-delà, l’import est refusé avec un message clair.', '<input class="input" type="number" value="50" aria-label="Taille maximale en mégaoctets" style="width:90px"> Mo')}
          ${row('Formats acceptés', '', 'PDF, Word (DOCX), texte et Markdown')}
        </div><div style="margin-top:12px"><button class="btn btn-primary" type="submit">Enregistrer</button></div></form>
        <section class="set-sec"><h2>Extraction du texte</h2><div class="set-box">
          ${row('Apache Tika', 'Intégré. S’exécute dans un processus isolé : un fichier piégé ne peut pas faire tomber l’application.', pill('Actif', 'p-green'))}
          ${row('Extracteur externe', 'Service optionnel, par exemple pour l’OCR ou les PDF complexes. Son installation et sa licence relèvent de votre organisation.', `<button class="btn" type="button" data-mock="Ajout d’un extracteur externe : non simulé.">${ico('plus')}Ajouter</button>`)}
          ${row('Reconnaissance de texte (OCR)', 'Hors v0.1 : les PDF sans texte sont détectés et signalés.', pill('Non disponible', 'p-gray'))}
        </div></section>
        <section class="set-sec"><h2>Fichiers</h2><div class="set-box">
          ${row('Emplacement', 'Volume local du conteneur.', '<code style="font-size:12.5px">/var/lib/lore/files</code>')}
          ${row('Stockage compatible S3', '', sw(false, true, 'Stockage compatible S3'), vb('Plus tard'))}
        </div></section>`);
    }
    if (k === 'audit') {
      const types = [...new Set(D.audit.map((a) => a.type))];
      return settingsPage('audit', 'Journal d’audit', `
        <div class="target-chips" style="margin:18px 0 12px">
          <select class="select select-sm" data-audit="type" aria-label="Type d’action"><option value="">Toutes les actions</option>${types.map((t) => `<option>${t}</option>`).join('')}</select>
          <select class="select select-sm" data-audit="who" aria-label="Personne"><option value="">Toutes les personnes</option>${[...new Set(D.audit.filter((a) => a.who).map((a) => a.who))].map((w) => `<option value="${w}">${esc(person(w).name)}</option>`).join('')}</select>
          <select class="select select-sm" aria-label="Période"><option>7 derniers jours</option><option>30 derniers jours</option></select>
          <span style="flex:1"></span><button class="btn" type="button" data-mock="Export CSV : non simulé.">${ico('download')}Exporter en CSV</button>
        </div>
        <div class="set-box" style="overflow:hidden"><div class="grid-wrap"><table class="grid" style="min-width:820px"><thead><tr><th><span class="th">${ico('clock')}Date</span></th><th><span class="th">${ico('user')}Personne</span></th><th><span class="th">${ico('tag')}Action</span></th><th><span class="th">${ico('text')}Détail</span></th></tr></thead><tbody id="audit-rows"></tbody></table></div></div>
        <p class="help" style="margin-top:10px">Consultations, imports, téléchargements, changements de statut, de droits et de membres, connexions. Conservé 1 an.</p>`,
        { wide: true, intro: 'Les opérations sensibles de toute l’organisation.', after: renderAudit });
    }
    if (k === 'assistant') {
      return settingsPage('assistant', 'Assistant', `
        <div class="callout" style="margin-top:18px">${ico('info')}<p>Module optionnel, désactivé par défaut. Le reste de Lore fonctionne sans lui.</p></div>
        <section class="set-sec"><h2>Activation</h2><div class="set-box">${row('Activer l’assistant', 'Les membres pourront poser des questions sur les documents auxquels ils ont accès.', sw(false, false, 'Activer l’assistant'))}</div></section>
        <form class="set-sec" data-form="save"><h2>Modèle de langage</h2><div class="set-box">
          ${row('Fournisseur', '', '<select class="select" aria-label="Fournisseur"><option>Serveur local</option><option>Fournisseur externe</option></select>')}
          ${row('Adresse du serveur', '', '<input class="input input-mono" value="https://llm.dada.group" aria-label="Adresse du serveur">')}
          ${row('Modèle', '', '<input class="input input-mono" value="modele-local-exemple" aria-label="Modèle">')}
        </div><div style="margin-top:12px"><button class="btn btn-primary" type="submit">Enregistrer</button></div></form>
        <section class="set-sec"><h2>Confidentialité</h2><div class="set-box">
          ${row('Contenu transmis au modèle', 'Uniquement les passages des documents auxquels la personne qui pose la question a accès.', pill('Toujours', 'p-green'))}
          ${row('Documents obsolètes', 'Jamais utilisés pour construire une réponse.', pill('Exclus', 'p-green'))}
          ${row('Conservation des conversations', '', '<select class="select" aria-label="Conservation des conversations"><option>90 jours</option><option>30 jours</option><option>Ne pas conserver</option></select>')}
        </div></section>`, { badge: vb('v0.3') });
    }
    return screen404();
  }
  function renderAudit() {
    const tb = $('#audit-rows');
    if (!tb) return;
    const t = ($('[data-audit="type"]') || {}).value || '';
    const w = ($('[data-audit="who"]') || {}).value || '';
    const rows = D.audit.filter((a) => (!t || a.type === t) && (!w || a.who === w)).map((a) => `<tr><td>${esc(a.when)}</td><td>${a.who ? who(a.who) : '<span class="muted">Système</span>'}</td><td>${pill(a.type, AUDIT[a.type])}</td><td style="max-width:520px">${esc(a.text)}</td></tr>`).join('');
    tb.innerHTML = fr(rows || '<tr><td colspan="4" class="muted">Aucune opération avec ces filtres.</td></tr>');
  }

  function screenSources() {
    const rows = D.sources.map((s) => `<li><div class="list-row">${ico(s.kind === 'GitLab' ? 'branch' : 'server')}<div class="list-main"><div class="list-title">${esc(s.kind)} : <span style="font-family:var(--mono);font-size:13px">${esc(s.name)}</span></div><div class="list-sub">${esc(s.detail)}, vers ${esc(s.target)}. ${s.files} fichiers.</div></div><div class="list-side">${s.state === 'ok' ? pill('Synchronisé ' + s.sync, 'p-green') : pill(s.warn, 'p-yellow')}<button class="btn" type="button" data-mock="Synchronisation lancée.">${ico('refresh')}Synchroniser</button></div></div></li>`).join('');
    const cat = [['GitLab', 'branch', ''], ['GitHub', 'branch', ''], ['Dossier partagé', 'server', ''], ['Confluence', 'book', 'Offres payantes'], ['SharePoint', 'folder', 'Offres payantes'], ['Google Drive', 'folder', 'Offres payantes'], ['OneDrive', 'folder', 'Offres payantes']];
    return settingsPage('sources', 'Sources connectées', `
      <div class="callout" style="margin-top:18px">${ico('info')}<p>Prévu après la v0.3. Première source prévue : les fichiers Markdown des dépôts Git.</p></div>
      <section class="set-sec"><h2>Sources de l’organisation</h2><ul class="list" style="margin-top:12px">${rows}</ul></section>
      <section class="set-sec"><h2>Ajouter une source</h2><p class="help">Les documents synchronisés sont indexés et soumis aux mêmes droits que les autres.</p>
        <div class="catalog">${cat.map(([n, i, b]) => `<button class="cat-item" type="button" data-mock="Connexion à ${n} : non simulée."><span class="cat-ico">${ico(i)}</span>${n}${b ? vb(b) : ''}</button>`).join('')}</div></section>`,
      { nav: 'sources', badge: vb('Plus tard') });
  }

  /* =========================================================
     Base de connaissances (v0.2)
     ========================================================= */
  const techPills = (f) => f.tech.map((t) => pill(t, TECH[t])).join(' ');

  function screenKnowledge(m, p) {
    const view = p.get('view') === 'grid' ? 'grid' : 'kanban';
    const toolbar = `<div class="toolbar"><div class="views">
        <a class="view-tab" href="#/knowledge"${view === 'kanban' ? ' aria-current="page"' : ''}>${ico('kanban')}Kanban par statut</a>
        <a class="view-tab" href="#/knowledge?view=grid"${view === 'grid' ? ' aria-current="page"' : ''}>${ico('grid')}Grille</a></div>
      <div class="tools"><button class="tool" type="button" data-mock="Filtre : non simulé.">${ico('filter')}Filtrer</button><button class="tool is-on" type="button" data-mock="Regroupement : non simulé.">${ico('group')}Regroupé par statut</button><button class="tool" type="button" data-mock="Tri : non simulé.">${ico('sort')}Trier</button></div></div>`;
    let body;
    if (view === 'kanban') {
      body = `<div class="board">${['draft', 'review', 'validated'].map((st) => {
        const list = D.fiches.filter((f) => f.status === st);
        return `<section class="column"><div class="column-head">${stIcon(st)}${st === 'draft' ? 'Brouillons' : st === 'review' ? 'En attente de validation' : 'Validées'}<span class="count">${list.length}</span></div><div class="cards">${list.map((f) => `<a class="card" href="#/knowledge/${f.id}"><div class="card-title">${esc(f.title)}</div><div class="card-pills">${techPills(f)}</div><div class="card-meta">${who(f.author)}<span>${esc(spaceById(f.space).name)}, ${esc(inText(f.updated))}</span></div></a>`).join('')}</div></section>`;
      }).join('')}</div>`;
    } else {
      const rows = D.fiches.map((f, i) => `<tr><td class="rn">${i + 1}</td><td class="primary"><div class="cell-title">${ico('book')}<a href="#/knowledge/${f.id}">${esc(f.title)}</a><a class="expand" href="#/knowledge/${f.id}" aria-label="Ouvrir la fiche">${ico('expand')}</a></div></td><td>${status(f.status)}</td><td>${techPills(f)}</td><td>${esc(spaceById(f.space).name)}</td><td>${who(f.author)}</td><td>${f.validator ? who(f.validator) : '<span class="muted">Pas encore</span>'}</td><td>${esc(f.updated)}</td><td class="num">${f.resources.length}</td></tr>`).join('');
      body = `<div class="grid-wrap"><table class="grid"><thead><tr><th class="rn"></th><th class="primary"><span class="th">${ico('text')}Problème</span></th><th><span class="th">${ico('tag')}Statut</span></th><th><span class="th">${ico('tag')}Technologies</span></th><th><span class="th">${ico('grid')}Espace</span></th><th><span class="th">${ico('user')}Auteur</span></th><th><span class="th">${ico('user')}Validée par</span></th><th><span class="th">${ico('calendar')}Mis à jour</span></th><th><span class="th">${ico('link')}Ressources</span></th></tr></thead><tbody>${rows}</tbody></table></div><div class="grid-foot"><span>${D.fiches.length} fiches</span></div>`;
    }
    return {
      nav: 'knowledge', title: 'Base de connaissances',
      crumbs: crumbs([{ label: 'Base de connaissances', badge: ' ' + vb('v0.2') }]),
      actions: `<a class="btn btn-primary" href="#/knowledge/new">${ico('plus')}<span class="btn-label">Nouvelle fiche</span></a>`,
      html: `<h1 class="sr-only">Base de connaissances</h1>${toolbar}${body}`
    };
  }

  function screenFiche(m) {
    const f = D.fiches.find((x) => x.id === m[1]);
    if (!f) return screen404();
    const s = spaceById(f.space);
    const field = (icon, label, val) => `<div class="rfield"><div class="rfield-label">${ico(icon)}${label}</div><div class="rfield-value">${val ? hl(val, []) : '<span class="muted">Non détaillé dans la démo.</span>'}</div></div>`;
    const review = f.status === 'review';
    return {
      nav: 'knowledge', title: f.title,
      crumbs: crumbs([{ label: 'Base de connaissances', href: '#/knowledge' }, { label: f.title }]),
      actions: (review
        ? `<button class="btn" type="button" data-mock="Demande de modifications envoyée à la personne qui l’a rédigée." title="Demander des modifications">${ico('edit')}<span class="btn-label">Demander des modifications</span></button><button class="btn btn-primary" type="button" data-mock="Fiche validée : elle est maintenant proposée dans la recherche." title="Valider la fiche">${ico('check')}<span class="btn-label">Valider la fiche</span></button>`
        : `<button class="btn" type="button" data-mock="Édition : non simulée.">${ico('edit')}<span class="btn-label">Modifier</span></button>`) + panelBtn('props', 'les propriétés', 'sidebar-right', ']'),
      html: `<div class="record"><div class="record-main"><div class="record-inner">
          ${review ? `<div class="callout" style="margin-bottom:14px">${stIcon('review')}<p>Cette fiche attend une validation. Les responsables de l’espace ${esc(s.name)} peuvent la valider ou demander des modifications.</p></div>` : ''}
          <h1 class="doc-title">${esc(f.title)}</h1>
          <div class="doc-sub" style="margin-bottom:12px">${status(f.status)}<span>Par ${esc(person(f.author).name)}</span><span>Mise à jour ${/^\d/.test(f.updated) ? 'le ' + esc(f.updated) : esc(inText(f.updated))}</span></div>
          ${field('info', 'Contexte', f.context)}${field('eye', 'Symptômes', f.symptoms)}${field('search', 'Causes', f.causes)}${field('check', 'Solution', f.solution)}${field('alert', 'Précautions', f.precautions)}
        </div></div>
        <aside class="props" aria-label="Propriétés de la fiche">
          <section><h2>Propriétés</h2><dl>
            <div class="prop"><dt>Statut</dt><dd><span class="prop-val prop-static">${status(f.status)}</span></dd></div>
            <div class="prop"><dt>Technologies</dt><dd><span class="prop-val prop-static" style="flex-wrap:wrap">${techPills(f)}</span></dd></div>
            <div class="prop"><dt>Espace</dt><dd><a class="prop-val" href="#/spaces/${s.id}">${spaceIco(s)}${esc(s.name)}</a></dd></div>
            <div class="prop"><dt>Auteur</dt><dd><span class="prop-val prop-static">${who(f.author)}</span></dd></div>
            <div class="prop"><dt>Validée par</dt><dd><span class="prop-val prop-static">${f.validator ? who(f.validator) : '<span class="muted">En attente</span>'}</span></dd></div>
          </dl></section>
          <section><h2>Origine</h2><p class="access-note">${esc(f.origin || 'Rédigée directement.')}</p></section>
          <section><h2>Ressources associées</h2>${f.resources.length ? f.resources.map((id) => { const d = docById(id); return `<a class="prop-val" href="#/documents/${d.id}" style="height:auto;padding:6px">${ico(fmtIco(d))}<span>${esc(d.title)}</span></a>`; }).join('') : '<p class="access-note">Aucune ressource liée.</p>'}</section>
        </aside></div>`
    };
  }

  function screenNewFiche(m, p) {
    const fromA = p.get('from') === 'assistant';
    const fromD = p.get('from') === 'document' ? docById(p.get('doc')) : null;
    const s = spaceById('infrastructure');
    const v = fromA ? {
      title: 'Restaurer la base de facturation quand pg_restore signale un rôle manquant',
      symptoms: 'pg_restore s’interrompt avec ERROR: role "…" does not exist.',
      causes: 'Le rôle indiqué n’existe pas sur le serveur de restauration, par exemple après un nettoyage des rôles.',
      solution: '1. Créer une base vide et lancer pg_restore avec quatre processus en parallèle.\n2. Créer le rôle manquant (CREATE ROLE … LOGIN;).\n3. Relancer la restauration, ou utiliser --no-privileges si les droits d’origine sont inutiles.',
      res: ['restaurer-pg', 'inc-2291']
    } : { title: '', symptoms: '', causes: '', solution: '', res: fromD ? [fromD.id] : [] };
    const ta = (id, label, icon, val, help) => `<div class="field"><label for="${id}">${ico(icon)}${label}</label><textarea class="textarea" id="${id}">${esc(val || '')}</textarea>${help ? `<span class="help">${help}</span>` : ''}</div>`;
    return {
      nav: 'knowledge', title: 'Nouvelle fiche',
      crumbs: crumbs([{ label: 'Base de connaissances', href: '#/knowledge' }, { label: 'Nouvelle fiche', badge: ' ' + vb('v0.2') }]),
      html: `<div class="form-view"><div class="form-cover" style="--c:${s.color}"></div><form class="form-card" data-form="knowledge">
        <div><h1 class="page-title">Nouvelle fiche de connaissances</h1><p class="page-intro">Un problème, ses symptômes, sa cause et la solution appliquée. La fiche sera proposée dans la recherche une fois validée.</p></div>
        ${fromA ? `<div class="callout">${ico('ask')}<p>Pré-remplie à partir d’une réponse de l’assistant ${vb('v0.3')}. Vérifiez chaque section avant de la soumettre.</p></div>` : ''}
        ${fromD ? `<div class="callout">${ico('file-text')}<p>Créée à partir du document « ${esc(fromD.title)} ».</p></div>` : ''}
        <div class="field"><label for="f-title">${ico('text')}Problème ou question</label><input class="input" id="f-title" value="${esc(v.title)}" placeholder="Exemple : pods bloqués en Pending après la bascule de site"></div>
        <div class="form-2"><div class="field"><label for="f-space">${ico('grid')}Espace</label><select class="select" id="f-space">${D.spaces.filter((x) => !x.empty).map((x) => `<option${x.id === 'infrastructure' ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
          <div class="field"><label for="f-tech">${ico('tag')}Technologies</label><input class="input" id="f-tech" value="${fromA ? 'PostgreSQL' : ''}" placeholder="PostgreSQL, Kubernetes…"></div></div>
        ${ta('f-ctx', 'Contexte', 'info', '', 'Système concerné, environnement, circonstances.')}
        ${ta('f-sym', 'Symptômes', 'eye', v.symptoms)}
        ${ta('f-cause', 'Causes', 'search', v.causes)}
        ${ta('f-sol', 'Solution', 'check', v.solution)}
        ${ta('f-pre', 'Précautions', 'alert', '')}
        <div class="field"><span class="field-label" style="display:flex;align-items:center;gap:6px">${ico('link')}Ressources associées</span><div class="target-chips">${v.res.map((id) => `<span class="pill p-gray">${ico('file-text')}${esc(docById(id).title)}</span>`).join('')}<button class="btn" type="button" data-mock="Choix d’un document : non simulé.">${ico('plus')}Ajouter un document</button></div></div>
        <div class="row-between" style="margin-top:6px"><button class="btn" type="button" data-mock="Brouillon enregistré.">Enregistrer le brouillon</button><button class="btn btn-primary btn-lg" type="submit">Soumettre à validation</button></div>
      </form></div>`
    };
  }

  /* =========================================================
     Tableau de bord (v0.2)
     ========================================================= */
  function screenDashboard() {
    const T = D.dashboard;
    const max = 300;
    const bars = T.weeks.map(([w, v]) => `<div class="vcol" tabindex="0" style="--v:${(v / max * 100).toFixed(1)}%" aria-label="Semaine du ${w} : ${v} recherches"><div class="vbar"></div><div class="tip" role="tooltip">Semaine du ${w}<br><b>${v}</b> recherches</div></div>`).join('');
    const xl = T.weeks.map(([w], i) => `<span>${i % 3 === 0 ? w : ''}</span>`).join('');
    const hmax = Math.max(...T.perSpace.map((x) => x[1]));
    const hrows = T.perSpace.map(([n, v]) => `<div class="hrow" title="${n} : ${v} documents"><span>${n}</span><div class="track"><div class="hbar" style="--v:${(v / hmax * 100).toFixed(1)}%;${v ? '' : 'min-width:0'}"></div></div><span class="val">${v}</span></div>`).join('');
    const kpi = (label, value, note) => `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div><div class="kpi-note">${note}</div></div>`;
    return {
      nav: 'dashboard', title: 'Tableau de bord',
      crumbs: crumbs([{ label: 'Tableau de bord', badge: ' ' + vb('v0.2') }]),
      actions: `<select class="select select-sm" aria-label="Période"><option>30 derniers jours</option><option>90 derniers jours</option></select><button class="btn" type="button" data-mock="Export : non simulé.">${ico('download')}<span class="btn-label">Exporter</span></button>`,
      html: `<div class="pad"><h1 class="page-title" style="margin-bottom:16px">Tableau de bord</h1>
        <div class="kpis">
          ${kpi('Documents', D.org.docs, D.org.scanned + ' numérisés, non recherchables')}
          ${kpi('Membres actifs', '41', 'sur ' + D.org.members + ' membres')}
          ${kpi('Recherches', '944', '30 derniers jours')}
          ${kpi('Sans résultat', '6 %', '57 recherches')}
          ${kpi('Documents obsolètes', '23', 'dont 4 encore consultés')}
          ${kpi('Révisions en retard', String(T.overdue.length), 'date de révision dépassée')}
        </div>
        <div class="dash">
          <section class="panel"><div class="panel-head"><h2>Recherches par semaine</h2></div><p class="panel-sub">12 dernières semaines</p>
            <div class="vchart"><div class="vchart-y" aria-hidden="true"><span>300</span><span>200</span><span>100</span><span>0</span></div><div class="vchart-plot">${bars}</div><div class="vchart-x" aria-hidden="true">${xl}</div></div>
            <details class="data-table"><summary>Voir les données</summary><table><thead><tr><th>Semaine du</th><th>Recherches</th></tr></thead><tbody>${T.weeks.map(([w, v]) => `<tr><td>${w}</td><td class="num">${v}</td></tr>`).join('')}</tbody></table></details></section>
          <section class="panel"><div class="panel-head"><h2>Documents par espace</h2></div><p class="panel-sub">${D.org.docs} documents au total</p><div class="hchart">${hrows}</div></section>
          <section class="panel"><div class="panel-head"><h2>Recherches sans résultat</h2><a class="link" href="#/search?q=quota%20ceph" style="font-size:12.5px">Essayer</a></div><p class="panel-sub">Lacunes documentaires possibles</p>
            <ol class="rank">${T.gaps.map(([q, n]) => `<li>${ico('search')}<span style="font-family:var(--mono);font-size:12.5px">${esc(q)}</span><span class="v">${n} fois</span><a class="btn" href="#/knowledge/new" style="margin-left:8px">Rédiger une fiche</a></li>`).join('')}</ol></section>
          <section class="panel"><div class="panel-head"><h2>Documents les plus consultés</h2></div><p class="panel-sub">30 derniers jours</p>
            <ol class="rank">${T.topDocs.map(([id, n]) => { const d = docById(id); return `<li>${ico(fmtIco(d))}<a href="#/documents/${d.id}">${esc(d.title)}</a><span class="v">${n}</span></li>`; }).join('')}</ol></section>
          <section class="panel"><div class="panel-head"><h2>Révisions en retard</h2></div><p class="panel-sub">Documents dont la date de révision prévue est dépassée</p>
            <ol class="rank">${T.overdue.map(([id, when]) => { const d = docById(id); return `<li>${avatar(d.owner)}<a href="#/documents/${d.id}">${esc(d.title)}</a><span class="v">prévue le ${esc(when)}</span></li>`; }).join('')}</ol></section>
          <section class="panel"><div class="panel-head"><h2 style="display:flex;align-items:center;gap:8px">Assistant ${vb('v0.3')}</h2></div><p class="panel-sub">30 derniers jours</p>
            <div class="kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))">${kpi('Questions', '312', '')}${kpi('Réponses utiles', '81 %', 'selon les avis donnés')}${kpi('Sans réponse fiable', '9 %', '28 questions')}</div>
            <p class="panel-sub" style="margin:14px 0 6px">Questions fréquentes</p>
            <ol class="rank"><li>${ico('ask')}<span>Comment restaurer la base de facturation ?</span><span class="v">18</span></li><li>${ico('ask')}<span>Quelle est la procédure de bascule de site ?</span><span class="v">11</span></li><li>${ico('ask')}<span>Qui contacter pour l’astreinte du week-end ?</span><span class="v">9</span></li></ol></section>
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
      return `<div class="answer"><div class="answer-label">${ico('alert')}Pas de réponse fiable</div>
        <p>Les documents auxquels vous avez accès ne décrivent pas cette procédure. Plutôt que de proposer une procédure non vérifiée, voici les documents qui s’en rapprochent.</p>
        ${c.near && c.near.indexOf('rotation-tls') >= 0 ? '<p>« Rotation des certificats TLS internes » concerne les certificats des services internes, pas le VPN partenaires.</p>' : ''}
        <div class="answer-foot"><button class="btn" type="button" data-mock="Lacune signalée : elle apparaîtra dans le tableau de bord.">${ico('flag')}Signaler une lacune documentaire</button><a class="btn" href="#/knowledge/new">${ico('book')}Rédiger une fiche ${vb('v0.2')}</a></div></div>`;
    }
    const S = c.sources;
    const body = c.short
      ? `<p>Les sauvegardes complètes sont conservées 35 jours sur la baie principale, puis 12 mois sur le stockage objet du site de secours${cite(S, 1)}.</p>`
      : `<p>Le message indique que le rôle cité dans les droits n’existe pas sur le serveur de restauration. Créez ce rôle, puis relancez <code>pg_restore</code>${cite(S, 1)}.</p>
         <ol><li>Créez une base vide et lancez la restauration avec <code>pg_restore</code> et quatre processus en parallèle${cite(S, 2)}.</li>
         <li>Si l’erreur <code>role "…" does not exist</code> apparaît, créez le rôle indiqué, par exemple <code>CREATE ROLE app_rw LOGIN;</code>${cite(S, 1)}.</li>
         <li>Relancez la restauration. Si les droits d’origine sont inutiles sur ce serveur, utilisez plutôt l’option <code>--no-privileges</code>${cite(S, 1)}.</li></ol>
         <p>Ce cas s’est déjà produit lors de l’incident INC-2291 : le rôle <code>reporting</code> avait été supprimé lors d’un nettoyage${cite(S, 3)}.</p>`;
    const docs = new Set(S.map((x) => x.doc)).size;
    return `<div class="answer"><div class="answer-label">${ico('ask')}Réponse, d’après ${docs} document${docs > 1 ? 's' : ''}</div>${body}
      ${c.ignored && c.ignored.length ? `<div class="callout callout-mock">${ico('info')}<p>Un document obsolète correspondait aussi à la question et n’a pas été utilisé : « ${esc(docById(c.ignored[0].doc).title)} ».</p></div>` : ''}
      <div class="answer-foot"><span>Cette réponse est-elle utile ?</span><button class="btn" type="button" data-action="feedback" aria-pressed="false">${ico('thumbs-up')}Oui</button><button class="btn" type="button" data-action="feedback" aria-pressed="false">${ico('thumbs-down')}Non</button><span class="sp"></span>
      <a class="btn" href="#/knowledge/new?from=assistant">${ico('book')}Créer une fiche</a><button class="btn" type="button" data-mock="Réponse copiée.">${ico('copy')}Copier</button></div></div>`;
  }

  function screenAssistant(m, p) {
    const q = (p.get('q') || '').trim();
    let c = m[1] ? D.conversations.find((x) => x.id === m[1]) : null;
    if (!c && q) {
      if (/pg_restore|r[oô]le|restaur/i.test(q)) c = Object.assign({}, D.conversations[0], { question: q, when: 'À l’instant', id: 'c1' });
      else if (/certif|vpn/i.test(q)) c = Object.assign({}, D.conversations[1], { question: q, when: 'À l’instant' });
      else c = { id: 'tmp', question: q, when: 'À l’instant', kind: 'none', near: relatedDocs(q, 3).map((d) => d.id) };
    }
    const hist = D.conversations.map((x) => `<a class="conv-link" href="#/assistant/${x.id}"${c && c.id === x.id && !q ? ' aria-current="page"' : ''}>${esc(x.question)}<span>${esc(x.when)}</span></a>`).join('');
    let center, side;
    if (!c) {
      const ex = ['Quelle procédure suivre pour restaurer la base PostgreSQL ?', 'Comment renouveler le certificat de l’API de facturation ?', 'Quelles causes de saturation disque a-t-on déjà rencontrées ?'];
      center = `<div class="empty" style="padding-top:40px">${ico('ask')}<h1 class="page-title">Poser une question sur vos documents</h1><p>L’assistant répond à partir des documents auxquels vous avez accès, et cite ses sources. Il ignore les documents obsolètes.</p></div>
        <div class="suggest">${ex.map((x) => `<a href="#/assistant?q=${enc(x)}">${esc(x)}</a>`).join('')}</div>`;
      side = `<h2>Sources</h2><p class="help">Les documents cités apparaîtront ici, avec leur version et leur statut.</p>`;
    } else {
      center = `<div class="q">${avatar('as', true)}<div><h1 class="q-text">${esc(c.question)}</h1><div class="q-meta">${esc(c.when)}</div></div></div>${answerHtml(c)}`;
      if (c.kind === 'none') {
        const near = (c.near || []).map(docById).filter(Boolean);
        side = `<h2>Documents proches</h2>${near.length ? near.map((d) => `<a class="src" href="#/documents/${d.id}"><div class="src-top">${ico(fmtIco(d))}${esc(d.title)}</div><div class="src-meta">${status(d.status)}<span>Version ${d.version}</span></div></a>`).join('') : '<p class="help">Aucun document proche.</p>'}`;
      } else {
        side = `<h2>Sources citées</h2><p class="help">Uniquement des documents auxquels vous avez accès.</p>${c.sources.map((s) => { const d = docById(s.doc); return `<a class="src" href="${citeHref(s)}"><div class="src-top"><span class="cite">${s.n}</span>${esc(d.title)}</div><div class="src-loc">${esc(s.loc)}</div><q>${esc(s.quote)}</q><div class="src-meta">${status(d.status)}<span>Version ${d.version}</span><span>${esc(d.updated)}</span></div></a>`; }).join('')}`;
      }
    }
    return {
      nav: 'assistant', title: 'Assistant',
      crumbs: crumbs([{ label: 'Assistant', badge: ' ' + vb('v0.3') }]),
      actions: `${panelBtn('history', 'l’historique', 'history')}<a class="btn" href="#/assistant">${ico('plus')}<span class="btn-label">Nouvelle question</span></a>${panelBtn('sources', 'les sources', 'sidebar-right', ']')}`,
      html: `<div class="assist">
        <nav class="conv-side" aria-label="Historique des conversations"><a class="btn btn-block" href="#/assistant">${ico('plus')}Nouvelle question</a><h2>Historique</h2>${hist}</nav>
        <div class="thread"><div class="thread-inner">${center}</div>
          <form class="composer" data-form="ask"><div class="composer-box"><label class="sr-only" for="ask">Votre question</label><textarea id="ask" name="q" rows="2" placeholder="Posez une question sur vos documents"></textarea>
            <div class="composer-row"><span>Les réponses citent leurs sources : vérifiez-les avant d’appliquer une procédure.</span><button class="btn btn-primary" type="submit">${ico('send')}Envoyer</button></div></div></form></div>
        <aside class="src-side">${side}</aside></div>`
    };
  }

  /* =========================================================
     Page introuvable
     ========================================================= */
  function screen404() {
    return {
      nav: '', title: 'Introuvable',
      crumbs: crumbs([{ label: 'Introuvable' }]),
      html: `<div class="empty" style="padding-top:96px">${logo(34)}<h1 class="page-title">Cette page est introuvable</h1><p>Le document ou l’espace n’existe pas, a été supprimé, ou vous n’y avez pas accès.</p>
        <div class="actions"><a class="btn btn-primary" href="#/">Retour à l’accueil</a><button class="btn" type="button" data-action="palette">${ico('search')}Rechercher</button></div>
        <p class="help">Par sécurité, Lore ne distingue pas un document inexistant d’un document auquel vous n’avez pas accès.</p></div>`
    };
  }

  /* =========================================================
     Fenêtres : import, version, accès, statut…
     ========================================================= */
  function modal(title, body, foot, opts) {
    opts = opts || {};
    const tag = opts.form ? 'form' : 'div';
    return `<div class="overlay-backdrop" data-action="close"></div><div class="modal-wrap" data-action="close-wrap"><${tag} class="modal ${opts.size || ''}" role="dialog" aria-modal="true" aria-labelledby="mt"${opts.form ? ` data-form="${opts.form}"` : ''}>
      <div class="modal-head"><h2 id="mt">${title}</h2><button type="button" class="icon-btn" data-action="close" aria-label="Fermer">${ico('x')}</button></div>
      <div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}</${tag}></div>`;
  }
  const cancelBtn = '<button class="btn" type="button" data-action="close">Annuler</button>';

  const OVERLAYS = {
    'import': () => {
      const s = spaceById('infrastructure');
      const file = (icon, name, size, st) => `<div class="file">${ico(icon)}<span class="file-name">${name}</span><span class="file-size">${size}</span>${st}</div>`;
      return modal('Importer des documents', `
        <div class="target-chips"><span class="pill p-gray">${spaceIco(s)}${esc(s.name)}</span><span class="muted">›</span>
          <select class="select select-sm" aria-label="Dossier">${D.folders.infrastructure.map((f) => `<option>${esc(f.name)}</option>`).join('')}</select>
          <select class="select select-sm" aria-label="Statut à l’import"><option>Brouillon</option><option>Publié</option></select>
          <select class="select select-sm" aria-label="Catégorie">${Object.keys(CAT).map((c) => `<option>${esc(c)}</option>`).join('')}</select></div>
        <div class="drop">${ico('upload')}<p>Déposez vos fichiers ici, ou <button class="link" type="button" data-mock="Sélecteur de fichiers : non simulé.">choisissez-les sur votre ordinateur</button>.</p><p class="help">PDF, Word (DOCX), texte et Markdown. 50 Mo au maximum par fichier.</p></div>
        <label class="check"><input type="checkbox">Restreindre l’accès à certaines personnes</label>
        <div><div class="row-between"><strong style="font-size:13.5px">5 fichiers déposés</strong><span class="help">Importés dès leur dépôt</span></div>
          ${file('file-text', 'plan-reprise-2026.docx', '1,2 Mo', `<span class="file-state is-busy">${ico('spinner', 'spin')}Extraction du texte en cours</span>`)}
          ${file('file-text', 'runbook-redis.md', '14 Ko', `<span class="file-state is-busy">${ico('spinner', 'spin')}Extraction du texte en cours</span><span class="progress" aria-hidden="true"><span></span></span>`)}
          ${file('file', 'schema-cablage-salle-b.pdf', '8,7 Mo', `<span class="file-state is-warn">${ico('scan')}Document numérisé : importé, mais seuls son titre et ses métadonnées sont recherchables.</span>`)}
          ${file('file', 'export-journaux-octobre.pdf', '72 Mo', `<span class="file-state is-err">${ico('alert')}Non importé : le fichier fait 72 Mo, la limite est de 50 Mo.</span>`)}
          ${file('file-text', 'procedure-vpn.docx', '340 Ko', `<span class="file-state is-err" id="retry-state">${ico('alert')}Échec de l’extraction : le fichier est protégé par un mot de passe. <button class="link" type="button" data-action="retry">Relancer</button></span>`)}
        </div>`,
        `<span class="left">Raccourci : touche I</span><button class="btn btn-primary" type="button" data-action="close">Terminé</button>`, { size: 'modal-lg' });
    },
    'version': (p) => {
      const d = docById(p.get('doc') || 'restaurer-pg');
      return modal(`Nouvelle version de « ${esc(d.title)} »`, `
        <div class="drop">${ico('upload')}<p>Déposez le fichier de la version ${d.version + 1}, ou <button class="link" type="button" data-mock="Sélecteur de fichiers : non simulé.">choisissez-le</button>.</p><p class="help">Même format conseillé : ${esc(d.format)}. 50 Mo au maximum.</p></div>
        <div class="field"><label for="v-note">Ce qui change</label><textarea class="textarea" id="v-note" placeholder="Exemple : ajout de la vérification des rôles avant restauration"></textarea><span class="help">Visible dans l’historique des versions.</span></div>
        <label class="check"><input type="checkbox" checked>Conserver le statut ${ST[d.status].label}</label>
        <div class="callout callout-mock">${ico('info')}<p>La version ${d.version} reste consultable et téléchargeable dans l’historique.</p></div>`,
        `${cancelBtn}<button class="btn btn-primary" type="submit">Importer la version ${d.version + 1}</button>`, { form: 'version' });
    },
    'access': (p) => {
      const d = docById(p.get('doc') || 'rotation-tls');
      const members = D.spaceMembers[d.space] || [];
      const grants = d.grants || [];
      return modal('Accès au document', `
        <p class="help" style="margin-top:-4px">${esc(d.title)}</p>
        <label class="radio-card"><input type="radio" name="access" value="all"${d.restricted ? '' : ' checked'}><span><strong>${ico('users')}Tous les membres de l’espace</strong><span class="help">${members.length} personnes</span></span></label>
        <label class="radio-card"><input type="radio" name="access" value="restricted"${d.restricted ? ' checked' : ''}><span><strong>${ico('lock')}Certaines personnes seulement</strong><span class="help">Les autres membres ne voient le document nulle part : ni dans les listes, ni dans la recherche.</span></span></label>
        <div class="people-pick" id="people-pick"${d.restricted ? '' : ' aria-disabled="true" style="opacity:.5;pointer-events:none"'}>${members.map((x) => `<label><input type="checkbox"${grants.indexOf(x.id) >= 0 || x.role === 'Responsable' ? ' checked' : ''}${x.role === 'Responsable' ? ' disabled' : ''}>${avatar(x.id)}${esc(person(x.id).name)}<span class="role">${pill(x.role, ROLE[x.role])}</span></label>`).join('')}</div>
        <p class="help">Les responsables de l’espace et les administrateurs de l’organisation gardent toujours l’accès.</p>`,
        `${cancelBtn}<button class="btn btn-primary" type="submit">Enregistrer</button>`, { form: 'access' });
    },
    'status': (p) => {
      const d = docById(p.get('doc') || 'restaurer-pg');
      const opt = (st, help, extra, dis) => `<label class="radio-card"${dis ? ' style="opacity:.55;cursor:not-allowed"' : ''}><input type="radio" name="st" value="${st}"${d.status === st ? ' checked' : ''}${dis ? ' disabled' : ''}><span><strong>${stIcon(st)}${ST[st].label}${extra || ''}</strong><span class="help">${help}</span></span></label>`;
      return modal('Changer le statut', `
        <p class="help" style="margin-top:-4px">${esc(d.title)}</p>
        ${opt('draft', 'Visible par les membres de l’espace, signalé comme non finalisé.')}
        ${opt('review', 'Soumis aux responsables de l’espace avant publication.', ' ' + vb('v0.2'), true)}
        ${opt('published', 'Version de référence.')}
        ${opt('obsolete', 'Reste consultable et cherchable, mais classé en dernier. L’assistant ne l’utilise pas.')}
        <div class="field" style="margin-left:34px"><label for="repl">Remplacé par</label><select class="select" id="repl"><option>Aucun document</option>${D.docs.filter((x) => x.id !== d.id && x.space === d.space).map((x) => `<option>${esc(x.title)}</option>`).join('')}</select></div>
        ${opt('archived', 'Retiré des listes et de la recherche. Consultable par les responsables.')}`,
        `${cancelBtn}<button class="btn btn-primary" type="submit">Enregistrer</button>`, { form: 'status' });
    },
    'create-space': () => {
      const colors = ['#13705E', '#3F6C9A', '#8A6A1F', '#6B5A8E', '#8E4B44', '#4E7A5A', '#5B5FD6'];
      return modal('Créer un espace', `
        <div class="field"><label for="cs-name">Nom</label><input class="input" id="cs-name" value="Applications métier" required></div>
        <div class="field"><label for="cs-desc">Description</label><input class="input" id="cs-desc" value="Documentation des applications internes."></div>
        <div class="field"><label for="cs-slug">Adresse</label><input class="input input-mono" id="cs-slug" value="applications"><span class="help">${D.org.url}/spaces/applications</span></div>
        <div class="field"><span class="field-label">Couleur</span><div class="target-chips">${colors.map((c, i) => `<label style="cursor:pointer"><input class="sr-only" type="radio" name="cs-color"${i === 5 ? ' checked' : ''}><span class="space-ico space-ico-lg" style="--c:${c};width:28px;height:28px;border-radius:7px${i === 5 ? ';box-shadow:0 0 0 2px var(--bg-raised),0 0 0 4px ' + c : ''}"></span></label>`).join('')}</div></div>
        <p class="help">Vous en serez responsable. Vous pourrez inviter des membres ensuite.</p>`,
        `${cancelBtn}<button class="btn btn-primary" type="submit">Créer l’espace</button>`, { form: 'create-space' });
    },
    'delete-space': (p) => {
      const s = spaceById(p.get('space') || 'infrastructure');
      return modal('Supprimer l’espace', `
        <div class="callout callout-warn">${ico('alert')}<p>La suppression est définitive : ${s.docs} documents, leurs versions et leurs fichiers seront supprimés. Les membres perdront l’accès.</p></div>
        <div class="field"><label for="del-name">Pour confirmer, saisissez <strong>${esc(s.name)}</strong></label><input class="input" id="del-name" data-confirm-name="${esc(s.name)}" autocomplete="off"></div>`,
        `${cancelBtn}<button class="btn btn-primary" type="submit" id="confirm-delete" disabled style="background:var(--danger);border-color:var(--danger);color:#fff">Supprimer définitivement</button>`, { form: 'delete-space' });
    },
    'new-folder': () => modal('Nouveau dossier', `<div class="field"><label for="nf">Nom du dossier</label><input class="input" id="nf" placeholder="Exemple : Procédures d’astreinte"></div><p class="help">Dans l’espace Infrastructure.</p>`,
      `${cancelBtn}<button class="btn btn-primary" type="submit">Créer le dossier</button>`, { form: 'new-folder' }),
    'invite': () => modal('Inviter dans l’organisation', `
      <p class="help" style="margin-top:-4px">Créez un lien et transmettez-le vous-même. Aucun serveur de messagerie n’est nécessaire.</p>
      <div class="form-2"><div class="field"><label for="io-role">Rôle dans l’organisation</label><select class="select" id="io-role"><option>Membre</option><option>Administrateur</option></select></div>
        <div class="field"><label for="io-exp">Validité</label><select class="select" id="io-exp"><option>7 jours, usage unique</option><option>48 heures, usage unique</option></select></div></div>
      <div class="field"><span class="field-label">Espaces à rejoindre</span><div class="people-pick">${D.spaces.filter((s) => !s.empty).map((s, i) => `<label><input type="checkbox"${i === 0 ? ' checked' : ''}>${spaceIco(s)}${esc(s.name)}<span class="role"><select class="select select-sm" aria-label="Rôle dans ${esc(s.name)}"><option>Lecteur</option><option selected>Contributeur</option><option>Responsable</option></select></span></label>`).join('')}</div></div>
      <div id="invite-result" hidden><div class="target-chips"><label class="sr-only" for="inv-url">Lien d’invitation</label><input class="input input-mono" id="inv-url" readonly value="${D.org.url}/join#P3n8-Lw2c-9QxA" style="flex:1"><button class="btn" type="button" data-action="copy" data-target="inv-url">${ico('copy')}Copier</button></div></div>`,
      `${cancelBtn}<button class="btn btn-primary" type="button" data-action="invite-create">${ico('link')}Créer le lien</button>`),
    'reset-link': (p) => {
      const pp = person(p.get('for') || 'hc');
      return modal('Lien de réinitialisation', `
        <p>Transmettez ce lien à ${esc(pp.name)} par un canal sûr. Il permet de choisir un nouveau mot de passe.</p>
        <div class="target-chips"><label class="sr-only" for="rl">Lien de réinitialisation</label><input class="input input-mono" id="rl" readonly value="${D.org.url}/reset-password#Zt4K-0pRm-7HcE" style="flex:1"><button class="btn" type="button" data-action="copy" data-target="rl">${ico('copy')}Copier</button></div>
        <p class="help">Valable 24 heures, une seule fois. L’opération est inscrite au journal d’audit. <a class="link" href="#/reset-password">Voir la page reçue</a></p>`,
        `<button class="btn btn-primary" type="button" data-action="close">Fermer</button>`);
    },
    'plan': () => {
      const enc2 = enc(DEFAULT_Q);
      const groups = [
        ['Accès', 'v0.1', [['Configuration : organisation', '#/setup'], ['Configuration : compte administrateur', '#/setup?step=2'], ['Configuration : terminé', '#/setup?step=3'], ['Connexion', '#/login'], ['Connexion refusée', '#/login?error=1'], ['Rejoindre via une invitation', '#/join'], ['Mot de passe oublié', '#/forgot-password'], ['Nouveau mot de passe', '#/reset-password']]],
        ['Environnement', 'v0.1', [['Accueil', '#/'], ['Tous les espaces', '#/spaces'], ['Bibliothèque, vue grille', '#/spaces/infrastructure'], ['Bibliothèque, vue kanban', '#/spaces/infrastructure?view=kanban'], ['Bibliothèque filtrée sur un dossier', '#/spaces/infrastructure?folder=runbooks'], ['Espace vide', '#/spaces/applications'], ['Membres de l’espace', '#/spaces/infrastructure/members'], ['Paramètres de l’espace', '#/spaces/infrastructure/settings'], ['Mon compte', '#/account'], ['Page introuvable', '#/not-found']]],
        ['Documents', 'v0.1', [['Markdown', '#/documents/restaurer-pg'], ['Word converti', '#/documents/inc-2291'], ['PDF', '#/documents/guide-baie'], ['PDF numérisé', '#/documents/schema-cablage'], ['Accès restreint', '#/documents/rotation-tls'], ['Obsolète', '#/documents/barman'], ['Extraction en cours', '#/documents/plan-reprise'], ['Ouvert depuis la recherche', `#/documents/restaurer-pg?from=search&q=${enc2}&anchor=s-4-2`], ['PDF ouvert à la page trouvée', '#/documents/guide-baie?from=search&q=snapshot%20restore&anchor=page-112']]],
        ['Recherche', 'v0.1', [['Page de recherche', '#/search'], ['Résultats et filtres', `#/search?q=${enc2}`], ['Aucun résultat', '#/search?q=quota%20ceph'], ['Palette de commandes (Ctrl K)', 'palette']]],
        ['Fenêtres', 'v0.1', [['Importer des documents', '#/spaces/infrastructure?open=import'], ['Nouvelle version', '#/documents/restaurer-pg?open=version&doc=restaurer-pg'], ['Accès au document', '#/documents/rotation-tls?open=access&doc=rotation-tls'], ['Changer le statut', '#/documents/restaurer-pg?open=status&doc=restaurer-pg'], ['Créer un espace', '#/spaces?open=create-space'], ['Nouveau dossier', '#/spaces/infrastructure?open=new-folder'], ['Supprimer un espace', '#/spaces/infrastructure/settings?open=delete-space&space=infrastructure'], ['Inviter dans l’organisation', '#/admin/members?open=invite'], ['Lien de réinitialisation', '#/admin/members?open=reset-link&for=hc']]],
        ['Administration', 'v0.1', [['Général', '#/admin/general'], ['Membres', '#/admin/members'], ['Sécurité et connexion', '#/admin/security'], ['Stockage et import', '#/admin/storage'], ['Journal d’audit', '#/admin/audit']]],
        ['Base de connaissances', 'v0.2', [['Kanban des fiches', '#/knowledge'], ['Grille des fiches', '#/knowledge?view=grid'], ['Fiche validée', '#/knowledge/pg-role-manquant'], ['Fiche à valider', '#/knowledge/vpn-mtu'], ['Nouvelle fiche', '#/knowledge/new']]],
        ['Pilotage et recherche', 'v0.2', [['Tableau de bord', '#/dashboard'], ['Recherche par mots-clés et sens', `#/search?mode=semantic&q=${enc(D.semantic.question)}`]]],
        ['Assistant', 'v0.3', [['Nouvelle question', '#/assistant'], ['Réponse sourcée', '#/assistant/c1'], ['Réponse courte', '#/assistant/c3'], ['Pas de réponse fiable', '#/assistant/c2'], ['Fiche pré-remplie par l’assistant', '#/knowledge/new?from=assistant'], ['Réglages de l’assistant', '#/admin/assistant']]],
        ['Sources connectées', 'Plus tard', [['Sources connectées', '#/sources']]],
        ['Site web', '', [['Retour au site de Lore', '/']]]
      ];
      const total = groups.reduce((n, g) => n + g[2].length, 0);
      return modal('Plan de la démo', `<p class="help" style="margin-top:-4px">${total} écrans et fenêtres, regroupés par version. Les données sont fictives.</p>
        <div class="plan-cols">${groups.map(([t, v, items]) => `<div class="plan-group"><h3>${t} ${v ? vb(v) : ''}</h3><ul>${items.map(([l, h]) => h === 'palette' ? `<li><a href="#" data-action="palette">${ico('command')}${l}</a></li>` : h.indexOf('#') !== 0 ? `<li><a href="${h}" target="_top">${ico('external')}${l}</a></li>` : `<li><a href="${h}" data-action="go" data-href="${h}">${ico('chevron-right')}${l}</a></li>`).join('')}</ul></div>`).join('')}</div>`,
        '', { size: 'modal-xl' });
    },
    'palette': () => `<div class="overlay-backdrop" data-action="close"></div><div class="modal-wrap" data-action="close-wrap"><div class="palette" role="dialog" aria-modal="true" aria-label="Palette de commandes">
        <div class="palette-input">${ico('search')}<input id="pal-in" placeholder="Rechercher un document, un espace ou une action…" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-label="Rechercher ou aller à"></div>
        <div class="palette-list" id="pal-list" role="listbox"></div>
        <div class="palette-foot"><span><span class="kbd">↑</span><span class="kbd">↓</span>naviguer</span><span><span class="kbd">Entrée</span>ouvrir</span><span><span class="kbd">Échap</span>fermer</span></div></div></div>`
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

  /* Palette de commandes */
  function paletteItems() {
    const items = [];
    const add = (group, icon, label, run, hint) => items.push({ group, icon, label, run, hint: hint || '' });
    add('Actions', 'upload', 'Importer des documents', () => openOverlay('import'), '<span class="kbd">I</span>');
    add('Actions', 'plus', 'Créer un espace', () => openOverlay('create-space'));
    add('Actions', 'book', 'Nouvelle fiche de connaissances', () => go('#/knowledge/new'), vb('v0.2'));
    add('Actions', 'ask', 'Poser une question à l’assistant', () => go('#/assistant'), vb('v0.3'));
    add('Actions', 'theme', 'Changer de thème', () => { closeOverlay(); cycleTheme(); });
    add('Actions', 'map', 'Plan de la démo', () => openOverlay('plan'));
    [['home', 'Accueil', '#/'], ['search', 'Recherche', '#/search'], ['grid', 'Tous les espaces', '#/spaces'], ['book', 'Base de connaissances', '#/knowledge'], ['chart', 'Tableau de bord', '#/dashboard'], ['settings', 'Administration', '#/admin/general'], ['list', 'Journal d’audit', '#/admin/audit'], ['user', 'Mon compte', '#/account']].forEach(([i, l, h]) => add('Aller à', i, l, () => go(h)));
    D.spaces.forEach((s) => add('Espaces', null, s.name, () => go('#/spaces/' + s.id), `${s.docs} documents`));
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
      items.unshift({ group: 'Recherche', icon: 'search', label: `Rechercher « ${q.trim()} » dans les documents`, run: () => go('#/search?q=' + enc(q.trim())), hint: '<span class="kbd">Entrée</span>' });
    } else items = items.filter((it) => it.group !== 'Documents' || ['restaurer-pg', 'inc-2291', 'bascule-k8s'].some((id) => docById(id).title === it.label));
    state.pal.items = items;
    state.pal.sel = 0;
    let html = '', last = '';
    items.forEach((it, i) => {
      if (it.group !== last) { html += `<div class="palette-group">${it.group}</div>`; last = it.group; }
      const icon = it.icon ? ico(it.icon) : spaceIco(D.spaces.find((s) => s.name === it.label) || D.spaces[0]);
      html += `<button class="palette-item" type="button" role="option" id="pal-${i}" data-action="pal-run" data-i="${i}" aria-selected="${i === 0}">${icon}<span>${esc(it.label)}</span><span class="hint">${it.hint}</span></button>`;
    });
    $('#pal-list').innerHTML = fr(html || '<div class="palette-empty">Aucun résultat.</div>');
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
     Thème
     ========================================================= */
  const THEMES = ['auto', 'light', 'dark'];
  const THEME_LABEL = { auto: 'Thème : système', light: 'Thème : clair', dark: 'Thème : sombre' };
  function getTheme() { try { return localStorage.getItem('lore-theme') || 'auto'; } catch (e) { return 'auto'; } }
  function setTheme(t) {
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('lore-theme', t); } catch (e) { /* stockage indisponible */ }
    syncTheme();
  }
  function syncTheme() { $$('[data-theme-select]').forEach((s) => { s.value = getTheme(); }); }
  function cycleTheme() { setTheme(THEMES[(THEMES.indexOf(getTheme()) + 1) % 3]); toast(THEME_LABEL[getTheme()].replace(' :', ' :')); }

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
  /* Dans une grille qui défile, le menu est positionné par rapport à la fenêtre pour ne pas être coupé. */
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
      const done = () => toast('Lien copié');
      const fail = () => { input.select(); toast('Sélectionnez le lien, puis copiez-le.'); };
      try { navigator.clipboard.writeText(input.value).then(done, fail); } catch (err) { fail(); }
    },
    'retry': () => {
      const st = $('#retry-state');
      if (!st) return;
      st.className = 'file-state is-busy';
      st.innerHTML = fr(`${ico('spinner', 'spin')}Extraction relancée`);
      setTimeout(() => {
        if (!document.contains(st)) return;
        st.className = 'file-state is-err';
        st.innerHTML = fr(`${ico('alert')}Échec de l’extraction : le fichier est toujours protégé par un mot de passe. Retirez la protection, puis importez une nouvelle version.`);
      }, 1500);
    },
    'set-role': (el) => {
      const menu = el.closest('.menu');
      const btn = menu.querySelector(':scope > [data-action="menu"]');
      const r = el.dataset.role;
      btn.className = 'pill ' + ROLE[r];
      btn.innerHTML = esc(r) + ico('chevron');
      toast('Rôle mis à jour : ' + r);
    },
    'feedback': (el) => {
      el.parentElement.querySelectorAll('[data-action="feedback"]').forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
      toast('Merci. Votre avis compte dans le taux de réponses utiles du tableau de bord.');
    },
    'pal-run': (el) => palRun(parseInt(el.dataset.i, 10))
  };

  const FORMS = {
    'search': (f) => { const q = f.q.value.trim(); const sens = f.mode ? 'mode=semantic&' : ''; go(`#/search?${sens}q=${enc(q)}`); },
    'login': () => go('#/'),
    'setup1': () => go('#/setup?step=2'),
    'setup2': () => go('#/setup?step=3'),
    'join': () => { go('#/spaces/infrastructure'); toast('Bienvenue dans l’espace Infrastructure'); },
    'reset': () => { go('#/'); toast('Mot de passe enregistré'); },
    'ask': (f) => { const q = f.q.value.trim(); if (q) go('#/assistant?q=' + enc(q)); },
    'create-space': () => { closeOverlay(true); go('#/spaces/applications'); toast('Espace créé'); },
    'delete-space': () => { closeOverlay(); toast('Démo : la suppression n’est pas simulée.'); },
    'save': () => toast('Modifications enregistrées'),
    'knowledge': () => { go('#/knowledge'); toast('Fiche soumise à validation'); },
    'version': () => { closeOverlay(); toast('Version importée : extraction du texte en cours'); },
    'access': () => { closeOverlay(); toast('Accès mis à jour'); },
    'status': () => { closeOverlay(); toast('Statut mis à jour'); },
    'new-folder': () => { closeOverlay(); toast('Dossier créé'); }
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
      toast(mk.dataset.mock || 'Démo : cette action n’est pas simulée.');
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
