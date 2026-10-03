import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg from 'react-native-svg';

import { CozyRoomBackdrop } from '@/components/world/art/Backdrops';
import { EmotionBall, FEELING_COLORS } from '@/components/world/art/EmotionBall';
import { FRIEND_LOOKS, KID_VIEW, PLAYER_LOOK, type Expression } from '@/components/world/art/KidCharacter';
import { LivingKid } from '@/components/world/motion/LivingKid';
import { PopIn } from '@/components/world/motion/Motion';
import { SceneScreen, type SceneSize } from '@/components/world/scene/SceneScreen';
import { EmotionChoice, type ChoiceState } from '@/components/world/ui/Choices';
import { GameCard } from '@/components/world/ui/GameCard';
import { GameButton } from '@/components/world/ui/GameButton';
import { SpeechBubble } from '@/components/world/ui/SpeechBubble';
import { PROGRESSION } from '@/config/worldConfig';
import { useChild } from '@/context/ChildContext';
import { useLearning } from '@/context/LearningContext';
import { useWorld } from '@/context/WorldContext';
import { BAND_SETTINGS } from '@/data/reasoningCheck';
import {
  BREATHE_FEELINGS,
  FEELINGS,
  FEELING_CUES,
  FEELING_RESPONSES,
  FEELING_SCENARIOS,
  FEELING_TO_EMOTION,
  emotionToFeeling,
  type FeelingScenario,
} from '@/data/worldActivities';
import { useNarration } from '@/hooks/useNarration';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { gameColors, gameType } from '@/theme';
import type { Emotion } from '@/types/emotion';
import type { QuestionResult } from '@/types/learning';
import type { FeelingId, RewardSummary } from '@/types/world';
import { lighten } from '@/utils/color';
import { createId, createRandom, shuffle } from '@/utils/random';
import { scoreAttempt } from '@/utils/scoring';

const ROUNDS = 3;
const MAX_TRIES = 2;
/** At most this many rounds target the child's weak feelings, so play stays varied. */
const MAX_FOCUS_ROUNDS = 2;

/** Only called from event handlers, never during render. */
const now = () => Date.now();
const msSince = (start: number) => (start > 0 ? now() - start : undefined);

/** Picks the friends to help, favouring feelings the child is still learning. */
function pickScenarios(focus: Emotion[]): FeelingScenario[] {
  const random = createRandom(Date.now());
  const focusFeelings = focus.map(emotionToFeeling).filter((id): id is FeelingId => id !== null);
  const all = shuffle(FEELING_SCENARIOS, random);
  const targeted = all.filter((item) => focusFeelings.includes(item.feeling)).slice(0, MAX_FOCUS_ROUNDS);
  const rest = all.filter((item) => !targeted.includes(item));
  return shuffle([...targeted, ...rest.slice(0, ROUNDS - targeted.length)], random);
}

/** A feeling face with its name and clue, used by the in-scene teaching card. */
function FeelingClue({ feeling, title, highlight }: { feeling: FeelingId; title: string; highlight?: boolean }) {
  return (
    <View style={[styles.clue, highlight && styles.clueHighlight, { borderColor: highlight ? gameColors.green : lighten(FEELING_COLORS[feeling], 0.4) }]}>
      <Text style={styles.clueTitle}>{title}</Text>
      <Svg width={54} height={54} viewBox="0 0 100 100">
        <EmotionBall feeling={feeling} />
      </Svg>
      <Text style={styles.clueLabel}>{labelOf(feeling)}</Text>
      <Text style={styles.clueText}>{FEELING_CUES[feeling]}</Text>
    </View>
  );
}

type Phase =
  | { kind: 'checkin' }
  | { kind: 'response'; feeling: FeelingId }
  | { kind: 'breathe'; feeling: FeelingId }
  | { kind: 'detective'; round: number };

const EXPRESSION: Record<FeelingId, Expression> = {
  happy: 'happy',
  sad: 'sad',
  angry: 'angry',
  worried: 'worried',
  calm: 'calm',
};

