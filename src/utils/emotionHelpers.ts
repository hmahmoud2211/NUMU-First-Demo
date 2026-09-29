import type { AgeGroupConfig } from '@/config/ageGroups';
import { EMOTION_FACE_CONFIGURATIONS } from '@/data/emotionFaceConfigurations';
import { EMOTION_INFO } from '@/data/emotions';
import type { AgeGroupId } from '@/types/child';
import { ALL_EMOTIONS, type Emotion, type FacePartCategory, type FaceParts } from '@/types/emotion';

import { shuffle, type Random } from './random';

export function getEmotionLabel(emotion: Emotion, ageGroupId?: AgeGroupId): string {
  const info = EMOTION_INFO[emotion];
  return ageGroupId === 'early' ? info.childLabel : info.label;
}

export function getEmotionEmoji(emotion: Emotion): string {
  return EMOTION_INFO[emotion].emoji;
}

export function isEmotion(value: unknown): value is Emotion {
  return typeof value === 'string' && (ALL_EMOTIONS as readonly string[]).includes(value);
}

/** Parses a comma-separated route param such as "fear,surprise". Invalid values are dropped. */
export function parseEmotionList(value: string | string[] | undefined): Emotion[] {
  const raw = Array.isArray(value) ? value.join(',') : (value ?? '');
  return [...new Set(raw.split(',').map((item) => item.trim()).filter(isEmotion))];
}

export function formatEmotionList(emotions: Emotion[], ageGroupId?: AgeGroupId): string {
  const labels = emotions.map((emotion) => getEmotionLabel(emotion, ageGroupId));
  if (labels.length <= 1) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]}`;
}

/**
 * Builds answer choices: the target, then the most confusable emotions
 * available to the age group, then other emotions. Always returns
 * `count` distinct options in shuffled order.
 */
export function buildAnswerOptions(
  target: Emotion,
  group: AgeGroupConfig,
  random: Random,
  count: number = group.answerChoiceCount,
): Emotion[] {
  const pool = [...group.coreEmotions, ...group.extendedEmotions];
  const confusable = EMOTION_INFO[target].confusableWith.filter((emotion) => pool.includes(emotion));
  const others = shuffle(
    group.coreEmotions.filter((emotion) => emotion !== target && !confusable.includes(emotion)),
    random,
  );
  const fallback = ALL_EMOTIONS.filter((emotion) => emotion !== target);
  const distractors = [...new Set([...confusable.slice(0, 1), ...others, ...confusable.slice(1), ...fallback])];
  return shuffle([target, ...distractors.slice(0, Math.max(1, count - 1))], random);
}

/** Makes sure curated options contain the target and fit the age group's choice count. */
export function normaliseOptions(
  target: Emotion,
  curated: Emotion[] | undefined,
  group: AgeGroupConfig,
  random: Random,
): Emotion[] {
  if (!curated) return buildAnswerOptions(target, group, random);
  const withTarget = curated.includes(target) ? curated : [target, ...curated];
  const trimmed = [target, ...withTarget.filter((e) => e !== target)].slice(0, group.answerChoiceCount);
  return shuffle(trimmed, random);
}

export type FaceCheck = {
  correct: boolean;
  partResults: Record<FacePartCategory, boolean>;
  /** The emotion the built face looks most like. */
  closestEmotion: Emotion;
};

export function checkBuiltFace(target: Emotion, face: FaceParts, allowed: Emotion[]): FaceCheck {
  const accepted = EMOTION_FACE_CONFIGURATIONS[target].accepted;
  const partResults = {
    eyes: accepted.eyes.includes(face.eyes),
    brows: accepted.brows.includes(face.brows),
    mouth: accepted.mouth.includes(face.mouth),
  };
  const correct = partResults.eyes && partResults.brows && partResults.mouth;
  if (correct) return { correct, partResults, closestEmotion: target };
  // Not quite right: record which other emotion the face resembles most.
  const others = allowed.filter((emotion) => emotion !== target);
  return { correct, partResults, closestEmotion: classifyFace(face, others, others[0] ?? 'neutral') };
}

/** Scores each emotion by how many of the face's parts it accepts. Mouth counts most. */
export function classifyFace(face: FaceParts, candidates: Emotion[], tieBreaker: Emotion): Emotion {
  let best = tieBreaker;
  let bestScore = -1;
  for (const emotion of candidates) {
    const { accepted } = EMOTION_FACE_CONFIGURATIONS[emotion];
    const score =
      (accepted.eyes.includes(face.eyes) ? 1 : 0) +
      (accepted.brows.includes(face.brows) ? 1 : 0) +
      (accepted.mouth.includes(face.mouth) ? 1.5 : 0);
    if (score > bestScore || (score === bestScore && emotion === tieBreaker)) {
      best = emotion;
      bestScore = score;
    }
  }
  return best;
}
