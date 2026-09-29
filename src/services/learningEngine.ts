/**
 * NUMU's local personalization engine.
 *
 * It observes answers, finds which emotions are hard and which pairs are
 * confused, and generates the next activities around them. Everything is
 * deterministic TypeScript so it can later be replaced by a server-side
 * model that returns the same shapes.
 */
import { getEmotionPool, type AgeGroupConfig } from '@/config/ageGroups';
import { MASTERY, PRACTICE } from '@/config/gameConfig';
import { ALL_EMOTIONS, type Emotion } from '@/types/emotion';
import type {
  ActiveSession,
  Confusion,
  EmotionInsight,
  EmotionStats,
  LearningQuestion,
  MasteryStatus,
  ProgressInsights,
  QuestionResult,
  QuestionType,
  SessionSummary,
} from '@/types/learning';
import { shuffle } from '@/utils/random';
import { calculateAccuracy, maxScoreFor, pickBadge, totalScore } from '@/utils/scoring';

import { buildFaceQuestion, buildQuestion, createGeneratorContext } from './questionGenerator';

// ───────────── Analysis ─────────────

export function computeEmotionStats(results: QuestionResult[]): EmotionStats {
  const stats: EmotionStats = {};
  for (const result of results) {
    const stat = stats[result.expectedEmotion] ?? { attempted: 0, correct: 0 };
    stat.attempted += 1;
    if (result.correct) stat.correct += 1;
    stats[result.expectedEmotion] = stat;
  }
  return stats;
}

/** Mistakes per emotion, e.g. { happy: 0, sad: 3, fear: 4 }. */
export function getMistakeCounts(results: QuestionResult[]): Partial<Record<Emotion, number>> {
  const counts: Partial<Record<Emotion, number>> = {};
  for (const result of results) {
    counts[result.expectedEmotion] = (counts[result.expectedEmotion] ?? 0) + (result.correct ? 0 : 1);
  }
  return counts;
}

export function getConfusions(results: QuestionResult[]): Confusion[] {
  const map = new Map<string, Confusion>();
  for (const result of results) {
    for (const selected of new Set(result.wrongSelections)) {
      const key = `${result.expectedEmotion}>${selected}`;
      const entry = map.get(key) ?? { expected: result.expectedEmotion, selected, count: 0 };
      entry.count += 1;
      map.set(key, entry);
    }
  }
  return sortConfusions([...map.values()]);
}

function sortConfusions(confusions: Confusion[]): Confusion[] {
  return [...confusions].sort((a, b) => b.count - a.count);
}

export function getMasteryStatus(accuracy: number, attempted: number): MasteryStatus {
  if (attempted === 0) return 'not-started';
  if (accuracy >= MASTERY.strong) return 'strong';
  if (accuracy >= MASTERY.developing) return 'developing';
  return 'needs-practice';
}

function toInsights(stats: EmotionStats): EmotionInsight[] {
  return ALL_EMOTIONS.flatMap((emotion) => {
    const stat = stats[emotion];
    if (!stat || stat.attempted === 0) return [];
    const accuracy = stat.correct / stat.attempted;
    return [{ emotion, ...stat, accuracy, status: getMasteryStatus(accuracy, stat.attempted) }];
  });
}

/**
 * Accuracy pulled slightly towards 50% so a single answer does not outweigh
 * many (0/1 should not look weaker than 4/14). Used for ranking only.
 */
function rankingScore(insight: EmotionInsight): number {
  return (insight.correct + 1) / (insight.attempted + 2);
}

/** Prefers emotions with enough answers to judge; falls back to all when data is thin. */
function withEnoughData(insights: EmotionInsight[]): EmotionInsight[] {
  const reliable = insights.filter((insight) => insight.attempted >= MASTERY.minAttempts);
  return reliable.length > 0 ? reliable : insights;
}

/** Emotions below the "strong" threshold, weakest first. */
export function getWeakEmotionsFromStats(stats: EmotionStats, max: number = MASTERY.maxFocusEmotions): Emotion[] {
  return withEnoughData(toInsights(stats).filter((insight) => insight.accuracy < MASTERY.strong))
    .sort((a, b) => rankingScore(a) - rankingScore(b))
    .slice(0, max)
    .map((insight) => insight.emotion);
}

export function getWeakEmotions(results: QuestionResult[]): Emotion[] {
  return getWeakEmotionsFromStats(computeEmotionStats(results));
}

/**
 * Chooses what to practise next: the weakest emotion plus the emotion it is
 * most often confused with (e.g. Fear & Surprise). Falls back to the second
 * weakest emotion.
 */
