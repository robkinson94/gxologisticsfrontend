// src/hooks/useAuthCheck.ts
import { useEffect, useState } from 'react';
import { fetchUserProfile } from './auth';

export function useAuthCheck() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await fetchUserProfile(); // if success => authenticated
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    })();
  }, []);

  return isAuthenticated;
}