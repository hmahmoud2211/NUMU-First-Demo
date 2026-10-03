import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs } from 'react-native-svg';

import { ClassroomBackdrop, classroomBoard } from '@/components/world/art/Backdrops';
import { OWL_VIEW, OwlTeacher, type HelperMood } from '@/components/world/art/Characters';
import { FoodArt } from '@/components/world/art/Foods';
import { GameIcon } from '@/components/world/art/Icons';
import { KID_VIEW, PLAYER_LOOK } from '@/components/world/art/KidCharacter';
import { Ball, useArtIds } from '@/components/world/art/primitives';
import { LivingKid, useReactions } from '@/components/world/motion/LivingKid';
import { Bob, PopIn, Twinkle } from '@/components/world/motion/Motion';
import { SceneScreen, type SceneSize } from '@/components/world/scene/SceneScreen';
import { ChoiceTile, type ChoiceState } from '@/components/world/ui/Choices';
import { GameCard } from '@/components/world/ui/GameCard';
import { GameButton } from '@/components/world/ui/GameButton';
import { SpeechBubble } from '@/components/world/ui/SpeechBubble';
import { PROGRESSION } from '@/config/worldConfig';
import { useWorld } from '@/context/WorldContext';
import { PUZZLES, type Puzzle, type PuzzleToken } from '@/data/worldActivities';
import { useNarration } from '@/hooks/useNarration';
import { gameColors, gameFonts, gameType } from '@/theme';
import type { RewardSummary } from '@/types/world';

function TokenArt({ token, size }: { token: PuzzleToken; size: number }) {
  const ids = useArtIds('tok');
  if ('ball' in token) {
    return (
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Defs>
          <Ball id={ids.id('b')} color={token.ball} />
        </Defs>
        <Circle cx={20} cy={20} r={17} fill={ids.url('b')} />
      </Svg>
    );
  }
  if ('food' in token) {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <FoodArt id={token.food} shadow={false} />
      </Svg>
    );
  }
  return <GameIcon name={token.icon} size={size} color={token.color} />;
}

function tokenLabel(token: PuzzleToken): string {
  if ('ball' in token) return { '#FF5C7A': 'red ball', '#38B0FF': 'blue ball', '#3CCB7F': 'green ball' }[token.ball] ?? 'ball';
  if ('food' in token) return token.food;
  return token.icon;
}

function optionsOf(puzzle: Puzzle): { key: string; label: string; render: (size: number) => ReactNode }[] {
  if (puzzle.kind === 'count') {
    return puzzle.options.map((value) => ({
      key: `${value}`,
      label: `${value}`,
      render: (size) => <Text style={[styles.number, { fontSize: size * 0.7, lineHeight: size * 0.85 }]}>{value}</Text>,
    }));
  }
  const tokens = puzzle.kind === 'pattern' ? puzzle.options : puzzle.items;
  return tokens.map((token, index) => ({ key: `${index}`, label: tokenLabel(token), render: (size) => <TokenArt token={token} size={size} /> }));
}

function answerOf(puzzle: Puzzle): number {
  return puzzle.kind === 'count' ? puzzle.options.indexOf(puzzle.amount) : puzzle.answer;
}

function OwlSprite({ height, mood, hopKey }: { height: number; mood: HelperMood; hopKey: number }) {
  const { translateY } = useReactions(hopKey, undefined);
  const width = (height * OWL_VIEW.width) / OWL_VIEW.height;
  return (
    <Animated.View style={{ width, height, transform: [{ translateY }] }} accessible accessibilityRole="image" accessibilityLabel="Professor Owl">
      <Svg width={width} height={height} viewBox={OWL_VIEW.viewBox}>
        <OwlTeacher mood={mood} wingsUp={mood === 'excited'} />
      </Svg>
    </Animated.View>
  );
}

