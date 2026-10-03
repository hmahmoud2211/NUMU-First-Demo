/**
 * Shared frame for every mini-game: a full-bleed illustrated backdrop, a
 * header, a stage for characters and a bottom panel for choices. The scene
 * "settles" into place on entry, continuing the camera zoom from the map.
 */
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameIcon, LOCATION_ICONS } from '@/components/world/art/Icons';
import { GameButton } from '@/components/world/ui/GameButton';
import { GameViewport } from '@/components/world/ui/GameViewport';
import { RewardCelebration } from '@/components/world/ui/RewardCelebration';
import { LOCATIONS } from '@/config/worldConfig';
import { useWorld } from '@/context/WorldContext';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { stopSpeaking } from '@/services/speechService';
import { routes } from '@/navigation/routes';
import { gameColors, gameShadow, gameType } from '@/theme';
import type { LocationId, RewardSummary } from '@/types/world';

/** Matches the map's zoom flash, so entering a place fades in from warm light. */
const SCENE_BACKDROP = '#FFFDF4';

export type SceneSize = {
  width: number;
  height: number;
  /** Where the back wall meets the floor (screen px). */
  floorY: number;
  /** Where characters' feet stand (screen px). */
  groundY: number;
  /** Stage area between the header and the bottom panel. */
  stageTop: number;
  stageHeight: number;
};

type SceneScreenProps = {
  location: LocationId;
  backdrop: (size: SceneSize) => ReactNode;
  /** Characters and props, absolutely positioned within the full scene. */
  stage?: (size: SceneSize) => ReactNode;
  /** Bottom panel content: questions and choices. */
  children?: ReactNode;
  score?: { value: number; total: number };
  celebration?: { summary: RewardSummary; message?: string } | null;
  backdropColor?: string;
};

/** Leaves a location and walks back out to the world map. */
function useLeaveLocation(location: LocationId) {
  const { markReturn } = useWorld();
  return (summary: RewardSummary | null) => {
    stopSpeaking();
    markReturn({ location, summary });
    if (router.canGoBack()) router.back();
    else router.replace(routes.world);
  };
}

function SceneHeader({ location, score, onBack }: { location: LocationId; score?: { value: number; total: number }; onBack: () => void }) {
  const config = LOCATIONS[location];
  return (
    <View style={styles.header}>
      <GameButton
        round
        size="sm"
        ionicon="arrow-back"
        color={gameColors.white}
        edge={gameColors.cardEdge}
        textColor={gameColors.ink}
        accessibilityLabel="Back to town"
        onPress={onBack}
      />
      <View style={[styles.place, gameShadow.soft, { borderBottomColor: config.color }]}>
        <GameIcon name={LOCATION_ICONS[location]} size={26} />
        <Text style={styles.placeText} numberOfLines={1} accessibilityRole="header">
          {config.name}
        </Text>
      </View>
      <View style={styles.flex} />
      {score ? (
        <View style={[styles.score, gameShadow.soft]} accessible accessibilityLabel={`${score.value} of ${score.total} stars`}>
          <GameIcon name="star" size={26} />
          <Text style={gameType.number}>
            {score.value}/{score.total}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function SceneScreen({ location, backdrop, stage, children, score, celebration, backdropColor }: SceneScreenProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const leave = useLeaveLocation(location);
  const [root, setRoot] = useState<{ width: number; height: number } | null>(null);
  const [stageBox, setStageBox] = useState<{ y: number; height: number } | null>(null);
  const [enter] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: reduceMotion ? 0 : 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [enter, reduceMotion]);

  const size: SceneSize | null =
    root && stageBox
      ? {
          width: root.width,
          height: root.height,
          floorY: stageBox.y + stageBox.height * 0.62,
          groundY: stageBox.y + stageBox.height - 4,
          stageTop: stageBox.y,
          stageHeight: stageBox.height,
        }
      : null;

  const settle = {
    opacity: enter,
    transform: [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [1.14, 1] }) }],
  };

  return (
    <GameViewport backdrop={backdropColor ?? SCENE_BACKDROP}>
      <View style={styles.root} onLayout={(event: LayoutChangeEvent) => setRoot(event.nativeEvent.layout)}>
        <Animated.View style={[StyleSheet.absoluteFill, settle]} pointerEvents="box-none">
          {size ? (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {backdrop(size)}
            </View>
          ) : null}
          {size && stage ? (
            <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
              {stage(size)}
            </View>
          ) : null}
        </Animated.View>

        <View style={[styles.column, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
          <SceneHeader location={location} score={score} onBack={() => leave(null)} />
          <View
            style={styles.flex}
            pointerEvents="none"
            onLayout={(event: LayoutChangeEvent) => {
              const { y, height } = event.nativeEvent.layout;
              setStageBox({ y, height });
            }}
          />
          <View style={[styles.panel, { paddingBottom: insets.bottom + 12 }]} pointerEvents="box-none">
            {children}
          </View>
        </View>

        {celebration ? (
          <RewardCelebration summary={celebration.summary} message={celebration.message} onContinue={() => leave(celebration.summary)} />
        ) : null}
      </View>
    </GameViewport>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  column: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  place: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 8,
    paddingRight: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderBottomWidth: 4,
    flexShrink: 1,
  },
  placeText: {
    ...gameType.heading,
    fontSize: 16,
    flexShrink: 1,
  },
  score: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 6,
    paddingRight: 12,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderBottomWidth: 3,
    borderBottomColor: gameColors.cardEdge,
  },
  panel: {
    paddingHorizontal: 12,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
});
