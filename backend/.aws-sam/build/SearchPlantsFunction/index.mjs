/**
 * searchPlants Lambda
 *
 * GET /plants/search?q={query}&page={page}
 *
 * Proxies search requests to the Perenual Plant API and returns a
 * normalised list of plant results. The API key never leaves the server.
 *
 * Perenual API docs: https://perenual.com/docs/api
 * Free tier: 100 requests/day, returns up to 30 results per page.
 *
 * Environment variables required:
 *   PERENUAL_API_KEY  — set this in AWS Systems Manager Parameter Store
 *                       or as a Lambda env var after deployment
 *
 * Response: 200 {
 *   results: [{ id, commonName, scientificName, emoji, cycle, watering, sunlight, imageUrl }],
 *   currentPage, lastPage, total
 * }
 */

import { ok, badRequest, serverError } from './response.mjs';

const PERENUAL_BASE = 'https://perenual.com/api';

// Best-effort emoji based on plant cycle / type keywords
function pickEmoji(plant) {
  const name = (plant.common_name ?? '').toLowerCase();
  if (name.includes('rose'))      return '🌹';
  if (name.includes('tomato'))    return '🍅';
  if (name.includes('lavender'))  return '💜';
  if (name.includes('basil') || name.includes('herb')) return '🌿';
  if (name.includes('sunflower')) return '🌻';
  if (name.includes('tulip'))     return '🌷';
  if (name.includes('cactus') || name.includes('succulent')) return '🌵';
  if (name.includes('fern') || name.includes('moss'))  return '🌿';
  if (name.includes('tree') || name.includes('oak'))   return '🌳';
  if (name.includes('fruit') || name.includes('apple') || name.includes('berry')) return '🍎';
  if (name.includes('pepper') || name.includes('chilli')) return '🌶️';
  if (name.includes('carrot') || name.includes('root')) return '🥕';
  if (name.includes('lettuce') || name.includes('spinach')) return '🥬';
  return '🌱';
}

/**
 * Normalise a raw Perenual result into the shape the UI and DynamoDB expect.
 */
function normalise(plant) {
  return {
    perenualId:     plant.id,
    commonName:     plant.common_name ?? 'Unknown',
    scientificName: Array.isArray(plant.scientific_name)
      ? plant.scientific_name[0]
      : (plant.scientific_name ?? ''),
    emoji:          pickEmoji(plant),
    cycle:          plant.cycle ?? '',
    watering:       plant.watering ?? '',
    sunlight:       Array.isArray(plant.sunlight)
      ? plant.sunlight.join(', ')
      : (plant.sunlight ?? ''),
    imageUrl:       plant.default_image?.small_url ?? null,
  };
}

export async function handler(event) {
  try {
    const apiKey = process.env.PERENUAL_API_KEY;
    if (!apiKey) {
      return serverError(new Error('PERENUAL_API_KEY environment variable is not set'));
    }

    const query = event.queryStringParameters?.q ?? '';
    const page  = event.queryStringParameters?.page ?? '1';

    if (!query.trim()) {
      return badRequest('Query parameter "q" is required');
    }

    const url = new URL(`${PERENUAL_BASE}/species-list`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('q', query);
    url.searchParams.set('page', page);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Perenual API returned ${response.status}`);
    }

    const data = await response.json();

    return ok({
      results:     (data.data ?? []).map(normalise),
      currentPage: data.current_page ?? 1,
      lastPage:    data.last_page ?? 1,
      total:       data.total ?? 0,
    });

  } catch (err) {
    return serverError(err);
  }
}
