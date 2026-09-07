import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import type { Attempt, Purchase, Test } from './types';

interface DataState {
  tests: Test[];
  categories: string[];
  purchases: Purchase[];
  attempts: Attempt[];
  purchasedIds: Set<string>;
  loading: boolean;
  refreshAll: () => Promise<void>;
  refreshBuyerData: () => Promise<void>;
  testsById: Record<string, Test>;
}

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPublic = useCallback(async () => {
    const [testsRes, catRes] = await Promise.all([
      api.getTests().catch(() => ({ tests: [] })),
      api.getCategories().catch(() => ({ categories: [] })),
    ]);
    setTests(testsRes.tests || []);
    setCategories(catRes.categories || []);
  }, []);

  const refreshBuyerData = useCallback(async () => {
    if (!session || session.role !== 'buyer') {
      setPurchases([]);
      setAttempts([]);
      return;
    }
    const [purchasesRes, attemptsRes] = await Promise.all([
      api.getMyPurchases().catch(() => ({ purchases: [] })),
      api.getMyAttempts().catch(() => ({ attempts: [] })),
    ]);
    setPurchases(purchasesRes.purchases || []);
    setAttempts(attemptsRes.attempts || []);
  }, [session]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadPublic(), refreshBuyerData()]);
    setLoading(false);
  }, [loadPublic, refreshBuyerData]);

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.email]);

  const purchasedIds = useMemo(() => new Set(purchases.map((p) => p.testId)), [purchases]);
  const testsById = useMemo(() => Object.fromEntries(tests.map((t) => [t.id, t])), [tests]);

  const value = useMemo(
    () => ({ tests, categories, purchases, attempts, purchasedIds, loading, refreshAll, refreshBuyerData, testsById }),
    [tests, categories, purchases, attempts, purchasedIds, loading, refreshAll, refreshBuyerData, testsById]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
