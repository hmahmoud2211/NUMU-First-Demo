import type { LevelId, QuestionType } from '@/types/learning';

export type LevelConfig = {
  id: LevelId;
  title: string;
  childTitle: string;
  description: string;
  emoji: string;
  /** Question types used by the level, cycled in order. */
  questionTypes: QuestionType[];
  questionCount: number;
};

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: 'Recognize the Face',
    childTitle: 'Look at the Face',
    description: 'Look at a face and choose the feeling.',
    emoji: '🙂',
    questionTypes: ['face'],
    questionCount: 5,
  },
  {
    id: 2,
    title: 'Understand the Situation',
    childTitle: 'What Happened?',
    description: 'Read what happened and choose how they might feel.',
    emoji: '📖',
    questionTypes: ['situation'],
    questionCount: 4,
  },
  {
    id: 3,
    title: 'Emotion Match',
    childTitle: 'Match the Faces',
    description: 'Match each face with its feeling.',
    emoji: '🧩',
    questionTypes: ['matching'],
    questionCount: 1,
  },
  {
    id: 4,
    title: 'Build the Face',
    childTitle: 'Build a Face',
    description: 'Choose eyes, eyebrows and a mouth to make a feeling.',
    emoji: '🎨',
    questionTypes: ['face-builder'],
    questionCount: 2,
  },
  {
    id: 5,
    title: 'Mixed Challenge',
    childTitle: 'Mixed Challenge',
    description: 'A little bit of everything!',
    emoji: '🏆',
    questionTypes: ['face', 'story', 'situation', 'face-builder', 'face'],
    questionCount: 5,
  },
];

export function getLevel(id: number): LevelConfig | undefined {
  return LEVELS.find((level) => level.id === id);
}

export const SCORING = {
  firstAttempt: 10,
  secondAttempt: 7,
  afterCoaching: 5,
  revealed: 0,
  /** After this many incorrect attempts the answer is shown calmly. */
  maxAttempts: 3,
} as const;

/** Mastery thresholds (accuracy is 0–1). */
export const MASTERY = {
  strong: 0.8,
  developing: 0.6,
  /** How many weak emotions to focus on at once. */
  maxFocusEmotions: 2,
} as const;

export const STARS = {
  threeStars: 0.85,
  twoStars: 0.6,
} as const;

export const PRACTICE = {
  questionCount: 6,
  /** Share of practice questions that target weak emotions. */
  focusShare: 0.7,
  pairQuestionCount: 4,
} as const;

export const LESSON = {
  /** Total teaching examples across the taught emotions. */
  totalExamples: 10,
} as const;
