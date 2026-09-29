import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '@/theme';

type SelectableCardProps = {
  title: string;
  description?: string;
  emoji?: string;
  selected?: boolean;
  disabled?: boolean;
  badge?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/** Large tappable card used for age groups, learning areas and similar choices. */
export function SelectableCard({
  title,
  description,
  emoji,
  selected = false,
  disabled = false,
  badge,
  onPress,
  style,
  children,
}: SelectableCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={[title, description, badge].filter(Boolean).join('. ')}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {emoji ? (
        <View style={[styles.emojiWrap, selected && styles.emojiSelected]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
      ) : null}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[typography.h3, styles.title]}>{title}</Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        {description ? <Text style={typography.bodySecondary}>{description}</Text> : null}
        {children}
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={26} color={colors.primary} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.card,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.9,
  },
  emojiWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiSelected: {
    backgroundColor: colors.surface,
  },
  emoji: {
    fontSize: 30,
  },
  body: {
    flex: 1,
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  title: {
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.warning,
  },
});
