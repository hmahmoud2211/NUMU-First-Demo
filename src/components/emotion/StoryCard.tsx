import { StyleSheet, Text, View } from 'react-native';

import { SpeakerButton } from '@/components/common/SpeakerButton';
import { colors, radius, shadows, spacing, typography } from '@/theme';

type StoryCardProps = {
  label: string;
  emoji: string;
  text: string;
};

export function StoryCard({ label, emoji, text }: StoryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{emoji}</Text>
        </View>
        <Text style={[typography.label, styles.label]}>{label}</Text>
        <SpeakerButton text={text} label="Read the story aloud" />
      </View>
      <Text style={typography.childBody}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  label: {
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
