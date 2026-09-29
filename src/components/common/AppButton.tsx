import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing, touchTarget, typography } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost';
type Size = 'md' | 'lg' | 'child';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  emoji?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

const VARIANT_STYLES: Record<Variant, { background: string; text: string; border: string }> = {
  primary: { background: colors.primary, text: colors.textOnPrimary, border: colors.primary },
  secondary: { background: colors.surface, text: colors.primary, border: colors.primary },
  soft: { background: colors.primarySoft, text: colors.primaryDark, border: colors.primarySoft },
  ghost: { background: 'transparent', text: colors.textSecondary, border: 'transparent' },
};

const SIZE_HEIGHT: Record<Size, number> = { md: touchTarget.min, lg: 56, child: touchTarget.child };

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  emoji,
  disabled = false,
  loading = false,
  style,
  accessibilityHint,
}: AppButtonProps) {
  const palette = VARIANT_STYLES[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: SIZE_HEIGHT[size],
          backgroundColor: palette.background,
          borderColor: palette.border,
          opacity: inactive ? 0.5 : pressed ? 0.85 : 1,
        },
        size === 'child' && styles.child,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <View style={styles.content}>
          {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
          {icon ? <Ionicons name={icon} size={size === 'child' ? 24 : 20} color={palette.text} /> : null}
          <Text style={[typography.button, size === 'child' && styles.childText, { color: palette.text }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  child: {
    borderRadius: radius.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  emoji: {
    fontSize: 22,
  },
  childText: {
    fontSize: 20,
  },
});
