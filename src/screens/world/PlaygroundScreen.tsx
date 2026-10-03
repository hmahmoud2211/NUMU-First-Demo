import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Path } from 'react-native-svg';

import { ParkBackdrop } from '@/components/world/art/Backdrops';
import { FRIEND_LOOKS, KID_VIEW, PLAYER_LOOK, type Expression, type FriendId, type Pose } from '@/components/world/art/KidCharacter';
import { Ball } from '@/components/world/art/primitives';
import { LivingKid } from '@/components/world/motion/LivingKid';
import { Bob, PopIn } from '@/components/world/motion/Motion';
import { SceneScreen, type SceneSize } from '@/components/world/scene/SceneScreen';
import { OptionButton, type ChoiceState } from '@/components/world/ui/Choices';
import { GameCard } from '@/components/world/ui/GameCard';
import { GameButton } from '@/components/world/ui/GameButton';
import { SpeechBubble } from '@/components/world/ui/SpeechBubble';
import { PROGRESSION } from '@/config/worldConfig';
import { useWorld } from '@/context/WorldContext';
import { SOCIAL_SCENARIOS } from '@/data/worldActivities';
import { useNarration } from '@/hooks/useNarration';
import { gameColors, gameShadow, gameType } from '@/theme';
import type { RewardSummary } from '@/types/world';

function PlayBall({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Defs>
        <Ball id="numu-play-ball" color="#FF5C7A" />
      </Defs>
      <Circle cx={20} cy={20} r={18} fill="url(#numu-play-ball)" />
      <Path d="M3 18 Q20 10 37 18 M3 24 Q20 32 37 24" stroke="#FFFFFF" strokeWidth={3} fill="none" />
    </Svg>
  );
}

