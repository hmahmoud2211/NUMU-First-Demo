import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useChild } from '@/context/ChildContext';
import { emotionColors, radius, spacing, typography } from '@/theme';
import type { Emotion } from '@/types/emotion';
import { getEmotionEmoji, getEmotionLabel } from '@/utils/emotionHelpers';

type EmotionCardProps = {
  emotion: Emotion;
  description?: string;
  size?: 'sm' | 'lg';
  style?: StyleProp<ViewStyle>;
};

/** Emoji + label chip/card in the emotion's colour. */
export function EmotionCard({ emotion, description, size = 'sm', style }: EmotionCardProps) {
  const { ageGroup } = useChild();
  const palette = emotionColors[emotion];
  const large = size === 'lg';
  return (
    <View style={[styles.card, large && styles.large, { backgroundColor: palette.soft, borderColor: palette.main }, style]}>
      <View style={styles.titleRow}>
        {ageGroup.showEmoji || large ? <Text style={large ? styles.emojiLarge : styles.emoji}>{getEmotionEmoji(emotion)}</Text> : null}
        <Text style={[large ? typography.h1 : typography.h3, styles.label]}>{getEmotionLabel(emotion, ageGroup.id).toUpperCase()}</Text>
      </View>
      {description ? <Text style={[typography.childBody, styles.description]}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  large: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  emoji: {
    fontSize: 24,
  },
  emojiLarge: {
    fontSize: 44,
  },
  label: {
    letterSpacing: 1,
  },
  description: {
    textAlign: 'center',
  },
});
