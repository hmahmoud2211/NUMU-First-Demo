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
import { BAND_SETTINGS } from '@/data/reasoningCheck';
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

      <Card style={styles.world}>
        <View style={styles.worldHeader}>
          <Text style={styles.worldEmoji}>🏰</Text>
          <View style={styles.flex}>
            <Text style={[typography.label, styles.overline]}>LEARNING IN NUMU WORLD</Text>
            <Text style={typography.h2}>
              {area?.emoji} {area?.title ?? 'Emotion Recognition'}
            </Text>
          </View>
        </View>
        <Text style={typography.bodySecondary}>
          {child.name} learns while exploring the town. If {child.name} picks the wrong feeling, NUMU stops and teaches the
          difference right there — then lets {child.name} try again.
        </Text>
        <View style={styles.recommendation}>
          <Text style={typography.label}>{focus.length > 0 ? 'NUMU is focusing on' : 'Starting with'}</Text>
          <Text style={typography.h3}>
            {recommended.map((emotion) => getEmotionEmoji(emotion)).join(' ')} {formatEmotionList(recommended)}
          </Text>
          {focus.length > 0 ? (
            <Text style={typography.caption}>Chosen from {child.name}’s recent answers in the House of Feelings.</Text>
          ) : null}
        </View>
      </Card>
      <AppButton title={`Enter NUMU World with ${child.name}`} emoji="🌍" size="child" onPress={() => router.push(routes.world)} />

      <View style={styles.stats}>
        <Card style={styles.stat}>
          <Text style={typography.caption}>Learning visits</Text>
          <Text style={typography.h1}>{insights.sessionsCompleted}</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={typography.caption}>Overall accuracy</Text>
          <Text style={typography.h1}>{insights.overallAccuracy === null ? '—' : `${toPercent(insights.overallAccuracy)}%`}</Text>
        </Card>
      </View>

      {child.reasoningCheck ? (
        <Card style={[styles.reasoningCard, child.reasoningCheck.band === 'support' && styles.supportCard]}>
          <View style={styles.reasoningHeader}>
            <Text style={styles.reasoningEmoji}>🧩</Text>
            <View style={styles.flex}>
              <Text style={typography.h3}>Pre-World Reasoning Check</Text>
              <Text style={typography.bodySecondary}>
                Pace: {BAND_SETTINGS[child.reasoningCheck.band]?.label ?? 'Standard'} · {child.reasoningCheck.correct}/{child.reasoningCheck.total} solved
              </Text>
            </View>
          </View>
          {child.reasoningCheck.band === 'support' ? (
            <View style={styles.advisoryBox}>
              <Text style={[typography.label, styles.advisoryTitle]}>Note for Parents</Text>
              <Text style={typography.bodySecondary}>
                {child.name}’s reasoning check indicates that our gentlest pace is most suitable. NUMU has simplified in-world choices. If you would like a formal evaluation of {child.name}’s developmental milestones, we advise consulting a pediatrician or child development specialist.
              </Text>
            </View>
          ) : (
            <Text style={typography.caption}>
              NUMU adapted {child.name}’s learning environment to match their reasoning strengths.
            </Text>
          )}
        </Card>
      ) : null}

      <AppButton title="View Progress" icon="stats-chart" variant="secondary" onPress={() => router.push(routes.dashboard)} />
      <AppButton title="Learning Area" icon="grid" variant="soft" onPress={() => router.push(routes.learningArea)} />

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
  world: {
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
  },
  worldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  worldEmoji: {
    fontSize: 40,
  },
  overline: {
    color: colors.primary,
    letterSpacing: 1,
  },
  recommendation: {
    backgroundColor: colors.surface,
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
  reasoningCard: {
    gap: spacing.sm,
    borderColor: colors.border,
  },
  supportCard: {
    borderColor: colors.warning,
    borderWidth: 1.5,
    backgroundColor: colors.warningSoft,
  },
  reasoningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  reasoningEmoji: {
    fontSize: 32,
  },
  advisoryBox: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xxs,
  },
  advisoryTitle: {
    color: colors.warning,
    fontWeight: '700',
  },
  footer: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  center: {
    textAlign: 'center',
  },
});
