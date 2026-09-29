import type { BrowShape, Emotion, EyeShape, FacePartCategory, FaceParts, MouthShape } from '@/types/emotion';

export type FacePartOption<T extends string> = {
  id: T;
  label: string;
};

export const FACE_PART_OPTIONS: {
  eyes: Record<EyeShape, FacePartOption<EyeShape>>;
  brows: Record<BrowShape, FacePartOption<BrowShape>>;
  mouth: Record<MouthShape, FacePartOption<MouthShape>>;
} = {
  eyes: {
    relaxed: { id: 'relaxed', label: 'Relaxed' },
    wide: { id: 'wide', label: 'Wide open' },
    narrowed: { id: 'narrowed', label: 'Narrowed' },
  },
  brows: {
    neutral: { id: 'neutral', label: 'Resting' },
    raised: { id: 'raised', label: 'Raised' },
    lowered: { id: 'lowered', label: 'Pulled down' },
    worried: { id: 'worried', label: 'Tilted up' },
  },
  mouth: {
    smile: { id: 'smile', label: 'Smile' },
    frown: { id: 'frown', label: 'Frown' },
    open: { id: 'open', label: 'Open wide' },
    round: { id: 'round', label: 'Round “O”' },
    neutral: { id: 'neutral', label: 'Straight' },
    scrunch: { id: 'scrunch', label: 'Scrunched' },
  },
};

export const FACE_PART_CATEGORIES: { id: FacePartCategory; label: string }[] = [
  { id: 'eyes', label: 'Eyes' },
  { id: 'brows', label: 'Eyebrows' },
  { id: 'mouth', label: 'Mouth' },
];

export type EmotionFaceConfiguration = {
  /** Accepted shapes per part. The first entry is the typical (canonical) shape. */
  accepted: { [K in FacePartCategory]: FaceParts[K][] };
};

export const EMOTION_FACE_CONFIGURATIONS: Record<Emotion, EmotionFaceConfiguration> = {
  happy: { accepted: { eyes: ['relaxed', 'narrowed'], brows: ['neutral', 'raised'], mouth: ['smile'] } },
  sad: { accepted: { eyes: ['relaxed', 'narrowed'], brows: ['worried'], mouth: ['frown'] } },
  angry: { accepted: { eyes: ['narrowed', 'wide'], brows: ['lowered'], mouth: ['frown', 'neutral'] } },
  fear: { accepted: { eyes: ['wide'], brows: ['worried', 'raised'], mouth: ['open'] } },
  surprise: { accepted: { eyes: ['wide'], brows: ['raised'], mouth: ['round', 'open'] } },
  disgust: { accepted: { eyes: ['narrowed'], brows: ['lowered'], mouth: ['scrunch', 'frown'] } },
  neutral: { accepted: { eyes: ['relaxed'], brows: ['neutral'], mouth: ['neutral'] } },
};

export const BLANK_FACE: FaceParts = { eyes: 'relaxed', brows: 'neutral', mouth: 'neutral' };

export function getCanonicalFace(emotion: Emotion): FaceParts {
  const { accepted } = EMOTION_FACE_CONFIGURATIONS[emotion];
  return { eyes: accepted.eyes[0], brows: accepted.brows[0], mouth: accepted.mouth[0] };
}

/** Produces small, still-valid variations of an emotion's face for illustrated examples. */
export function getFaceVariant(emotion: Emotion, variant: number): FaceParts {
  const { accepted } = EMOTION_FACE_CONFIGURATIONS[emotion];
  return {
    eyes: accepted.eyes[Math.floor(variant / 2) % accepted.eyes.length],
    brows: accepted.brows[variant % accepted.brows.length],
    mouth: accepted.mouth[Math.floor(variant / 3) % accepted.mouth.length],
  };
}

export function getFacePartLabel(category: FacePartCategory, value: string): string {
  const options: Record<string, FacePartOption<string>> = FACE_PART_OPTIONS[category];
  return options[value]?.label ?? value;
}

/** Returns a copy of the face with one part replaced. */
export function withPart(face: FaceParts, category: FacePartCategory, value: string): FaceParts {
  return { ...face, [category]: value } as FaceParts;
}