/** What the chalkboard shows for each puzzle. */
function BoardContent({ puzzle, solved, unit }: { puzzle: Puzzle; solved: boolean; unit: number }) {
  const size = 34 * unit;
  return (
    <View style={styles.board}>
      <Text style={[styles.chalk, { fontSize: 22 * unit }]}>{puzzle.prompt}</Text>
      {puzzle.kind === 'pattern' ? (
        <View style={styles.sequence}>
          {puzzle.sequence.map((token, index) => (
            <Bob key={index} delay={index * 150} duration={1400} distance={3}>
              <TokenArt token={token} size={size} />
            </Bob>
          ))}
          <View style={[styles.slot, { width: size + 10, height: size + 10 }, solved && styles.slotSolved]}>
            {solved ? (
              <PopIn>
                <TokenArt token={puzzle.options[puzzle.answer]} size={size} />
              </PopIn>
            ) : (
              <Text style={[styles.chalk, { fontSize: 26 * unit }]}>?</Text>
            )}
          </View>
        </View>
      ) : null}
      {puzzle.kind === 'count' ? (
        <View style={styles.sequence}>
          {Array.from({ length: puzzle.amount }, (_, index) => (
            <Bob key={index} delay={index * 200} duration={1500} distance={4}>
              <TokenArt token={puzzle.token} size={size * 1.25} />
            </Bob>
          ))}
        </View>
      ) : null}
      {puzzle.kind === 'odd' ? (
        <View style={styles.sequence}>
          {puzzle.items.map((token, index) => (
            <Bob key={index} delay={index * 150} duration={1400} distance={3}>
              <View style={solved && index === puzzle.answer ? styles.oddFound : undefined}>
                <TokenArt token={token} size={size * 1.15} />
              </View>
            </Bob>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function LearningCenterScreen() {
  const { recordActivity, progress } = useWorld();
  const { narrate } = useNarration();
  const [index, setIndex] = useState(0);
  const [tried, setTried] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState(`Hoot hoot! Welcome to class. ${PUZZLES[0].prompt}`);
  const [mood, setMood] = useState<HelperMood>('happy');
  const [hop, setHop] = useState(0);
  const [wobbles, setWobbles] = useState<Record<number, number>>({});
  const [firstTry, setFirstTry] = useState(0);
  const [stars, setStars] = useState(0);
  const [celebration, setCelebration] = useState<{ summary: RewardSummary; message: string } | null>(null);
  const finished = useRef(false);

  const puzzle = PUZZLES[index];
  const options = optionsOf(puzzle);
  const answer = answerOf(puzzle);

  useEffect(() => {
    narrate(message);
  }, [message, narrate]);

  const choose = (choice: number) => {
    if (solved || tried.includes(choice)) return;
    if (choice === answer) {
      setSolved(true);
      setStars((count) => count + 1);
      if (tried.length === 0) setFirstTry((count) => count + 1);
      setMood('excited');
      setHop((key) => key + 1);
      setMessage(['Hoot hoot! Brilliant!', 'Wonderful thinking!', 'You’re a super learner!', 'Owl-standing work!'][index % 4]);
      return;
    }
    setTried((items) => [...items, choice]);
    setWobbles((current) => ({ ...current, [choice]: (current[choice] ?? 0) + 1 }));
    setMood('thinking');
    setMessage(puzzle.hint);
  };

  const next = () => {
    if (index + 1 < PUZZLES.length) {
      setIndex(index + 1);
      setTried([]);
      setSolved(false);
      setMood('happy');
      setMessage(PUZZLES[index + 1].prompt);
      return;
    }
    if (finished.current) return;
    finished.current = true;
    const summary = recordActivity({
      location: 'learning',
      stars,
      coins: PROGRESSION.activityCoins,
      skills: { learning: 2 + (firstTry >= 3 ? 1 : 0), attention: 2, problemSolving: 1 },
    });
    setCelebration({ summary, message: 'Hoot hoot! You solved every puzzle on the board!' });
  };

  const stateOf = (choice: number): ChoiceState => {
    if (solved && choice === answer) return 'correct';
    if (tried.includes(choice)) return 'tried';
    return solved ? 'disabled' : 'idle';
  };

  const stage = (size: SceneSize) => {
    const { width, groundY, stageHeight } = size;
    const board = classroomBoard(size);
    const owlHeight = Math.min(stageHeight * 0.4, 170);
    const owlWidth = (owlHeight * OWL_VIEW.width) / OWL_VIEW.height;
    const kidHeight = owlHeight * 1.15;
    const kidWidth = (kidHeight * KID_VIEW.width) / KID_VIEW.height;
    const bubbleTop = board.y + board.h + 22;
    return (
      <>
        <View style={[styles.abs, { left: board.x, top: board.y, width: board.w, height: board.h }]}>
          <BoardContent puzzle={puzzle} solved={solved} unit={board.u} />
          {solved ? (
            <Twinkle style={[styles.abs, { right: 10, top: 8 }]} duration={600}>
              <GameIcon name="star" size={28} />
            </Twinkle>
          ) : null}
        </View>
        <View style={[styles.abs, { left: width * 0.04, top: groundY - owlHeight }]}>
          <OwlSprite height={owlHeight} mood={mood} hopKey={hop} />
        </View>
        <LivingKid
          width={kidWidth}
          look={PLAYER_LOOK}
          equipped={progress.equipped}
          expression={mood === 'excited' ? 'excited' : 'thinking'}
          pose={mood === 'excited' ? 'cheer' : 'rest'}
          hopKey={hop}
          accessibilityLabel="You"
          style={[styles.abs, { right: width * 0.02, top: groundY - kidHeight }]}
        />
        <View
          style={[styles.abs, styles.bubbleSlot, { left: width * 0.04 + owlWidth * 0.2, top: Math.min(bubbleTop, groundY - owlHeight - 70) }]}
          pointerEvents="box-none"
        >
          <SpeechBubble text={message} tail="bottom-left" />
        </View>
      </>
    );
  };

  return (
    <SceneScreen location="learning" backdrop={(size) => <ClassroomBackdrop {...size} />} stage={stage} score={{ value: stars, total: PUZZLES.length }} celebration={celebration}>
      <GameCard style={styles.card}>
        <Text style={[gameType.heading, styles.center]}>
          Puzzle {index + 1}/{PUZZLES.length}: {puzzle.prompt}
        </Text>
        <View style={styles.options}>
          {options.map((option, choice) => (
            <View key={`${index}-${option.key}`} style={styles.option}>
              <ChoiceTile
                state={stateOf(choice)}
                onPress={() => choose(choice)}
                accessibilityLabel={option.label}
                hopKey={solved && choice === answer ? hop : undefined}
                wobbleKey={wobbles[choice] ?? 0}
                tint={gameColors.cardTint}
              >
                {option.render(52)}
              </ChoiceTile>
            </View>
          ))}
        </View>
        {solved ? (
          <PopIn>
            <GameButton
              title={index + 1 < PUZZLES.length ? 'Next puzzle' : 'Finish'}
              ionicon="arrow-forward"
              color={gameColors.primary}
              edge={gameColors.primaryEdge}
              onPress={next}
            />
          </PopIn>
        ) : null}
      </GameCard>
    </SceneScreen>
  );
}

const styles = StyleSheet.create({
  abs: {
    position: 'absolute',
  },
  bubbleSlot: {
    right: 14,
    alignItems: 'flex-start',
  },
  card: {
    gap: 12,
  },
  center: {
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    height: 84,
  },
  number: {
    fontFamily: gameFonts.bold,
    color: gameColors.ink,
  },
  board: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 10,
  },
  chalk: {
    fontFamily: gameFonts.semibold,
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
  },
  sequence: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  slot: {
    borderRadius: 12,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSolved: {
    borderStyle: 'solid',
    borderColor: gameColors.gold,
    backgroundColor: 'rgba(255, 220, 90, 0.2)',
  },
  oddFound: {
    borderRadius: 30,
    backgroundColor: 'rgba(255, 220, 90, 0.35)',
  },
});
