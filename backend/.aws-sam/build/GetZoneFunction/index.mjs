/**
 * getZone Lambda
 *
 * GET /zone/{zipCode}
 *
 * Calls the USDA Plant Hardiness Zone API to map a US zip code to a
 * hardiness zone (e.g. "10a"), then returns it to the frontend.
 *
 * Proxying through Lambda means:
 *  - The USDA API key (if ever required) stays server-side
 *  - We can cache results in DynamoDB later to avoid repeat calls
 *
 * USDA API endpoint (free, no key required):
 *   https://phzmapi.org/{zipCode}.json
 *
 * Response: 200 { zipCode, zone, coordinates, temperature_range }
 */

import { ok, badRequest, notFound, serverError } from '../../shared/response.mjs';

const USDA_BASE_URL = 'https://phzmapi.org';

export async function handler(event) {
  try {
    const zipCode = event.pathParameters?.zipCode;
    if (!zipCode) return badRequest('Missing zipCode path parameter');

    // Basic zip code format validation (US 5-digit)
    if (!/^\d{5}$/.test(zipCode)) {
      return badRequest('zipCode must be a 5-digit US zip code');
    }

    const response = await fetch(`${USDA_BASE_URL}/${zipCode}.json`);

    if (response.status === 404) {
      return notFound(`No hardiness zone found for zip code ${zipCode}`);
    }

    if (!response.ok) {
      throw new Error(`USDA API returned ${response.status}`);
    }

    const data = await response.json();

    return ok({
      zipCode,
      zone:              data.zone,
      coordinates:       data.coordinates,
      temperature_range: data.temperature_range,
    });

  } catch (err) {
    return serverError(err);
  }
}
