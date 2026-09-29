import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { SpeakerButton } from '@/components/common/SpeakerButton';
import { useChild } from '@/context/ChildContext';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useSpeech } from '@/hooks/useSpeech';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export type AvatarMood = 'happy' | 'encouraging' | 'thinking' | 'celebrating';

type LearningAvatarProps = {
  message?: string;
  mood?: AvatarMood;
  /** Shows the replay button and allows automatic speech. */
  speechEnabled?: boolean;
  /** Overrides the age group's default auto-speak behaviour. */
  autoSpeak?: boolean;
  size?: number;
  layout?: 'row' | 'column';
  style?: StyleProp<ViewStyle>;
};

function AvatarFace({ mood }: { mood: AvatarMood }) {
  const eyes =
    mood === 'celebrating' ? (
      <G stroke={colors.faceStroke} strokeWidth={4} strokeLinecap="round" fill="none">
        <Path d="M40 66 Q46 58 52 66" />
        <Path d="M68 66 Q74 58 80 66" />
      </G>
    ) : (
      <G>
        <Circle cx={46} cy={66} r={7} fill={colors.faceStroke} />
        <Circle cx={74} cy={66} r={7} fill={colors.faceStroke} />
        <Circle cx={mood === 'thinking' ? 48 : 44} cy={mood === 'thinking' ? 62 : 63} r={2.5} fill={colors.surface} />
        <Circle cx={mood === 'thinking' ? 76 : 72} cy={mood === 'thinking' ? 62 : 63} r={2.5} fill={colors.surface} />
      </G>
    );

  const mouth = {
    happy: <Path d="M50 80 Q60 90 70 80" stroke={colors.faceStroke} strokeWidth={4} fill="none" strokeLinecap="round" />,
    encouraging: <Path d="M48 79 Q60 92 72 79" stroke={colors.faceStroke} strokeWidth={4} fill="none" strokeLinecap="round" />,
    thinking: <Ellipse cx={62} cy={84} rx={5} ry={4} fill={colors.faceStroke} />,
    celebrating: <Path d="M46 78 Q60 98 74 78 Z" fill={colors.faceMouthInside} stroke={colors.faceStroke} strokeWidth={3} />,
  }[mood];

  return (
    <G>
      {/* sprout */}
      <Path d="M60 34 L60 18" stroke={colors.avatarLeafDark} strokeWidth={4} strokeLinecap="round" />
      <Path d="M60 22 C48 22 40 14 40 4 C52 4 60 10 60 22 Z" fill={colors.avatarLeaf} />
      <Path d="M60 20 C70 20 78 13 80 4 C68 4 60 10 60 20 Z" fill={colors.avatarLeafDark} />
      {/* body */}
      <Ellipse cx={60} cy={74} rx={44} ry={40} fill={colors.avatarBody} />
      <Ellipse cx={60} cy={90} rx={28} ry={18} fill={colors.avatarBodyShade} opacity={0.35} />
      {eyes}
      <Ellipse cx={34} cy={80} rx={7} ry={4.5} fill={colors.avatarCheek} opacity={0.7} />
      <Ellipse cx={86} cy={80} rx={7} ry={4.5} fill={colors.avatarCheek} opacity={0.7} />
      {mouth}
    </G>
  );
}

/**
 * Numi, NUMU's learning companion. Gives calm, encouraging guidance with
 * optional text-to-speech.
 */
export function LearningAvatar({
  message,
  mood = 'happy',
  speechEnabled = true,
  autoSpeak,
  size = 96,
  layout = 'row',
  style,
}: LearningAvatarProps) {
  const { ageGroup } = useChild();
  const { say } = useSpeech();
  const reduceMotion = useReduceMotion();
  const bob = useRef(new Animated.Value(0)).current;
  const shouldAutoSpeak = speechEnabled && (autoSpeak ?? ageGroup.autoSpeak);

  // Slow, gentle float. Skipped entirely when reduce motion is on.
  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob, reduceMotion]);

  useEffect(() => {
    if (message && shouldAutoSpeak) say(message);
  }, [message, shouldAutoSpeak, say]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });

  return (
    <View style={[layout === 'row' ? styles.row : styles.column, style]}>
      <Animated.View style={{ transform: [{ translateY }] }} accessibilityRole="image" accessibilityLabel="Numi the helper">
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <AvatarFace mood={mood} />
        </Svg>
      </Animated.View>
      {message ? (
        <View style={[styles.bubble, layout === 'row' ? styles.bubbleRow : styles.bubbleColumn]}>
          <Text style={[typography.body, styles.message]} accessibilityLiveRegion="polite">
            {message}
          </Text>
          {speechEnabled ? <SpeakerButton text={message} label="Hear Numi" /> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  column: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  bubbleRow: {
    flex: 1,
    borderTopLeftRadius: radius.sm,
  },
  bubbleColumn: {
    alignSelf: 'stretch',
  },
  message: {
    flex: 1,
    fontWeight: '600',
  },
});
