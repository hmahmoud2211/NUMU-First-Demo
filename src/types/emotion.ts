import type { ImageSourcePropType } from 'react-native';

export const ALL_EMOTIONS = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'] as const;

export type Emotion = (typeof ALL_EMOTIONS)[number];

export type EyeShape = 'relaxed' | 'wide' | 'narrowed';
export type BrowShape = 'neutral' | 'raised' | 'lowered' | 'worried';
export type MouthShape = 'smile' | 'frown' | 'open' | 'round' | 'neutral' | 'scrunch';

export type FaceParts = {
  eyes: EyeShape;
  brows: BrowShape;
  mouth: MouthShape;
};

export type FacePartCategory = keyof FaceParts;

/**
 * A single example face. The game only ever depends on this shape, so the
 * source can be a local FER2013 photo, a remote URL from an API, or an
 * illustrated fallback face (when no photo has been added yet).
 */
export type EmotionImage = {
  id: string;
  emotion: Emotion;
  difficulty: 1 | 2 | 3;
} & (
  | { kind: 'photo'; source: ImageSourcePropType }
  | { kind: 'illustration'; variant: number }
);

export type EmotionInfo = {
  id: Emotion;
  label: string;
  /** Friendlier label used for the youngest age group. */
  childLabel: string;
  emoji: string;
  /** Emotions that are commonly mistaken for this one. Most confusable first. */
  confusableWith: Emotion[];
};
