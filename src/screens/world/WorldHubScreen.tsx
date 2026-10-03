import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DockButton, QuestScroll, WorldHud } from '@/components/world/hud/WorldHud';
import { WorldMap, type WorldMapHandle } from '@/components/world/map/WorldMap';
import { Bob } from '@/components/world/motion/Motion';
import { JourneyPanel, type JourneyTab } from '@/components/world/panels/JourneyPanel';
import { SettingsPanel } from '@/components/world/panels/SettingsPanel';
import { GameButton } from '@/components/world/ui/GameButton';
import { GameViewport } from '@/components/world/ui/GameViewport';
import { SpeechBubble } from '@/components/world/ui/SpeechBubble';
import { LOCATIONS, REWARDS } from '@/config/worldConfig';
import { useWorld } from '@/context/WorldContext';
import { useNarration } from '@/hooks/useNarration';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { exitChildMode } from '@/navigation/childMode';
import { routes } from '@/navigation/routes';
import { canAfford } from '@/services/worldEngine';
import { gameColors, gameFonts, gameType } from '@/theme';
import type { LocationId } from '@/types/world';

/** The title sweep plays once per app launch, not on every return to the map. */
let introPlayed = false;

function IntroOverlay({ name, onPlay }: { name: string; onPlay: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[StyleSheet.absoluteFill, styles.intro, { paddingBottom: insets.bottom + 40 }]}>
      <Bob distance={8} duration={1800}>
        <Text style={styles.introKicker}>Welcome to</Text>
        <Text style={styles.introTitle} accessibilityRole="header">
          NUMU World
        </Text>
      </Bob>
      <View style={styles.introCard}>
        <Text style={styles.introSubtitle}>Hi {name}! A town full of feelings, friends and fun is waiting.</Text>
      </View>
      <GameButton
        title="Let’s Play!"
        size="lg"
        icon="star"
        color={gameColors.green}
        edge={gameColors.greenEdge}
        onPress={onPlay}
        style={styles.introButton}
      />
    </View>
  );
}

