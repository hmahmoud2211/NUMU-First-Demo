import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LearningAvatar } from '@/components/avatar/LearningAvatar';
import { AppButton } from '@/components/common/AppButton';
import { ChildHeader } from '@/components/common/ChildHeader';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { LEVELS } from '@/config/gameConfig';
import { useChild } from '@/context/ChildContext';
import { useLearning } from '@/context/LearningContext';
import { exitChildMode } from '@/navigation/childMode';
import { routes } from '@/navigation/routes';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import type { LevelId } from '@/types/learning';
import { formatEmotionList } from '@/utils/emotionHelpers';

type NodeState = 'completed' | 'open' | 'locked';

export default function LevelMapScreen() {
  const { child, ageGroup } = useChild();
  const { activeSession, ensureGameSession, progress, finishSession } = useLearning();

  useEffect(() => {
    ensureGameSession();
  }, [ensureGameSession]);

  const completed = activeSession?.completedLevels ?? [];
  const focus = activeSession?.focusEmotions ?? [];
  const canFinish = (activeSession?.results.length ?? 0) > 0;

  const stateFor = (id: LevelId): NodeState => {
    if (completed.includes(id)) return 'completed';
    return id <= progress.unlockedLevel ? 'open' : 'locked';
  };

  const nextLevel = LEVELS.find((level) => stateFor(level.id) === 'open');
  const greeting =
    completed.length === 0
      ? `${child ? `${child.name}, pick` : 'Pick'} a level to start!`
      : nextLevel
        ? `Well done! Level ${nextLevel.id} is ready for you.`
        : 'You finished every level. Amazing!';
  const focusNote = focus.length > 0 ? ` I added extra ${formatEmotionList(focus, ageGroup.id)} practice for you.` : '';

  const finish = () => {
    const summary = finishSession();
    router.replace(summary ? routes.results : routes.parentHome);
  };

  return (
    <ScreenContainer
      background={colors[ageGroup.childBackground]}
      header={<ChildHeader onBack={exitChildMode} backType="exit" title="Emotion Adventure" />}
      footer={
        canFinish ? <AppButton title="Finish & see my stars" emoji="⭐" size="child" variant="secondary" onPress={finish} /> : null
      }
    >
      <LearningAvatar message={`${greeting}${completed.length === 0 ? focusNote : ''}`} mood="happy" size={80} />

      <View style={styles.path}>
        {LEVELS.map((level, index) => {
          const state = stateFor(level.id);
          const isNext = level.id === nextLevel?.id;
          return (
            <View key={level.id}>
              {index > 0 ? <View style={[styles.connector, state !== 'locked' && styles.connectorActive]} /> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Level ${level.id}: ${level.childTitle}. ${state === 'locked' ? 'Locked' : state === 'completed' ? 'Completed' : 'Open'}`}
                accessibilityState={{ disabled: state === 'locked' }}
                disabled={state === 'locked'}
                onPress={() => router.push(routes.level(level.id))}
                style={({ pressed }) => [
                  styles.node,
                  index % 2 === 1 && styles.nodeOffset,
                  isNext && styles.nodeNext,
                  state === 'locked' && styles.nodeLocked,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.badge,
                    state === 'completed' && styles.badgeDone,
                    state === 'open' && styles.badgeOpen,
                  ]}
                >
                  {state === 'locked' ? (
                    <Ionicons name="lock-closed" size={24} color={colors.textMuted} />
                  ) : state === 'completed' ? (
                    <Ionicons name="checkmark" size={30} color={colors.textOnPrimary} />
                  ) : (
                    <Text style={styles.badgeEmoji}>{level.emoji}</Text>
                  )}
                </View>
                <View style={styles.nodeText}>
                  <Text style={typography.label}>LEVEL {level.id}</Text>
                  <Text style={typography.h3}>{ageGroup.id === 'teen' ? level.title : level.childTitle}</Text>
                  <Text style={typography.caption}>{level.description}</Text>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  path: {
    gap: 0,
  },
  connector: {
    width: 6,
    height: 22,
    marginLeft: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  connectorActive: {
    backgroundColor: colors.secondary,
  },
  node: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.card,
  },
  nodeOffset: {
    marginLeft: spacing.lg,
  },
  nodeNext: {
    borderColor: colors.primary,
  },
  nodeLocked: {
    backgroundColor: colors.surfaceAlt,
    opacity: 0.75,
  },
  pressed: {
    opacity: 0.85,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOpen: {
    backgroundColor: colors.accentSoft,
  },
  badgeDone: {
    backgroundColor: colors.success,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  nodeText: {
    flex: 1,
    gap: 2,
  },
});
