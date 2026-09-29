import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LearningAvatar } from '@/components/avatar/LearningAvatar';
import { AppButton } from '@/components/common/AppButton';
import { Card } from '@/components/common/Card';
import { ChildHeader } from '@/components/common/ChildHeader';
import { ProgressBar } from '@/components/common/ProgressBar';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { EmotionComparison } from '@/components/emotion/EmotionComparison';
import { GameSession } from '@/components/games/GameSession';
import { useChild } from '@/context/ChildContext';
import { useLearning } from '@/context/LearningContext';
import { backInChildMode, openParentDashboard } from '@/navigation/childMode';
import { routes } from '@/navigation/routes';
import { computeEmotionStats, generatePairPractice, generatePracticeQuestions } from '@/services/learningEngine';
import { colors, emotionColors, spacing, typography } from '@/theme';
import type { QuestionResult } from '@/types/learning';
import { formatEmotionList, getEmotionEmoji, getEmotionLabel, parseEmotionList } from '@/utils/emotionHelpers';
import { createId } from '@/utils/random';

/**
 * Personalised practice. "pair" mode drills two confused emotions (from
 * coaching); "personalized" mode focuses on the weakest emotions after a session.
 */
export default function PracticeScreen() {
  const params = useLocalSearchParams<{ focus: string; mode: string }>();
  const { ageGroup } = useChild();
  const { activeSession, insights, startSession, recordResults, finishSession } = useLearning();

  const requested = parseEmotionList(params.focus);
  const focus = requested.length > 0 ? requested : insights.weakEmotions.length > 0 ? insights.weakEmotions : ageGroup.coreEmotions.slice(0, 2);
  const isPair = params.mode === 'pair' && focus.length >= 2;
  // Pair drills launched mid-level add their results to the running game session.
  const joinsGame = useRef(isPair && activeSession?.kind === 'game').current;
  const [seed] = useState(() => createId('practice'));
  const [started, setStarted] = useState(false);
  const [results, setResults] = useState<QuestionResult[] | null>(null);
  const focusKey = focus.join(',');

  // Keyed on focusKey (a string) because the focus array is rebuilt every render.
  const questions = useMemo(() => {
    const list = parseEmotionList(focusKey);
    return isPair ? generatePairPractice([list[0], list[1]], ageGroup, seed) : generatePracticeQuestions(list, ageGroup, seed);
  }, [isPair, focusKey, ageGroup, seed]);

  const focusLabel = formatEmotionList(focus, ageGroup.id);
  const background = colors[ageGroup.childBackground];

  const start = () => {
    if (!joinsGame) startSession('practice', focus);
    setStarted(true);
  };

  const finished = (all: QuestionResult[]) => {
    if (!joinsGame) finishSession();
    setResults(all);
  };

  if (!started) {
    return (
      <ScreenContainer
        background={background}
        header={<ChildHeader onBack={backInChildMode} title="Practice time" />}
        footer={<AppButton title="Let’s practice!" emoji="🎯" size="child" onPress={start} />}
      >
        <LearningAvatar
          message={
            isPair
              ? `Let’s practice ${focusLabel}. Look closely at the eyes, eyebrows and mouth.`
              : `Let’s practice ${focusLabel} again! I picked these because they were a little tricky.`
          }
          mood="encouraging"
          layout="column"
          size={96}
        />
        {focus.length >= 2 ? <EmotionComparison left={focus[0]} right={focus[1]} showCues={isPair} /> : null}
      </ScreenContainer>
    );
  }

  if (results) {
    const stats = computeEmotionStats(results);
    return (
      <ScreenContainer
        background={background}
        header={<ChildHeader onBack={backInChildMode} title="Practice done" progress={1} />}
        footer={
          isPair ? (
            <AppButton title="Back to the game" icon="arrow-forward" size="child" onPress={backInChildMode} />
          ) : (
            <>
              <AppButton title="Show Parent" icon="people" size="child" onPress={openParentDashboard} />
              <AppButton title="Play the levels" variant="ghost" size="md" onPress={() => router.replace(routes.levels)} />
            </>
          )
        }
      >
        <LearningAvatar message={`Great practice! You worked on ${focusLabel}.`} mood="celebrating" layout="column" size={110} />
        <Card style={styles.stats}>
          {focus.map((emotion) => {
            const stat = stats[emotion];
            const value = stat ? stat.correct / stat.attempted : 0;
            return (
              <View key={emotion} style={styles.statRow}>
                <Text style={typography.h3}>
                  {getEmotionEmoji(emotion)} {getEmotionLabel(emotion, ageGroup.id)}
                </Text>
                <ProgressBar value={value} color={emotionColors[emotion].main} />
                <Text style={typography.caption}>
                  {stat ? `${stat.correct} of ${stat.attempted} on the first try` : 'Practised with help'}
                </Text>
              </View>
            );
          })}
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <GameSession
      title={`Practice: ${focusLabel}`}
      questions={questions}
      source="practice"
      onBack={backInChildMode}
      onResults={recordResults}
      onFinished={finished}
    />
  );
}

const styles = StyleSheet.create({
  stats: {
    gap: spacing.md,
  },
  statRow: {
    gap: spacing.xxs,
  },
});
