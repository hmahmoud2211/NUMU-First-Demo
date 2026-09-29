import { router } from 'expo-router';
import { useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { LearningAvatar } from '@/components/avatar/LearningAvatar';
import { AppButton } from '@/components/common/AppButton';
import { ChildHeader } from '@/components/common/ChildHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { EmotionCard } from '@/components/emotion/EmotionCard';
import { FaceIllustration } from '@/components/face/FaceIllustration';
import { pickAgeText } from '@/config/ageGroups';
import { useChild } from '@/context/ChildContext';
import { getCanonicalFace } from '@/data/emotionFaceConfigurations';
import { EMOTION_LESSONS, INTRO_MESSAGE } from '@/data/emotionLessons';
import { useFadeIn } from '@/hooks/useFadeIn';
import { exitChildMode } from '@/navigation/childMode';
import { routes } from '@/navigation/routes';
import { colors, emotionColors, radius, spacing, typography } from '@/theme';

export default function LearningIntroScreen() {
  const { child, ageGroup } = useChild();
  const emotions = ageGroup.coreEmotions;
  const [index, setIndex] = useState(0);
  const fade = useFadeIn(index);
  const emotion = emotions[index] ?? 'happy';
  const introText = pickAgeText(EMOTION_LESSONS[emotion].intro, ageGroup.id);

  return (
    <ScreenContainer
      background={colors[ageGroup.childBackground]}
      header={<ChildHeader onBack={exitChildMode} backType="exit" progress={(index + 1) / emotions.length} />}
      footer={
        <>
          <AppButton title="Start Learning" emoji="🌱" size="child" onPress={() => router.push(routes.lesson)} />
          <AppButton title="Go to the games" variant="ghost" size="md" onPress={() => router.push(routes.levels)} />
        </>
      }
    >
      <Text style={typography.childTitle} accessibilityRole="header">
        {ageGroup.id === 'teen' ? 'Reading Emotions' : 'Let’s Learn Emotions!'}
      </Text>
      <LearningAvatar
        message={`${child ? `Hi ${child.name}! ` : ''}${pickAgeText(INTRO_MESSAGE, ageGroup.id)}`}
        mood="happy"
        size={80}
      />

      <Animated.View style={[styles.card, { borderColor: emotionColors[emotion].main }, fade]}>
        <View style={[styles.face, { backgroundColor: emotionColors[emotion].soft }]}>
          <FaceIllustration parts={getCanonicalFace(emotion)} variant={index} size={170} />
        </View>
        <EmotionCard emotion={emotion} style={styles.label} />
        <View style={styles.textRow}>
          <Text style={[typography.childBody, styles.flex]}>{introText}</Text>
          <SpeakerButton text={introText} />
        </View>
      </Animated.View>

      <View style={styles.nav}>
        <AppButton
          title="Back"
          icon="chevron-back"
          variant="soft"
          size="md"
          disabled={index === 0}
          onPress={() => setIndex(index - 1)}
          style={styles.flex}
        />
        <AppButton
          title="Next feeling"
          icon="chevron-forward"
          variant="soft"
          size="md"
          disabled={index === emotions.length - 1}
          onPress={() => setIndex(index + 1)}
          style={styles.flex}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 2,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  face: {
    borderRadius: radius.xl,
    padding: spacing.xs,
  },
  label: {
    alignSelf: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  nav: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
