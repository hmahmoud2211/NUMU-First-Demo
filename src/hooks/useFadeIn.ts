import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

import { useReduceMotion } from './useReduceMotion';

/** Gentle fade + rise used for calm entrances. Re-runs when `key` changes. */
export function useFadeIn(key: unknown = 0, duration = 350) {
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [key, duration, progress, reduceMotion]);

  return {
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  };
}
