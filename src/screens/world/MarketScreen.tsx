import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { MarketBackdrop } from '@/components/world/art/Backdrops';
import { GROCER_VIEW, Grocer, type HelperMood } from '@/components/world/art/Characters';
import { FoodArt, type FoodId } from '@/components/world/art/Foods';
import { Bob, PopIn } from '@/components/world/motion/Motion';
import { useReactions } from '@/components/world/motion/LivingKid';
import { SceneScreen, type SceneSize } from '@/components/world/scene/SceneScreen';
import { ChoiceTile, type ChoiceState } from '@/components/world/ui/Choices';
import { GameButton } from '@/components/world/ui/GameButton';
import { SpeechBubble } from '@/components/world/ui/SpeechBubble';
import { PROGRESSION } from '@/config/worldConfig';
import { useWorld } from '@/context/WorldContext';
import { FOODS, MARKET_ROUNDS } from '@/data/worldActivities';
import { useNarration } from '@/hooks/useNarration';
import { gameColors, gameShadow, gameType } from '@/theme';
import type { RewardSummary } from '@/types/world';

const TOTAL_STARS = MARKET_ROUNDS.reduce((sum, round) => sum + round.count, 0);

function Basket({ items, width }: { items: FoodId[]; width: number }) {
  const height = width * 0.62;
  return (
    <View style={{ width, height }}>
      <View style={[styles.basketItems, { left: width * 0.12, right: width * 0.12, bottom: height * 0.45 }]}>
        {items.map((id, index) => (
          <PopIn key={`${id}-${index}`} style={{ marginHorizontal: -width * 0.04 }}>
            <Svg width={width * 0.36} height={width * 0.36} viewBox="0 0 100 100">
              <FoodArt id={id} shadow={false} />
            </Svg>
          </PopIn>
        ))}
      </View>
      <Svg width={width} height={height} viewBox="0 0 100 62" style={StyleSheet.absoluteFill}>
        <Path d="M22 22 C22 2 78 2 78 22" stroke="#B9783E" strokeWidth={4} fill="none" />
        <Path d="M6 26 L94 26 L84 60 L16 60Z" fill="#D9A15B" />
        <Path d="M10 34 L90 34 M13 43 L87 43 M15 52 L85 52" stroke="#B9783E" strokeWidth={2} />
        <Path d="M30 26 L32 60 M50 26 L50 60 M70 26 L68 60" stroke="#C48A4A" strokeWidth={2} />
        <Path d="M4 24 L96 24 L94 30 L6 30Z" fill="#B9783E" />
      </Svg>
    </View>
  );
}

function GrocerSprite({ width, mood, waving, hopKey }: { width: number; mood: HelperMood; waving: boolean; hopKey: number }) {
  const { translateY } = useReactions(hopKey, undefined);
  const height = (width * GROCER_VIEW.height) / GROCER_VIEW.width;
  return (
    <Animated.View style={{ width, height, transform: [{ translateY }] }} accessible accessibilityRole="image" accessibilityLabel="The friendly grocer">
      <Svg width={width} height={height} viewBox={GROCER_VIEW.viewBox}>
        <Grocer mood={mood} waving={waving} />
      </Svg>
    </Animated.View>
  );
}

function Crate({ id, state, onPress, wobbleKey }: { id: FoodId; state: ChoiceState; onPress: () => void; wobbleKey: number }) {
  return (
    <ChoiceTile
      state={state}
      onPress={onPress}
      accessibilityLabel={FOODS[id].label}
      wobbleKey={wobbleKey}
      hopKey={state === 'correct' ? 1 : 0}
      tint={state === 'correct' ? '#E8F9F0' : '#F3D3A4'}
      style={styles.crate}
    >
      <View style={styles.crateSlats} />
      <Svg width={58} height={58} viewBox="0 0 100 100">
        <FoodArt id={id} />
      </Svg>
      {state === 'correct' ? (
        <View style={styles.check}>
          <Svg width={14} height={14} viewBox="0 0 12 12">
            <Path d="M2 6.5 L5 9 L10 3" stroke="#FFFFFF" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      ) : null}
    </ChoiceTile>
  );
}

