import type { TextStyle } from 'react-native';

import { colors } from './colors';

export const typography = {
  display: { fontSize: 34, fontWeight: '800', letterSpacing: 1, color: colors.textPrimary },
  h1: { fontSize: 26, fontWeight: '800', color: colors.textPrimary },
  h2: { fontSize: 21, fontWeight: '700', color: colors.textPrimary },
  h3: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  body: { fontSize: 16, lineHeight: 23, color: colors.textPrimary },
  bodySecondary: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  caption: { fontSize: 13, lineHeight: 18, color: colors.textMuted },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  button: { fontSize: 17, fontWeight: '700' },
  // Child mode: larger and highly readable
  childTitle: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  childBody: { fontSize: 20, lineHeight: 28, fontWeight: '600', color: colors.textPrimary },
  childOption: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
} satisfies Record<string, TextStyle>;
