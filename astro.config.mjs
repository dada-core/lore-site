import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { docMdastPlugins, docPlugins } from './src/docs/markdown.ts';

/* The demo is a static application in public/demo/. Static hosts serve /demo/ from demo/index.html,
   but the development server does not look for index.html in public/ and answers 404.
   This serves /demo/ from /demo/index.html during development only. */
const demoIndex = {
  name: 'lore:demo-index',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const [path, query] = (req.url ?? '').split('?');
      if (path === '/demo/') req.url = '/demo/index.html' + (query ? '?' + query : '');
      next();
    });
  }
};

// Static website: every page is rendered to HTML at build time (dist/), no server needed.
export default defineConfig({
  site: 'https://lore.dada-core.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  markdown: {
    /* Code is colored with the site's own tokens (see docs.css), in light and dark themes. */
    shikiConfig: { theme: 'css-variables' },
    /* Documentation pages: inline HTML (<kbd>, release badges) and the extensions of src/docs/markdown.ts. */
    processor: satteri({ mdastPlugins: docMdastPlugins, hastPlugins: docPlugins, features: { rawHtml: true } })
  },
  vite: { plugins: [demoIndex] }
});
