/**
 * useAuth.js
 *
 * React hook that manages authentication state for the entire app.
 * Wraps authService — no component ever calls Amplify directly.
 *
 * Returns:
 *   user          - { userId, username, email } | null
 *   authLoading   - true during initial session check and auth operations
 *   authError     - Error | null
 *   isAuthenticated
 *   login         - (email, password) => Promise<void>
 *   register      - (email, password) => Promise<{ nextStep }>
 *   confirmSignUp - (email, code)     => Promise<void>
 *   logout        - ()                => Promise<void>
 *   clearError    - ()                => void
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentAuthUser,
  login as serviceLogin,
  register as serviceRegister,
  confirmRegistration,
  logout as serviceLogout,
} from '../services/authService';

export function useAuth() {
  const [user, setUser]           = useState(null);
  const [authLoading, setLoading] = useState(true);
  const [authError, setError]     = useState(null);

  // ── Check for existing session on mount ─────────────────────────────────────
  useEffect(() => {
    getCurrentAuthUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // ── Login ────────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await serviceLogin(email, password);
      setUser(loggedInUser);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Register ─────────────────────────────────────────────────────────────────
  const register = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      return await serviceRegister(email, password);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Confirm sign-up ──────────────────────────────────────────────────────────
  const confirmSignUp = useCallback(async (email, code) => {
    setLoading(true);
    setError(null);
    try {
      await confirmRegistration(email, code);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await serviceLogout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    authLoading,
    authError,
    isAuthenticated: !!user,
    login,
    register,
    confirmSignUp,
    logout,
    clearError,
  };
}
