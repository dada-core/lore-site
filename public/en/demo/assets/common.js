/* Lore demo: shared functions.
   English version of site/public/demo/assets/common.js: both files must stay in sync
   (same behavior and storage keys; only the language differs). */
window.SLC = (function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ico = (n, cls) => `<svg class="ico${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  /* English typography needs no rewriting: the French version adds no-break spaces here. */
  const fr = (html) => html;
  const logo = (size) => {
    size = size || 20;
    return `<svg width="${size}" height="${size}" viewBox="0 0 28 28" aria-hidden="true"><rect x="2" y="19" width="23" height="6" rx="1.5" fill="var(--s2)"/><rect x="6" y="11.5" width="20" height="6" rx="1.5" fill="var(--s3)"/><rect x="2" y="4" width="17" height="6" rx="1.5" fill="var(--accent)"/></svg>`;
  };
  const vb = (v) => {
    const title = v === 'Later' ? 'Planned after v0.3' : v.indexOf('v0') === 0 ? 'Planned for ' + v : v === 'Paid plans' ? 'Paid plans only' : v;
    return `<span class="vb" title="${title}">${esc(v)}</span>`;
  };

  const mock = document.body.dataset.mock || 'app';
  /* Back to the English website. */
  const site = '/en/';
  const LINKS = { app: 'index.html', site: site, doc: site };

  /* ---------- Notifications ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
  }

  /* ---------- Theme (light, dark or system), shared with the site ---------- */
  const THEMES = ['auto', 'light', 'dark'];
  const THEME_LABEL = { auto: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' };
  function getTheme() { try { return localStorage.getItem('lore-theme') || 'auto'; } catch (e) { return 'auto'; } }
  function setTheme(t) {
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('lore-theme', t); } catch (e) { /* storage unavailable */ }
    $$('[data-theme-select]').forEach((s) => { s.value = t; });
  }
  /* A theme change on the site also applies to the demo shown in the page. */
  window.addEventListener('storage', (e) => {
    if (e.key !== 'lore-theme') return;
    const t = e.newValue || 'auto';
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  });
  function cycleTheme() {
    setTheme(THEMES[(THEMES.indexOf(getTheme()) + 1) % THEMES.length]);
    toast(THEME_LABEL[getTheme()]);
  }

  /* ---------- Collapsible side panels ---------- */
  const PANELS = ['nav', 'props', 'history', 'sources', 'settings', 'docnav', 'toc'];
  let hidden = {};
  try { hidden = JSON.parse(localStorage.getItem('lore-demo-panels') || '{}') || {}; } catch (e) { hidden = {}; }
  function applyPanels() {
    PANELS.forEach((p) => document.body.classList.toggle('hide-' + p, !!hidden[p]));
    $$('[data-action="toggle-panel"]').forEach((b) => {
      const shown = !hidden[b.dataset.panel];
      const label = (shown ? 'Hide ' : 'Show ') + (b.dataset.label || 'the panel');
      b.setAttribute('aria-expanded', String(shown));
      b.setAttribute('aria-label', label);
      b.title = label + (b.dataset.key ? ' (' + b.dataset.key + ')' : '');
    });
  }
  function togglePanel(p, show) {
    hidden[p] = show === undefined ? !hidden[p] : !show;
    try { localStorage.setItem('lore-demo-panels', JSON.stringify(hidden)); } catch (e) { /* storage unavailable */ }
    applyPanels();
    requestAnimationFrame(updateHints);
  }
  const leftPanel = () => (mock === 'doc' ? 'docnav' : mock === 'app' ? 'nav' : null);
  const rightPanel = () => (mock === 'doc' ? 'toc' : $('.props') ? 'props' : $('.src-side') ? 'sources' : null);

  /* ---------- Scrolling without visible bars: a fade shows the remaining content ---------- */
  const HX = '.grid-wrap, .board, .s-scroll-x, .d-scroll-x';
  const HY = '.side-scroll, .props, .palette-list, .conv-side, .settings-nav, .src-side, .d-nav-scroll, .d-toc, .s-drawer-body';
  function wrapX() {
    $$(HX).forEach((el) => {
      if (el.parentElement && el.parentElement.classList.contains('hx')) return;
      const w = document.createElement('div');
      w.className = 'hx';
      el.parentNode.insertBefore(w, el);
      w.appendChild(el);
    });
  }
  function hintOne(el) {
    if (el.matches(HX)) {
      const w = el.parentElement;
      w.classList.toggle('hint-l', el.scrollLeft > 2);
      w.classList.toggle('hint-r', el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    } else {
      el.classList.toggle('hint-t', el.scrollTop > 2);
      el.classList.toggle('hint-b', el.scrollTop + el.clientHeight < el.scrollHeight - 2);
    }
  }
  function updateHints() { wrapX(); $$(HX + ',' + HY).forEach(hintOne); }
  document.addEventListener('scroll', (e) => {
    const t = e.target;
    if (t instanceof Element && t.matches(HX + ',' + HY)) hintOne(t);
  }, true);
  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; updateHints(); applyPanels(); });
  }
  window.addEventListener('resize', schedule);
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });

  /* ---------- Simple windows ---------- */
  let lastFocus = null;
  function openModal(html, onOpen) {
    const o = $('#overlay');
    if (o.hidden) lastFocus = document.activeElement;
    o.innerHTML = fr(html);
    o.hidden = false;
    document.body.style.overflow = 'hidden';
    const first = o.querySelector('[autofocus], input:not([type=hidden]), textarea, select, button');
    if (first) first.focus();
    if (onOpen) onOpen(o);
  }
  function closeModal() {
    const o = $('#overlay');
    if (!o || o.hidden) return;
    o.hidden = true;
    o.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  function modal(title, body, opts) {
    opts = opts || {};
    return `<div class="overlay-backdrop" data-action="close"></div><div class="modal-wrap" data-action="close-wrap"><div class="modal ${opts.size || ''}" role="dialog" aria-modal="true" aria-labelledby="mt">
      <div class="modal-head"><h2 id="mt">${title}</h2><button type="button" class="icon-btn" data-action="close" aria-label="Close">${ico('x')}</button></div>
      <div class="modal-body">${body}</div>${opts.foot ? `<div class="modal-foot">${opts.foot}</div>` : ''}</div></div>`;
  }

  function copyText(text, okMsg) {
    const fail = () => toast('Select the text, then copy it.');
    try { navigator.clipboard.writeText(text).then(() => toast(okMsg || 'Copied'), fail); } catch (e) { fail(); }
  }

  /* ---------- Demo bar: map of the screens and back to the site ---------- */
  function mockBar() {
    document.body.insertAdjacentHTML('beforeend', fr(`<nav class="mock-bar" aria-label="Demo">
      <button class="mock-plan" type="button" data-action="plan" title="Demo map">${ico('map')}<span>Map</span></button><span class="mock-sep" aria-hidden="true"></span>
      <span class="mock-note">Demo, sample data</span><span class="mock-sep" aria-hidden="true"></span>
      <a href="${LINKS.site}">${ico('chevron-left')}<span class="long">Back to the site</span><span class="short">Site</span></a>
    </nav>`));
  }

  /* ---------- Shared events ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const act = a.dataset.action;
    if (act === 'toggle-panel') { e.preventDefault(); togglePanel(a.dataset.panel); return; }
    if (mock === 'app') return;
    if (act === 'close') { e.preventDefault(); closeModal(); }
    else if (act === 'close-wrap' && e.target === a) closeModal();
    else if (act === 'theme') { e.preventDefault(); cycleTheme(); }
    else if (act === 'copy') { e.preventDefault(); copyText(a.dataset.text || (document.getElementById(a.dataset.target) || {}).value || '', a.dataset.ok); }
  });
  document.addEventListener('change', (e) => {
    if (mock !== 'app' && e.target.matches('[data-theme-select]')) setTheme(e.target.value);
  });
  document.addEventListener('keydown', (e) => {
    const ae = document.activeElement;
    const typing = ae && (/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) || ae.isContentEditable);
    const o = $('#overlay');
    const overlayOpen = o && !o.hidden;
    if (mock !== 'app' && overlayOpen) {
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') {
        const f = $$('#overlay button:not([disabled]), #overlay a[href], #overlay input:not([disabled]):not([type=hidden]), #overlay select:not([disabled]), #overlay textarea').filter((el) => el.offsetParent !== null);
        if (f.length) {
          if (e.shiftKey && ae === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && ae === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      }
      return;
    }
    if (typing || overlayOpen || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '[' && leftPanel()) { e.preventDefault(); togglePanel(leftPanel()); }
    else if (e.key === ']' && rightPanel()) { e.preventDefault(); togglePanel(rightPanel()); }
  });

  /* Embedded in a page of the site (iframe), the demo does not show its bar. */
  if (!new URLSearchParams(location.search).has('embed')) mockBar();
  applyPanels();

  return { $, $$, esc, ico, fr, logo, vb, toast, getTheme, setTheme, cycleTheme, togglePanel, applyPanels, updateHints, openModal, closeModal, modal, copyText, LINKS, mock };
})();
