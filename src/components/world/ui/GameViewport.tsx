import type { ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { gameColors } from '@/theme';

/**
 * Keeps the portrait game stage phone-shaped on wide screens (tablets in
 * landscape, desktop web) and fills the screen everywhere else.
 */
export function GameViewport({ children, backdrop = gameColors.stageBackdrop }: { children: ReactNode; backdrop?: string }) {
  const { width, height } = useWindowDimensions();
  const stageWidth = width / height > 0.8 ? Math.min(width, Math.max(420, Math.round(height * 0.62))) : width;
  return (
    <View style={[styles.backdrop, { backgroundColor: backdrop }]}>
      <View style={[styles.stage, { width: stageWidth }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
  },
  stage: {
    flex: 1,
    overflow: 'hidden',
  },
});
