import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { Session } from './types';

interface AuthState {
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (payload: { email: string; password: string; expectedRole?: string | null }) => Promise<void>;
  register: (payload: {
    role: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    businessName?: string;
    referralCodeUsed?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    await api.hydrateTokens();
    if (api.isLoggedIn()) {
      try {
        const data = await api.me();
        setSession(data.user ?? data);
      } catch {
        await api.clearSession();
        setSession(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (payload: { email: string; password: string; expectedRole?: string | null }) => {
    setError(null);
    try {
      const data = await api.login(payload);
      setSession(data.user ?? data);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      throw err;
    }
  }, []);

  const register = useCallback(async (payload: any) => {
    setError(null);
    try {
      const data = await api.register(payload);
      setSession(data.user ?? data);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setSession(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!api.isLoggedIn()) return;
    try {
      const data = await api.me();
      setSession(data.user ?? data);
    } catch {
      /* keep last known session on transient failure */
    }
  }, []);

  const value = useMemo(
    () => ({ session, loading, error, login, register, logout, refresh, clearError: () => setError(null) }),
    [session, loading, error, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
