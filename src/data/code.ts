/* Code samples shown on the site, and their light coloring. */
import type { Lang } from '../i18n/routes';

export const STEPS = {
  download: 'curl -LO https://github.com/dada-core/lore/releases/latest/download/docker-compose.yml',
  password: 'echo "DB_PASSWORD=$(openssl rand -base64 24)" > .env',
  start: 'docker compose up -d'
};

export function install(lang: Lang) {
  const c = lang === 'fr'
    ? ['# 1. Télécharger le fichier de démarrage', '# 2. Choisir le mot de passe de la base', '# 3. Démarrer les deux conteneurs', '# Lore répond sur http://localhost:8080']
    : ['# 1. Download the starter file', '# 2. Choose the database password', '# 3. Start both containers', '# Lore answers on http://localhost:8080'];
  return [c[0], STEPS.download, '', c[1], STEPS.password, '', c[2], STEPS.start, '', c[3]].join('\n');
}

/* Installing a .deb or .rpm package, once PostgreSQL 18 is ready. */
export function packages(lang: Lang) {
  const c = lang === 'fr'
    ? ['# Ubuntu et Debian', '# RHEL, Rocky Linux et AlmaLinux', '# Puis, une fois la base prête et /etc/lore/lore.env rempli']
    : ['# Ubuntu and Debian', '# RHEL, Rocky Linux and AlmaLinux', '# Then, once the database and /etc/lore/lore.env are ready'];
  return [c[0], 'sudo apt install ./lore_0.1.0_amd64.deb', '', c[1], 'sudo dnf install ./lore-0.1.0-1.x86_64.rpm', '', c[2], 'sudo systemctl enable --now lore'].join('\n');
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/* Comments in gray, YAML keys in the accent color; each line is wrapped so it can appear in turn. */
export function colorize(src: string) {
  return esc(src).split('\n').map((l, i) => {
    const html = /^\s*#/.test(l) ? `<span class="c">${l}</span>` : l.replace(/^(\s*-?\s*)([A-Za-z_][\w.-]*):/, '$1<span class="k">$2</span>:');
    return `<span class="ln" style="--i:${i}">${html}</span>`;
  }).join('\n');
}
