import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { EmotionFeedback } from '@/components/emotion/EmotionFeedback';
import { EmotionOption } from '@/components/emotion/EmotionOption';
import { useChild } from '@/context/ChildContext';
import { AVATAR_PHRASES, pickPhrase } from '@/data/coaching';
import type { useChoiceAnswer } from '@/hooks/useChoiceAnswer';
import { spacing, typography } from '@/theme';
import type { Emotion } from '@/types/emotion';
import type { ChoiceQuestion } from '@/types/learning';
import { getEmotionLabel } from '@/utils/emotionHelpers';
import { hashString } from '@/utils/random';

type ChoiceQuestionViewProps = {
  question: ChoiceQuestion;
  answer: ReturnType<typeof useChoiceAnswer>;
  stimulus: ReactNode;
  /** Clue shown after a mistake (never names the answer). */
  hint: string;
  onNext: () => void;
  onCompare?: (expected: Emotion, selected: Emotion) => void;
};

/** Shared layout for single-answer questions: prompt, stimulus, options, feedback. */
export function ChoiceQuestionView({ question, answer, stimulus, hint, onNext, onCompare }: ChoiceQuestionViewProps) {
  const { ageGroup } = useChild();
  const seed = hashString(question.id);
  const label = getEmotionLabel(question.targetEmotion, ageGroup.id);
  const twoColumns = ageGroup.id !== 'early' && question.options.length > 2;

  const handleCompare =
    onCompare && answer.lastWrong
      ? () => {
          answer.markCoaching();
          onCompare(question.targetEmotion, answer.lastWrong as Emotion);
        }
      : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.promptRow}>
        <Text style={[typography.childTitle, styles.prompt]} accessibilityRole="header">
          {question.prompt}
        </Text>
        <SpeakerButton text={question.prompt} />
      </View>

      {stimulus}

      <View style={[styles.options, twoColumns && styles.grid]}>
        {question.options.map((emotion) => (
          <View key={emotion} style={twoColumns ? styles.gridItem : undefined}>
            <EmotionOption
              emotion={emotion}
              state={answer.optionState(emotion)}
              onPress={answer.submit}
              compact={twoColumns}
            />
          </View>
        ))}
      </View>

      {answer.status === 'solved' ? (
        <EmotionFeedback
          kind="correct"
          title={pickPhrase(AVATAR_PHRASES.correct, seed)}
          message={question.explanation}
          points={answer.points}
        />
      ) : null}
      {answer.status === 'retry' ? (
        <EmotionFeedback
          kind="try-again"
          title={pickPhrase(AVATAR_PHRASES.tryAgain, seed + answer.wrong.length)}
          message={answer.lastWrong ? `You chose ${getEmotionLabel(answer.lastWrong, ageGroup.id)}. ${hint}` : hint}
          onCompare={handleCompare}
          compareLabel={answer.lastWrong ? `How is ${getEmotionLabel(answer.lastWrong, ageGroup.id)} different?` : undefined}
        />
      ) : null}
      {answer.status === 'revealed' ? (
        <EmotionFeedback
          kind="reveal"
          title={pickPhrase(AVATAR_PHRASES.reveal, seed)}
          message={`This one is ${label}. ${question.explanation}`}
        />
      ) : null}

      {answer.done ? <AppButton title="Next" icon="arrow-forward" size="child" onPress={onNext} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  prompt: {
    flex: 1,
    fontSize: 24,
    textAlign: 'left',
  },
  options: {
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    flexBasis: '48%',
    flexGrow: 1,
  },
});
