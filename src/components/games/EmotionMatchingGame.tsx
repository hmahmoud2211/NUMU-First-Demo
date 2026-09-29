import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { LearningAvatar } from '@/components/avatar/LearningAvatar';
import { AppButton } from '@/components/common/AppButton';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { EmotionImage } from '@/components/emotion/EmotionImage';
import { EmotionOption } from '@/components/emotion/EmotionOption';
import { pickAgeText } from '@/config/ageGroups';
import { useChild } from '@/context/ChildContext';
import { AVATAR_PHRASES, pickPhrase } from '@/data/coaching';
import { EMOTION_LESSONS } from '@/data/emotionLessons';
import { colors, emotionColors, radius, spacing, typography } from '@/theme';
import type { Emotion } from '@/types/emotion';
import type { MatchingQuestion, QuestionResult } from '@/types/learning';
import { getEmotionLabel } from '@/utils/emotionHelpers';
import { scoreAttempt } from '@/utils/scoring';

import type { GameComponentProps } from './types';

/** Level 3: tap a face, then tap the matching feeling. */
export function EmotionMatchingGame({ question, source, onComplete }: GameComponentProps<MatchingQuestion>) {
  const { ageGroup } = useChild();
  const { width } = useWindowDimensions();
  const [selectedPairId, setSelectedPairId] = useState<string | null>(question.pairs[0]?.id ?? null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrongByPair, setWrongByPair] = useState<Record<string, Emotion[]>>({});
  const [message, setMessage] = useState(pickAgeText(
    { early: 'Tap a face. Then tap its feeling.', middle: 'Tap a face, then tap the feeling that matches.', teen: 'Select a face, then its emotion.' },
    ageGroup.id,
  ));
  const [mood, setMood] = useState<'happy' | 'encouraging' | 'celebrating'>('happy');
  const [startedAt] = useState(() => Date.now());

  const imageSize = Math.min((width - 64) / 2, 140);
  const allMatched = matched.length === question.pairs.length;
  const matchedEmotions = question.pairs.filter((pair) => matched.includes(pair.id)).map((pair) => pair.emotion);

  const handleLabel = (emotion: Emotion) => {
    const pair = question.pairs.find((item) => item.id === selectedPairId);
    if (!pair) {
      setMessage('First, tap a face.');
      return;
    }
    if (pair.emotion === emotion) {
      const nextMatched = [...matched, pair.id];
      setMatched(nextMatched);
      setMood('celebrating');
      setMessage(`${pickPhrase(AVATAR_PHRASES.correct, nextMatched.length)} That face looks ${getEmotionLabel(emotion, ageGroup.id).toLowerCase()}.`);
      setSelectedPairId(question.pairs.find((item) => !nextMatched.includes(item.id))?.id ?? null);
      return;
    }
    setWrongByPair((previous) => ({ ...previous, [pair.id]: [...(previous[pair.id] ?? []), emotion] }));
    setMood('encouraging');
    setMessage(`${pickPhrase(AVATAR_PHRASES.tryAgain, matched.length)} ${pickAgeText(EMOTION_LESSONS[pair.emotion].faceHint, ageGroup.id)}`);
  };

  const finish = () => {
    const now = new Date().toISOString();
    const results: QuestionResult[] = question.pairs.map((pair) => {
      const wrong = wrongByPair[pair.id] ?? [];
      const attempts = wrong.length + 1;
      return {
        questionId: pair.id,
        questionType: 'matching',
        expectedEmotion: pair.emotion,
        selectedEmotion: wrong[0] ?? pair.emotion,
        wrongSelections: wrong,
        correct: wrong.length === 0,
        solved: true,
        attempts,
        usedCoaching: false,
        points: scoreAttempt({ solved: true, attempts, usedCoaching: false }),
        responseTimeMs: Date.now() - startedAt,
        timestamp: now,
        source,
      };
    });
    onComplete(results);
  };

  return (
    <View style={styles.container}>
      <View style={styles.promptRow}>
        <Text style={[typography.childTitle, styles.prompt]}>{question.prompt}</Text>
        <SpeakerButton text={question.prompt} />
      </View>

      <View style={styles.board}>
        <View style={styles.column}>
          {question.pairs.map((pair) => {
            const isMatched = matched.includes(pair.id);
            const isSelected = pair.id === selectedPairId;
            return (
              <Pressable
                key={pair.id}
                accessibilityRole="button"
                accessibilityLabel={isMatched ? `Matched: ${getEmotionLabel(pair.emotion, ageGroup.id)}` : 'Face to match'}
                accessibilityState={{ selected: isSelected, disabled: isMatched }}
                disabled={isMatched}
                onPress={() => setSelectedPairId(pair.id)}
                style={[
                  styles.faceSlot,
                  isSelected && styles.faceSelected,
                  isMatched && { borderColor: emotionColors[pair.emotion].main },
                ]}
              >
                <EmotionImage image={pair.image} size={imageSize} revealEmotion={isMatched} />
                {isMatched ? (
                  <Text style={[typography.label, styles.matchedLabel]}>✓ {getEmotionLabel(pair.emotion, ageGroup.id)}</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
        <View style={[styles.column, styles.labels]}>
          {question.labels.map((emotion) => (
            <EmotionOption
              key={emotion}
              emotion={emotion}
              compact
              state={matchedEmotions.includes(emotion) ? 'correct' : allMatched ? 'disabled' : 'idle'}
              onPress={handleLabel}
            />
          ))}
        </View>
      </View>

      <LearningAvatar message={message} mood={mood} size={72} />
      {allMatched ? <AppButton title="Next" icon="arrow-forward" size="child" onPress={finish} /> : null}
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
    fontSize: 22,
    textAlign: 'left',
  },
  board: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  column: {
    flex: 1,
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  labels: {
    justifyContent: 'center',
  },
  faceSlot: {
    alignItems: 'center',
    padding: spacing.xxs,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: 'transparent',
    gap: spacing.xxs,
  },
  faceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  matchedLabel: {
    color: colors.textPrimary,
  },
});
