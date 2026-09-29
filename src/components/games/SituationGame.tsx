import { StoryCard } from '@/components/emotion/StoryCard';
import { useChoiceAnswer } from '@/hooks/useChoiceAnswer';
import type { StoryQuestion } from '@/types/learning';

import { ChoiceQuestionView } from './ChoiceQuestionView';
import type { GameComponentProps } from './types';

/** Level 2 (and story questions): read what happened and choose how they might feel. */
export function SituationGame({ question, source, onComplete, onCompare }: GameComponentProps<StoryQuestion>) {
  const answer = useChoiceAnswer(question, source);
  const isStory = question.type === 'story';

  return (
    <ChoiceQuestionView
      question={question}
      answer={answer}
      hint={question.hint}
      onNext={() => onComplete([answer.buildResult()])}
      onCompare={onCompare}
      stimulus={<StoryCard label={isStory ? 'Story time' : 'What happened?'} emoji={isStory ? '📖' : '💭'} text={question.story} />}
    />
  );
}
