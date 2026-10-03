import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';
import Svg from 'react-native-svg';

import { KID_VIEW, KidCharacter, type Expression, type KidLook, type Pose } from '@/components/world/art/KidCharacter';
import { useLoop } from '@/hooks/useLoop';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import type { Equipment } from '@/types/world';

/** Runs `play` whenever `key` changes after the first render. */
export function useTrigger(key: unknown, play: () => void) {
  const first = useRef(true);
  const latest = useRef(play);
  useEffect(() => {
    latest.current = play;
  });
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    latest.current();
  }, [key]);
}

/** A 0 → 1 → 0 hop and a left-right wobble, each fired by changing a key. */
export function useReactions(hopKey: unknown, wobbleKey: unknown) {
  const reduceMotion = useReduceMotion();
  const [hop] = useState(() => new Animated.Value(0));
  const [wobble] = useState(() => new Animated.Value(0));

  useTrigger(hopKey, () => {
    if (reduceMotion) return;
    Animated.sequence([
      Animated.timing(hop, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(hop, { toValue: 0, friction: 4, tension: 140, useNativeDriver: true }),
    ]).start();
  });

  useTrigger(wobbleKey, () => {
    if (reduceMotion) return;
    Animated.sequence(
      [1, -1, 0.6, -0.4, 0].map((toValue) => Animated.timing(wobble, { toValue, duration: 90, useNativeDriver: true })),
    ).start();
  });

  return {
    translateY: hop.interpolate({ inputRange: [0, 1], outputRange: [0, -26] }),
    rotate: wobble.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] }),
  };
}

/** Blinks every few seconds. */
function useBlink(intervalMs = 3400) {
  const reduceMotion = useReduceMotion();
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    if (reduceMotion) return;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    const timer = setInterval(() => {
      setBlink(true);
      closeTimer = setTimeout(() => setBlink(false), 140);
    }, intervalMs + Math.round(Math.random() * 900));
    return () => {
      clearInterval(timer);
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [intervalMs, reduceMotion]);
  return blink;
}

type LivingKidProps = {
  width: number;
  look: KidLook;
  expression?: Expression;
  pose?: Pose;
  equipped?: Equipment;
  hopKey?: unknown;
  wobbleKey?: unknown;
  /** Face left instead of right. */
  flip?: boolean;
  breatheDelay?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** A character that breathes, blinks and reacts. Feet sit on the bottom edge. */
export function LivingKid({
  width,
  look,
  expression,
  pose,
  equipped,
  hopKey,
  wobbleKey,
  flip = false,
  breatheDelay = 0,
  style,
  accessibilityLabel,
}: LivingKidProps) {
  const height = (width * KID_VIEW.height) / KID_VIEW.width;
  const breathe = useLoop(1700, { delay: breatheDelay });
  const blink = useBlink();
  const { translateY, rotate } = useReactions(hopKey, wobbleKey);
  const scaleY = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });
  const scaleX = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 0.99] });

  return (
    <Animated.View
      accessible={Boolean(accessibilityLabel)}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      pointerEvents="none"
      style={[
        { width, height },
        style,
        { transformOrigin: '50% 100%', transform: [{ translateY }, { rotate }, { scaleX: flip ? -1 : 1 }, { scaleX }, { scaleY }] },
      ]}
    >
      <Svg width={width} height={height} viewBox={KID_VIEW.viewBox}>
        <KidCharacter look={look} expression={expression} pose={pose} blink={blink} equipped={equipped} />
      </Svg>
    </Animated.View>
  );
}
