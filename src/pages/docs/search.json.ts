/* Search index of the French documentation, loaded by the search window on first use. */
import type { APIRoute } from 'astro';
import { searchIndex } from '../../docs/search';

export const GET: APIRoute = async () => Response.json(await searchIndex('fr'));
