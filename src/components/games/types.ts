import type { Emotion } from '@/types/emotion';
import type { LearningQuestion, QuestionResult, ResultSource } from '@/types/learning';

export type GameComponentProps<Q extends LearningQuestion> = {
  question: Q;
  source: ResultSource;
  /** Called once the question is finished. Matching emits one result per pair. */
  onComplete: (results: QuestionResult[]) => void;
  /** Opens side-by-side coaching for a confused pair. */
  onCompare?: (expected: Emotion, selected: Emotion) => void;
};
