/**
 * All scoring rules live here. Screens and games must call these helpers
 * instead of calculating points themselves.
 */
import { SCORING, STARS } from '@/config/gameConfig';
import type { BadgeId } from '@/data/badges';
import type { QuestionResult, SessionKind } from '@/types/learning';

type AttemptOutcome = {
  solved: boolean;
  attempts: number;
  usedCoaching: boolean;
};

export function scoreAttempt({ solved, attempts, usedCoaching }: AttemptOutcome): number {
  if (!solved) return SCORING.revealed;
  if (attempts <= 1) return SCORING.firstAttempt;
  if (usedCoaching || attempts >= 3) return SCORING.afterCoaching;
  return SCORING.secondAttempt;
}

export function maxScoreFor(questionCount: number): number {
  return questionCount * SCORING.firstAttempt;
}

export function totalScore(results: QuestionResult[]): number {
  return results.reduce((sum, result) => sum + result.points, 0);
}

/** First-attempt accuracy, 0–1. Returns 0 for an empty list. */
export function calculateAccuracy(results: QuestionResult[]): number {
  if (results.length === 0) return 0;
  return results.filter((result) => result.correct).length / results.length;
}

/** Always at least one star — every finished session deserves recognition. */
export function starsForAccuracy(accuracy: number): 1 | 2 | 3 {
  if (accuracy >= STARS.threeStars) return 3;
  if (accuracy >= STARS.twoStars) return 2;
  return 1;
}

export function toPercent(value: number | null | undefined): number {
  if (value == null || Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}

function typeAccuracy(results: QuestionResult[], types: QuestionResult['questionType'][]): number | null {
  const subset = results.filter((result) => types.includes(result.questionType));
  return subset.length >= 2 ? calculateAccuracy(subset) : null;
}

export function pickBadge(results: QuestionResult[], kind: SessionKind): BadgeId {
  if (kind === 'practice') return 'practice-star';
  const happy = results.filter((result) => result.expectedEmotion === 'happy');
  const faceAccuracy = typeAccuracy(results, ['face', 'matching']);
  const storyAccuracy = typeAccuracy(results, ['story', 'situation']);
  if (faceAccuracy !== null && faceAccuracy >= 0.8) return 'face-detective';
  if (storyAccuracy !== null && storyAccuracy >= 0.8) return 'story-solver';
  if (happy.length >= 2 && happy.every((result) => result.correct)) return 'happy-hero';
  return 'emotion-explorer';
}
