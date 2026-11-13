/* French typography, applied to the rendered HTML of French pages:
   - narrow no-break space (U+202F) before ; ! ? % and as a thousands separator;
   - no-break space (U+00A0) before : and » and after «.
   Only text between tags is changed: tags, attributes, scripts, styles and code are left untouched. */

const NNBSP = ' ';
const NBSP = ' ';
const SKIP = /^<(script|style|pre|code|textarea)\b/i;
const TOKEN = /(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<pre\b[\s\S]*?<\/pre>|<code\b[\s\S]*?<\/code>|<textarea\b[\s\S]*?<\/textarea>|<!--[\s\S]*?-->|<[^>]*>)/i;

function text(s: string): string {
  return s
    .replace(/[  ]([;!?%])/g, NNBSP + '$1')
    .replace(/[  ]([:»])/g, NBSP + '$1')
    .replace(/«[  ]/g, '«' + NBSP)
    .replace(/(\d) (\d{3})(?!\d)/g, '$1' + NNBSP + '$2');
}

/* Attributes whose text is read or shown: page description, tooltips, labels for assistive technologies. */
const ATTR = /(\s(?:content|title|aria-label|alt)=")([^"]*)(")/g;

export function frenchTypography(html: string): string {
  return html
    .split(TOKEN)
    .map((part, i) => {
      if (SKIP.test(part)) return part;
      if (i % 2 === 1) return part.startsWith('<!--') ? part : part.replace(ATTR, (_, a, v, b) => a + text(v) + b);
      return text(part);
    })
    .join('');
}
