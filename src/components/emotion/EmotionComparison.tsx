import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { FACE_PART_CATEGORIES } from '@/data/emotionFaceConfigurations';
import { EMOTION_LESSONS } from '@/data/emotionLessons';
import { getImagesForEmotion } from '@/data/emotions';
import { colors, emotionColors, radius, spacing, typography } from '@/theme';
import type { Emotion } from '@/types/emotion';

import { EmotionCard } from './EmotionCard';
import { EmotionImage } from './EmotionImage';

type EmotionComparisonProps = {
  left: Emotion;
  right: Emotion;
  showCues?: boolean;
};

function Column({ emotion, size, showCues }: { emotion: Emotion; size: number; showCues: boolean }) {
  const image = getImagesForEmotion(emotion)[0];
  const cues = EMOTION_LESSONS[emotion].faceCues;
  return (
    <View style={[styles.column, { borderColor: emotionColors[emotion].main }]}>
      <EmotionCard emotion={emotion} style={styles.label} />
      {image ? <EmotionImage image={image} size={size} revealEmotion /> : null}
      {showCues
        ? FACE_PART_CATEGORIES.map(({ id, label }) => (
            <View key={id} style={styles.cue}>
              <Text style={styles.cueLabel}>{label}</Text>
              <Text style={typography.bodySecondary}>{cues[id]}</Text>
            </View>
          ))
        : null}
    </View>
  );
}

/** Side-by-side view of two emotions that are easy to confuse. */
export function EmotionComparison({ left, right, showCues = true }: EmotionComparisonProps) {
  const { width } = useWindowDimensions();
  const size = Math.min((Math.min(width, 640) - 88) / 2, 170);
  return (
    <View style={styles.row}>
      <Column emotion={left} size={size} showCues={showCues} />
      <View style={styles.vs}>
        <Text style={styles.vsText}>VS</Text>
      </View>
      <Column emotion={right} size={size} showCues={showCues} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.xs,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.sm,
  },
  label: {
    alignSelf: 'stretch',
    paddingHorizontal: spacing.xs,
  },
  vs: {
    justifyContent: 'center',
  },
  vsText: {
    ...typography.label,
    color: colors.textMuted,
  },
  cue: {
    alignSelf: 'stretch',
    gap: 2,
  },
  cueLabel: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
