import type { AgeGroupId, AgeText } from '@/types/child';
import type { Emotion, FacePartCategory, FaceParts } from '@/types/emotion';
import type { ColorToken } from '@/theme';

export type StoryComplexity = 'simple' | 'medium' | 'advanced';

export type AgeGroupConfig = {
  id: AgeGroupId;
  /** Inclusive lower bound. */
  minAge: number;
  /** Exclusive upper bound (the last group is inclusive). */
  maxAge: number;
  label: string;
  rangeLabel: string;
  emoji: string;
  description: string;
  instructionStyle: 'very-short' | 'short' | 'natural';
  storyComplexity: StoryComplexity;
  answerChoiceCount: number;
  /** Emotions taught first in the lesson. */
  coreEmotions: Emotion[];
  /** Emotions introduced later: as distractors, in coaching and in the mixed level. */
  extendedEmotions: Emotion[];
  matchingPairCount: number;
  imageSize: 'large' | 'medium';
  showEmoji: boolean;
  speechRate: number;
  /** Speak avatar messages automatically (younger children rely more on audio). */
  autoSpeak: boolean;
  childBackground: ColorToken;
  /** Face-builder options offered to this group. */
  faceBuilderOptions: { [K in FacePartCategory]: FaceParts[K][] };
};

export const AGE_GROUPS: Record<AgeGroupId, AgeGroupConfig> = {
  early: {
    id: 'early',
    minAge: 3,
    maxAge: 8,
    label: 'Little Learners',
    rangeLabel: '3–8 years',
    emoji: '🧸',
    description: 'Big pictures, very short sentences and lots of audio.',
    instructionStyle: 'very-short',
    storyComplexity: 'simple',
    answerChoiceCount: 3,
    coreEmotions: ['happy', 'sad', 'angry', 'fear'],
    extendedEmotions: ['surprise', 'neutral'],
    matchingPairCount: 3,
    imageSize: 'large',
    showEmoji: true,
    speechRate: 0.85,
    autoSpeak: true,
    childBackground: 'childBackground',
    faceBuilderOptions: {
      eyes: ['relaxed', 'wide', 'narrowed'],
      brows: ['neutral', 'raised', 'lowered', 'worried'],
      mouth: ['smile', 'frown', 'open', 'neutral'],
    },
  },
  middle: {
    id: 'middle',
    minAge: 8,
    maxAge: 13,
    label: 'Explorers',
    rangeLabel: '8–13 years',
    emoji: '🧭',
    description: 'Everyday stories, matching games and more emotion words.',
    instructionStyle: 'short',
    storyComplexity: 'medium',
    answerChoiceCount: 4,
    coreEmotions: ['happy', 'sad', 'angry', 'fear', 'surprise'],
    extendedEmotions: ['neutral', 'disgust'],
    matchingPairCount: 4,
    imageSize: 'medium',
    showEmoji: true,
    speechRate: 0.95,
    autoSpeak: false,
    childBackground: 'childBackground',
    faceBuilderOptions: {
      eyes: ['relaxed', 'wide', 'narrowed'],
      brows: ['neutral', 'raised', 'lowered', 'worried'],
      mouth: ['smile', 'frown', 'open', 'round', 'neutral'],
    },
  },
  teen: {
    id: 'teen',
    minAge: 13,
    maxAge: 18,
    label: 'Navigators',
    rangeLabel: '13–18 years',
    emoji: '🎧',
    description: 'Realistic social situations and subtle facial cues.',
    instructionStyle: 'natural',
    storyComplexity: 'advanced',
    answerChoiceCount: 4,
    coreEmotions: ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'],
    extendedEmotions: [],
    matchingPairCount: 4,
    imageSize: 'medium',
    showEmoji: false,
    speechRate: 1,
    autoSpeak: false,
    childBackground: 'teenBackground',
    faceBuilderOptions: {
      eyes: ['relaxed', 'wide', 'narrowed'],
      brows: ['neutral', 'raised', 'lowered', 'worried'],
      mouth: ['smile', 'frown', 'open', 'round', 'neutral', 'scrunch'],
    },
  },
};

export const AGE_GROUP_ORDER: AgeGroupId[] = ['early', 'middle', 'teen'];

export const SUPPORTED_AGE = { min: 3, max: 18 } as const;

export function getAgeGroup(id: AgeGroupId | undefined | null): AgeGroupConfig {
  return AGE_GROUPS[id ?? 'early'] ?? AGE_GROUPS.early;
}

/** Picks the age group for an age, clamping ages outside the supported range. */
export function getAgeGroupIdForAge(age: number): AgeGroupId {
  const match = AGE_GROUP_ORDER.find((id) => age >= AGE_GROUPS[id].minAge && age < AGE_GROUPS[id].maxAge);
  if (match) return match;
  return age < SUPPORTED_AGE.min ? 'early' : 'teen';
}

export function pickAgeText(text: AgeText, groupId: AgeGroupId): string {
  return text[groupId];
}

/** Every emotion used by the age group, core emotions first. */
export function getEmotionPool(group: AgeGroupConfig): Emotion[] {
  return [...group.coreEmotions, ...group.extendedEmotions];
}
