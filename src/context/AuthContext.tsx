/**
 * Demo-only authentication. Accounts live on the device; passwords are only
 * validated for length and never stored. Replace with a real auth provider later.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEMO_PARENT } from '@/data/demoData';
import { clearAllNumuData, loadJSON, saveJSON, storageKeys } from '@/services/storageService';
import type { ParentProfile } from '@/types/child';
import { createId } from '@/utils/random';

type AuthResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  parent: ParentProfile | null;
  isReady: boolean;
  onboardingSeen: boolean;
  markOnboardingSeen: () => void;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  continueAsDemo: () => Promise<void>;
  signOutAndReset: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 4;

function validateCredentials(email: string, password: string): string | null {
  if (!EMAIL_PATTERN.test(email.trim())) return 'Please enter a valid email address.';
  if (password.length < MIN_PASSWORD_LENGTH) return `Password needs at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [parent, setParent] = useState<ParentProfile | null>(null);
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [storedParent, seen] = await Promise.all([
        loadJSON<ParentProfile | null>(storageKeys.parent, null),
        loadJSON<boolean>(storageKeys.onboardingSeen, false),
      ]);
      setParent(storedParent);
      setOnboardingSeen(seen);
      setIsReady(true);
    })();
  }, []);

  const persistParent = useCallback(async (profile: ParentProfile) => {
    setParent(profile);
    await saveJSON(storageKeys.parent, profile);
  }, []);

  const markOnboardingSeen = useCallback(() => {
    setOnboardingSeen(true);
    void saveJSON(storageKeys.onboardingSeen, true);
  }, []);

  const signUp = useCallback<AuthContextValue['signUp']>(
    async (name, email, password) => {
      if (!name.trim()) return { ok: false, error: 'Please enter your name.' };
      const error = validateCredentials(email, password);
      if (error) return { ok: false, error };
      const accounts = await loadJSON<ParentProfile[]>(storageKeys.accounts, []);
      const normalised = email.trim().toLowerCase();
      if (accounts.some((account) => account.email === normalised)) {
        return { ok: false, error: 'An account with this email already exists. Try logging in.' };
      }
      const profile: ParentProfile = {
        id: createId('parent'),
        name: name.trim(),
        email: normalised,
        isDemo: false,
        createdAt: new Date().toISOString(),
      };
      await saveJSON(storageKeys.accounts, [...accounts, profile]);
      await persistParent(profile);
      return { ok: true };
    },
    [persistParent],
  );

  const login = useCallback<AuthContextValue['login']>(
    async (email, password) => {
      const error = validateCredentials(email, password);
      if (error) return { ok: false, error };
      const accounts = await loadJSON<ParentProfile[]>(storageKeys.accounts, []);
      const account = accounts.find((item) => item.email === email.trim().toLowerCase());
      if (!account) return { ok: false, error: 'No account found on this device. Create one first.' };
      await persistParent(account);
      return { ok: true };
    },
    [persistParent],
  );

  const continueAsDemo = useCallback(async () => {
    await persistParent({ ...DEMO_PARENT, createdAt: new Date().toISOString() });
  }, [persistParent]);

  const signOutAndReset = useCallback(async () => {
    await clearAllNumuData();
    setParent(null);
    setOnboardingSeen(false);
  }, []);

  const value = useMemo(
    () => ({ parent, isReady, onboardingSeen, markOnboardingSeen, signUp, login, continueAsDemo, signOutAndReset }),
    [parent, isReady, onboardingSeen, markOnboardingSeen, signUp, login, continueAsDemo, signOutAndReset],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