export default function WorldHubScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const { progress, playerName, level, questsDone, pendingReturn, clearReturn, isReady } = useWorld();
  const { narrate } = useNarration();
  const mapRef = useRef<WorldMapHandle>(null);
  const lastEntered = useRef<LocationId | null>(null);
  // Arriving straight from a location (e.g. a deep link) skips the title sweep.
  const [introPending, setIntroPending] = useState(() => !introPlayed && !pendingReturn);
  const [journey, setJourney] = useState<{ open: boolean; tab: JourneyTab }>({ open: false, tab: 'progress' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [hudIn] = useState(() => new Animated.Value(introPending ? 0 : 1));

  const enter = useCallback((id: LocationId) => {
    lastEntered.current = id;
    setHint(null);
    router.push(routes.worldLocation(id));
  }, []);

  // Walking back out of a building: zoom the camera out and celebrate any rewards.
  useFocusEffect(
    useCallback(() => {
      const location = pendingReturn?.location ?? lastEntered.current;
      if (!location) return;
      mapRef.current?.returnFrom(location, Boolean(pendingReturn?.summary));
      lastEntered.current = null;
      if (pendingReturn) {
        if (pendingReturn.summary) {
          const nextQuest = questsDone.length < 4 ? 'Where shall we go next?' : 'You finished all of today’s quests!';
          setHint(`Great job at the ${LOCATIONS[location].name}! ${nextQuest}`);
        }
        clearReturn();
      }
    }, [pendingReturn, clearReturn, questsDone.length]),
  );

  useEffect(() => {
    if (!hint) return;
    const timer = setTimeout(() => setHint(null), 6000);
    return () => clearTimeout(timer);
  }, [hint]);

  const play = () => {
    introPlayed = true;
    setIntroPending(false);
    mapRef.current?.playIntro();
    Animated.timing(hudIn, { toValue: 1, duration: reduceMotion ? 0 : 600, delay: reduceMotion ? 0 : 1300, useNativeDriver: true }).start();
    const greeting = `Hi ${playerName}! Tap a place in town to explore.`;
    setTimeout(() => setHint(greeting), reduceMotion ? 0 : 1700);
    narrate(greeting);
  };

  const openJourney = (tab: JourneyTab) => setJourney({ open: true, tab });
  const closeJourney = useCallback(() => setJourney((current) => ({ ...current, open: false })), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const goFromQuest = (id: LocationId) => {
    closeJourney();
    setTimeout(() => mapRef.current?.travelTo(id), 260);
  };

  const rewardReady = REWARDS.some((reward) => !progress.owned.includes(reward.id) && canAfford(progress, reward.id));
  const hudStyle = {
    opacity: hudIn,
    transform: [{ translateY: hudIn.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
  };
  const dockStyle = {
    opacity: hudIn,
    transform: [{ translateY: hudIn.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
  };

  return (
    <GameViewport>
      <WorldMap
        ref={mapRef}
        equipped={progress.equipped}
        questsDone={questsDone}
        introPending={introPending}
        interactive={!introPending && !journey.open && !settingsOpen}
        onEnter={enter}
      />

      {isReady ? (
        <>
          <Animated.View pointerEvents={introPending ? 'none' : 'box-none'} style={[styles.top, { paddingTop: insets.top + 8 }, hudStyle]}>
            <WorldHud
              name={playerName}
              level={level}
              totalStars={progress.totalStars}
              stars={progress.stars}
              coins={progress.coins}
              equipped={progress.equipped}
              onProfile={() => openJourney('progress')}
              onSettings={() => setSettingsOpen(true)}
            />
            {hint ? <SpeechBubble text={hint} tail="none" style={styles.hint} /> : null}
          </Animated.View>

          <Animated.View pointerEvents={introPending ? 'none' : 'box-none'} style={[styles.bottom, { paddingBottom: insets.bottom + 10 }, dockStyle]}>
            <QuestScroll done={questsDone} onPress={() => openJourney('quests')} />
            <View style={styles.dock}>
              <DockButton icon="trophy" label="Journey" onPress={() => openJourney('progress')} />
              <DockButton icon="gift" label="Rewards" onPress={() => openJourney('rewards')} badge={rewardReady} />
            </View>
          </Animated.View>
        </>
      ) : null}

      {introPending ? <IntroOverlay name={playerName} onPlay={play} /> : null}

      <JourneyPanel
        visible={journey.open}
        tab={journey.tab}
        onTab={(tab) => setJourney({ open: true, tab })}
        onClose={closeJourney}
        onGo={goFromQuest}
      />
      <SettingsPanel
        visible={settingsOpen}
        onClose={closeSettings}
        onParentArea={() => {
          setSettingsOpen(false);
          exitChildMode();
        }}
      />
    </GameViewport>
  );
}

const styles = StyleSheet.create({
  top: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 10,
    gap: 10,
  },
  hint: {
    alignSelf: 'center',
    maxWidth: 360,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dock: {
    flexDirection: 'row',
    gap: 10,
  },
  intro: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    gap: 14,
  },
  introKicker: {
    ...gameType.heading,
    color: gameColors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(43, 29, 107, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  introTitle: {
    fontFamily: gameFonts.bold,
    fontSize: 52,
    lineHeight: 58,
    color: gameColors.white,
    textAlign: 'center',
    textShadowColor: '#5B3FD6',
    textShadowOffset: { width: 0, height: 5 },
    textShadowRadius: 0.1,
  },
  introSubtitle: {
    ...gameType.body,
    color: gameColors.white,
    textAlign: 'center',
    maxWidth: 320,
    textShadowColor: 'rgba(43, 29, 107, 0.6)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  introCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(43, 29, 107, 0.35)',
  },
  introButton: {
    minWidth: 220,
    marginTop: 6,
  },
});
