import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

type ScreenContainerProps = {
  children: ReactNode;
  scroll?: boolean;
  background?: string;
  /** Content pinned below the scroll area (e.g. primary actions). */
  footer?: ReactNode;
  /** Content pinned above the scroll area (e.g. child-mode header). */
  header?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  keyboardAware?: boolean;
  /** Changing this resets the scroll position (e.g. when the question changes). */
  scrollKey?: string | number;
};

const MAX_CONTENT_WIDTH = 640;

export function ScreenContainer({
  children,
  scroll = true,
  background = colors.background,
  footer,
  header,
  contentStyle,
  edges = ['top', 'bottom', 'left', 'right'],
  keyboardAware = false,
  scrollKey,
}: ScreenContainerProps) {
  const body = scroll ? (
    <ScrollView
      key={scrollKey}
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
  );

  const inner = (
    <>
      {header ? <View style={styles.header}>{header}</View> : null}
      {body}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: background }]}>
      {keyboardAware ? (
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  header: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  footer: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
});
