import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { GameIcon, type IconName } from '@/components/world/art/Icons';
import { gameColors, gameShadow, gameType } from '@/theme';

type Size = 'sm' | 'md' | 'lg';

const HEIGHT: Record<Size, number> = { sm: 42, md: 54, lg: 64 };
const DEPTH: Record<Size, number> = { sm: 4, md: 6, lg: 7 };

export type GameButtonProps = {
  title?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  color?: string;
  edge?: string;
  textColor?: string;
  size?: Size;
  icon?: IconName;
  ionicon?: ComponentProps<typeof Ionicons>['name'];
  round?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  faceStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: { selected?: boolean; checked?: boolean };
};

/**
 * A chunky raised button. The face sits on a darker edge and sinks into it
 * while pressed, so every tap has a physical "click".
 */
export function GameButton({
  title,
  onPress,
  onLongPress,
  delayLongPress,
  color = gameColors.green,
  edge = gameColors.greenEdge,
  textColor = gameColors.white,
  size = 'md',
  icon,
  ionicon,
  round = false,
  disabled = false,
  children,
  style,
  faceStyle,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}: GameButtonProps) {
  const [press] = useState(() => new Animated.Value(0));
  const height = HEIGHT[size];
  const depth = DEPTH[size];
  const radius = round ? height / 2 : size === 'sm' ? 14 : 20;
  const face = disabled ? gameColors.locked : color;
  const base = disabled ? gameColors.lockedEdge : edge;

  const sink = (toValue: number) =>
    Animated.spring(press, { toValue, friction: 6, tension: 300, useNativeDriver: true }).start();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, ...accessibilityState }}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      onPressIn={() => sink(1)}
      onPressOut={() => sink(0)}
      hitSlop={6}
      style={[{ paddingBottom: depth }, round && { width: height }, style]}
    >
      <View style={[styles.edge, { top: depth, borderRadius: radius, backgroundColor: base }, gameShadow.soft]} />
      <Animated.View
        style={[
          styles.face,
          { minHeight: height, borderRadius: radius, backgroundColor: face },
          round && styles.round,
          round && { width: height },
          { transform: [{ translateY: press.interpolate({ inputRange: [0, 1], outputRange: [0, depth] }) }] },
          faceStyle,
        ]}
      >
        <View pointerEvents="none" style={[styles.gloss, { borderTopLeftRadius: radius, borderTopRightRadius: radius }]} />
        {icon ? <GameIcon name={icon} size={size === 'sm' ? 22 : 28} /> : null}
        {ionicon ? <Ionicons name={ionicon} size={size === 'sm' ? 20 : 26} color={textColor} /> : null}
        {title ? (
          <Text style={[gameType.button, size === 'sm' && styles.smallText, { color: textColor }, textColor === gameColors.white && styles.textShadow]}>
            {title}
          </Text>
        ) : null}
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  edge: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  face: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  round: {
    paddingHorizontal: 0,
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  smallText: {
    fontSize: 15,
  },
  textShadow: {
    textShadowColor: 'rgba(30, 20, 80, 0.25)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 0.5,
  },
});
