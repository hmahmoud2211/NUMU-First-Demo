import type { Emotion, EmotionImage } from './emotion';

export type QuestionType = 'face' | 'story' | 'situation' | 'matching' | 'face-builder';

export type LevelId = 1 | 2 | 3 | 4 | 5;

type QuestionBase = {
  id: string;
  targetEmotion: Emotion;
  prompt: string;
  explanation: string;
  difficulty: 1 | 2 | 3;
};

export type FaceQuestion = QuestionBase & {
  type: 'face';
  image: EmotionImage;
  options: Emotion[];
};

export type StoryQuestion = QuestionBase & {
  type: 'story' | 'situation';
  story: string;
  character: string;
  hint: string;
  options: Emotion[];
};

export type MatchingPair = {
  id: string;
  emotion: Emotion;
  image: EmotionImage;
};

export type MatchingQuestion = QuestionBase & {
  type: 'matching';
  pairs: MatchingPair[];
  /** Labels in display order (shuffled independently from the faces). */
  labels: Emotion[];
};

export type FaceBuilderQuestion = QuestionBase & {
  type: 'face-builder';
};

export type LearningQuestion = FaceQuestion | StoryQuestion | MatchingQuestion | FaceBuilderQuestion;

export type ChoiceQuestion = FaceQuestion | StoryQuestion;

export type ResultSource = LevelId | 'practice';

export type QuestionResult = {
  questionId: string;
  questionType: QuestionType;
  expectedEmotion: Emotion;
  /** The first answer the child selected. */
  selectedEmotion?: Emotion;
  /** Every incorrect answer, in order. Used for confusion analysis. */
  wrongSelections: Emotion[];
  /** Correct on the first attempt. Used for accuracy. */
  correct: boolean;
  /** Eventually answered correctly (possibly after hints). */
  solved: boolean;
  attempts: number;
  usedCoaching: boolean;
  points: number;
  responseTimeMs?: number;
  timestamp: string;
  source: ResultSource;
};

export type EmotionStat = {
  attempted: number;
  correct: number;
};

export type EmotionStats = Partial<Record<Emotion, EmotionStat>>;

export type Confusion = {
  expected: Emotion;
  selected: Emotion;
  count: number;
};

export type SessionKind = 'game' | 'practice';

export type SessionSummary = {
  id: string;
  kind: SessionKind;
  area: 'emotion-recognition';
  completedAt: string;
  questionCount: number;
  correctCount: number;
  accuracy: number;
  score: number;
  maxScore: number;
  emotionStats: EmotionStats;
  confusions: Confusion[];
  focusEmotions: Emotion[];
  badgeId?: string;
};

export type ActiveSession = {
  id: string;
  kind: SessionKind;
  startedAt: string;
  results: QuestionResult[];
  completedLevels: LevelId[];
  focusEmotions: Emotion[];
};

export type ChildProgress = {
  history: SessionSummary[];
  /** Highest level the child may open on the level map. */
  unlockedLevel: LevelId;
  lessonCompleted: boolean;
};

export type MasteryStatus = 'strong' | 'developing' | 'needs-practice' | 'not-started';

export type EmotionInsight = {
  emotion: Emotion;
  attempted: number;
  correct: number;
  accuracy: number;
  status: MasteryStatus;
};

export type ProgressInsights = {
  sessionsCompleted: number;
  overallAccuracy: number | null;
  emotions: EmotionInsight[];
  strongest: EmotionInsight | null;
  weakEmotions: Emotion[];
  confusions: Confusion[];
};

export type LessonStep =
  | { kind: 'example'; id: string; emotion: Emotion; image: EmotionImage; text: string; index: number; total: number }
  | { kind: 'story'; id: string; emotion: Emotion; question: StoryQuestion };
