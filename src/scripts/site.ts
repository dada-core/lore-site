/* Interactions: theme, header, mobile menu, tabs, copy buttons, presentation video, scroll hints. */

const root = document.documentElement;
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
const words = JSON.parse(root.dataset.words || '{}') as Record<string, string>;

/* ---------- Notification ---------- */
let toastTimer: number | undefined;
function toast(msg: string) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { t.hidden = true; }, 3200);
}

/* ---------- Theme: system, light or dark, shared with the demo ---------- */
type Theme = 'auto' | 'light' | 'dark';
const THEMES: Theme[] = ['auto', 'light', 'dark'];
function getTheme(): Theme {
  try { const t = localStorage.getItem('lore-theme'); return t === 'light' || t === 'dark' ? t : 'auto'; } catch { return 'auto'; }
}
function setTheme(t: Theme) {
  if (t === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', t);
  try { localStorage.setItem('lore-theme', t); } catch { /* storage unavailable: the choice lasts until the page closes */ }
  $$<HTMLSelectElement>('[data-theme-select]').forEach((s) => { s.value = t; });
}
$$<HTMLSelectElement>('[data-theme-select]').forEach((s) => {
  s.value = getTheme();
  s.addEventListener('change', () => setTheme(s.value as Theme));
});
$$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => {
  const next = THEMES[(THEMES.indexOf(getTheme()) + 1) % THEMES.length];
  setTheme(next);
  toast(words['theme-' + next] || next);
}));

/* ---------- Header: becomes a floating capsule once the page scrolls ---------- */
const header = $('.s-header');
const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Mobile menu ---------- */
const drawer = $<HTMLDialogElement>('#s-drawer');
$$('[data-drawer-open]').forEach((b) => b.addEventListener('click', () => drawer?.showModal()));
$$('[data-drawer-close]').forEach((b) => b.addEventListener('click', () => drawer?.close()));
drawer?.addEventListener('click', (e) => { if (e.target === drawer) drawer.close(); });

/* ---------- Tabs (code samples) ---------- */
function select(tab: HTMLElement, focus = false) {
  const list = tab.closest('[role="tablist"]');
  if (!list) return;
  $$('[role="tab"]', list).forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls') || '');
    if (!panel) return;
    panel.hidden = !on;
  });
  if (focus) tab.focus();
}
document.addEventListener('click', (e) => {
  const tab = (e.target as Element).closest<HTMLElement>('[role="tab"]');
  if (tab) select(tab);
});
document.addEventListener('keydown', (e) => {
  const tab = (e.target as Element).closest?.<HTMLElement>('[role="tab"]');
  if (!tab || !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
  const tabs = $$('[role="tab"]', tab.closest('[role="tablist"]')!);
  const i = tabs.indexOf(tab);
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  e.preventDefault();
  select(tabs[next], true);
});

/* ---------- Copy buttons ---------- */
function copy(text: string, done: string) {
  const fail = () => toast(words['copy-fail']);
  try { navigator.clipboard.writeText(text).then(() => toast(done), fail); } catch { fail(); }
}
document.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLElement>('[data-copy], [data-copy-pane]');
  if (!b) return;
  if (b.dataset.copy) { copy(b.dataset.copy, b.dataset.done || words.copied); return; }
  const pane = $$<HTMLElement>('pre', b.closest('.s-code, .d-code')!).find((p) => !p.closest('[hidden]'));
  if (pane) copy(pane.textContent || '', words.copied);
});

/* ---------- Presentation video: "See the demo" opens it in a window. Without the script, the
   button and the "Full screen" link of the home page lead to the video file itself. ---------- */
const videoWindow = $<HTMLDialogElement>('#s-video');
const windowVideo = videoWindow?.querySelector('video');
$$('[data-video-open]').forEach((link) => link.addEventListener('click', (e) => {
  if (!videoWindow || !windowVideo) return;
  e.preventDefault();
  videoWindow.showModal();
  windowVideo.play().catch(() => { /* playback refused: the controls stay available */ });
}));
videoWindow?.addEventListener('close', () => windowVideo?.pause());
videoWindow?.addEventListener('click', (e) => { if (e.target === videoWindow) videoWindow.close(); });
$$('[data-video-close]').forEach((b) => b.addEventListener('click', () => videoWindow?.close()));
/* The video of the home page starts with its sound when half of it is in view, and pauses when it
   leaves; a video paused by the visitor stays paused. Browsers only allow sound once the visitor has
   clicked or typed on the page: until then it plays silently, says so, and the first click or key press
   brings the sound. Reduced motion or data saving: it waits for a click. */
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
  || Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
