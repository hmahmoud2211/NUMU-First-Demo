import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';

import { GameIcon, SKILL_ICONS } from '@/components/world/art/Icons';
import { PopIn } from '@/components/world/motion/Motion';
import { GameCard, GameProgressBar } from '@/components/world/ui/GameCard';
import { GameButton } from '@/components/world/ui/GameButton';
import { QUESTS, SKILLS } from '@/config/worldConfig';
import { useLoop } from '@/hooks/useLoop';
import { useNarration } from '@/hooks/useNarration';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { skillRatio } from '@/services/worldEngine';
import { gameColors, gameFonts, gameType } from '@/theme';
import type { RewardSummary, SkillId } from '@/types/world';

const CONFETTI_COLORS = ['#FF5C8A', '#FFD43B', '#38B0FF', '#3CCB7F', '#9B5CFF', '#FF9F1C'];

function ConfettiPiece({ index, height }: { index: number; height: number }) {
  const t = useLoop(2600 + (index % 5) * 380, { pingPong: false, delay: (index * 170) % 1200 });
  const left = `${(index * 37) % 100}%` as const;
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [-40, height + 40] });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${index % 2 ? 540 : -540}deg`] });
  const translateX = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, index % 2 ? 24 : -24, 0] });
  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          left,
          backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
          width: index % 3 === 0 ? 8 : 12,
          height: index % 3 === 0 ? 14 : 8,
          transform: [{ translateY }, { translateX }, { rotate }],
        },
      ]}
    />
  );
}

function Sunburst({ size }: { size: number }) {
  const spin = useLoop(14000, { pingPong: false });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rays = Array.from({ length: 12 }, (_, index) => index * 30);
  return (
    <Animated.View style={[styles.sunburst, { width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, transform: [{ rotate }] }]}>
      <Svg width={size} height={size} viewBox="-100 -100 200 200">
        <Defs>
          <RadialGradient id="numu-burst" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFF6C2" stopOpacity={0.95} />
            <Stop offset="1" stopColor="#FFE07A" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <G>
          {rays.map((deg) => (
            <Path key={deg} d="M-9 0 L0 -100 L9 0Z" fill="url(#numu-burst)" transform={`rotate(${deg})`} />
          ))}
        </G>
      </Svg>
    </Animated.View>
  );
}

/** Skill bars start at the old value and grow to the new one. */
function SkillGain({ skill, before, after }: { skill: SkillId; before: number; after: number }) {
  const [value, setValue] = useState(skillRatio(before));
  useEffect(() => {
    const timer = setTimeout(() => setValue(skillRatio(after)), 650);
    return () => clearTimeout(timer);
  }, [after]);
  const config = SKILLS.find((item) => item.id === skill);
  if (!config) return null;
  return (
    <View style={styles.skillRow}>
      <GameIcon name={SKILL_ICONS[skill]} size={26} color={config.color} />
      <View style={styles.flex}>
        <View style={styles.skillHeader}>
          <Text style={styles.skillLabel}>{config.label}</Text>
          <Text style={[styles.skillLabel, { color: config.color }]}>+{after - before}</Text>
        </View>
        <GameProgressBar value={value} color={config.color} height={12} accessibilityLabel={`${config.label} progress`} />
      </View>
    </View>
  );
}

function titleFor(stars: number): string {
  if (stars >= 3) return 'Amazing!';
  if (stars >= 2) return 'Great job!';
  return 'Well done!';
}

type RewardCelebrationProps = {
  summary: RewardSummary;
  message?: string;
  onContinue: () => void;
};

/** Immediate feedback after a mini-game: stars, coins, quest, level and skill growth. */
export function RewardCelebration({ summary, message, onContinue }: RewardCelebrationProps) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const { narrate } = useNarration();
  const [fade] = useState(() => new Animated.Value(0));
  const title = titleFor(summary.stars);
  const quest = summary.quest ? QUESTS.find((item) => item.id === summary.quest) : null;
  const leveledUp = summary.levelAfter > summary.levelBefore;
  const gains = useMemo(
    () => (Object.keys(summary.skills) as SkillId[]).filter((id) => summary.skillsAfter[id] > summary.skillsBefore[id]),
    [summary],
  );

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: reduceMotion ? 0 : 300, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    narrate(`${title} You earned ${summary.stars + summary.questBonusStars} stars!${message ? ` ${message}` : ''}`);
    // Narrate once when the celebration appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: fade }]} accessibilityViewIsModal>
      {reduceMotion ? null : (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {Array.from({ length: 16 }, (_, index) => (
            <ConfettiPiece key={index} index={index} height={height} />
          ))}
        </View>
      )}
      <View style={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.hero}>
          <Sunburst size={Math.min(width, 420)} />
          <PopIn>
            <GameIcon name="star" size={96} />
          </PopIn>
          <PopIn delay={120}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
          </PopIn>
        </View>

        <PopIn delay={240} style={styles.cardWrap}>
          <GameCard style={styles.card}>
            {message ? <Text style={[gameType.body, styles.center]}>{message}</Text> : null}
            <View style={styles.totals}>
              <View style={styles.total}>
                <GameIcon name="star" size={40} />
                <Text style={styles.totalText}>+{summary.stars}</Text>
              </View>
              <View style={styles.total}>
                <GameIcon name="coin" size={40} />
                <Text style={styles.totalText}>+{summary.coins}</Text>
              </View>
            </View>

            {quest ? (
              <View style={styles.ribbon}>
                <GameIcon name="scroll" size={28} />
                <View style={styles.flex}>
                  <Text style={styles.ribbonTitle}>Quest complete!</Text>
                  <Text style={gameType.small}>{quest.title}</Text>
                </View>
                <Text style={styles.ribbonBonus}>+{summary.questBonusStars}</Text>
                <GameIcon name="star" size={20} />
              </View>
            ) : null}

            {leveledUp ? (
              <View style={[styles.ribbon, styles.levelRibbon]}>
                <GameIcon name="trophy" size={28} />
                <Text style={[styles.ribbonTitle, styles.flex]}>Level up! You are now level {summary.levelAfter}</Text>
              </View>
            ) : null}

            {gains.map((skill) => (
              <SkillGain key={skill} skill={skill} before={summary.skillsBefore[skill]} after={summary.skillsAfter[skill]} />
            ))}
          </GameCard>
        </PopIn>

        <PopIn delay={420}>
          <GameButton title="Back to Town" ionicon="map" size="lg" color={gameColors.green} edge={gameColors.greenEdge} onPress={onContinue} />
        </PopIn>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(32, 22, 86, 0.72)',
  },
  confetti: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 14,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
  },
  sunburst: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  title: {
    fontFamily: gameFonts.bold,
    fontSize: 42,
    color: gameColors.white,
    textAlign: 'center',
    textShadowColor: '#5B3FD6',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 0.1,
  },
  cardWrap: {
    width: '100%',
  },
  card: {
    gap: 12,
  },
  center: {
    textAlign: 'center',
  },
  totals: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
  },
  total: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalText: {
    ...gameType.title,
    fontSize: 28,
  },
  ribbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#FFF6D6',
  },
  levelRibbon: {
    backgroundColor: '#EEE8FF',
  },
  ribbonTitle: {
    ...gameType.heading,
    fontSize: 15,
  },
  ribbonBonus: {
    ...gameType.number,
    color: gameColors.goldEdge,
  },
  flex: {
    flex: 1,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  skillLabel: {
    ...gameType.label,
    fontFamily: gameType.number.fontFamily,
    color: gameColors.ink,
  },
});
