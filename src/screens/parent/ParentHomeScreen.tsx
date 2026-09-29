import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LearningAvatar } from '@/components/avatar/LearningAvatar';
import { AppButton } from '@/components/common/AppButton';
import { Card } from '@/components/common/Card';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuth } from '@/context/AuthContext';
import { useChild } from '@/context/ChildContext';
import { useLearning } from '@/context/LearningContext';
import { getChildAvatar } from '@/data/childAvatars';
import { getLearningArea } from '@/data/learningAreas';
import { routes } from '@/navigation/routes';
import { colors, radius, spacing, typography } from '@/theme';
import { formatEmotionList, getEmotionEmoji } from '@/utils/emotionHelpers';
import { toPercent } from '@/utils/scoring';

export default function ParentHomeScreen() {
  const { parent, signOutAndReset } = useAuth();
  const { child, ageGroup, isReady } = useChild();
  const { insights } = useLearning();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!parent) return <Redirect href={routes.auth} />;
  if (isReady && !child) return <Redirect href={routes.childProfile} />;
  if (!child) return null;

  const area = getLearningArea(child.learningArea ?? 'emotion-recognition');
  const focus = insights.weakEmotions;
  const recommended = focus.length > 0 ? focus : ageGroup.coreEmotions;

  const reset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    await signOutAndReset();
    router.replace(routes.splash);
  };

  return (
    <ScreenContainer>
      <View>
        <Text style={typography.bodySecondary}>Hello,</Text>
        <Text style={typography.h1}>{parent.name} 👋</Text>
      </View>

      <Card style={styles.childCard}>
        <View style={styles.childAvatar}>
          <Text style={styles.childEmoji}>{getChildAvatar(child.avatarId).emoji}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={typography.h2}>{child.name}</Text>
          <Text style={typography.bodySecondary}>
            Age: {child.age} · {ageGroup.rangeLabel}
          </Text>
        </View>
        <AppButton title="Edit" variant="ghost" size="md" onPress={() => router.push(routes.childProfile)} />
      </Card>

      <Card style={styles.today}>
        <Text style={[typography.label, styles.overline]}>TODAY’S LEARNING</Text>
        <Text style={typography.h2}>
          {area?.emoji} {area?.title ?? 'Emotion Recognition'}
        </Text>
        <View style={styles.recommendation}>
          <Text style={typography.label}>{focus.length > 0 ? 'Recommended practice' : 'Starting with'}</Text>
          <Text style={typography.h3}>
            {recommended.map((emotion) => getEmotionEmoji(emotion)).join(' ')} {formatEmotionList(recommended)}
          </Text>
          {focus.length > 0 ? (
            <Text style={typography.caption}>Chosen by NUMU from {child.name}’s recent answers.</Text>
          ) : null}
        </View>
        <AppButton title="Start Today’s Session" icon="play" onPress={() => router.push(routes.learningIntro)} />
      </Card>

      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Text style={typography.caption}>Sessions</Text>
          <Text style={typography.h1}>{insights.sessionsCompleted}</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={typography.caption}>Overall accuracy</Text>
          <Text style={typography.h1}>{insights.overallAccuracy === null ? '—' : `${toPercent(insights.overallAccuracy)}%`}</Text>
        </Card>
      </View>

      <AppButton title="View Progress" icon="stats-chart" variant="secondary" onPress={() => router.push(routes.dashboard)} />
      <AppButton title="Learning Activities" icon="grid" variant="soft" onPress={() => router.push(routes.learningArea)} />

      <LearningAvatar
        message="Short, calm sessions work best. Sit with your child for the first few activities."
        mood="happy"
        size={64}
        autoSpeak={false}
      />

      <View style={styles.footer}>
        <Text style={[typography.caption, styles.center]}>
          NUMU is an educational learning-support tool. It does not diagnose or treat any condition.
        </Text>
        <AppButton
          title={confirmReset ? 'Tap again to sign out & reset' : 'Sign out & reset demo'}
          variant="ghost"
          size="md"
          icon="log-out-outline"
          onPress={reset}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  childAvatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childEmoji: {
    fontSize: 36,
  },
  today: {
    gap: spacing.sm,
  },
  overline: {
    color: colors.primary,
    letterSpacing: 1,
  },
  recommendation: {
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xxs,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    gap: spacing.xxs,
  },
  footer: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  center: {
    textAlign: 'center',
  },
});
