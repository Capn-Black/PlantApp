/**
 * useGarden.js
 *
 * React hook that manages garden data state for the UI.
 * Calls gardenService — components never touch the service directly.
 *
 * Returns:
 *   plants        - array of plant view-models
 *   userMeta      - { userId, zipCode, hardinessZone, createdAt }
 *   loading       - true while any async operation is in flight
 *   error         - Error object if the last operation failed, else null
 *   addPlant      - (plantData) => Promise<void>
 *   removePlant   - (plantId)   => Promise<void>
 *   refreshPlants - ()          => Promise<void>  (manual re-fetch)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getPlants,
  getUserMetadata,
  addPlant as serviceAddPlant,
  removePlant as serviceRemovePlant,
} from '../services/gardenService';

export function useGarden() {
  const [plants, setPlants]     = useState([]);
  const [userMeta, setUserMeta] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // ── Initial load ────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedPlants, fetchedMeta] = await Promise.all([
        getPlants(),
        getUserMetadata(),
      ]);
      setPlants(fetchedPlants);
      setUserMeta(fetchedMeta);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Add a plant ─────────────────────────────────────────────────────────────
  const addPlant = useCallback(async (plantData) => {
    setLoading(true);
    setError(null);
    try {
      const saved = await serviceAddPlant(plantData);
      setPlants((prev) => [...prev, saved]);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Remove a plant ──────────────────────────────────────────────────────────
  const removePlant = useCallback(async (plantId) => {
    setLoading(true);
    setError(null);
    try {
      await serviceRemovePlant(plantId);
      setPlants((prev) => prev.filter((p) => p.id !== plantId));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    plants,
    userMeta,
    loading,
    error,
    addPlant,
    removePlant,
    refreshPlants: fetchAll,
  };
}