$$('[data-video-frame]').forEach((frame) => {
  const video = frame.querySelector('video');
  const toggle = $<HTMLButtonElement>('[data-video-toggle]', frame);
  const sound = $<HTMLButtonElement>('[data-video-sound]', frame);
  if (!video || !toggle || !sound) return;
  let pausedByVisitor = false;
  let soundOffByVisitor = false;
  let silentByBrowser = false;
  let soundJustGiven = false;
  const play = () => {
    video.muted = soundOffByVisitor;
    video.play().catch(() => {
      if (video.muted) return;
      silentByBrowser = true;
      video.muted = true;
      video.play().catch(() => { /* playback refused: the button stays available */ });
      sync();
    });
  };
  /* The first click or key press anywhere on the page: the sound the browser held back. */
  const giveSound = () => {
    if (!silentByBrowser) return;
    silentByBrowser = false;
    if (!soundOffByVisitor) video.muted = false;
    soundJustGiven = true;
    setTimeout(() => { soundJustGiven = false; }, 0);
    sync();
  };
  document.addEventListener('click', giveSound, true);
  document.addEventListener('keydown', giveSound, true);
  const sync = () => {
    frame.classList.toggle('is-silent', silentByBrowser && !video.paused);
    frame.classList.toggle('is-playing', !video.paused);
    toggle.setAttribute('aria-label', (video.paused ? frame.dataset.play : frame.dataset.pause) || '');
    const on = !video.muted;
    const label = (on ? frame.dataset.soundOff : frame.dataset.soundOn) || '';
    sound.setAttribute('aria-pressed', String(on));
    sound.setAttribute('aria-label', label);
    sound.title = label;
  };
  ['play', 'pause', 'ended', 'volumechange'].forEach((type) => video.addEventListener(type, sync));
  toggle.addEventListener('click', () => {
    if (soundJustGiven) return;
    pausedByVisitor = !video.paused;
    if (video.paused) play(); else video.pause();
  });
  video.addEventListener('click', () => toggle.click());
  sound.addEventListener('click', () => {
    if (soundJustGiven) return;
    video.muted = !video.muted;
    soundOffByVisitor = video.muted;
  });
  if (!calm) {
    new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= 0.5) { if (!pausedByVisitor && !video.ended) play(); }
      else if (!video.paused) video.pause();
    }, { threshold: [0, 0.5] }).observe(frame);
  }
  sync();
});
/* "Full screen" shows the frame, with its buttons, and turns the sound on. */
$$('[data-video-full]').forEach((link) => link.addEventListener('click', (e) => {
  const frame = link.closest('.s-frame')?.querySelector<HTMLElement>('[data-video-frame]');
  const video = frame?.querySelector('video');
  if (!frame || !video || !frame.requestFullscreen) return;
  e.preventDefault();
  frame.requestFullscreen().then(() => { video.muted = false; return video.play(); }).catch(() => { /* full screen refused: the link is a fallback */ });
}));

/* ---------- Horizontal scrolling without a scrollbar: fades show there is more.
   A box that scrolls can take the keyboard focus, to scroll it with the arrow keys. ---------- */
$$('.hx').forEach((w) => {
  const el = w.firstElementChild as HTMLElement | null;
  if (!el) return;
  const hint = () => {
    w.classList.toggle('hint-l', el.scrollLeft > 2);
    w.classList.toggle('hint-r', el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    if (el.scrollWidth > el.clientWidth + 2) el.tabIndex = 0;
    else if (!el.hasAttribute('data-keep-focus')) el.removeAttribute('tabindex');
  };
  el.addEventListener('scroll', hint, { passive: true });
  new ResizeObserver(hint).observe(el);
  hint();
});