const labelOf = (feeling: FeelingId) => FEELINGS.find((item) => item.id === feeling)?.label ?? feeling;

/** A slow grow-and-shrink circle to breathe along with. */
function BreathingBubble({ size }: { size: number }) {
  const reduceMotion = useReduceMotion();
  const [t] = useState(() => new Animated.Value(0));
  const [inhale, setInhale] = useState(true);
  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    const timer = setInterval(() => setInhale((value) => !value), 4000);
    return () => {
      loop.stop();
      clearInterval(timer);
    };
  }, [t, reduceMotion]);
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  return (
    <View style={[styles.breathe, { width: size, height: size }]}>
      <Animated.View style={[styles.breatheRing, { width: size, height: size, borderRadius: size / 2, transform: [{ scale }] }]} />
      <Animated.View style={[styles.breatheCore, { width: size * 0.7, height: size * 0.7, borderRadius: size, transform: [{ scale }] }]} />
      <Text style={styles.breatheText} accessibilityLiveRegion="polite">
        {reduceMotion ? 'Breathe slowly' : inhale ? 'Breathe in…' : 'Breathe out…'}
      </Text>
    </View>
  );
}

export default function FeelingsHouseScreen() {
  const { child } = useChild();
  const { recordFeeling, recordActivity, progress } = useWorld();
  const { insights, ensureGameSession, recordResults, finishSession } = useLearning();
  const { narrate } = useNarration();
  const [phase, setPhase] = useState<Phase>({ kind: 'checkin' });
  const [mood, setMood] = useState<FeelingId | null>(null);
  const [scenarios] = useState<FeelingScenario[]>(() => pickScenarios(insights.weakEmotions));
  const [wrong, setWrong] = useState<FeelingId[]>([]);
  const [solved, setSolved] = useState(false);
  /** The wrong pick NUMU is currently teaching about (null when not teaching). */
  const [teaching, setTeaching] = useState<FeelingId | null>(null);
  const roundStartedAt = useRef(0);
  const recordedCount = useRef(0);
  const sessionClosed = useRef(false);
  const finishSessionRef = useRef(finishSession);
  useEffect(() => {
    finishSessionRef.current = finishSession;
  }, [finishSession]);

  // Learning happens inside the world: every visit is a quiet learning session.
  useEffect(() => {
    ensureGameSession();
    return () => {
      // Leaving early still saves what the child practised.
      if (!sessionClosed.current && recordedCount.current > 0) finishSessionRef.current();
    };
  }, [ensureGameSession]);
  const [firstTry, setFirstTry] = useState(0);
  const [stars, setStars] = useState(0);
  const [avatarHop, setAvatarHop] = useState(0);
  const [friendHop, setFriendHop] = useState(0);
  const [friendWobble, setFriendWobble] = useState(0);
  const [celebration, setCelebration] = useState<{ summary: RewardSummary; message: string } | null>(null);
  const finished = useRef(false);

  const scenario = phase.kind === 'detective' ? scenarios[phase.round] : null;
  const band = child?.reasoningCheck?.band ?? 'emerging';
  const targetChoices = BAND_SETTINGS[band]?.feelingOptions ?? 3;

  const options = useMemo(() => {
    if (!scenario) return [];
    const random = createRandom(`${scenario.story}-${phase.kind === 'detective' ? phase.round : 0}`);
    const others = shuffle(
      FEELINGS.map((item) => item.id).filter((id) => id !== scenario.feeling),
      random,
    ).slice(0, Math.max(1, targetChoices - 1));
    return shuffle([scenario.feeling, ...others], random);
  }, [scenario, phase, targetChoices]);

  const bubble = (() => {
    switch (phase.kind) {
      case 'checkin':
        return 'How are you feeling today?';
      case 'response':
        return FEELING_RESPONSES[phase.feeling];
      case 'breathe':
        return 'Let’s breathe together. In through your nose… and slowly out.';
      case 'detective': {
        if (!scenario) return '';
        const label = labelOf(scenario.feeling).toLowerCase();
        if (solved && wrong.length === 0) return `Yes! ${scenario.name} feels ${label}. ${scenario.because}`;
        if (solved && wrong.length < MAX_TRIES) return `You got it! ${scenario.name} feels ${label}. ${scenario.because}`;
        if (solved) return `Let’s learn this one together. ${scenario.name} feels ${label}. ${scenario.because}`;
        if (teaching) {
          return `That’s the ${labelOf(teaching).toLowerCase()} face. ${FEELING_CUES[teaching]} Now look at ${scenario.name}. ${scenario.because} Which feeling looks like that?`;
        }
        return `${scenario.story} How does ${scenario.name} feel?`;
      }
    }
  })();

  useEffect(() => {
    narrate(bubble);
  }, [bubble, narrate]);

  const chooseMood = (feeling: FeelingId) => {
    setMood(feeling);
    recordFeeling(feeling);
    setStars(1);
    setAvatarHop((key) => key + 1);
    setPhase({ kind: 'response', feeling });
  };

  const startDetective = () => {
    setWrong([]);
    setSolved(false);
    setTeaching(null);
    roundStartedAt.current = Date.now();
    setPhase({ kind: 'detective', round: 0 });
  };

  /** Saves the round to the learning engine so parents see progress from the world. */
  const recordRound = (current: FeelingScenario, wrongs: FeelingId[], solvedByChild: boolean) => {
    const attempts = wrongs.length + (solvedByChild ? 1 : 0);
    const usedCoaching = wrongs.length > 0;
    const result: QuestionResult = {
      questionId: createId('world-feelings'),
      questionType: 'situation',
      expectedEmotion: FEELING_TO_EMOTION[current.feeling],
      selectedEmotion: FEELING_TO_EMOTION[wrongs[0] ?? current.feeling],
      wrongSelections: wrongs.map((id) => FEELING_TO_EMOTION[id]),
      correct: wrongs.length === 0,
      solved: solvedByChild,
      attempts,
      usedCoaching,
      points: scoreAttempt({ solved: solvedByChild, attempts, usedCoaching }),
      responseTimeMs: msSince(roundStartedAt.current),
      timestamp: new Date().toISOString(),
      source: 'practice',
    };
    ensureGameSession();
    recordResults([result]);
    recordedCount.current += 1;
  };

  const guess = (feeling: FeelingId) => {
    if (!scenario || solved || teaching || wrong.includes(feeling)) return;
    if (feeling === scenario.feeling) {
      setSolved(true);
      setFriendHop((key) => key + 1);
      if (wrong.length === 0) {
        setFirstTry((count) => count + 1);
        setStars((count) => count + 1);
      }
      recordRound(scenario, wrong, true);
      return;
    }
    const next = [...wrong, feeling];
    setWrong(next);
    setFriendWobble((key) => key + 1);
    // Teach right here in the scene instead of moving on.
    setTeaching(feeling);
    if (next.length >= MAX_TRIES) {
      setSolved(true);
      recordRound(scenario, next, false);
    }
  };

  const tryAgain = () => {
    setTeaching(null);
  };

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    if (recordedCount.current > 0) {
      sessionClosed.current = true;
      finishSession();
    }
    const summary = recordActivity({
      location: 'feelings',
      stars,
      coins: PROGRESSION.activityCoins,
      skills: { emotions: 1 + firstTry },
    });
    setCelebration({ summary, message: 'Thank you for sharing your feelings and helping your friends!' });
  };

  const nextRound = () => {
    if (phase.kind !== 'detective') return;
    if (phase.round + 1 >= ROUNDS) {
      finish();
      return;
    }
    setWrong([]);
    setSolved(false);
    setTeaching(null);
    roundStartedAt.current = Date.now();
    setPhase({ kind: 'detective', round: phase.round + 1 });
  };

  const choiceState = (feeling: FeelingId): ChoiceState => {
    if (!scenario) return mood === feeling ? 'selected' : 'idle';
    if (solved && feeling === scenario.feeling) return 'correct';
    if (wrong.includes(feeling)) return 'tried';
    return solved ? 'disabled' : 'idle';
  };

  const avatarExpression: Expression =
    phase.kind === 'breathe' ? 'calm' : mood && phase.kind === 'response' ? EXPRESSION[mood] : phase.kind === 'detective' ? 'thinking' : 'happy';
  const friendExpression: Expression = scenario ? EXPRESSION[scenario.feeling] : 'happy';

  const stage = ({ width, groundY, stageTop, stageHeight }: SceneSize) => {
    const height = Math.min(stageHeight * 0.66, 310);
    const kidWidth = (height * KID_VIEW.width) / KID_VIEW.height;
    const withFriend = Boolean(scenario);
    return (
      <>
        <LivingKid
          width={kidWidth}
          look={PLAYER_LOOK}
          equipped={progress.equipped}
          expression={avatarExpression}
          pose={phase.kind === 'response' && mood === 'happy' ? 'cheer' : 'rest'}
          hopKey={avatarHop}
          accessibilityLabel="You"
          style={[styles.abs, { left: width * (withFriend ? 0.27 : 0.36) - kidWidth / 2, top: groundY - height }]}
        />
        {scenario ? (
          <PopIn key={phase.kind === 'detective' ? phase.round : 0} style={[styles.abs, { left: width * 0.73 - kidWidth / 2, top: groundY - height }]}>
            <LivingKid
              width={kidWidth}
              look={FRIEND_LOOKS[scenario.friend]}
              expression={friendExpression}
              pose={solved && wrong.length < MAX_TRIES && scenario.feeling === 'happy' ? 'cheer' : 'rest'}
              hopKey={friendHop}
              wobbleKey={friendWobble}
              breatheDelay={400}
              accessibilityLabel={`${scenario.name} looks ${labelOf(scenario.feeling).toLowerCase()}`}
            />
          </PopIn>
        ) : null}
        <View style={[styles.abs, styles.bubbleSlot, { top: stageTop + 6 }]} pointerEvents="box-none">
          {phase.kind === 'breathe' ? (
            <BreathingBubble size={Math.min(stageHeight * 0.36, 170)} />
          ) : (
            <SpeechBubble text={bubble} tail={withFriend ? 'bottom-right' : 'bottom-left'} large={phase.kind === 'checkin'} />
          )}
        </View>
      </>
    );
  };

  return (
    <SceneScreen
      location="feelings"
      backdrop={(size) => <CozyRoomBackdrop {...size} />}
      stage={stage}
      score={{ value: stars, total: ROUNDS + 1 }}
      celebration={celebration}
    >
      {phase.kind === 'checkin' ? (
        <GameCard style={styles.card}>
          <Text style={[gameType.title, styles.center]}>How are you feeling today?</Text>
          <View style={styles.choices}>
            {FEELINGS.map((item, index) => (
              <EmotionChoice key={item.id} feeling={item.id} label={item.label} delay={index * 160} onPress={() => chooseMood(item.id)} />
            ))}
          </View>
        </GameCard>
      ) : null}

      {phase.kind === 'response' ? (
        <GameCard style={styles.card} tint={lighten(FEELING_COLORS[phase.feeling], 0.85)}>
          <Text style={[gameType.title, styles.center]}>You feel {labelOf(phase.feeling).toLowerCase()}</Text>
          <Text style={[gameType.body, styles.center]}>Every feeling is okay. Thank you for telling me!</Text>
          <View style={styles.row}>
            {BREATHE_FEELINGS.includes(phase.feeling) ? (
              <GameButton
                title="Breathe with me"
                color={gameColors.sky}
                edge={gameColors.skyEdge}
                onPress={() => setPhase({ kind: 'breathe', feeling: phase.feeling })}
                style={styles.flex}
              />
            ) : null}
            <GameButton title="Next" ionicon="arrow-forward" onPress={startDetective} style={styles.flex} />
          </View>
        </GameCard>
      ) : null}

      {phase.kind === 'breathe' ? (
        <GameCard style={styles.card}>
          <Text style={[gameType.body, styles.center]}>Watch the bubble. Breathe in as it grows, and out as it shrinks.</Text>
          <GameButton title="I feel better" ionicon="happy" onPress={startDetective} />
        </GameCard>
      ) : null}

      {phase.kind === 'detective' && scenario && teaching ? (
        <PopIn key={`teach-${phase.round}-${wrong.length}`}>
          <GameCard style={styles.card} tint={lighten(gameColors.sky, 0.86)}>
            <Text style={[gameType.heading, styles.center]}>
              {solved ? `Let’s learn: ${scenario.name} feels ${labelOf(scenario.feeling).toLowerCase()}` : 'Let’s look closer!'}
            </Text>
            <View style={styles.row}>
              <FeelingClue feeling={teaching} title="You picked" />
              {solved ? (
                <FeelingClue feeling={scenario.feeling} title={`${scenario.name} feels`} highlight />
              ) : (
                <View style={[styles.clue, styles.friendClue]}>
                  <Text style={styles.clueTitle}>{scenario.name}’s face</Text>
                  <Text style={styles.clueBig}>🔍</Text>
                  <Text style={styles.clueText}>{scenario.because}</Text>
                </View>
              )}
            </View>
            {solved ? (
              <GameButton title={phase.round + 1 >= ROUNDS ? 'Finish' : 'Next friend'} ionicon="arrow-forward" onPress={nextRound} />
            ) : (
              <GameButton
                title="Try again"
                ionicon="refresh"
                color={gameColors.sky}
                edge={gameColors.skyEdge}
                onPress={tryAgain}
              />
            )}
          </GameCard>
        </PopIn>
      ) : null}

      {phase.kind === 'detective' && scenario && !teaching ? (
        <GameCard style={styles.card}>
          <Text style={[gameType.heading, styles.center]}>
            Feeling detective {phase.round + 1}/{ROUNDS}: how does {scenario.name} feel?
          </Text>
          <View style={styles.choices}>
            {options.map((feeling, index) => (
              <EmotionChoice
                key={feeling}
                feeling={feeling}
                label={labelOf(feeling)}
                size={66}
                delay={index * 160}
                state={choiceState(feeling)}
                hopKey={solved && feeling === scenario.feeling ? friendHop : undefined}
                wobbleKey={wrong.includes(feeling) ? wrong.length : undefined}
                onPress={() => guess(feeling)}
              />
            ))}
          </View>
          {solved ? (
            <GameButton title={phase.round + 1 >= ROUNDS ? 'Finish' : 'Next friend'} ionicon="arrow-forward" onPress={nextRound} />
          ) : null}
        </GameCard>
      ) : null}
    </SceneScreen>
  );
}

