import type { LearningQuestion } from '@/types/learning';

import { EmotionMatchingGame } from './EmotionMatchingGame';
import { FaceBuilder } from './FaceBuilder';
import { FaceRecognitionGame } from './FaceRecognitionGame';
import { SituationGame } from './SituationGame';
import type { GameComponentProps } from './types';

/** Renders any learning question. The question data decides which game appears. */
export function GameQuestion({ question, ...rest }: GameComponentProps<LearningQuestion>) {
  switch (question.type) {
    case 'face':
      return <FaceRecognitionGame question={question} {...rest} />;
    case 'story':
    case 'situation':
      return <SituationGame question={question} {...rest} />;
    case 'matching':
      return <EmotionMatchingGame question={question} {...rest} />;
    case 'face-builder':
      return <FaceBuilder question={question} {...rest} />;
  }
}
