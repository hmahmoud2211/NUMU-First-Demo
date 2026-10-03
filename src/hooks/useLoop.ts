import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

import { useReduceMotion } from './useReduceMotion';

type LoopOptions = {
  /** Wait before the first cycle so neighbouring loops drift out of phase. */
  delay?: number;
  /** true: 0 → 1 → 0 (sway, bob). false: 0 → 1, then restart (drift, rise). */
  pingPong?: boolean;
  enabled?: boolean;
  easing?: (value: number) => number;
};

/**
 * A looping 0–1 driver for ambient motion. Rests at 0 when reduce motion is on,
 * so every animation built on it is skipped automatically.
 */
export function useLoop(duration: number, { delay = 0, pingPong = true, enabled = true, easing }: LoopOptions = {}) {
  const reduceMotion = useReduceMotion();
  const [value] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion || !enabled) {
      value.setValue(0);
      return;
    }
    const ease = easing ?? (pingPong ? Easing.inOut(Easing.sin) : Easing.linear);
    const cycle = pingPong
      ? Animated.sequence([
          Animated.timing(value, { toValue: 1, duration, easing: ease, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration, easing: ease, useNativeDriver: true }),
        ])
      : Animated.timing(value, { toValue: 1, duration, easing: ease, useNativeDriver: true });
    const animation = Animated.sequence([Animated.delay(delay), Animated.loop(cycle)]);
    animation.start();
    return () => animation.stop();
  }, [value, duration, delay, pingPong, enabled, easing, reduceMotion]);

  return value;
}
