/**
 * AuthContext
 *
 * Single source of truth for auth state across the entire app.
 * Wrap the app in <AuthProvider> once — every component that calls
 * useAuth() shares the same state instance.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCurrentAuthUser,
  login as serviceLogin,
  register as serviceRegister,
  confirmRegistration,
  logout as serviceLogout,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [authLoading, setLoading] = useState(true);
  const [authError, setError]     = useState(null);

  // Check for an existing Cognito session on mount
  useEffect(() => {
    getCurrentAuthUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const clearError = useCallback(() => setError(null), []);

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

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await serviceLogout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      authLoading,
      authError,
      isAuthenticated: !!user,
      login,
      register,
      confirmSignUp,
      logout,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
