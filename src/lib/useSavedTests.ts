// Client-side "saved for later" list — the API has no wishlist endpoint, so
// this persists locally (SecureStore on native, localStorage on web).
import { useCallback, useEffect, useState } from 'react';
import * as storage from './secureStorage';

const KEY = 'testmandi_saved_tests';

export function useSavedTests() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storage
      .getItemAsync(KEY)
      .then((raw) => {
        if (raw) setSavedIds(new Set(JSON.parse(raw)));
      })
      .finally(() => setLoaded(true));
  }, []);

  const toggle = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      storage.setItemAsync(KEY, JSON.stringify(Array.from(next))).catch(() => {});
      return next;
    });
  }, []);

  return { savedIds, toggle, loaded };
}
