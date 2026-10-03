import { useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { GameIcon, LOCATION_ICONS, SKILL_ICONS, type IconName } from '@/components/world/art/Icons';
import { RewardArt } from '@/components/world/art/RewardItems';
import { LivingKid, useReactions } from '@/components/world/motion/LivingKid';
import { PLAYER_LOOK } from '@/components/world/art/KidCharacter';
import { AvatarBadge } from '@/components/world/hud/WorldHud';
import { CurrencyPill, GameCard, GameProgressBar } from '@/components/world/ui/GameCard';
import { GameButton } from '@/components/world/ui/GameButton';
import { Sheet } from '@/components/world/ui/Sheet';
import { SpeechBubble } from '@/components/world/ui/SpeechBubble';
import { ACHIEVEMENTS, LOCATIONS, PROGRESSION, QUESTS, REWARDS, SKILLS, type RewardConfig } from '@/config/worldConfig';
import { useWorld } from '@/context/WorldContext';
import { canAfford, levelProgress, skillRatio, skillStage } from '@/services/worldEngine';
import { gameColors, gameType } from '@/theme';
import type { LocationId } from '@/types/world';
import { darken, lighten } from '@/utils/color';

export type JourneyTab = 'progress' | 'quests' | 'rewards';

const TABS: { id: JourneyTab; label: string; icon: IconName }[] = [
  { id: 'progress', label: 'My Progress', icon: 'star' },
  { id: 'quests', label: 'Quests', icon: 'scroll' },
  { id: 'rewards', label: 'Rewards', icon: 'gift' },
];

function Check({ size = 14 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      <Path d="M2 6.5 L5 9 L10 3" stroke="#FFFFFF" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function relativeDay(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function ProgressTab() {
  const { progress } = useWorld();
  return (
    <View style={styles.tabBody}>
      <GameCard style={styles.cardGap}>
        <SectionTitle>My Skills</SectionTitle>
        {SKILLS.map((skill) => {
          const points = progress.skills[skill.id];
          return (
            <View key={skill.id} style={styles.skillRow}>
              <View style={[styles.iconTile, { backgroundColor: lighten(skill.color, 0.82) }]}>
                <GameIcon name={SKILL_ICONS[skill.id]} size={30} color={skill.color} />
              </View>
              <View style={styles.flex}>
                <View style={styles.skillHeader}>
                  <Text style={styles.skillLabel}>{skill.label}</Text>
                  <Text style={styles.skillStage}>
                    {skillStage(points)}/{PROGRESSION.skillStages}
                  </Text>
                </View>
                <GameProgressBar value={skillRatio(points)} color={skill.color} height={14} accessibilityLabel={`${skill.label} progress`} />
              </View>
            </View>
          );
        })}
      </GameCard>

      <GameCard style={styles.cardGap}>
        <SectionTitle>Achievements</SectionTitle>
        <View style={styles.medals}>
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = achievement.isUnlocked(progress);
            return (
              <View
                key={achievement.id}
                style={styles.medal}
                accessible
                accessibilityLabel={`${achievement.title}: ${achievement.description}. ${unlocked ? 'Unlocked' : 'Locked'}`}
              >
                <View
                  style={[
                    styles.medalDisc,
                    { backgroundColor: unlocked ? lighten(achievement.color, 0.75) : '#ECEAF4', borderColor: unlocked ? achievement.color : '#D5D2E2' },
                  ]}
                >
                  <View style={!unlocked && styles.lockedArt}>
                    <GameIcon name={achievement.icon} size={30} color={unlocked ? achievement.color : '#B9B4D0'} />
                  </View>
                </View>
                <Text style={[styles.medalText, !unlocked && styles.muted]} numberOfLines={2}>
                  {achievement.title}
                </Text>
              </View>
            );
          })}
        </View>
      </GameCard>

      <GameCard style={styles.cardGap}>
        <SectionTitle>Recent Adventures</SectionTitle>
        {progress.history.length === 0 ? (
          <Text style={gameType.label}>Visit a place in town to start your adventure!</Text>
        ) : (
          progress.history.slice(0, 5).map((entry, index) => (
            <View key={`${entry.at}-${index}`} style={styles.historyRow}>
              <GameIcon name={LOCATION_ICONS[entry.location]} size={26} />
              <View style={styles.flex}>
                <Text style={styles.skillLabel}>{LOCATIONS[entry.location].name}</Text>
                <Text style={gameType.small}>{relativeDay(entry.at)}</Text>
              </View>
              <View style={styles.reward}>
                <Text style={styles.rewardText}>+{entry.stars}</Text>
                <GameIcon name="star" size={18} />
              </View>
            </View>
          ))
        )}
      </GameCard>
    </View>
  );
}

function QuestsTab({ onGo }: { onGo: (id: LocationId) => void }) {
  const { questsDone } = useWorld();
  const allDone = QUESTS.every((quest) => questsDone.includes(quest.id));
  return (
    <View style={styles.tabBody}>
      <GameCard style={styles.cardGap}>
        <SectionTitle>Today’s Quests</SectionTitle>
        {QUESTS.map((quest) => {
          const done = questsDone.includes(quest.id);
          const color = LOCATIONS[quest.location].color;
          return (
            <View key={quest.id} style={[styles.questRow, done && styles.questRowDone]}>
              <View style={[styles.iconTile, { backgroundColor: lighten(color, 0.8) }]}>
                <GameIcon name={LOCATION_ICONS[quest.location]} size={30} />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.skillLabel, done && styles.doneText]}>{quest.title}</Text>
                <View style={styles.reward}>
                  <Text style={styles.rewardText}>+{quest.stars}</Text>
                  <GameIcon name="star" size={16} />
                </View>
              </View>
              {done ? (
                <View style={styles.doneBadge} accessibilityLabel="Done">
                  <Check size={18} />
                </View>
              ) : (
                <GameButton title="Go!" size="sm" color={color} edge={darken(color, 0.2)} onPress={() => onGo(quest.location)} accessibilityLabel={`Go to ${LOCATIONS[quest.location].name}`} />
              )}
            </View>
          );
        })}
      </GameCard>
      <GameCard tint={allDone ? '#FFF6D6' : gameColors.card} style={styles.questHero}>
        <GameIcon name="trophy" size={44} />
        <Text style={[gameType.body, styles.flex]}>
          {allDone ? 'You finished every quest today. You are a Quest Hero!' : 'Finish every quest to become a Quest Hero!'}
        </Text>
      </GameCard>
    </View>
  );
}

