/**
 * usePlantSearch.js
 *
 * Hook for searching the Perenual plant database.
 * Debounces the query so we don't fire on every keystroke.
 *
 * Returns:
 *   results     - array of normalised plant objects
 *   loading     - true while search is in flight
 *   error       - Error | null
 *   query       - current search string
 *   setQuery    - update the search string (triggers debounced search)
 *   pagination  - { currentPage, lastPage, total }
 *   nextPage    - () => void
 *   prevPage    - () => void
 *   clearSearch - () => void
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { searchPlants } from '../services/gardenService';

const DEBOUNCE_MS = 400;

export function usePlantSearch() {
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });

  const debounceTimer = useRef(null);

  const runSearch = useCallback(async (q, p) => {
    if (!q.trim()) {
      setResults([]);
      setPagination({ currentPage: 1, lastPage: 1, total: 0 });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchPlants(q, p);
      setResults(data.results);
      setPagination({
        currentPage: data.currentPage,
        lastPage:    data.lastPage,
        total:       data.total,
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce query changes
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      runSearch(query, 1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceTimer.current);
  }, [query, runSearch]);

  // Re-run when page changes (pagination buttons)
  useEffect(() => {
    if (page > 1) runSearch(query, page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, pagination.lastPage));
  }, [pagination.lastPage]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setPage(1);
    setPagination({ currentPage: 1, lastPage: 1, total: 0 });
  }, []);

  return {
    query, setQuery,
    results, loading, error,
    pagination,
    nextPage, prevPage,
    clearSearch,
  };
}
