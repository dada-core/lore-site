/* Motion: reveals on scroll, typed command, menu pill, glow under the pointer.
   Does nothing when the system asks for reduced motion (no "motion" class on <html>). */
import { REVEAL, HERO } from './reveal';

const root = document.documentElement;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T & Element>(s)) as T[];

/* The install command types itself, character by character. */
function typeCommand(box: Element) {
  const code = box.querySelector<HTMLElement>('code');
  if (!code || code.dataset.typed) return;
  code.dataset.typed = '1';
  const text = code.textContent || '';
  const caret = box.querySelector('.s-caret');
  code.textContent = '';
  let i = 0;
  const step = () => {
    code.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(step, 45 + Math.random() * 55);
    else caret?.classList.add('is-done');
  };
  setTimeout(step, 900);
}

function reveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.setAttribute('data-in', '');
      io.unobserve(e.target);
      if (e.target.matches('.s-cmd')) typeCommand(e.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -7% 0px' });

  const seen = new Set<Element>();
  REVEAL.forEach(([sel, type, step, base]) => {
    const groups = new Map<Element | null, HTMLElement[]>();
    $$<HTMLElement>(sel).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', type);
      const list = groups.get(el.parentElement) || [];
      list.push(el);
      groups.set(el.parentElement, list);
    });
    groups.forEach((list) => list.forEach((el, i) => {
      el.style.setProperty('--d', base + i * step + 'ms');
      if (type === 'toss') {
        el.style.setProperty('--tx', (i % 2 ? -36 : 36) + 'px');
        el.style.setProperty('--tr', (i % 2 ? -5 : 5) + 'deg');
      }
      io.observe(el);
    }));
  });
  HERO.forEach(([sel, d]) => document.querySelector<HTMLElement>(sel)?.style.setProperty('--d', d + 'ms'));
  const h1 = document.querySelector<HTMLElement>('[data-reveal="words"]');
  h1?.style.setProperty('--base', document.querySelector('.s-hero') ? '.12s' : '.05s');
}

/* Menu pill: glides under the hovered link, then back to the current page. */
function navPill() {
  const nav = document.querySelector<HTMLElement>('.s-nav');
  if (!nav) return;
  const pill = document.createElement('span');
  pill.className = 's-nav-pill no-tr';
  pill.setAttribute('aria-hidden', 'true');
  nav.prepend(pill);
  nav.classList.add('has-pill');
  const place = (a: HTMLElement | null) => {
    if (!a) { pill.style.opacity = '0'; return; }
    pill.style.opacity = '1';
    pill.style.setProperty('--x', a.offsetLeft + 'px');
    pill.style.setProperty('--y', a.offsetTop + 'px');
    pill.style.setProperty('--w', a.offsetWidth + 'px');
    pill.style.setProperty('--h', a.offsetHeight + 'px');
    pill.dataset.tone = a.dataset.tone || '';
  };
  const current = () => nav.querySelector<HTMLElement>('[aria-current]');
  const reset = () => place(current());
  reset();
  document.fonts?.ready.then(reset);
  window.addEventListener('resize', reset);
  requestAnimationFrame(() => requestAnimationFrame(() => pill.classList.remove('no-tr')));
  nav.addEventListener('pointerover', (e) => { const a = (e.target as Element).closest<HTMLElement>('a'); if (a) place(a); });
  nav.addEventListener('pointerleave', reset);
  nav.addEventListener('focusin', (e) => { const a = (e.target as Element).closest<HTMLElement>('a'); if (a) place(a); });
  nav.addEventListener('focusout', reset);
}

/* Glow that follows the pointer on cards. */
function shine() {
  $$('.s-tile, .s-card, .s-cta').forEach((el) => el.setAttribute('data-shine', ''));
  document.addEventListener('pointermove', (e) => {
    const el = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-shine]') : null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  }, { passive: true });
}

if (root.classList.contains('motion')) {
  reveal();
  navPill();
  shine();
  root.classList.add('mo-ready');
}
