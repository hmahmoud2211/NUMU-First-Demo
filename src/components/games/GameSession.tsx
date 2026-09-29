import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LearningAvatar } from '@/components/avatar/LearningAvatar';
import { AppButton } from '@/components/common/AppButton';
import { ChildHeader } from '@/components/common/ChildHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useChild } from '@/context/ChildContext';
import { colors, spacing, typography } from '@/theme';
import type { Emotion } from '@/types/emotion';
import type { LearningQuestion, QuestionResult, ResultSource } from '@/types/learning';

import { GameQuestion } from './GameQuestion';

type GameSessionProps = {
  title: string;
  questions: LearningQuestion[];
  source: ResultSource;
  onBack: () => void;
  /** Called after every question so results are never lost. */
  onResults: (results: QuestionResult[]) => void;
  /** Called once with every result when the last question is done. */
  onFinished: (results: QuestionResult[]) => void;
  onCompare?: (expected: Emotion, selected: Emotion) => void;
};

/**
 * The reusable game engine: walks through any list of questions, shows
 * progress, and reports results. Levels, mixed challenges and personalised
 * practice all run through this component.
 */
export function GameSession({ title, questions, source, onBack, onResults, onFinished, onCompare }: GameSessionProps) {
  const { ageGroup } = useChild();
  const [index, setIndex] = useState(0);
  const collected = useRef<QuestionResult[]>([]);
  const question = questions[index];

  const handleComplete = (results: QuestionResult[]) => {
    collected.current = [...collected.current, ...results];
    onResults(results);
    if (index + 1 >= questions.length) {
      onFinished(collected.current);
    } else {
      setIndex(index + 1);
    }
  };

  const background = colors[ageGroup.childBackground];

  if (!question) {
    return (
      <ScreenContainer background={background} header={<ChildHeader onBack={onBack} title={title} />}>
        <View style={styles.empty}>
          <LearningAvatar message="There are no activities here yet. Let’s go back and pick another one!" mood="thinking" layout="column" />
          <AppButton title="Go back" onPress={onBack} size="child" />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      background={background}
      scrollKey={question.id}
      header={
        <ChildHeader
          onBack={onBack}
          title={title}
          progress={index / questions.length}
          progressLabel={`${index + 1} / ${questions.length}`}
        />
      }
    >
      <GameQuestion key={question.id} question={question} source={source} onComplete={handleComplete} onCompare={onCompare} />
      <Text style={[typography.caption, styles.footnote]}>Take your time. You can listen again with the speaker.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  footnote: {
    textAlign: 'center',
  },
});
