import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { DEMO_CHILD, DEMO_HISTORY } from '@/data/demoData';
import { buildProgressInsights, summarizeSession } from '@/services/learningEngine';
import { loadJSON, saveJSON, storageKeys } from '@/services/storageService';
import type { Emotion } from '@/types/emotion';
import type {
  ActiveSession,
  ChildProgress,
  LevelId,
  ProgressInsights,
  QuestionResult,
  SessionKind,
  SessionSummary,
} from '@/types/learning';
import { createId } from '@/utils/random';

import { useChild } from './ChildContext';

type LearningContextValue = {
  progress: ChildProgress;
  insights: ProgressInsights;
  activeSession: ActiveSession | null;
  lastSummary: SessionSummary | null;
  /** Emotions the next activities should emphasise. */
  focusEmotions: Emotion[];
  isReady: boolean;
  startSession: (kind: SessionKind, focus?: Emotion[]) => ActiveSession;
  ensureGameSession: () => ActiveSession;
  recordResults: (results: QuestionResult[]) => void;
  completeLevel: (levelId: LevelId) => void;
  finishSession: () => SessionSummary | null;
  abandonSession: () => void;
  markLessonCompleted: () => void;
};

const EMPTY_PROGRESS: ChildProgress = { history: [], unlockedLevel: 1, lessonCompleted: false };

const LearningContext = createContext<LearningContextValue | null>(null);

function initialProgressFor(childId: string): ChildProgress {
  // The demo child starts with history so the dashboard shows a trend.
  return childId === DEMO_CHILD.id ? { ...EMPTY_PROGRESS, history: DEMO_HISTORY } : EMPTY_PROGRESS;
}

export function LearningProvider({ children }: { children: ReactNode }) {
  const { child } = useChild();
  const childId = child?.id ?? null;
  const [progress, setProgress] = useState<ChildProgress>(EMPTY_PROGRESS);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [lastSummary, setLastSummary] = useState<SessionSummary | null>(null);
  // The child id whose progress has finished loading; readiness is derived from it.
  const [loadedChildId, setLoadedChildId] = useState<string | null | undefined>(undefined);
  const isReady = loadedChildId === childId;
  // Refs let actions read the latest state synchronously between renders.
  const sessionRef = useRef<ActiveSession | null>(null);
  const progressRef = useRef<ChildProgress>(EMPTY_PROGRESS);

  const updateSession = useCallback((session: ActiveSession | null) => {
    sessionRef.current = session;
    setActiveSession(session);
  }, []);

  const updateProgress = useCallback(
    (next: ChildProgress) => {
      progressRef.current = next;
      setProgress(next);
      if (childId) void saveJSON(storageKeys.progress(childId), next);
    },
    [childId],
  );

  // Tracks which child the in-memory session belongs to.
  const sessionChildRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    // Only drop the session when switching away from a previously loaded child;
    // a session started while the first profile loads must survive.
    if (sessionChildRef.current !== null && sessionChildRef.current !== childId) {
      updateSession(null);
      setLastSummary(null);
    }
    sessionChildRef.current = childId;
    (async () => {
      const loaded = childId
        ? await loadJSON<ChildProgress>(storageKeys.progress(childId), initialProgressFor(childId))
        : EMPTY_PROGRESS;
      if (!active) return;
      progressRef.current = { ...EMPTY_PROGRESS, ...loaded };
      setProgress(progressRef.current);
      setLoadedChildId(childId);
    })();
    return () => {
      active = false;
    };
  }, [childId, updateSession]);

  const insights = useMemo(() => buildProgressInsights(progress.history), [progress.history]);

  const startSession = useCallback<LearningContextValue['startSession']>(
    (kind, focus) => {
      const session: ActiveSession = {
        id: createId(kind),
        kind,
        startedAt: new Date().toISOString(),
        results: [],
        completedLevels: [],
        focusEmotions: focus ?? buildProgressInsights(progressRef.current.history).weakEmotions,
      };
      updateSession(session);
      return session;
    },
    [updateSession],
  );

  const ensureGameSession = useCallback(() => {
    const current = sessionRef.current;
    if (current && current.kind === 'game') return current;
    return startSession('game');
  }, [startSession]);

  const recordResults = useCallback(
    (results: QuestionResult[]) => {
      const current = sessionRef.current;
      if (!current || results.length === 0) return;
      updateSession({ ...current, results: [...current.results, ...results] });
    },
    [updateSession],
  );

  const completeLevel = useCallback(
    (levelId: LevelId) => {
      const current = sessionRef.current;
      if (current && !current.completedLevels.includes(levelId)) {
        updateSession({ ...current, completedLevels: [...current.completedLevels, levelId] });
      }
      const nextUnlocked = Math.min(5, Math.max(progressRef.current.unlockedLevel, levelId + 1)) as LevelId;
      if (nextUnlocked !== progressRef.current.unlockedLevel) {
        updateProgress({ ...progressRef.current, unlockedLevel: nextUnlocked });
      }
    },
    [updateProgress, updateSession],
  );

  const finishSession = useCallback(() => {
    const current = sessionRef.current;
    if (!current) return null;
    updateSession(null);
    if (current.results.length === 0) return null;
    const summary = summarizeSession(current);
    updateProgress({ ...progressRef.current, history: [...progressRef.current.history, summary] });
    setLastSummary(summary);
    return summary;
  }, [updateProgress, updateSession]);

  const abandonSession = useCallback(() => updateSession(null), [updateSession]);

  const markLessonCompleted = useCallback(() => {
    if (!progressRef.current.lessonCompleted) {
      updateProgress({ ...progressRef.current, lessonCompleted: true });
    }
  }, [updateProgress]);

  const focusEmotions = activeSession?.focusEmotions ?? insights.weakEmotions;

  const value = useMemo(
    () => ({
      progress,
      insights,
      activeSession,
      lastSummary,
      focusEmotions,
      isReady,
      startSession,
      ensureGameSession,
      recordResults,
      completeLevel,
      finishSession,
      abandonSession,
      markLessonCompleted,
    }),
    [
      progress,
      insights,
      activeSession,
      lastSummary,
      focusEmotions,
      isReady,
      startSession,
      ensureGameSession,
      recordResults,
      completeLevel,
      finishSession,
      abandonSession,
      markLessonCompleted,
    ],
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning(): LearningContextValue {
  const context = useContext(LearningContext);
  if (!context) throw new Error('useLearning must be used inside LearningProvider');
  return context;
}