function RewardCard({ reward, onMessage }: { reward: RewardConfig; onMessage: (text: string) => void }) {
  const { progress, unlockReward, toggleEquip } = useWorld();
  const [hop, setHop] = useState(0);
  const [wobble, setWobble] = useState(0);
  const { translateY, rotate } = useReactions(hop, wobble);
  const owned = progress.owned.includes(reward.id);
  const wearing = progress.equipped[reward.slot] === reward.id;
  const affordable = canAfford(progress, reward.id);
  const balance = reward.currency === 'stars' ? progress.stars : progress.coins;
  const unit = reward.currency === 'stars' ? 'stars' : 'coins';

  const press = () => {
    if (owned) {
      toggleEquip(reward.id);
      setHop((key) => key + 1);
      onMessage(wearing ? `You took off the ${reward.name}.` : `Looking great in your ${reward.name}!`);
      return;
    }
    if (unlockReward(reward.id)) {
      setHop((key) => key + 1);
      onMessage(`Wow! You unlocked the ${reward.name}!`);
      return;
    }
    setWobble((key) => key + 1);
    onMessage(`Collect ${reward.price - balance} more ${unit} to unlock the ${reward.name}. You can do it!`);
  };

  const status = owned ? (wearing ? 'Wearing' : 'Wear') : affordable ? 'Unlock!' : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${reward.name}. ${owned ? (wearing ? 'Wearing. Tap to take off.' : 'Owned. Tap to wear.') : `${reward.price} ${unit}.`}`}
      onPress={press}
      style={({ pressed }) => [styles.rewardCard, wearing && styles.rewardWearing, affordable && !owned && styles.rewardReady, pressed && styles.pressed]}
    >
      <Animated.View style={{ transform: [{ translateY }, { rotate }] }}>
        <Svg width={68} height={68} viewBox="0 0 100 100">
          <RewardArt id={reward.id} />
        </Svg>
      </Animated.View>
      <Text style={styles.rewardName}>{reward.name}</Text>
      {status ? (
        <View style={[styles.statusPill, { backgroundColor: wearing ? gameColors.green : owned ? gameColors.primary : gameColors.orange }]}>
          {wearing ? <Check size={11} /> : null}
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : (
        <View style={[styles.statusPill, styles.pricePill]}>
          <GameIcon name={reward.currency === 'stars' ? 'star' : 'coin'} size={16} />
          <Text style={styles.priceText}>{reward.price}</Text>
        </View>
      )}
    </Pressable>
  );
}

function RewardsTab() {
  const { progress } = useWorld();
  const [message, setMessage] = useState('Tap an item to unlock it or try it on!');
  const [cheer, setCheer] = useState(0);
  const say = (text: string) => {
    setMessage(text);
    setCheer((key) => key + 1);
  };
  return (
    <View style={styles.tabBody}>
      <GameCard tint="#EAF6FF" edge="#BFE0FA" style={styles.preview}>
        <View style={styles.pedestalWrap}>
          <LivingKid width={110} look={PLAYER_LOOK} equipped={progress.equipped} expression="excited" pose={cheer % 2 ? 'cheer' : 'wave'} hopKey={cheer} />
          <View style={styles.pedestal} />
        </View>
        <SpeechBubble text={message} tail="left" style={styles.flex} />
      </GameCard>

      {(['stars', 'coins'] as const).map((currency) => (
        <GameCard key={currency} style={styles.cardGap}>
          <View style={styles.shopHeader}>
            <SectionTitle>{currency === 'stars' ? 'Star Shop' : 'Coin Corner'}</SectionTitle>
            <CurrencyPill kind={currency === 'stars' ? 'star' : 'coin'} value={currency === 'stars' ? progress.stars : progress.coins} compact />
          </View>
          <View style={styles.rewardGrid}>
            {REWARDS.filter((reward) => reward.currency === currency).map((reward) => (
              <RewardCard key={reward.id} reward={reward} onMessage={say} />
            ))}
          </View>
        </GameCard>
      ))}
      <Text style={[gameType.small, styles.center]}>Stars and coins are earned by playing. Nothing here costs real money.</Text>
    </View>
  );
}

type JourneyPanelProps = {
  visible: boolean;
  tab: JourneyTab;
  onTab: (tab: JourneyTab) => void;
  onClose: () => void;
  onGo: (id: LocationId) => void;
};

/** "My Journey": skills, achievements, daily quests and the reward shop in one panel. */
export function JourneyPanel({ visible, tab, onTab, onClose, onGo }: JourneyPanelProps) {
  const { progress, playerName, level } = useWorld();
  const { into, needed, ratio } = levelProgress(progress.totalStars);
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <AvatarBadge equipped={progress.equipped} level={level} size={58} />
        <View style={styles.flex}>
          <Text style={gameType.title} numberOfLines={1}>
            {playerName}’s Journey
          </Text>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>Level {level}</Text>
            <GameProgressBar value={ratio} color={gameColors.gold} height={10} style={styles.flex} accessibilityLabel="Level progress" />
            <GameIcon name="star" size={16} />
            <Text style={styles.levelLabel}>
              {into}/{needed}
            </Text>
          </View>
        </View>
        <GameButton round size="sm" ionicon="close" color={gameColors.white} edge={gameColors.cardEdge} textColor={gameColors.ink} accessibilityLabel="Close" onPress={onClose} />
      </View>

      <View style={styles.tabs} accessibilityRole="tablist">
        {TABS.map((item) => {
          const active = item.id === tab;
          return (
            <GameButton
              key={item.id}
              size="sm"
              title={item.label}
              color={active ? gameColors.primary : gameColors.white}
              edge={active ? gameColors.primaryEdge : gameColors.cardEdge}
              textColor={active ? gameColors.white : gameColors.inkSoft}
              accessibilityState={{ selected: active }}
              onPress={() => onTab(item.id)}
              style={styles.flex}
              faceStyle={styles.tabFace}
            />
          );
        })}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {tab === 'progress' ? <ProgressTab /> : tab === 'quests' ? <QuestsTab onGo={onGo} /> : <RewardsTab />}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  levelLabel: {
    ...gameType.label,
    fontFamily: gameType.number.fontFamily,
    color: gameColors.ink,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  tabFace: {
    paddingHorizontal: 6,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  tabBody: {
    gap: 14,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  cardGap: {
    gap: 12,
  },
  sectionTitle: {
    ...gameType.heading,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  skillLabel: {
    ...gameType.body,
    fontSize: 15,
    lineHeight: 19,
  },
  skillStage: {
    ...gameType.label,
    fontFamily: gameType.number.fontFamily,
  },
  medals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  medal: {
    width: 72,
    alignItems: 'center',
    gap: 4,
  },
  medalDisc: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedArt: {
    opacity: 0.6,
  },
  medalText: {
    ...gameType.small,
    fontFamily: gameType.heading.fontFamily,
    color: gameColors.ink,
    textAlign: 'center',
  },
  muted: {
    color: gameColors.inkFaint,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rewardText: {
    ...gameType.number,
    fontSize: 14,
    color: gameColors.goldEdge,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 18,
    backgroundColor: gameColors.cardTint,
  },
  questRowDone: {
    backgroundColor: '#E5F8EE',
  },
  doneText: {
    color: gameColors.greenEdge,
  },
  doneBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: gameColors.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: gameColors.white,
  },
  questHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pedestalWrap: {
    alignItems: 'center',
    width: 110,
  },
  pedestal: {
    width: 96,
    height: 16,
    marginTop: -10,
    borderRadius: 48,
    backgroundColor: '#BFE0FA',
    zIndex: -1,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  rewardCard: {
    flexGrow: 1,
    flexBasis: '44%',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: gameColors.cardTint,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  rewardWearing: {
    borderColor: gameColors.green,
    backgroundColor: '#E8F9F0',
  },
  rewardReady: {
    borderColor: gameColors.gold,
    backgroundColor: '#FFF8E0',
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  rewardName: {
    ...gameType.heading,
    fontSize: 15,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...gameType.number,
    fontSize: 13,
    color: gameColors.white,
  },
  pricePill: {
    backgroundColor: gameColors.white,
  },
  priceText: {
    ...gameType.number,
    fontSize: 14,
  },
});
