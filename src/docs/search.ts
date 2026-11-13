/* Search index of the documentation: the plain text of every page, cut at each heading,
   so that a result opens the page at the right section. Built with the site, served as JSON. */
import { getCollection, render } from 'astro:content';
import { frenchTypography } from '../lib/typography';
import { DOC_ORDER, docHref, docSection, type DocLang } from './nav';

export interface SearchEntry {
  /** Page title */
  t: string;
  /** Section of the documentation (menu group) */
  g: string;
  /** Heading of the passage, empty for the top of the page */
  h: string;
  /** Address, with the heading's anchor */
  u: string;
  /** Plain text of the passage */
  x: string;
}

const BADGE_TEXT = /\s*(?:v\d+\.\d+|Après v\d+\.\d+|After v\d+\.\d+|En préparation|In preparation)\s*$/;

/* Markdown to plain text: keeps the words and the code, drops the markup. */
function plain(md: string): string {
  return md
    .replace(/^\s*```.*$/gm, ' ')
    .replace(/\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/g, ' ')
    .replace(/^\s*\|?\s*:?-{3,}.*$/gm, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s*(?:>\s?)+/gm, '')
    .replace(/^\s*(?:[-*]|\d+\.)\s+/gm, '')
    .replace(/[|*`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Splits a page at its level 2 and 3 headings, ignoring lines inside code blocks. */
function sections(md: string): { heading: string; text: string }[] {
  const out = [{ heading: '', text: '' }];
  let fence = false;
  for (const line of md.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) fence = !fence;
    const m = !fence && /^(#{2,3})\s+(.*)$/.exec(line);
    if (m) out.push({ heading: m[2], text: '' });
    else out[out.length - 1].text += line + '\n';
  }
  return out;
}

export async function searchIndex(lang: DocLang): Promise<SearchEntry[]> {
  const typo = (s: string) => (lang === 'fr' ? frenchTypography(s) : s);
  const entries = await getCollection('docs', ({ id }) => id.startsWith(lang + '/'));
  const index: SearchEntry[] = [];
  for (const key of DOC_ORDER) {
    const entry = entries.find((e) => e.id === `${lang}/${key}`);
    if (!entry) continue;
    const { headings } = await render(entry);
    const anchors = headings.filter((h) => h.depth === 2 || h.depth === 3);
    const parts = sections(entry.body ?? '');
    const page = { t: typo(entry.data.title), g: typo(docSection(key).title[lang]) };
    parts.forEach((part, n) => {
      const anchor = n > 0 ? anchors[n - 1] : undefined;
      const text = plain((n === 0 ? entry.data.description + '\n' : '') + part.text);
      if (n > 0 && !text) return;
      index.push({
        ...page,
        h: anchor ? typo(anchor.text.replace(BADGE_TEXT, '')) : '',
        u: docHref(key, lang, anchor?.slug),
        x: typo(text)
      });
    });
  }
  return index;
}
