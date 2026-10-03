import { useEffect, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { GameIcon } from '@/components/world/art/Icons';
import { useTrigger } from '@/components/world/motion/LivingKid';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { gameColors, gameShadow, gameType } from '@/theme';
import { lighten } from '@/utils/color';

/** A raised, rounded panel with a coloured lip along the bottom. */
export function GameCard({
  children,
  style,
  tint = gameColors.card,
  edge = gameColors.cardEdge,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tint?: string;
  edge?: string;
}) {
  return <View style={[styles.card, { backgroundColor: tint, borderBottomColor: edge }, gameShadow.lifted, style]}>{children}</View>;
}

/** Star or coin counter that pops whenever the value changes. */
export function CurrencyPill({
  kind,
  value,
  suffix,
  compact = false,
}: {
  kind: 'star' | 'coin';
  value: number;
  suffix?: string;
  compact?: boolean;
}) {
  const reduceMotion = useReduceMotion();
  const [pop] = useState(() => new Animated.Value(0));
  useTrigger(value, () => {
    if (reduceMotion) return;
    pop.setValue(1);
    Animated.spring(pop, { toValue: 0, friction: 4, tension: 120, useNativeDriver: true }).start();
  });
  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  return (
    <View
      accessible
      accessibilityLabel={`${value}${suffix ?? ''} ${kind === 'star' ? 'stars' : 'coins'}`}
      style={[styles.pill, compact && styles.pillCompact, gameShadow.soft]}
    >
      <Animated.View style={[styles.pillIcon, { transform: [{ scale }] }]}>
        <GameIcon name={kind} size={compact ? 24 : 30} />
      </Animated.View>
      <Text style={[gameType.number, compact && styles.compactNumber]}>
        {value}
        {suffix ? <Text style={gameType.label}>{suffix}</Text> : null}
      </Text>
    </View>
  );
}

/** Rounded progress bar with a glossy fill that eases to its new value. */
export function GameProgressBar({
  value,
  color,
  height = 14,
  track = gameColors.track,
  style,
  accessibilityLabel,
}: {
  value: number;
  color: string;
  height?: number;
  track?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const clamped = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  const reduceMotion = useReduceMotion();
  const [width] = useState(() => new Animated.Value(clamped));
  useEffect(() => {
    if (reduceMotion) {
      width.setValue(clamped);
      return;
    }
    Animated.timing(width, { toValue: clamped, duration: 700, useNativeDriver: false }).start();
  }, [clamped, reduceMotion, width]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { height, borderRadius: height / 2, backgroundColor: track }, style]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            borderRadius: height / 2,
            backgroundColor: color,
            width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          },
        ]}
      >
        <View style={[styles.fillGloss, { borderRadius: height / 2, backgroundColor: lighten(color, 0.45) }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    borderBottomWidth: 6,
    padding: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 4,
    paddingRight: 12,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 3,
    borderBottomColor: gameColors.cardEdge,
  },
  pillCompact: {
    height: 32,
    paddingRight: 10,
  },
  pillIcon: {
    marginLeft: -2,
  },
  compactNumber: {
    fontSize: 14,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
    boxShadow: 'inset 0px 2px 3px rgba(43, 29, 107, 0.15)',
  },
  fill: {
    height: '100%',
    overflow: 'hidden',
  },
  fillGloss: {
    position: 'absolute',
    top: 2,
    left: 4,
    right: 4,
    height: '35%',
    opacity: 0.6,
  },
});
