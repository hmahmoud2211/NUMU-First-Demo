import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Animated, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { LearningAvatar } from '@/components/avatar/LearningAvatar';
import { AppButton } from '@/components/common/AppButton';
import { ChildHeader } from '@/components/common/ChildHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { EmotionCard } from '@/components/emotion/EmotionCard';
import { EmotionImage } from '@/components/emotion/EmotionImage';
import { SituationGame } from '@/components/games/SituationGame';
import { useChild } from '@/context/ChildContext';
import { useLearning } from '@/context/LearningContext';
import { EMOTION_LESSONS } from '@/data/emotionLessons';
import { useFadeIn } from '@/hooks/useFadeIn';
import { backInChildMode } from '@/navigation/childMode';
import { routes } from '@/navigation/routes';
import { buildLessonSteps } from '@/services/questionGenerator';
import { colors, radius, spacing, typography } from '@/theme';
import type { LessonStep } from '@/types/learning';
import { formatEmotionList } from '@/utils/emotionHelpers';

function ExampleStep({ step, onNext }: { step: Extract<LessonStep, { kind: 'example' }>; onNext: () => void }) {
  const { ageGroup } = useChild();
  const { width, height } = useWindowDimensions();
  const size = Math.min(width - 48, height * 0.36, ageGroup.imageSize === 'large' ? 300 : 250);
  const fade = useFadeIn(step.id);
  return (
    <Animated.View style={[styles.step, fade]}>
      <EmotionCard emotion={step.emotion} />
      <Text style={[typography.caption, styles.centerText]}>
        Example {step.index + 1} of {step.total}
      </Text>
      <View style={styles.center}>
        <EmotionImage image={step.image} size={size} revealEmotion highlight={EMOTION_LESSONS[step.emotion].hintPart} />
      </View>
      <View style={styles.explain}>
        <Text style={[typography.childBody, styles.flex]}>{step.text}</Text>
        <SpeakerButton text={step.text} size="lg" />
      </View>
      <AppButton title="Next" icon="arrow-forward" size="child" onPress={onNext} />
    </Animated.View>
  );
}

export default function LessonScreen() {
  const { child, ageGroup } = useChild();
  const { markLessonCompleted } = useLearning();
  const steps = useMemo(() => buildLessonSteps(ageGroup, child?.id ?? 'lesson'), [ageGroup, child?.id]);
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const finished = index >= steps.length;

  const next = () => {
    if (index + 1 >= steps.length) markLessonCompleted();
    setIndex(index + 1);
  };

  return (
    <ScreenContainer
      background={colors[ageGroup.childBackground]}
      scrollKey={step?.id ?? 'done'}
      header={
        <ChildHeader
          onBack={backInChildMode}
          title="Learning time"
          progress={Math.min(1, index / Math.max(steps.length, 1))}
          progressLabel={finished ? undefined : `${index + 1} / ${steps.length}`}
        />
      }
    >
      {finished || !step ? (
        <View style={styles.done}>
          <LearningAvatar
            message={`Great learning! You met ${formatEmotionList(ageGroup.coreEmotions.slice(0, 4), ageGroup.id)}. Now let’s play!`}
            mood="celebrating"
            layout="column"
            size={120}
          />
          <AppButton title="Go to the games" emoji="🎮" size="child" onPress={() => router.replace(routes.levels)} />
        </View>
      ) : step.kind === 'example' ? (
        <ExampleStep key={step.id} step={step} onNext={next} />
      ) : (
        <View style={styles.step}>
          <View style={styles.storyBadge}>
            <Text style={typography.label}>📖 A short story</Text>
          </View>
          {/* Lesson stories teach; their answers are not scored. */}
          <SituationGame key={step.id} question={step.question} source="practice" onComplete={next} />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  step: {
    gap: spacing.md,
  },
  explain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  storyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  done: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
});
