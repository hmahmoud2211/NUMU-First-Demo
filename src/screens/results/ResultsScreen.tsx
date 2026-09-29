import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { LearningAvatar } from '@/components/avatar/LearningAvatar';
import { AppButton } from '@/components/common/AppButton';
import { Card } from '@/components/common/Card';
import { ChildHeader } from '@/components/common/ChildHeader';
import { ProgressBar } from '@/components/common/ProgressBar';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { StarRating } from '@/components/common/StarRating';
import { useChild } from '@/context/ChildContext';
import { useLearning } from '@/context/LearningContext';
import { BADGES, type BadgeId } from '@/data/badges';
import { exitChildMode, openParentDashboard } from '@/navigation/childMode';
import { routes } from '@/navigation/routes';
import { colors, radius, spacing, typography } from '@/theme';
import { formatEmotionList } from '@/utils/emotionHelpers';
import { starsForAccuracy, toPercent } from '@/utils/scoring';

export default function ResultsScreen() {
  const { ageGroup } = useChild();
  const { lastSummary } = useLearning();
  const background = colors[ageGroup.childBackground];

  if (!lastSummary) {
    return (
      <ScreenContainer background={background} header={<ChildHeader onBack={exitChildMode} backType="exit" />}>
        <LearningAvatar message="Play a level first, then your stars will appear here!" mood="thinking" layout="column" />
        <AppButton title="Go to the games" size="child" onPress={() => router.replace(routes.levels)} />
      </ScreenContainer>
    );
  }

  const { accuracy, correctCount, questionCount, score, maxScore, focusEmotions } = lastSummary;
  const badge = BADGES[(lastSummary.badgeId as BadgeId) ?? 'emotion-explorer'] ?? BADGES['emotion-explorer'];
  const focusLabel = formatEmotionList(focusEmotions, ageGroup.id);
  const title = accuracy >= 0.85 ? 'Amazing Work!' : accuracy >= 0.6 ? 'Great Job!' : 'Well Done for Trying!';

  return (
    <ScreenContainer
      background={background}
      header={<ChildHeader onBack={exitChildMode} backType="exit" title="Your results" />}
      footer={
        <>
          <AppButton
            title={focusEmotions.length > 0 ? `Practice ${focusLabel}` : 'Practice Again'}
            emoji="🎯"
            size="child"
            onPress={() => router.replace(routes.practice(focusEmotions, 'personalized'))}
          />
          <View style={styles.row}>
            <AppButton title="Continue" icon="map" variant="secondary" size="md" style={styles.flex} onPress={() => router.replace(routes.levels)} />
            <AppButton title="Show Parent" icon="people" variant="secondary" size="md" style={styles.flex} onPress={openParentDashboard} />
          </View>
        </>
      }
    >
      <Text style={typography.childTitle}>{title}</Text>
      <StarRating stars={starsForAccuracy(accuracy)} size={48} />

      <Card style={styles.scoreCard}>
        <Text style={[typography.display, styles.center]}>
          {correctCount} / {questionCount}
        </Text>
        <Text style={[typography.bodySecondary, styles.center]}>correct on the first try</Text>
        <ProgressBar value={accuracy} color={colors.success} height={14} accessibilityLabel="Correct answers" />
        <Text style={[typography.label, styles.center]}>
          {toPercent(accuracy)}% · {score} of {maxScore} points
        </Text>
      </Card>

      <Card style={styles.badge}>
        <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
        <View style={styles.flex}>
          <Text style={typography.label}>NEW BADGE</Text>
          <Text style={typography.h2}>{badge.title}</Text>
          <Text style={typography.bodySecondary}>{badge.description}</Text>
        </View>
      </Card>

      <LearningAvatar
        message={
          focusEmotions.length > 0
            ? `${focusLabel} ${focusEmotions.length > 1 ? 'were' : 'was'} a little tricky today. Let’s practice ${focusEmotions.length > 1 ? 'them' : 'it'} again!`
            : 'You recognised every feeling. Fantastic!'
        }
        mood={focusEmotions.length > 0 ? 'encouraging' : 'celebrating'}
        size={80}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scoreCard: {
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.xl,
  },
  badgeEmoji: {
    fontSize: 48,
  },
});
