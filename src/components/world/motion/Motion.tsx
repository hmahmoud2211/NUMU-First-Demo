/**
 * Ambient motion wrappers built on native-driver loops. All of them hold still
 * when the system "reduce motion" setting is on (see useLoop).
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';

import { useLoop } from '@/hooks/useLoop';
import { useReduceMotion } from '@/hooks/useReduceMotion';

type MotionProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  duration?: number;
  delay?: number;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
};

/** Rocks gently around the bottom edge, like a tree in a breeze. */
export function Sway({ children, style, duration = 3200, delay = 0, degrees = 2, pointerEvents }: MotionProps & { degrees?: number }) {
  const t = useLoop(duration, { delay });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: [`${-degrees}deg`, `${degrees}deg`] });
  return (
    <Animated.View pointerEvents={pointerEvents} style={[style, { transformOrigin: '50% 100%', transform: [{ rotate }] }]}>
      {children}
    </Animated.View>
  );
}

/** Floats up and down. */
export function Bob({ children, style, duration = 1600, delay = 0, distance = 6, pointerEvents }: MotionProps & { distance?: number }) {
  const t = useLoop(duration, { delay });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] });
  return (
    <Animated.View pointerEvents={pointerEvents} style={[style, { transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

/** Pulses in size and brightness, for sparkles. */
export function Twinkle({ children, style, duration = 1200, delay = 0, pointerEvents }: MotionProps) {
  const t = useLoop(duration, { delay });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.1] });
  const opacity = t.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
  return (
    <Animated.View pointerEvents={pointerEvents} style={[style, { opacity, transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
}

/** Rises and fades out on repeat, like bubbles or chimney smoke. */
export function Rise({ children, style, duration = 3000, delay = 0, distance = 40, pointerEvents }: MotionProps & { distance?: number }) {
  const t = useLoop(duration, { delay, pingPong: false, easing: Easing.out(Easing.quad) });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] });
  const opacity = t.interpolate({ inputRange: [0, 0.2, 0.7, 1], outputRange: [0, 0.9, 0.6, 0] });
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.3] });
  return (
    <Animated.View pointerEvents={pointerEvents} style={[style, { opacity, transform: [{ translateY }, { scale }] }]}>
      {children}
    </Animated.View>
  );
}

/**
 * Slides across from `from` to `to` (px) forever, starting part-way through
 * (`phase` 0–1) so several drifters are spread out from the first frame.
 */
export function Drift({
  children,
  style,
  duration = 60000,
  from,
  to,
  phase = 0,
  pointerEvents,
}: MotionProps & { from: number; to: number; phase?: number }) {
  const reduceMotion = useReduceMotion();
  const [t] = useState(() => new Animated.Value(phase));

  useEffect(() => {
    if (reduceMotion) return;
    const first = Animated.timing(t, { toValue: 1, duration: duration * (1 - phase), easing: Easing.linear, useNativeDriver: true });
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(t, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
      ]),
    );
    const animation = Animated.sequence([first, loop]);
    animation.start();
    return () => animation.stop();
  }, [t, duration, phase, reduceMotion]);

  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
  return (
    <Animated.View pointerEvents={pointerEvents} style={[style, { transform: [{ translateX }] }]}>
      {children}
    </Animated.View>
  );
}

/** Springs in from small when it first appears. */
export function PopIn({ children, style, delay = 0, pointerEvents }: Omit<MotionProps, 'duration' | 'style'> & { style?: StyleProp<ViewStyle> }) {
  const reduceMotion = useReduceMotion();
  const [t] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));
  useEffect(() => {
    if (reduceMotion) {
      t.setValue(1);
      return;
    }
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.spring(t, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [t, delay, reduceMotion]);
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  return (
    <Animated.View pointerEvents={pointerEvents} style={[style, { opacity: t.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }), transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
}
