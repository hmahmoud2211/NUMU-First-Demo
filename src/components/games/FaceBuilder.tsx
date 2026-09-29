import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { LearningAvatar } from '@/components/avatar/LearningAvatar';
import { AppButton } from '@/components/common/AppButton';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { FaceIllustration, FacePartPreview } from '@/components/face/FaceIllustration';
import { getEmotionPool } from '@/config/ageGroups';
import { useChild } from '@/context/ChildContext';
import { AVATAR_PHRASES, pickPhrase } from '@/data/coaching';
import {
  BLANK_FACE,
  FACE_PART_CATEGORIES,
  getCanonicalFace,
  getFacePartLabel,
  withPart,
} from '@/data/emotionFaceConfigurations';
import { EMOTION_LESSONS } from '@/data/emotionLessons';
import { useChoiceAnswer } from '@/hooks/useChoiceAnswer';
import { colors, emotionColors, radius, spacing, typography } from '@/theme';
import type { FacePartCategory, FaceParts } from '@/types/emotion';
import type { FaceBuilderQuestion } from '@/types/learning';
import { checkBuiltFace, getEmotionLabel, type FaceCheck } from '@/utils/emotionHelpers';

import type { GameComponentProps } from './types';

/** Level 4: build a face for the requested emotion from eyes, eyebrows and mouth. */
export function FaceBuilder({ question, source, onComplete }: GameComponentProps<FaceBuilderQuestion>) {
  const { ageGroup } = useChild();
  const { width } = useWindowDimensions();
  const [face, setFace] = useState<FaceParts>(BLANK_FACE);
  const [check, setCheck] = useState<FaceCheck | null>(null);
  const answer = useChoiceAnswer(question, source);
  const target = question.targetEmotion;
  const targetLabel = getEmotionLabel(target, ageGroup.id);
  const previewSize = Math.min(width - 64, 220);
  const compareSize = Math.min((width - 80) / 2, 150);

  const choose = (category: FacePartCategory, value: string) => {
    if (answer.done) return;
    setFace((previous) => withPart(previous, category, value));
    setCheck(null);
  };

  const submitFace = () => {
    const result = checkBuiltFace(target, face, getEmotionPool(ageGroup));
    setCheck(result);
    answer.submit(result.closestEmotion);
  };

  const partFeedback = check
    ? FACE_PART_CATEGORIES.filter(({ id }) => !check.partResults[id]).map(({ id }) => EMOTION_LESSONS[target].faceCues[id])
    : [];

  const avatarMessage = (() => {
    if (answer.status === 'solved') return `${pickPhrase(AVATAR_PHRASES.correct, face.mouth.length)} That is a ${targetLabel.toLowerCase()} face!`;
    if (answer.status === 'revealed') return `Here is one way to make a ${targetLabel.toLowerCase()} face. ${EMOTION_LESSONS[target].faceCues.mouth}`;
    if (answer.status === 'retry') return `Good try! Let’s change one thing. ${partFeedback[0] ?? ''}`;
    return 'Pick eyes, eyebrows and a mouth. Then tap “Check my face”.';
  })();

  return (
    <View style={styles.container}>
      <View style={styles.promptRow}>
        <Text style={[typography.childTitle, styles.prompt]}>{question.prompt}</Text>
        <SpeakerButton text={question.prompt} />
      </View>

      {check ? (
        <View style={styles.compareRow}>
          <View style={styles.compareItem}>
            <Text style={typography.label}>YOUR FACE</Text>
            <View style={styles.compareFrame}>
              <FaceIllustration parts={face} size={compareSize} />
            </View>
          </View>
          <Text style={[typography.h3, styles.vs]}>vs</Text>
          <View style={styles.compareItem}>
            <Text style={typography.label}>{targetLabel.toUpperCase()} FACE</Text>
            <View style={[styles.compareFrame, { backgroundColor: emotionColors[target].soft }]}>
              <FaceIllustration parts={getCanonicalFace(target)} size={compareSize} />
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.preview, { backgroundColor: emotionColors[target].soft }]}>
          <FaceIllustration parts={face} size={previewSize} accessibilityLabel="The face you are building" />
        </View>
      )}

      <LearningAvatar
        message={avatarMessage}
        mood={answer.status === 'solved' ? 'celebrating' : answer.status === 'answering' ? 'happy' : 'encouraging'}
        size={64}
      />

      {!answer.done
        ? FACE_PART_CATEGORIES.map(({ id: category, label }) => (
            <View key={category} style={styles.category}>
              <Text style={typography.h3}>{label}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.partRow}>
                {(ageGroup.faceBuilderOptions[category] as string[]).map((value) => {
                  const selected = face[category] === value;
                  const optionLabel = getFacePartLabel(category, value);
                  const needsChange = check && !check.partResults[category];
                  return (
                    <Pressable
                      key={value}
                      accessibilityRole="button"
                      accessibilityLabel={`${label}: ${optionLabel}`}
                      accessibilityState={{ selected }}
                      onPress={() => choose(category, value)}
                      style={[styles.part, selected && styles.partSelected, selected && needsChange && styles.partNeedsChange]}
                    >
                      <FacePartPreview category={category} parts={withPart(face, category, value)} width={72} />
                      <Text style={[typography.caption, styles.partLabel]}>{optionLabel}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ))
        : null}

      {answer.done ? (
        <AppButton title="Next" icon="arrow-forward" size="child" onPress={() => onComplete([answer.buildResult()])} />
      ) : (
        <AppButton title="Check my face" emoji="✨" size="child" onPress={submitFace} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  prompt: {
    flex: 1,
    fontSize: 24,
    textAlign: 'left',
  },
  preview: {
    alignSelf: 'center',
    borderRadius: radius.xl,
    padding: spacing.sm,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  compareItem: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  compareFrame: {
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.xxs,
  },
  vs: {
    color: colors.textMuted,
  },
  category: {
    gap: spacing.xs,
  },
  partRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  part: {
    alignItems: 'center',
    gap: spacing.xxs,
    padding: spacing.xs,
    minWidth: 92,
    borderRadius: radius.md,
    borderWidth: 2.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  partSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  partNeedsChange: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  partLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
