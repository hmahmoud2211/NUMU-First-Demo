import type { AgeText } from '@/types/child';
import type { Emotion } from '@/types/emotion';

/**
 * Avatar phrases. All wording is encouraging — NUMU never says
 * "wrong", "failed" or "bad answer".
 */
export const AVATAR_PHRASES = {
  correct: ['Great job! 🎉', 'You got it!', 'Wonderful looking!', 'Nice work, detective!', 'Yes! Well done!'],
  tryAgain: ['Good try! Let’s look again.', 'That’s okay. Let’s look at another clue.', 'Nice try! Let’s look carefully.'],
  reveal: ['Let’s remember this one together.', 'That’s okay — now we know the clues!'],
  levelDone: ['You finished the level!', 'Look how much you learned!'],
} as const;

export function pickPhrase(list: readonly string[], seed: number): string {
  return list[Math.abs(seed) % list.length];
}

type PairTip = {
  pair: [Emotion, Emotion];
  tip: AgeText;
};

/** Specific explanations for pairs that are often confused. */
const PAIR_TIPS: PairTip[] = [
  {
    pair: ['fear', 'surprise'],
    tip: {
      early: 'Both have big eyes! Look at the mouth. Surprise makes a round “O”. Scared stretches wide.',
      middle: 'Surprise and fear can look similar — both have wide eyes. Look at the eyebrows and mouth: surprise has a round “O” mouth, fear has worried eyebrows and a stretched mouth.',
      teen: 'Fear and surprise share wide eyes. The difference is tension: fear pulls the eyebrows together and stretches the mouth; surprise lifts the eyebrows in a relaxed curve and rounds the mouth.',
    },
  },
  {
    pair: ['sad', 'neutral'],
    tip: {
      early: 'Look at the mouth. Sad goes down. Calm is flat.',
      middle: 'Sad and neutral faces can both look quiet. Check the mouth corners: sad turns down, neutral stays straight.',
      teen: 'Low-intensity sadness can look neutral. Look for downturned mouth corners and inner eyebrows lifting.',
    },
  },
  {
    pair: ['angry', 'disgust'],
    tip: {
      early: 'Angry eyebrows go down. Yucky faces scrunch the nose.',
      middle: 'Both can have lowered eyebrows. Disgust wrinkles the nose and lifts the top lip; anger presses the lips tight.',
      teen: 'Anger focuses on the brows and a hard stare; disgust centres on the nose wrinkle and raised upper lip.',
    },
  },
  {
    pair: ['angry', 'sad'],
    tip: {
      early: 'Angry eyebrows go down. Sad eyebrows go up in the middle.',
      middle: 'Look at the eyebrows: angry eyebrows go down and together, sad eyebrows tilt up in the middle.',
      teen: 'Eyebrow direction is the key cue: lowered and drawn together for anger, inner corners lifted for sadness.',
    },
  },
  {
    pair: ['happy', 'surprise'],
    tip: {
      early: 'Happy smiles. Surprise makes an “O”.',
      middle: 'Happy faces smile with the mouth corners up. Surprised faces open the mouth round.',
      teen: 'Pleasant surprise can include a smile, but the round open mouth and high brows point to surprise.',
    },
  },
  {
    pair: ['fear', 'sad'],
    tip: {
      early: 'Scared eyes are big. Sad eyes look down.',
      middle: 'Both can have worried eyebrows. Scared faces have wide eyes and an open mouth; sad faces have a mouth that turns down.',
      teen: 'Both lift the inner brows, but fear widens the eyes and opens the mouth while sadness lowers the gaze and mouth corners.',
    },
  },
];

const GENERIC_TIP: AgeText = {
  early: 'Let’s look at the eyes, the eyebrows and the mouth.',
  middle: 'These two can look alike. Let’s compare the eyes, eyebrows and mouth.',
  teen: 'Compare the three main areas — eyes, eyebrows and mouth — to spot the difference.',
};

export function getPairTip(a: Emotion, b: Emotion): AgeText {
  const match = PAIR_TIPS.find(({ pair }) => (pair[0] === a && pair[1] === b) || (pair[0] === b && pair[1] === a));
  return match?.tip ?? GENERIC_TIP;
}
