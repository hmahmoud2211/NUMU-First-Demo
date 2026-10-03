import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { Card } from '@/components/common/Card';
import { ProgressBar } from '@/components/common/ProgressBar';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SpeakerButton } from '@/components/common/SpeakerButton';
import { ShapeTile } from '@/components/reasoning/ShapeTile';
import { PopIn } from '@/components/world/motion/Motion';
import { useChild } from '@/context/ChildContext';
import { REASONING_ITEMS, bandFor } from '@/data/reasoningCheck';
import { useNarration } from '@/hooks/useNarration';
import { enterWorld } from '@/navigation/childMode';
import { colors, radius, spacing, typography } from '@/theme';

export default function ReasoningCheckScreen() {
  const { child, updateChild, ageGroup } = useChild();
  const { narrate } = useNarration();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const advancingRef = useRef(false);

  const total = REASONING_ITEMS.length;
  const currentItem = REASONING_ITEMS[currentIndex];

  useEffect(() => {
    if (!completed && currentItem) {
      narrate(currentItem.prompt);
    }
  }, [currentIndex, completed, currentItem, narrate]);

  const handleSelectOption = (optionIndex: number) => {
    if (advancingRef.current || selectedOption !== null) return;
    advancingRef.current = true;
    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === currentItem.answer;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }

    setTimeout(async () => {
      if (currentIndex + 1 < total) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        advancingRef.current = false;
      } else {
        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        const band = bandFor(finalCorrect, ageGroup.id);
        await updateChild({
          reasoningCheck: {
            completedAt: new Date().toISOString(),
            correct: finalCorrect,
            total,
            band,
          },
        });
        setCompleted(true);
        advancingRef.current = false;
      }
    }, 450);
  };

  const handleSkip = async () => {
    // If skipped, set standard emerging band so the child can proceed
    const band = bandFor(Math.floor(total / 2), ageGroup.id);
    await updateChild({
      reasoningCheck: {
        completedAt: new Date().toISOString(),
        correct: Math.floor(total / 2),
        total,
        band,
      },
    });
    enterWorld();
  };

  if (completed) {
    return (
      <ScreenContainer>
        <Card style={styles.celebrationCard}>
          <Text style={styles.celebrationEmoji}>🌟</Text>
          <Text style={[typography.h1, styles.center]}>Awesome Job!</Text>
          <Text style={[typography.body, styles.center]}>
            You completed the puzzle challenge, {child?.name ?? 'friend'}! NUMU World is all unlocked and ready for you.
          </Text>
          <AppButton
            title="Enter NUMU World"
            emoji="🌍"
            size="child"
            onPress={enterWorld}
            style={styles.fullWidth}
          />
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollKey={currentIndex}
      header={
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={typography.label}>
              Puzzle {currentIndex + 1} of {total}
            </Text>
            <SpeakerButton text={currentItem.prompt} />
          </View>
          <ProgressBar value={(currentIndex + 1) / total} height={8} />
        </View>
      }
      footer={
        <AppButton
          title="Skip challenge"
          variant="ghost"
          size="md"
          onPress={handleSkip}
        />
      }
    >
      <View style={styles.promptContainer}>
        <Text style={[typography.h2, styles.center]}>{currentItem.prompt}</Text>
      </View>

      {/* Main Puzzle Area */}
      <PopIn key={`puzzle-${currentIndex}`} style={styles.puzzleArea}>
        {currentItem.kind === 'matrix' && (
          <View
            style={[
              styles.matrixGrid,
              currentItem.columns === 3 ? styles.grid3 : styles.grid2,
            ]}
          >
            {currentItem.grid.map((tile, idx) => (
              <ShapeTile
                key={idx}
                tile={tile}
                size={currentItem.columns === 3 ? 66 : 82}
              />
            ))}
          </View>
        )}

        {currentItem.kind === 'sequence' && (
          <View style={styles.sequenceRow}>
            {currentItem.sequence.map((tile, idx) => (
              <ShapeTile key={idx} tile={tile} size={64} />
            ))}
            <ShapeTile tile={null} size={64} />
          </View>
        )}

        {currentItem.kind === 'odd' && (
          <View style={styles.oddNotice}>
            <Text style={styles.oddNoticeText}>
              Look closely at each option below. One of them does not belong!
            </Text>
          </View>
        )}
      </PopIn>

      {/* Options Selection */}
      <View style={styles.optionsSection}>
        <Text style={[typography.caption, styles.center, styles.chooseLabel]}>
          Tap your answer:
        </Text>
        <View style={styles.optionsRow}>
          {currentItem.options.map((option, optIdx) => {
            const isSelected = selectedOption === optIdx;
            return (
              <Pressable
                key={optIdx}
                onPress={() => handleSelectOption(optIdx)}
                accessibilityRole="button"
                accessibilityLabel={`Option ${optIdx + 1}`}
                style={({ pressed }) => [
                  styles.optionPressable,
                  pressed && styles.pressed,
                ]}
              >
                <ShapeTile
                  tile={option}
                  size={currentItem.options.length > 3 ? 64 : 76}
                  highlight={isSelected}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promptContainer: {
    paddingVertical: spacing.xs,
  },
  center: {
    textAlign: 'center',
  },
  puzzleArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 180,
  },
  matrixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  grid2: {
    maxWidth: 190,
  },
  grid3: {
    maxWidth: 240,
  },
  sequenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  oddNotice: {
    paddingHorizontal: spacing.lg,
  },
  oddNoticeText: {
    ...typography.bodySecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  optionsSection: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chooseLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  optionPressable: {
    borderRadius: radius.lg,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
  celebrationCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    marginTop: spacing.xl,
  },
  celebrationEmoji: {
    fontSize: 64,
  },
  fullWidth: {
    width: '100%',
    marginTop: spacing.sm,
  },
});