const styles = StyleSheet.create({
  abs: {
    position: 'absolute',
  },
  bubbleSlot: {
    left: 14,
    right: 14,
    alignItems: 'center',
  },
  card: {
    gap: 12,
  },
  center: {
    textAlign: 'center',
  },
  choices: {
    flexDirection: 'row',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  clue: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    padding: 10,
    borderRadius: 18,
    borderWidth: 3,
    backgroundColor: gameColors.white,
  },
  clueHighlight: {
    backgroundColor: '#E8F9F0',
  },
  friendClue: {
    borderColor: gameColors.gold,
    backgroundColor: '#FFF8E1',
  },
  clueTitle: {
    ...gameType.label,
    color: gameColors.inkFaint,
    textAlign: 'center',
  },
  clueLabel: {
    ...gameType.heading,
    fontSize: 16,
    textAlign: 'center',
  },
  clueBig: {
    fontSize: 40,
    lineHeight: 54,
  },
  clueText: {
    ...gameType.body,
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  flex: {
    flex: 1,
  },
  breathe: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  breatheRing: {
    position: 'absolute',
    backgroundColor: 'rgba(124, 200, 255, 0.35)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  breatheCore: {
    position: 'absolute',
    backgroundColor: 'rgba(124, 200, 255, 0.55)',
  },
  breatheText: {
    ...gameType.title,
    color: gameColors.white,
    textShadowColor: 'rgba(30, 60, 120, 0.5)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
});
