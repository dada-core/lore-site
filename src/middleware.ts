import { defineMiddleware } from 'astro:middleware';
import { frenchTypography } from './lib/typography';

/* Runs on every page while the site is built: French pages get French typography. */
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html') || context.url.pathname.startsWith('/en/')) return response;
  const html = await response.text();
  return new Response(frenchTypography(html), { status: response.status, headers: response.headers });
});
