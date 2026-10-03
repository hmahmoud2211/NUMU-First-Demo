import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { DEMO_CHILD } from '@/data/demoData';
import { loadJSON, saveJSON, storageKeys } from '@/services/storageService';
import {
  applyActivity,
  createDemoWorldProgress,
  createInitialWorldProgress,
  levelFor,
  normalizeWorldProgress,
  questsDoneToday,
  recordFeelingCheckIn,
  toggleEquipped,
  unlockReward as unlockRewardRule,
} from '@/services/worldEngine';
import type {
  ActivityReward,
  FeelingId,
  LocationId,
  QuestId,
  RewardId,
  RewardSummary,
  WorldProgress,
} from '@/types/world';

import { useChild } from './ChildContext';

/** A finished visit the world map should celebrate when the child walks back out. */
export type WorldReturn = {
  location: LocationId;
  summary: RewardSummary | null;
};

type WorldContextValue = {
  progress: WorldProgress;
  isReady: boolean;
  playerName: string;
  level: number;
  questsDone: QuestId[];
  recordActivity: (reward: ActivityReward) => RewardSummary;
  recordFeeling: (feeling: FeelingId) => void;
  unlockReward: (id: RewardId) => boolean;
  toggleEquip: (id: RewardId) => void;
  setVoice: (on: boolean) => void;
  /** Set when leaving a location; the world map plays the return animation and clears it. */
  pendingReturn: WorldReturn | null;
  markReturn: (entry: WorldReturn) => void;
  clearReturn: () => void;
};

const GUEST_ID = 'guest';

const WorldContext = createContext<WorldContextValue | null>(null);

export function WorldProvider({ children }: { children: ReactNode }) {
  const { child, ageGroup } = useChild();
  const ownerId = child?.id ?? GUEST_ID;
  const defaultVoice = ageGroup.autoSpeak;
  const [progress, setProgress] = useState<WorldProgress>(() => createInitialWorldProgress(defaultVoice));
  const [loadedOwner, setLoadedOwner] = useState<string | null>(null);
  const [pendingReturn, setPendingReturn] = useState<WorldReturn | null>(null);
  // Actions read the latest progress synchronously between renders.
  const progressRef = useRef(progress);

  useEffect(() => {
    let active = true;
    (async () => {
      const fallback =
        ownerId === DEMO_CHILD.id ? createDemoWorldProgress(defaultVoice) : createInitialWorldProgress(defaultVoice);
      const stored = await loadJSON<Partial<WorldProgress> | null>(storageKeys.world(ownerId), null);
      if (!active) return;
      const loaded = stored ? normalizeWorldProgress(stored, fallback) : fallback;
      progressRef.current = loaded;
      setProgress(loaded);
      setLoadedOwner(ownerId);
    })();
    return () => {
      active = false;
    };
  }, [ownerId, defaultVoice]);

  const commit = useCallback(
    (next: WorldProgress) => {
      progressRef.current = next;
      setProgress(next);
      void saveJSON(storageKeys.world(ownerId), next);
    },
    [ownerId],
  );

  const recordActivity = useCallback(
    (reward: ActivityReward) => {
      const { next, summary } = applyActivity(progressRef.current, reward);
      commit(next);
      return summary;
    },
    [commit],
  );

  const recordFeeling = useCallback(
    (feeling: FeelingId) => commit(recordFeelingCheckIn(progressRef.current, feeling)),
    [commit],
  );

  const unlockReward = useCallback(
    (id: RewardId) => {
      const next = unlockRewardRule(progressRef.current, id);
      if (!next) return false;
      commit(next);
      return true;
    },
    [commit],
  );

  const toggleEquip = useCallback((id: RewardId) => commit(toggleEquipped(progressRef.current, id)), [commit]);

  const setVoice = useCallback(
    (voice: boolean) => commit({ ...progressRef.current, settings: { ...progressRef.current.settings, voice } }),
    [commit],
  );

  const markReturn = useCallback((entry: WorldReturn) => setPendingReturn(entry), []);
  const clearReturn = useCallback(() => setPendingReturn(null), []);

  const playerName = child?.name ?? 'Explorer';
  const level = levelFor(progress.totalStars);
  const questsDone = questsDoneToday(progress);
  const isReady = loadedOwner === ownerId;

  const value = useMemo(
    () => ({
      progress,
      isReady,
      playerName,
      level,
      questsDone,
      recordActivity,
      recordFeeling,
      unlockReward,
      toggleEquip,
      setVoice,
      pendingReturn,
      markReturn,
      clearReturn,
    }),
    [
      progress,
      isReady,
      playerName,
      level,
      questsDone,
      recordActivity,
      recordFeeling,
      unlockReward,
      toggleEquip,
      setVoice,
      pendingReturn,
      markReturn,
      clearReturn,
    ],
  );

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}

export function useWorld(): WorldContextValue {
  const context = useContext(WorldContext);
  if (!context) throw new Error('useWorld must be used inside WorldProvider');
  return context;
}
