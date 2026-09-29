import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { getAgeGroup, getAgeGroupIdForAge, type AgeGroupConfig } from '@/config/ageGroups';
import { DEMO_CHILD } from '@/data/demoData';
import { DEFAULT_CHILD_AVATAR } from '@/data/childAvatars';
import { loadJSON, saveJSON, storageKeys } from '@/services/storageService';
import type { ChildProfile } from '@/types/child';
import { createId } from '@/utils/random';

import { useAuth } from './AuthContext';

type NewChildInput = {
  name: string;
  age: number;
  avatarId?: string;
};

type ChildContextValue = {
  child: ChildProfile | null;
  ageGroup: AgeGroupConfig;
  isReady: boolean;
  createChild: (input: NewChildInput) => Promise<ChildProfile>;
  updateChild: (changes: Partial<Omit<ChildProfile, 'id' | 'createdAt'>>) => Promise<void>;
  selectDemoChild: () => Promise<ChildProfile>;
};

const ChildContext = createContext<ChildContextValue | null>(null);

export function ChildProvider({ children }: { children: ReactNode }) {
  const { parent } = useAuth();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  // Incremented on every write so a slower reload never overwrites a newer profile.
  const writeVersion = useRef(0);
  const parentId = parent?.id ?? null;

  // Reload whenever the signed-in parent changes (sign in / sign out).
  useEffect(() => {
    let active = true;
    const versionAtStart = writeVersion.current;
    (async () => {
      const stored = parentId ? await loadJSON<ChildProfile | null>(storageKeys.child, null) : null;
      if (!active || writeVersion.current !== versionAtStart) {
        setIsReady(true);
        return;
      }
      setChild(stored);
      setIsReady(true);
    })();
    return () => {
      active = false;
    };
  }, [parentId]);

  const persist = useCallback(async (profile: ChildProfile) => {
    writeVersion.current += 1;
    setChild(profile);
    await saveJSON(storageKeys.child, profile);
  }, []);

  const createChild = useCallback<ChildContextValue['createChild']>(
    async ({ name, age, avatarId }) => {
      const profile: ChildProfile = {
        id: createId('child'),
        name: name.trim(),
        age,
        avatarId: avatarId ?? DEFAULT_CHILD_AVATAR.id,
        ageGroupId: getAgeGroupIdForAge(age),
        learningArea: null,
        createdAt: new Date().toISOString(),
      };
      await persist(profile);
      return profile;
    },
    [persist],
  );

  const updateChild = useCallback<ChildContextValue['updateChild']>(
    async (changes) => {
      if (!child) return;
      await persist({ ...child, ...changes });
    },
    [child, persist],
  );

  const selectDemoChild = useCallback(async () => {
    await persist(DEMO_CHILD);
    return DEMO_CHILD;
  }, [persist]);

  const ageGroup = getAgeGroup(child?.ageGroupId);

  const value = useMemo(
    () => ({ child, ageGroup, isReady, createChild, updateChild, selectDemoChild }),
    [child, ageGroup, isReady, createChild, updateChild, selectDemoChild],
  );

  return <ChildContext.Provider value={value}>{children}</ChildContext.Provider>;
}

export function useChild(): ChildContextValue {
  const context = useContext(ChildContext);
  if (!context) throw new Error('useChild must be used inside ChildProvider');
  return context;
}
