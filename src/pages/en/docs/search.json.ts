/* Search index of the English documentation, loaded by the search window on first use. */
import type { APIRoute } from 'astro';
import { searchIndex } from '../../../docs/search';

export const GET: APIRoute = async () => Response.json(await searchIndex('en'));
