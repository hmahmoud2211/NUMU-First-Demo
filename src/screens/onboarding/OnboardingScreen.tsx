import { router } from 'expo-router';
import { useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { LearningAvatar } from '@/components/avatar/LearningAvatar';
import { AppButton } from '@/components/common/AppButton';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuth } from '@/context/AuthContext';
import { useFadeIn } from '@/hooks/useFadeIn';
import { routes } from '@/navigation/routes';
import { colors, radius, spacing, typography } from '@/theme';

const CARDS = [
  {
    emoji: '🧩',
    title: 'Learn Through Play',
    body: 'Help your child recognize emotions using images, stories and interactive games.',
  },
  {
    emoji: '🌱',
    title: 'Personalized Learning',
    body: 'NUMU adapts activities according to the emotions your child finds difficult.',
  },
  {
    emoji: '📈',
    title: 'Track Progress',
    body: 'See your child’s strengths, mistakes and improvement over time.',
  },
];

export default function OnboardingScreen() {
  const { markOnboardingSeen } = useAuth();
  const [index, setIndex] = useState(0);
  const fade = useFadeIn(index);
  const card = CARDS[index];
  const isLast = index === CARDS.length - 1;

  const finish = () => {
    markOnboardingSeen();
    router.replace(routes.auth);
  };

  return (
    <ScreenContainer
      scroll={false}
      footer={
        <>
          <AppButton title={isLast ? 'Get Started' : 'Next'} icon="arrow-forward" onPress={isLast ? finish : () => setIndex(index + 1)} />
          {!isLast ? <AppButton title="Skip" variant="ghost" size="md" onPress={finish} /> : null}
        </>
      }
    >
      <View style={styles.center}>
        <Animated.View style={[styles.card, fade]}>
          <View style={styles.illustration}>
            <Text style={styles.emoji}>{card.emoji}</Text>
          </View>
          <Text style={[typography.h1, styles.text]}>{card.title}</Text>
          <Text style={[typography.bodySecondary, styles.text]}>{card.body}</Text>
        </Animated.View>
        <View style={styles.dots} accessibilityLabel={`Step ${index + 1} of ${CARDS.length}`}>
          {CARDS.map((item, i) => (
            <View key={item.title} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        {index === 0 ? <LearningAvatar message="Hi! I’m Numi. I’ll help your child learn." mood="happy" size={72} autoSpeak={false} /> : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  card: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  illustration: {
    width: 160,
    height: 160,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 72,
  },
  text: {
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
});
