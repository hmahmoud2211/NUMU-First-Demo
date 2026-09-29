import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LearningAvatar } from '@/components/avatar/LearningAvatar';
import { AppButton } from '@/components/common/AppButton';
import { ChildHeader } from '@/components/common/ChildHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { StarRating } from '@/components/common/StarRating';
import { GameSession } from '@/components/games/GameSession';
import { getLevel, type LevelConfig } from '@/config/gameConfig';
import { useChild } from '@/context/ChildContext';
import { useLearning } from '@/context/LearningContext';
import { AVATAR_PHRASES, pickPhrase } from '@/data/coaching';
import { backInChildMode } from '@/navigation/childMode';
import { routes } from '@/navigation/routes';
import { buildLevelQuestions } from '@/services/questionGenerator';
import { colors, spacing, typography } from '@/theme';
import type { LearningQuestion, LevelId, QuestionResult } from '@/types/learning';
import { parseEmotionList } from '@/utils/emotionHelpers';
import { calculateAccuracy, maxScoreFor, starsForAccuracy, totalScore } from '@/utils/scoring';

function LevelComplete({ level, results }: { level: LevelConfig; results: QuestionResult[] }) {
  const { finishSession } = useLearning();
  const stars = starsForAccuracy(calculateAccuracy(results));
  const isLast = level.id === 5;

  const seeResults = () => {
    const summary = finishSession();
    router.replace(summary ? routes.results : routes.levels);
  };

  return (
    <View style={styles.complete}>
      <Text style={typography.childTitle}>{pickPhrase(AVATAR_PHRASES.levelDone, level.id)}</Text>
      <StarRating stars={stars} />
      <Text style={[typography.h2, styles.center]}>
        {totalScore(results)} / {maxScoreFor(results.length)} points
      </Text>
      <LearningAvatar
        message={isLast ? 'You did every level! Let’s see your stars.' : `Level ${level.id + 1} is open now. Ready?`}
        mood="celebrating"
        layout="column"
        size={100}
      />
      {isLast ? (
        <AppButton title="See my results" emoji="🏆" size="child" onPress={seeResults} />
      ) : (
        <AppButton
          title={`Go to level ${level.id + 1}`}
          icon="arrow-forward"
          size="child"
          onPress={() => router.replace(routes.level((level.id + 1) as LevelId))}
        />
      )}
      <AppButton title="Back to the map" variant="ghost" size="md" onPress={backInChildMode} />
    </View>
  );
}

export default function LevelScreen() {
  const params = useLocalSearchParams<{ levelId: string }>();
  const level = getLevel(Number(params.levelId));
  const { ageGroup } = useChild();
  const { activeSession, ensureGameSession, recordResults, completeLevel, progress } = useLearning();
  const [finished, setFinished] = useState<QuestionResult[] | null>(null);
  const locked = !level || level.id > progress.unlockedLevel;

  useEffect(() => {
    if (!activeSession || activeSession.kind !== 'game') ensureGameSession();
  }, [activeSession, ensureGameSession]);

  // Keyed on the session id and focus (not the session object) so recording
  // answers or opening coaching never reshuffles the level.
  const sessionId = activeSession?.id;
  const focusKey = activeSession?.focusEmotions.join(',') ?? '';
  const questions = useMemo<LearningQuestion[] | null>(
    () =>
      level && !locked && sessionId
        ? buildLevelQuestions(level, ageGroup, `${sessionId}-L${level.id}`, parseEmotionList(focusKey))
        : null,
    [ageGroup, focusKey, level, locked, sessionId],
  );

  const background = colors[ageGroup.childBackground];

  if (!level || locked) {
    return (
      <ScreenContainer background={background} header={<ChildHeader onBack={backInChildMode} />}>
        <LearningAvatar
          message="This level is still locked. Finish the level before it first!"
          mood="thinking"
          layout="column"
        />
        <AppButton title="Back to the map" size="child" onPress={backInChildMode} />
      </ScreenContainer>
    );
  }

  if (finished) {
    return (
      <ScreenContainer background={background} header={<ChildHeader onBack={backInChildMode} title={level.childTitle} progress={1} />}>
        <LevelComplete level={level} results={finished} />
      </ScreenContainer>
    );
  }

  if (!questions) return <ScreenContainer background={background}>{null}</ScreenContainer>;

  return (
    <GameSession
      title={`Level ${level.id} · ${ageGroup.id === 'teen' ? level.title : level.childTitle}`}
      questions={questions}
      source={level.id}
      onBack={backInChildMode}
      onResults={recordResults}
      onFinished={(results) => {
        completeLevel(level.id);
        setFinished(results);
      }}
      onCompare={(expected, selected) => router.push(routes.coach(expected, selected))}
    />
  );
}

const styles = StyleSheet.create({
  complete: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  center: {
    textAlign: 'center',
  },
});