export function getPracticeFocus(stats: EmotionStats, confusions: Confusion[]): Emotion[] {
  const weak = getWeakEmotionsFromStats(stats);
  const weakest = weak[0];
  if (!weakest) return [];
  const partner = confusions.find((c) => c.expected === weakest || c.selected === weakest);
  const partnerEmotion = partner ? (partner.expected === weakest ? partner.selected : partner.expected) : weak[1];
  return partnerEmotion && partnerEmotion !== weakest ? [weakest, partnerEmotion] : [weakest];
}

export function summarizeSession(session: ActiveSession): SessionSummary {
  const { results } = session;
  const emotionStats = computeEmotionStats(results);
  const confusions = getConfusions(results);
  return {
    id: session.id,
    kind: session.kind,
    area: 'emotion-recognition',
    completedAt: new Date().toISOString(),
    questionCount: results.length,
    correctCount: results.filter((result) => result.correct).length,
    accuracy: calculateAccuracy(results),
    score: totalScore(results),
    maxScore: maxScoreFor(results.length),
    emotionStats,
    confusions,
    focusEmotions: getPracticeFocus(emotionStats, confusions),
    badgeId: pickBadge(results, session.kind),
  };
}

function mergeStats(history: SessionSummary[]): EmotionStats {
  const merged: EmotionStats = {};
  for (const session of history) {
    for (const emotion of ALL_EMOTIONS) {
      const stat = session.emotionStats[emotion];
      if (!stat) continue;
      const current = merged[emotion] ?? { attempted: 0, correct: 0 };
      merged[emotion] = { attempted: current.attempted + stat.attempted, correct: current.correct + stat.correct };
    }
  }
  return merged;
}

function mergeConfusions(history: SessionSummary[]): Confusion[] {
  const map = new Map<string, Confusion>();
  for (const confusion of history.flatMap((session) => session.confusions)) {
    const key = `${confusion.expected}>${confusion.selected}`;
    const entry = map.get(key) ?? { ...confusion, count: 0 };
    entry.count += confusion.count;
    map.set(key, entry);
  }
  return sortConfusions([...map.values()]);
}

/** Aggregates the whole history for the parent dashboard and home screen. */
export function buildProgressInsights(history: SessionSummary[]): ProgressInsights {
  const stats = mergeStats(history);
  const emotions = toInsights(stats);
  const attempted = emotions.reduce((sum, e) => sum + e.attempted, 0);
  const correct = emotions.reduce((sum, e) => sum + e.correct, 0);
  const confusions = mergeConfusions(history);
  const strongest = withEnoughData(emotions).sort((a, b) => rankingScore(b) - rankingScore(a))[0] ?? null;
  return {
    sessionsCompleted: history.length,
    overallAccuracy: attempted === 0 ? null : correct / attempted,
    emotions,
    strongest,
    weakEmotions: getPracticeFocus(stats, confusions),
    confusions,
  };
}

// ───────────── Adaptive generation ─────────────

/**
 * Personalised practice: ~70% of questions target the focus emotions,
 * the rest review other emotions so practice stays encouraging.
 */
export function generatePracticeQuestions(
  focusEmotions: Emotion[],
  group: AgeGroupConfig,
  seed: string,
  count: number = PRACTICE.questionCount,
): LearningQuestion[] {
  const ctx = createGeneratorContext(group, seed);
  const pool = getEmotionPool(group);
  const focus = focusEmotions.length > 0 ? focusEmotions : group.coreEmotions.slice(0, 2);
  const review = shuffle(
    pool.filter((emotion) => !focus.includes(emotion)),
    ctx.random,
  );
  const focusCount = Math.round(count * PRACTICE.focusShare);
  const targets = [
    ...Array.from({ length: focusCount }, (_, i) => focus[i % focus.length]),
    ...Array.from({ length: count - focusCount }, (_, i) => review[i % Math.max(review.length, 1)] ?? focus[0]),
  ];
  const types: QuestionType[] = ['face', 'situation', 'face', 'face-builder'];
  return shuffle(targets, ctx.random).flatMap((target, index) => {
    const question = buildQuestion(`P-q${index + 1}`, types[index % types.length], target, ctx);
    return question ? [question] : [];
  });
}

/** "Practice These Two": short two-choice drill that contrasts a confused pair. */
export function generatePairPractice(
  pair: [Emotion, Emotion],
  group: AgeGroupConfig,
  seed: string,
  count: number = PRACTICE.pairQuestionCount,
): LearningQuestion[] {
  const ctx = createGeneratorContext(group, seed);
  const targets = shuffle(
    Array.from({ length: count }, (_, i) => pair[i % 2]),
    ctx.random,
  );
  return targets.flatMap((target, index) => {
    const question = buildFaceQuestion(`PP-q${index + 1}`, target, ctx, shuffle(pair, ctx.random));
    return question ? [question] : [];
  });
}