function SocialTasks({ done, current }: { done: number; current: number }) {
  return (
    <View style={[styles.tasks, gameShadow.lifted]}>
      <Text style={styles.tasksTitle}>Social Task</Text>
      {SOCIAL_SCENARIOS.map((scenario, index) => {
        const complete = index < done;
        return (
          <View key={scenario.task} style={styles.taskRow}>
            <View style={[styles.box, complete && styles.boxDone, index === current && !complete && styles.boxCurrent]}>
              {complete ? (
                <Svg width={11} height={11} viewBox="0 0 12 12">
                  <Path d="M2 6.5 L5 9 L10 3" stroke="#FFFFFF" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              ) : null}
            </View>
            <Text style={[styles.taskText, complete && styles.taskDone]}>{scenario.task}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function PlaygroundScreen() {
  const { recordActivity, progress } = useWorld();
  const { narrate } = useNarration();
  const [index, setIndex] = useState(0);
  const [tried, setTried] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState(SOCIAL_SCENARIOS[0].situation);
  const [friendLine, setFriendLine] = useState(SOCIAL_SCENARIOS[0].opening);
  const [reaction, setReaction] = useState<'idle' | 'happy' | 'upset'>('idle');
  const [hop, setHop] = useState(0);
  const [wobble, setWobble] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [stars, setStars] = useState(0);
  const [celebration, setCelebration] = useState<{ summary: RewardSummary; message: string } | null>(null);
  const finished = useRef(false);

  const scenario = SOCIAL_SCENARIOS[index];

  useEffect(() => {
    narrate(`${message} ${solved ? '' : 'What should you do?'}`);
  }, [message, solved, narrate]);

  const choose = (choiceIndex: number) => {
    if (solved || tried.includes(choiceIndex)) return;
    const choice = scenario.choices[choiceIndex];
    if (choice.good) {
      setSolved(true);
      setStars((count) => count + 1);
      if (tried.length === 0) setFirstTry((count) => count + 1);
      setReaction('happy');
      setHop((key) => key + 1);
      setFriendLine(scenario.thanks);
      setMessage(choice.feedback);
      return;
    }
    setTried((items) => [...items, choiceIndex]);
    setReaction('upset');
    setWobble((key) => key + 1);
    setMessage(choice.feedback);
  };

  const next = () => {
    if (index + 1 < SOCIAL_SCENARIOS.length) {
      const upcoming = SOCIAL_SCENARIOS[index + 1];
      setIndex(index + 1);
      setTried([]);
      setSolved(false);
      setReaction('idle');
      setMessage(upcoming.situation);
      setFriendLine(upcoming.opening);
      return;
    }
    if (finished.current) return;
    finished.current = true;
    const summary = recordActivity({
      location: 'playground',
      stars,
      coins: PROGRESSION.activityCoins,
      skills: { social: 2 + firstTry },
    });
    setCelebration({ summary, message: 'You asked, took turns and shared. What a kind friend!' });
  };

  const friendFace = (friend: FriendId): Expression => {
    if (reaction === 'happy') return 'excited';
    if (reaction === 'upset') return friend === scenario.speaker ? 'sad' : 'surprised';
    return scenario.mood === 'sad' ? 'sad' : scenario.mood === 'thinking' ? 'thinking' : 'happy';
  };
  const friendPose = (friend: FriendId): Pose => (reaction === 'happy' ? (friend === scenario.speaker ? 'cheer' : 'wave') : 'rest');

  const stateOf = (choiceIndex: number): ChoiceState => {
    if (solved && scenario.choices[choiceIndex].good) return 'correct';
    if (tried.includes(choiceIndex)) return 'tried';
    return solved ? 'disabled' : 'idle';
  };

  const stage = ({ width, groundY, stageTop, stageHeight }: SceneSize) => {
    const height = Math.min(stageHeight * 0.56, 250);
    const kidWidth = (height * KID_VIEW.width) / KID_VIEW.height;
    const friends = scenario.friends;
    const friendSlots = friends.length === 1 ? [0.72] : [0.6, 0.84];
    const showBall = index === 2 ? 'player' : index === 0 ? 'friends' : null;
    return (
      <>
        <LivingKid
          width={kidWidth}
          look={PLAYER_LOOK}
          equipped={progress.equipped}
          expression={reaction === 'happy' ? 'excited' : 'thinking'}
          pose={reaction === 'happy' ? 'wave' : 'rest'}
          hopKey={hop}
          accessibilityLabel="You"
          style={[styles.abs, { left: width * 0.22 - kidWidth / 2, top: groundY - height }]}
        />
        {friends.map((friend, slot) => (
          <PopIn key={`${index}-${friend}`} delay={slot * 120} style={[styles.abs, { left: width * friendSlots[slot] - kidWidth / 2, top: groundY - height }]}>
            <LivingKid
              width={kidWidth}
              look={FRIEND_LOOKS[friend]}
              expression={friendFace(friend)}
              pose={friendPose(friend)}
              hopKey={hop}
              wobbleKey={wobble}
              breatheDelay={300 + slot * 200}
              flip={slot === friends.length - 1 && friends.length > 1}
              accessibilityLabel={friend}
            />
          </PopIn>
        ))}
        {showBall ? (
          <Bob
            duration={reaction === 'happy' ? 400 : 1200}
            distance={reaction === 'happy' ? 30 : 6}
            style={[styles.abs, { left: width * (showBall === 'player' ? (solved ? 0.5 : 0.33) : 0.72) - 18, top: groundY - 40 }]}
          >
            <PlayBall size={36} />
          </Bob>
        ) : null}
        <View style={[styles.abs, { right: 12, top: stageTop + 8 }]}>
          <SocialTasks done={index + (solved ? 1 : 0)} current={index} />
        </View>
        <View style={[styles.abs, { left: 12, right: width * 0.42, top: stageTop + 8 }]} pointerEvents="box-none">
          <SpeechBubble text={friendLine} tail="bottom-right" />
        </View>
      </>
    );
  };

  return (
    <SceneScreen location="playground" backdrop={(size) => <ParkBackdrop {...size} />} stage={stage} score={{ value: stars, total: SOCIAL_SCENARIOS.length }} celebration={celebration}>
      <GameCard style={styles.card}>
        <Text style={[gameType.heading, styles.center]}>{message}</Text>
        {!solved ? <Text style={[gameType.label, styles.center]}>What should you do?</Text> : null}
        <View style={styles.options}>
          {scenario.choices.map((choice, choiceIndex) => (
            <OptionButton key={choice.label} label={choice.label} icon={choice.icon} state={stateOf(choiceIndex)} onPress={() => choose(choiceIndex)} color={gameColors.purple} />
          ))}
        </View>
        {solved ? (
          <PopIn>
            <GameButton
              title={index + 1 < SOCIAL_SCENARIOS.length ? 'Next' : 'Finish'}
              ionicon="arrow-forward"
              color={gameColors.sky}
              edge={gameColors.skyEdge}
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
  card: {
    gap: 8,
  },
  center: {
    textAlign: 'center',
  },
  options: {
    gap: 2,
  },
  tasks: {
    padding: 10,
    gap: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderBottomWidth: 4,
    borderBottomColor: gameColors.cardEdge,
  },
  tasksTitle: {
    ...gameType.heading,
    fontSize: 14,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: gameColors.cardEdge,
    backgroundColor: gameColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxCurrent: {
    borderColor: gameColors.purple,
  },
  boxDone: {
    backgroundColor: gameColors.green,
    borderColor: gameColors.greenEdge,
  },
  taskText: {
    ...gameType.label,
    fontSize: 13,
    color: gameColors.ink,
  },
  taskDone: {
    color: gameColors.greenEdge,
  },
});
