import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { useSpeech } from '@/hooks/useSpeech';
import { colors, radius, touchTarget } from '@/theme';

type SpeakerButtonProps = {
  text: string;
  size?: 'md' | 'lg';
  label?: string;
};

/** Replays text aloud. Tapping while speaking stops the audio. */
export function SpeakerButton({ text, size = 'md', label = 'Listen' }: SpeakerButtonProps) {
  const { say, stop, isSpeaking } = useSpeech();
  const dimension = size === 'lg' ? touchTarget.child : touchTarget.min;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isSpeaking ? 'Stop audio' : label}
      onPress={() => (isSpeaking ? stop() : say(text))}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        { width: dimension, height: dimension, opacity: pressed ? 0.8 : 1 },
        isSpeaking && styles.active,
      ]}
    >
      <Ionicons
        name={isSpeaking ? 'stop' : 'volume-high'}
        size={size === 'lg' ? 30 : 22}
        color={isSpeaking ? colors.textOnPrimary : colors.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: colors.primary,
  },
});
