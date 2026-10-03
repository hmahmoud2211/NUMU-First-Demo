import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg from 'react-native-svg';

import { EmotionBall, FEELING_COLORS } from '@/components/world/art/EmotionBall';
import { Bob } from '@/components/world/motion/Motion';
import { useReactions } from '@/components/world/motion/LivingKid';
import { GameButton } from '@/components/world/ui/GameButton';
import { gameColors, gameShadow, gameType } from '@/theme';
import type { FeelingId } from '@/types/world';
import { lighten } from '@/utils/color';

export type ChoiceState = 'idle' | 'selected' | 'tried' | 'correct' | 'disabled';

type TileProps = {
  state?: ChoiceState;
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
  /** Change to play a happy hop. */
  hopKey?: unknown;
  /** Change to play a gentle "not this one" wobble. */
  wobbleKey?: unknown;
  style?: StyleProp<ViewStyle>;
  tint?: string;
};

/** A tappable tile that hops when right and wobbles (without scolding) when not. */
export function ChoiceTile({ state = 'idle', onPress, accessibilityLabel, children, hopKey, wobbleKey, style, tint }: TileProps) {
  const { translateY, rotate } = useReactions(hopKey, wobbleKey);
  const highlight = state === 'correct' ? gameColors.green : state === 'selected' ? gameColors.gold : 'transparent';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: state === 'disabled' || state === 'tried', selected: state === 'selected' || state === 'correct' }}
      disabled={state === 'disabled'}
      onPress={onPress}
      style={({ pressed }) => [styles.tilePress, pressed && styles.pressed, style]}
    >
      <Animated.View
        style={[
          styles.tile,
          { backgroundColor: tint ?? gameColors.white, borderColor: highlight },
          state === 'correct' && styles.tileCorrect,
          state === 'tried' && styles.tileTried,
          state === 'disabled' && styles.tileDisabled,
          { transform: [{ translateY }, { rotate }] },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

type EmotionChoiceProps = {
  feeling: FeelingId;
  label: string;
  state?: ChoiceState;
  onPress: () => void;
  size?: number;
  delay?: number;
  hopKey?: unknown;
  wobbleKey?: unknown;
};

/** A bouncing 3D feeling face with its name underneath. */
export function EmotionChoice({ feeling, label, state = 'idle', onPress, size = 58, delay = 0, hopKey, wobbleKey }: EmotionChoiceProps) {
  const color = FEELING_COLORS[feeling];
  const lifted = state === 'selected' || state === 'correct';
  return (
    <ChoiceTile
      state={state}
      onPress={onPress}
      accessibilityLabel={label}
      hopKey={hopKey}
      wobbleKey={wobbleKey}
      tint={lifted ? lighten(color, 0.78) : gameColors.white}
      style={styles.emotionTile}
    >
      <Bob delay={delay} duration={1300} distance={lifted ? 6 : 3}>
        <Svg width={size} height={size} viewBox="0 0 100 100" style={lifted ? styles.lifted : undefined}>
          <EmotionBall feeling={feeling} />
        </Svg>
      </Bob>
      <Text style={[styles.emotionLabel, { color: state === 'tried' ? gameColors.inkFaint : gameColors.ink }]} numberOfLines={1}>
        {label}
      </Text>
    </ChoiceTile>
  );
}

type OptionButtonProps = {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  state?: ChoiceState;
  onPress: () => void;
  color?: string;
};

/** A wide answer button for situations (playground). */
export function OptionButton({ label, icon, state = 'idle', onPress, color = gameColors.primary }: OptionButtonProps) {
  const correct = state === 'correct';
  const tried = state === 'tried';
  return (
    <GameButton
      onPress={onPress}
      disabled={state === 'disabled'}
      color={correct ? gameColors.green : tried ? '#F1EFF7' : gameColors.white}
      edge={correct ? gameColors.greenEdge : tried ? '#DEDAEA' : gameColors.cardEdge}
      accessibilityLabel={label}
      accessibilityState={{ selected: correct }}
      faceStyle={styles.optionFace}
    >
      <View style={[styles.optionIcon, { backgroundColor: correct ? 'rgba(255,255,255,0.3)' : lighten(color, 0.82) }]}>
        <Ionicons name={correct ? 'checkmark' : icon} size={22} color={correct ? gameColors.white : tried ? gameColors.inkFaint : color} />
      </View>
      <Text style={[styles.optionText, { color: correct ? gameColors.white : tried ? gameColors.inkFaint : gameColors.ink }]}>{label}</Text>
    </GameButton>
  );
}

const styles = StyleSheet.create({
  tilePress: {
    flex: 1,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 20,
    borderWidth: 3,
    borderBottomWidth: 5,
    ...gameShadow.soft,
  },
  tileCorrect: {
    backgroundColor: '#E8F9F0',
  },
  tileTried: {
    opacity: 0.55,
  },
  tileDisabled: {
    opacity: 0.6,
  },
  emotionTile: {
    minWidth: 58,
  },
  lifted: {
    transform: [{ scale: 1.08 }],
  },
  emotionLabel: {
    ...gameType.label,
    fontFamily: gameType.heading.fontFamily,
    fontSize: 13,
  },
  optionFace: {
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    minHeight: 58,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    ...gameType.body,
    flexShrink: 1,
  },
});
