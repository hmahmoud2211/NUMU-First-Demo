import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, touchTarget, typography } from '@/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  helper?: string;
};

export function TextField({ label, helper, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={typography.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...inputProps}
      />
      {helper ? <Text style={typography.caption}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xxs + 2,
  },
  input: {
    minHeight: touchTarget.min + 4,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