export default function MarketScreen() {
  const { recordActivity } = useWorld();
  const { narrate } = useNarration();
  const [roundIndex, setRoundIndex] = useState(0);
  const [collected, setCollected] = useState<FoodId[]>([]);
  const [basket, setBasket] = useState<FoodId[]>([]);
  const [tried, setTried] = useState<FoodId[]>([]);
  const [wobbles, setWobbles] = useState<Partial<Record<FoodId, number>>>({});
  const [wrongTaps, setWrongTaps] = useState(0);
  const [message, setMessage] = useState(MARKET_ROUNDS[0].prompt);
  const [mood, setMood] = useState<HelperMood>('happy');
  const [hop, setHop] = useState(0);
  const [celebration, setCelebration] = useState<{ summary: RewardSummary; message: string } | null>(null);
  const finished = useRef(false);

  const round = MARKET_ROUNDS[roundIndex];
  const roundDone = collected.length >= round.count;
  const stars = basket.length;

  useEffect(() => {
    narrate(message);
  }, [message, narrate]);

  const tap = (id: FoodId) => {
    if (roundDone || collected.includes(id) || tried.includes(id)) return;
    const food = FOODS[id];
    const is = food.plural ? 'are' : 'is';
    if (food.kind === round.target) {
      const next = [...collected, id];
      setCollected(next);
      setBasket((items) => [...items, id]);
      setMood('excited');
      setHop((key) => key + 1);
      if (next.length >= round.count) {
        setMessage(roundIndex === 0 ? 'Thank you! Those fruits are so healthy!' : 'My soup will be delicious. Thank you!');
      } else {
        setMessage(`Yummy! The ${food.label} ${is} a healthy ${round.target}! ${round.count - next.length} more to go.`);
      }
      return;
    }
    setTried((items) => [...items, id]);
    setWrongTaps((count) => count + 1);
    setWobbles((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
    setMood('thinking');
    setMessage(
      food.kind === 'treat'
        ? `The ${food.label} ${is} a treat for sometimes. Can you find a ${round.target}?`
        : `The ${food.label} ${is} healthy too, but ${food.plural ? 'they’re' : 'it’s'} a ${food.kind}. Can you find a ${round.target}?`,
    );
  };

  const next = () => {
    if (roundIndex + 1 < MARKET_ROUNDS.length) {
      const upcoming = MARKET_ROUNDS[roundIndex + 1];
      setRoundIndex(roundIndex + 1);
      setCollected([]);
      setTried([]);
      setMood('happy');
      setMessage(upcoming.prompt);
      return;
    }
    if (finished.current) return;
    finished.current = true;
    const summary = recordActivity({
      location: 'market',
      stars,
      coins: PROGRESSION.activityCoins,
      skills: { problemSolving: 2 + (wrongTaps === 0 ? 1 : 0), attention: wrongTaps <= 1 ? 2 : 1 },
    });
    setCelebration({ summary, message: 'You filled my basket with healthy food!' });
  };

  const stateOf = (id: FoodId): ChoiceState => {
    if (collected.includes(id)) return 'correct';
    if (tried.includes(id)) return 'tried';
    return roundDone ? 'disabled' : 'idle';
  };

  const stage = ({ width, groundY, stageTop, stageHeight }: SceneSize) => {
    const counterTop = groundY - 8;
    const grocerWidth = Math.min(stageHeight * 0.62, 270) * (GROCER_VIEW.width / GROCER_VIEW.height);
    const grocerHeight = (grocerWidth * GROCER_VIEW.height) / GROCER_VIEW.width;
    const basketWidth = Math.min(width * 0.34, 150);
    return (
      <>
        <View style={[styles.abs, { left: width * 0.3 - grocerWidth / 2, top: counterTop - grocerHeight + 10 }]}>
          <GrocerSprite width={grocerWidth} mood={mood} waving={mood !== 'thinking' && collected.length === 0} hopKey={hop} />
        </View>
        <View style={[styles.counterLip, { top: counterTop - 6, height: 14 }]} />
        <View style={[styles.counterFront, { top: counterTop + 8 }]} />
        <Bob duration={2000} distance={3} style={[styles.abs, { left: width * 0.78 - basketWidth / 2, top: counterTop - basketWidth * 0.62 + 6 }]}>
          <Basket items={basket} width={basketWidth} />
        </Bob>
        <View style={[styles.abs, styles.bubbleSlot, { top: stageTop + 6, maxHeight: stageHeight * 0.4 }]} pointerEvents="box-none">
          <SpeechBubble text={message} tail="bottom-left" large={!roundDone && collected.length === 0 && tried.length === 0} />
        </View>
      </>
    );
  };

  return (
    <SceneScreen location="market" backdrop={(size) => <MarketBackdrop {...size} />} stage={stage} score={{ value: stars, total: TOTAL_STARS }} celebration={celebration}>
      <View style={styles.panel}>
        <View style={[styles.goal, gameShadow.soft]}>
          <Text style={styles.goalText}>
            Find {round.count} {round.target === 'fruit' ? 'fruits' : 'vegetables'}
          </Text>
          <View style={styles.dots}>
            {Array.from({ length: round.count }, (_, index) => (
              <View key={index} style={[styles.dot, index < collected.length && styles.dotOn]} />
            ))}
          </View>
        </View>
        <View style={styles.grid}>
          {round.items.map((id) => (
            <View key={`${roundIndex}-${id}`} style={styles.cell}>
              <Crate id={id} state={stateOf(id)} onPress={() => tap(id)} wobbleKey={wobbles[id] ?? 0} />
            </View>
          ))}
        </View>
        {roundDone ? (
          <PopIn>
            <GameButton
              title={roundIndex + 1 < MARKET_ROUNDS.length ? 'Next order' : 'Finish'}
              ionicon="arrow-forward"
              color={gameColors.orange}
              edge={gameColors.orangeEdge}
              onPress={next}
            />
          </PopIn>
        ) : null}
      </View>
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
    alignItems: 'flex-end',
  },
  counterLip: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#E6B37A',
  },
  counterFront: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#C98C52',
  },
  basketItems: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  panel: {
    gap: 10,
  },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  goalText: {
    ...gameType.heading,
    fontSize: 15,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: gameColors.track,
    borderWidth: 2,
    borderColor: gameColors.cardEdge,
  },
  dotOn: {
    backgroundColor: gameColors.green,
    borderColor: gameColors.greenEdge,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    width: '23%',
    flexGrow: 1,
    aspectRatio: 0.95,
  },
  crate: {
    flex: 1,
  },
  crateSlats: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 10,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(160, 100, 50, 0.25)',
  },
  check: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: gameColors.green,
    borderWidth: 2,
    borderColor: gameColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
