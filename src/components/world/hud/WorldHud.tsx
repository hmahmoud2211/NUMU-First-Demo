import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { GameIcon, LOCATION_ICONS } from '@/components/world/art/Icons';
import { KID_HEAD_VIEWBOX, KidCharacter, PLAYER_LOOK } from '@/components/world/art/KidCharacter';
import { CurrencyPill, GameProgressBar } from '@/components/world/ui/GameCard';
import { GameButton } from '@/components/world/ui/GameButton';
import { QUESTS } from '@/config/worldConfig';
import { levelProgress } from '@/services/worldEngine';
import { gameColors, gameShadow, gameType } from '@/theme';
import type { Equipment, QuestId } from '@/types/world';

/** Round portrait of the player's avatar with their level on a badge. */
export function AvatarBadge({ equipped, level, size = 52 }: { equipped: Equipment; level?: number; size?: number }) {
  return (
    <View style={[styles.avatarRing, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.avatarClip, { borderRadius: size / 2 }]}>
        <Svg width={size} height={size} viewBox={KID_HEAD_VIEWBOX}>
          <KidCharacter look={PLAYER_LOOK} equipped={{ ...equipped, ride: undefined }} shadow={false} />
        </Svg>
      </View>
      {level !== undefined ? (
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
      ) : null}
    </View>
  );
}

type WorldHudProps = {
  name: string;
  level: number;
  totalStars: number;
  stars: number;
  coins: number;
  equipped: Equipment;
  onProfile: () => void;
  onSettings: () => void;
};

export function WorldHud({ name, level, totalStars, stars, coins, equipped, onProfile, onSettings }: WorldHudProps) {
  const { into, needed, ratio } = levelProgress(totalStars);
  return (
    <View style={styles.row} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${name}, level ${level}. ${into} of ${needed} stars to the next level. Open my journey.`}
        onPress={onProfile}
        style={({ pressed }) => [styles.profile, gameShadow.soft, pressed && styles.pressed]}
      >
        <AvatarBadge equipped={equipped} level={level} />
        <View style={styles.profileText}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.levelRow}>
            <GameIcon name="star" size={14} />
            <Text style={styles.levelProgress}>
              {into} / {needed}
            </Text>
          </View>
          <GameProgressBar value={ratio} color={gameColors.gold} height={8} accessibilityLabel="Level progress" />
        </View>
      </Pressable>
      <View style={styles.spacer} />
      <View style={styles.right}>
        <CurrencyPill kind="star" value={stars} compact />
        <CurrencyPill kind="coin" value={coins} compact />
        <GameButton
          round
          size="sm"
          ionicon="settings-sharp"
          color={gameColors.primary}
          edge={gameColors.primaryEdge}
          accessibilityLabel="Settings"
          onPress={onSettings}
        />
      </View>
    </View>
  );
}

/** Compact "Today's Quests" scroll that opens the full quest list. */
export function QuestScroll({ done, onPress }: { done: QuestId[]; onPress: () => void }) {
  const finished = QUESTS.filter((quest) => done.includes(quest.id)).length;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Today's quests: ${finished} of ${QUESTS.length} done. Open quests.`}
      onPress={onPress}
      style={({ pressed }) => [styles.quests, gameShadow.lifted, pressed && styles.pressed]}
    >
      <View style={styles.questHeader}>
        <GameIcon name="scroll" size={22} />
        <Text style={styles.questTitle}>Today’s Quests</Text>
        <Text style={styles.questCount}>
          {finished}/{QUESTS.length}
        </Text>
      </View>
      <View style={styles.questIcons}>
        {QUESTS.map((quest) => {
          const complete = done.includes(quest.id);
          return (
            <View key={quest.id} style={[styles.questIcon, complete && styles.questIconDone]}>
              <GameIcon name={LOCATION_ICONS[quest.location]} size={22} />
              {complete ? (
                <View style={styles.check}>
                  <Svg width={10} height={10} viewBox="0 0 12 12">
                    <Path d="M2 6.5 L5 9 L10 3" stroke="#FFFFFF" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

/** Round 3D button with a caption, for the bottom dock. */
export function DockButton({ icon, label, onPress, badge }: { icon: 'trophy' | 'gift'; label: string; onPress: () => void; badge?: boolean }) {
  return (
    <View style={styles.dockItem}>
      <GameButton round size="lg" color={gameColors.white} edge={gameColors.cardEdge} accessibilityLabel={label} onPress={onPress}>
        <GameIcon name={icon} size={36} />
      </GameButton>
      {badge ? <View style={styles.dot} /> : null}
      <Text style={styles.dockLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 5,
    paddingRight: 12,
    paddingVertical: 5,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 4,
    borderBottomColor: gameColors.cardEdge,
    width: 168,
    flexShrink: 1,
    minWidth: 0,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  avatarRing: {
    backgroundColor: '#BEE6FF',
    borderWidth: 3,
    borderColor: gameColors.white,
    boxShadow: '0px 2px 4px rgba(43, 29, 107, 0.2)',
  },
  avatarClip: {
    flex: 1,
    overflow: 'hidden',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    borderRadius: 11,
    backgroundColor: gameColors.primary,
    borderWidth: 2,
    borderColor: gameColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    ...gameType.number,
    fontSize: 12,
    color: gameColors.white,
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...gameType.heading,
    fontSize: 16,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  levelProgress: {
    ...gameType.small,
    fontFamily: gameType.number.fontFamily,
  },
  spacer: {
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    flexShrink: 0,
  },
  quests: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderBottomWidth: 5,
    borderBottomColor: gameColors.cardEdge,
    gap: 6,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  questTitle: {
    ...gameType.heading,
    fontSize: 14,
  },
  questCount: {
    ...gameType.label,
    fontFamily: gameType.number.fontFamily,
    marginLeft: 'auto',
    paddingLeft: 6,
  },
  questIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  questIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: gameColors.cardTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questIconDone: {
    backgroundColor: '#DDF7E8',
  },
  check: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: gameColors.green,
    borderWidth: 2,
    borderColor: gameColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockItem: {
    alignItems: 'center',
  },
  dockLabel: {
    ...gameType.heading,
    fontSize: 13,
    color: gameColors.white,
    marginTop: 1,
    textShadowColor: 'rgba(30, 20, 80, 0.55)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  dot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: gameColors.pink,
    borderWidth: 2,
    borderColor: gameColors.white,
  },
});
