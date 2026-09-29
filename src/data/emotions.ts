/**
 * Central registry for emotion metadata and every example face used in NUMU.
 *
 * Screens never list images themselves — they ask this module for images.
 * Real FER2013 photos come from `emotionImageManifest.ts` (generated from
 * assets/emotions/<emotion>/). When an emotion has no photos yet, NUMU falls
 * back to illustrated example faces so the demo always works.
 */
import { ALL_EMOTIONS, type Emotion, type EmotionImage, type EmotionInfo } from '@/types/emotion';

import { emotionPhotoManifest } from './emotionImageManifest';

export const EMOTION_INFO: Record<Emotion, EmotionInfo> = {
  happy: { id: 'happy', label: 'Happy', childLabel: 'Happy', emoji: '😊', confusableWith: ['surprise', 'neutral'] },
  sad: { id: 'sad', label: 'Sad', childLabel: 'Sad', emoji: '😢', confusableWith: ['neutral', 'fear', 'angry'] },
  angry: { id: 'angry', label: 'Angry', childLabel: 'Angry', emoji: '😠', confusableWith: ['disgust', 'sad'] },
  fear: { id: 'fear', label: 'Fear', childLabel: 'Scared', emoji: '😨', confusableWith: ['surprise', 'sad'] },
  surprise: { id: 'surprise', label: 'Surprise', childLabel: 'Surprised', emoji: '😮', confusableWith: ['fear', 'happy'] },
  disgust: { id: 'disgust', label: 'Disgust', childLabel: 'Yucky', emoji: '🤢', confusableWith: ['angry', 'sad'] },
  neutral: { id: 'neutral', label: 'Neutral', childLabel: 'Calm', emoji: '😐', confusableWith: ['sad', 'happy'] },
};

/** Number of illustrated fallback faces generated per emotion. */
const ILLUSTRATIONS_PER_EMOTION = 6;

const illustratedImages: EmotionImage[] = ALL_EMOTIONS.flatMap((emotion) =>
  Array.from({ length: ILLUSTRATIONS_PER_EMOTION }, (_, index): EmotionImage => ({
    id: `${emotion}_illustration_${index + 1}`,
    emotion,
    kind: 'illustration',
    variant: index,
    difficulty: index < 2 ? 1 : index < 4 ? 2 : 3,
  })),
);

const photoImages: EmotionImage[] = emotionPhotoManifest.map((entry) => ({
  id: entry.id,
  emotion: entry.emotion,
  difficulty: entry.difficulty,
  kind: 'photo',
  source: entry.source,
}));

export const emotionImages: EmotionImage[] = [...photoImages, ...illustratedImages];

/**
 * Example faces for an emotion. Photos (FER2013) are preferred; illustrations
 * are used only when no photo exists for that emotion.
 */
export function getImagesForEmotion(emotion: Emotion): EmotionImage[] {
  const photos = photoImages.filter((image) => image.emotion === emotion);
  if (photos.length > 0) return photos;
  return illustratedImages.filter((image) => image.emotion === emotion);
}
