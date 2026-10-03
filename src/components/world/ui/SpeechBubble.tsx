import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { PopIn } from '@/components/world/motion/Motion';
import { useSpeech } from '@/hooks/useSpeech';
import { gameColors, gameShadow, gameType } from '@/theme';

type Tail = 'left' | 'right' | 'bottom-left' | 'bottom-right' | 'none';

/** Rounded speech bubble with a pointer towards the speaker and a replay button. */
export function SpeechBubble({
  text,
  tail = 'bottom-left',
  style,
  large = false,
}: {
  text: string;
  tail?: Tail;
  style?: StyleProp<ViewStyle>;
  large?: boolean;
}) {
  const { say, stop, isSpeaking } = useSpeech();
  return (
    <PopIn key={text} style={[styles.wrap, style]}>
      <View style={[styles.bubble, gameShadow.lifted]}>
        <Text style={[gameType.body, large && styles.large, styles.text]} accessibilityLiveRegion="polite">
          {text}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSpeaking ? 'Stop reading' : 'Read aloud'}
          onPress={() => (isSpeaking ? stop() : say(text))}
          hitSlop={10}
          style={({ pressed }) => [styles.speaker, isSpeaking && styles.speakerActive, pressed && styles.pressed]}
        >
          <Ionicons name={isSpeaking ? 'stop' : 'volume-high'} size={18} color={isSpeaking ? gameColors.white : gameColors.primary} />
        </Pressable>
        {tail !== 'none' ? <View style={[styles.tail, TAIL_STYLES[tail]]} /> : null}
      </View>
    </PopIn>
  );
}

const TAIL_STYLES: Record<Exclude<Tail, 'none'>, ViewStyle> = {
  left: { left: -7, top: '50%', marginTop: -8 },
  right: { right: -7, top: '50%', marginTop: -8 },
  'bottom-left': { left: 28, bottom: -7 },
  'bottom-right': { right: 28, bottom: -7 },
};

const styles = StyleSheet.create({
  wrap: {
    maxWidth: '100%',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: gameColors.white,
    borderRadius: 22,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 10,
    borderBottomWidth: 4,
    borderBottomColor: gameColors.cardEdge,
  },
  text: {
    flexShrink: 1,
  },
  large: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: gameType.title.fontFamily,
  },
  speaker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: gameColors.cardTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerActive: {
    backgroundColor: gameColors.primary,
  },
  pressed: {
    opacity: 0.75,
  },
  tail: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: gameColors.white,
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
  },
});
