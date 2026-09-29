import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useChild } from '@/context/ChildContext';
import { colors, emotionColors, radius, spacing, touchTarget, typography } from '@/theme';
import type { Emotion } from '@/types/emotion';
import { getEmotionEmoji, getEmotionLabel } from '@/utils/emotionHelpers';

export type OptionState = 'idle' | 'correct' | 'tried' | 'disabled' | 'selected';

type EmotionOptionProps = {
  emotion: Emotion;
  state?: OptionState;
  onPress: (emotion: Emotion) => void;
  compact?: boolean;
};

/**
 * Answer button for an emotion. Incorrect choices become "tried" (muted),
 * never red — feedback stays calm.
 */
export function EmotionOption({ emotion, state = 'idle', onPress, compact = false }: EmotionOptionProps) {
  const { ageGroup } = useChild();
  const palette = emotionColors[emotion];
  const label = getEmotionLabel(emotion, ageGroup.id);
  const interactive = state === 'idle' || state === 'selected';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !interactive, selected: state === 'selected' || state === 'correct' }}
      disabled={!interactive}
      onPress={() => onPress(emotion)}
      style={({ pressed }) => [
        styles.option,
        compact && styles.compact,
        { borderColor: palette.main, backgroundColor: palette.soft },
        state === 'selected' && { backgroundColor: palette.main },
        state === 'correct' && styles.correct,
        state === 'tried' && styles.tried,
        state === 'disabled' && styles.disabled,
        pressed && interactive && styles.pressed,
      ]}
    >
      {ageGroup.showEmoji ? <Text style={compact ? styles.compactEmoji : styles.emoji}>{getEmotionEmoji(emotion)}</Text> : null}
      <Text
        style={[typography.childOption, compact && styles.compactText, state === 'tried' && styles.triedText]}
        numberOfLines={compact ? 2 : 1}
      >
        {label}
      </Text>
      <View style={styles.trailing}>
        {state === 'correct' ? <Ionicons name="checkmark-circle" size={26} color={colors.success} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    minHeight: touchTarget.child,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2.5,
  },
  compact: {
    minHeight: touchTarget.min + 8,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  compactText: {
    fontSize: 16,
    flexShrink: 1,
  },
  emoji: {
    fontSize: 28,
  },
  compactEmoji: {
    fontSize: 22,
  },
  trailing: {
    marginLeft: 'auto',
  },
  correct: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
    borderWidth: 3,
  },
  tried: {
    borderColor: colors.tried,
    backgroundColor: colors.surfaceAlt,
    opacity: 0.7,
  },
  triedText: {
    color: colors.textMuted,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
