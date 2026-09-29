import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, touchTarget, typography } from '@/theme';

import { ProgressBar } from './ProgressBar';

type ChildHeaderProps = {
  onBack: () => void;
  /** "exit" leaves child mode; "back" returns to the previous child screen. */
  backType?: 'exit' | 'back';
  title?: string;
  /** 0–1. Hidden when undefined. */
  progress?: number;
  progressLabel?: string;
};

/** Minimal, predictable header for child mode: one back/exit button and progress. */
export function ChildHeader({ onBack, backType = 'back', title, progress, progressLabel }: ChildHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backType === 'exit' ? 'Exit to parent' : 'Go back'}
        onPress={onBack}
        hitSlop={8}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Ionicons name={backType === 'exit' ? 'close' : 'arrow-back'} size={26} color={colors.textSecondary} />
      </Pressable>
      <View style={styles.center}>
        {title ? (
          <Text style={[typography.h3, styles.title]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {progress !== undefined ? <ProgressBar value={progress} color={colors.secondary} height={12} /> : null}
      </View>
      <View style={styles.side}>
        {progressLabel ? <Text style={styles.progressLabel}>{progressLabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  back: {
    width: touchTarget.min,
    height: touchTarget.min,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  center: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    textAlign: 'center',
  },
  side: {
    minWidth: touchTarget.min,
    alignItems: 'flex-end',
  },
  progressLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
});
