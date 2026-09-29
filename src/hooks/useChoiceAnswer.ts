import { useCallback, useRef, useState } from 'react';

import { SCORING } from '@/config/gameConfig';
import type { OptionState } from '@/components/emotion/EmotionOption';
import type { Emotion } from '@/types/emotion';
import type { QuestionResult, QuestionType, ResultSource } from '@/types/learning';
import { scoreAttempt } from '@/utils/scoring';

export type AnswerStatus = 'answering' | 'retry' | 'solved' | 'revealed';

type Target = {
  id: string;
  type: QuestionType;
  targetEmotion: Emotion;
};

/**
 * Shared attempt tracking for single-answer questions (faces, stories,
 * situations, face builder). Encapsulates attempts, coaching and scoring so
 * every game records results the same way.
 */
export function useChoiceAnswer(question: Target, source: ResultSource) {
  const [wrong, setWrong] = useState<Emotion[]>([]);
  const [status, setStatus] = useState<AnswerStatus>('answering');
  const [usedCoaching, setUsedCoaching] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const firstResponseMs = useRef<number | undefined>(undefined);
  const firstSelection = useRef<Emotion | undefined>(undefined);

  const submit = useCallback(
    (selected: Emotion) => {
      if (status === 'solved' || status === 'revealed') return;
      if (firstSelection.current === undefined) {
        firstSelection.current = selected;
        firstResponseMs.current = Date.now() - startedAt;
      }
      if (selected === question.targetEmotion) {
        setStatus('solved');
        return;
      }
      const next = [...wrong, selected];
      setWrong(next);
      setStatus(next.length >= SCORING.maxAttempts ? 'revealed' : 'retry');
    },
    [question.targetEmotion, startedAt, status, wrong],
  );

  const markCoaching = useCallback(() => setUsedCoaching(true), []);

  const attempts = wrong.length + (status === 'solved' ? 1 : 0);
  const done = status === 'solved' || status === 'revealed';
  const points = done ? scoreAttempt({ solved: status === 'solved', attempts, usedCoaching }) : 0;

  const buildResult = useCallback(
    (): QuestionResult => ({
      questionId: question.id,
      questionType: question.type,
      expectedEmotion: question.targetEmotion,
      selectedEmotion: firstSelection.current,
      wrongSelections: wrong,
      correct: wrong.length === 0 && status === 'solved',
      solved: status === 'solved',
      attempts: Math.max(1, attempts),
      usedCoaching,
      points,
      responseTimeMs: firstResponseMs.current,
      timestamp: new Date().toISOString(),
      source,
    }),
    [attempts, points, question.id, question.targetEmotion, question.type, source, status, usedCoaching, wrong],
  );

  const optionState = useCallback(
    (emotion: Emotion): OptionState => {
      if (done && emotion === question.targetEmotion) return 'correct';
      if (wrong.includes(emotion)) return 'tried';
      return done ? 'disabled' : 'idle';
    },
    [done, question.targetEmotion, wrong],
  );

  return {
    status,
    done,
    wrong,
    lastWrong: wrong[wrong.length - 1],
    points,
    usedCoaching,
    submit,
    markCoaching,
    buildResult,
    optionState,
  };
}
