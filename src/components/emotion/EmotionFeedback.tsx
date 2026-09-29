import { Animated, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { LearningAvatar } from '@/components/avatar/LearningAvatar';
import { useFadeIn } from '@/hooks/useFadeIn';
import { colors, radius, spacing, typography } from '@/theme';

export type FeedbackKind = 'correct' | 'try-again' | 'reveal';

type EmotionFeedbackProps = {
  kind: FeedbackKind;
  title: string;
  message: string;
  points?: number;
  /** Shown for mistakes: opens side-by-side coaching for the confused pair. */
  onCompare?: () => void;
  compareLabel?: string;
};

/**
 * Calm feedback panel. Correct answers celebrate; mistakes bring in the
 * avatar with a clue — never negative wording.
 */
export function EmotionFeedback({ kind, title, message, points, onCompare, compareLabel }: EmotionFeedbackProps) {
  const fade = useFadeIn(`${kind}-${message}`);
  const positive = kind === 'correct';
  return (
    <Animated.View style={[styles.panel, positive ? styles.positive : styles.gentle, fade]}>
      <View style={styles.titleRow}>
        <Text style={[typography.h2, styles.title]}>{title}</Text>
        {points ? (
          <View style={styles.points}>
            <Text style={styles.pointsText}>+{points}</Text>
          </View>
        ) : null}
      </View>
      <LearningAvatar message={message} mood={positive ? 'celebrating' : 'encouraging'} size={72} />
      {onCompare ? <AppButton title={compareLabel ?? 'See the difference'} emoji="🔍" variant="soft" size="md" onPress={onCompare} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 2,
  },
  positive: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  gentle: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flexShrink: 1,
  },
  points: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  pointsText: {
    ...typography.h3,
    color: colors.success,
  },
});
