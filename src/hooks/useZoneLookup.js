/**
 * useZoneLookup.js
 *
 * Hook for looking up a USDA hardiness zone by zip code.
 * Calls gardenService.getZone() — works against the mock in dev,
 * and the real Lambda/USDA API once VITE_API_URL is set.
 *
 * Returns:
 *   zoneData   - { zipCode, zone, coordinates, temperature_range } | null
 *   loading    - true while the lookup is in flight
 *   error      - Error | null
 *   lookupZone - (zipCode: string) => Promise<void>  — trigger a lookup
 *   clearZone  - () => void  — reset state
 */

import { useState, useCallback } from 'react';
import { getZone } from '../services/gardenService';

export function useZoneLookup() {
  const [zoneData, setZoneData] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const lookupZone = useCallback(async (zipCode) => {
    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      setError(new Error('Please enter a valid 5-digit US zip code'));
      return;
    }

    setLoading(true);
    setError(null);
    setZoneData(null);

    try {
      const data = await getZone(zipCode);
      setZoneData(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearZone = useCallback(() => {
    setZoneData(null);
    setError(null);
  }, []);

  return { zoneData, loading, error, lookupZone, clearZone };
}
