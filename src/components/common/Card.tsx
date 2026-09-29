import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '@/theme';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'surface' | 'muted' | 'outline';
};

export function Card({ children, style, tone = 'surface' }: CardProps) {
  return <View style={[styles.base, toneStyles[tone], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
});

const toneStyles = StyleSheet.create({
  surface: { backgroundColor: colors.surface, ...shadows.card },
  muted: { backgroundColor: colors.surfaceAlt },
  outline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
