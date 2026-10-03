/**
 * Content for the world's mini-games. Kept as plain data so activities can be
 * extended (or localised) without touching the scenes.
 */
import type { FoodId } from '@/components/world/art/Foods';
import type { IconName } from '@/components/world/art/Icons';
import type { FriendId } from '@/components/world/art/KidCharacter';
import type { Emotion } from '@/types/emotion';
import type { FeelingId } from '@/types/world';

// ---------------------------------------------------------------------------
// House of Feelings
// ---------------------------------------------------------------------------

export const FEELINGS: { id: FeelingId; label: string }[] = [
  { id: 'happy', label: 'Happy' },
  { id: 'sad', label: 'Sad' },
  { id: 'angry', label: 'Angry' },
  { id: 'worried', label: 'Worried' },
  { id: 'calm', label: 'Calm' },
];

export const FEELING_RESPONSES: Record<FeelingId, string> = {
  happy: 'Yay! Happy feels warm and bright, like sunshine!',
  sad: 'It’s okay to feel sad. A hug or talking to someone you love can help.',
  angry: 'Angry feelings are okay. A big, slow breath can help them get smaller.',
  worried: 'Worried feels wobbly inside. Slow breaths can help us feel safe.',
  calm: 'Calm feels peaceful, like a quiet lake. Lovely!',
};

/** Feelings where we offer a breathing break. */
export const BREATHE_FEELINGS: FeelingId[] = ['sad', 'angry', 'worried'];

/** The face clue for each feeling. Used when NUMU teaches after a mistake. */
export const FEELING_CUES: Record<FeelingId, string> = {
  happy: 'Big smile — the mouth corners go up.',
  sad: 'The mouth turns down and the eyes look teary.',
  angry: 'The eyebrows point down and the face is tight.',
  worried: 'The eyebrows go up and the mouth is wobbly.',
  calm: 'Soft eyes and a small, gentle smile.',
};

/** Bridges world feelings to the learning engine's emotions (for parent insights). */
export const FEELING_TO_EMOTION: Record<FeelingId, Emotion> = {
  happy: 'happy',
  sad: 'sad',
  angry: 'angry',
  worried: 'fear',
  calm: 'neutral',
};

export function emotionToFeeling(emotion: Emotion): FeelingId | null {
  const match = (Object.keys(FEELING_TO_EMOTION) as FeelingId[]).find((id) => FEELING_TO_EMOTION[id] === emotion);
  return match ?? null;
}

export type FeelingScenario = {
  friend: FriendId;
  name: string;
  feeling: FeelingId;
  story: string;
  /** Shown after the child answers, explaining the clue. */
  because: string;
};

export const FEELING_SCENARIOS: FeelingScenario[] = [
  { friend: 'mia', name: 'Mia', feeling: 'happy', story: 'Mia got a new puppy!', because: 'Look at her big smile.' },
  { friend: 'leo', name: 'Leo', feeling: 'sad', story: 'Leo dropped his ice cream.', because: 'His mouth turns down and a tear rolls out.' },
  { friend: 'sam', name: 'Sam', feeling: 'angry', story: 'Someone knocked down Sam’s block tower.', because: 'His eyebrows point down and his face is tight.' },
  { friend: 'zara', name: 'Zara', feeling: 'worried', story: 'Zara hears loud thunder at night.', because: 'Her eyebrows go up and her mouth is wobbly.' },
  { friend: 'mia', name: 'Mia', feeling: 'calm', story: 'Mia is reading a book under a tree.', because: 'Her eyes are soft and her smile is gentle.' },
  { friend: 'leo', name: 'Leo', feeling: 'happy', story: 'Leo’s friends threw him a birthday party!', because: 'His smile is so big!' },
  { friend: 'sam', name: 'Sam', feeling: 'sad', story: 'Sam’s best friend moved away.', because: 'His mouth turns down and he looks teary.' },
  { friend: 'zara', name: 'Zara', feeling: 'calm', story: 'Zara is lying in the warm sun.', because: 'Her eyes are closed and she looks relaxed.' },
  { friend: 'leo', name: 'Leo', feeling: 'worried', story: 'Leo can’t find his mom at the shop.', because: 'His eyebrows go up and he looks unsure.' },
  { friend: 'zara', name: 'Zara', feeling: 'angry', story: 'Someone took Zara’s turn on the swing.', because: 'Her eyebrows point down.' },
];

// ---------------------------------------------------------------------------
// Market
// ---------------------------------------------------------------------------

export type FoodKind = 'fruit' | 'vegetable' | 'treat';

export const FOODS: Record<FoodId, { label: string; kind: FoodKind; plural?: boolean }> = {
  apple: { label: 'apple', kind: 'fruit' },
  banana: { label: 'banana', kind: 'fruit' },
  orange: { label: 'orange', kind: 'fruit' },
  strawberry: { label: 'strawberry', kind: 'fruit' },
  grapes: { label: 'grapes', kind: 'fruit', plural: true },
  carrot: { label: 'carrot', kind: 'vegetable' },
  broccoli: { label: 'broccoli', kind: 'vegetable' },
  corn: { label: 'corn', kind: 'vegetable' },
  candy: { label: 'candy', kind: 'treat' },
  chocolate: { label: 'chocolate', kind: 'treat' },
  chips: { label: 'chips', kind: 'treat', plural: true },
  donut: { label: 'donut', kind: 'treat' },
  lollipop: { label: 'lollipop', kind: 'treat' },
  soda: { label: 'soda', kind: 'treat' },
  cupcake: { label: 'cupcake', kind: 'treat' },
};

export type MarketRound = {
  prompt: string;
  target: Exclude<FoodKind, 'treat'>;
  count: number;
  items: FoodId[];
};

export const MARKET_ROUNDS: MarketRound[] = [
  {
    prompt: 'Can you help me find 3 healthy fruits?',
    target: 'fruit',
    count: 3,
    items: ['apple', 'chocolate', 'banana', 'chips', 'donut', 'orange', 'candy', 'strawberry'],
  },
  {
    prompt: 'Now let’s find 2 vegetables for my soup!',
    target: 'vegetable',
    count: 2,
    items: ['soda', 'carrot', 'grapes', 'cupcake', 'lollipop', 'broccoli', 'chips', 'corn'],
  },
];

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

export type SocialChoice = {
  label: string;
  icon: 'chatbubble-ellipses' | 'hand-left' | 'walk' | 'time' | 'flash' | 'heart' | 'lock-closed' | 'eye-off';
  good: boolean;
  /** What the guide says after this choice. */
  feedback: string;
};

export type SocialScenario = {
  task: string;
  friends: FriendId[];
  /** The friend who reacts and speaks. */
  speaker: FriendId;
  situation: string;
  opening: string;
  /** Friend's line after a kind choice. */
  thanks: string;
  /** Expression friends start with. */
  mood: 'happy' | 'sad' | 'thinking';
  choices: SocialChoice[];
};

export const SOCIAL_SCENARIOS: SocialScenario[] = [
  {
    task: 'Ask to join',
    friends: ['mia', 'leo'],
    speaker: 'mia',
    situation: 'Mia and Leo are playing ball. You want to play too!',
    opening: 'We’re playing catch!',
    thanks: 'Sure! Let’s play together!',
    mood: 'happy',
    choices: [
      { label: 'Ask “Can I play too?”', icon: 'chatbubble-ellipses', good: true, feedback: 'Asking is a great way to join in!' },
      { label: 'Grab the ball', icon: 'hand-left', good: false, feedback: 'Grabbing can make friends upset. Let’s try asking!' },
      { label: 'Walk away alone', icon: 'walk', good: false, feedback: 'They might like to play with you. You can ask!' },
    ],
  },
  {
    task: 'Take turns',
    friends: ['sam', 'zara'],
    speaker: 'zara',
    situation: 'Everyone wants to go down the slide!',
    opening: 'I want to go next!',
    thanks: 'Thanks for waiting! Your turn is next!',
    mood: 'thinking',
    choices: [
      { label: 'Push to go first', icon: 'flash', good: false, feedback: 'Pushing can hurt. Let’s try taking turns.' },
      { label: 'Wait for my turn', icon: 'time', good: true, feedback: 'Taking turns makes play fair and fun!' },
      { label: 'Stand on the slide', icon: 'hand-left', good: false, feedback: 'Then nobody can slide. Let’s take turns!' },
    ],
  },
  {
    task: 'Share the ball',
    friends: ['sam'],
    speaker: 'sam',
    situation: 'Sam has nothing to play with. You have a ball.',
    opening: 'I wish I had something to play with…',
    thanks: 'Thank you for sharing! You’re a good friend!',
    mood: 'sad',
    choices: [
      { label: 'Keep it to myself', icon: 'lock-closed', good: false, feedback: 'Sam still feels sad. How could we help?' },
      { label: 'Hide the ball', icon: 'eye-off', good: false, feedback: 'Hmm, hiding it doesn’t help Sam. Let’s try again.' },
      { label: 'Share the ball', icon: 'heart', good: true, feedback: 'Sharing makes friends happy!' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Learning Center
// ---------------------------------------------------------------------------

export type PuzzleToken = { icon: IconName; color?: string } | { food: FoodId } | { ball: string };

export type Puzzle =
  | {
      kind: 'pattern';
      prompt: string;
      sequence: PuzzleToken[];
      options: PuzzleToken[];
      answer: number;
      hint: string;
    }
  | {
      kind: 'count';
      prompt: string;
      token: PuzzleToken;
      amount: number;
      options: number[];
      hint: string;
    }
  | {
      kind: 'odd';
      prompt: string;
      items: PuzzleToken[];
      answer: number;
      hint: string;
    };

const RED = '#FF5C7A';
const BLUE = '#38B0FF';
const GREEN = '#3CCB7F';

export const PUZZLES: Puzzle[] = [
  {
    kind: 'pattern',
    prompt: 'What comes next?',
    sequence: [{ ball: RED }, { ball: BLUE }, { ball: RED }, { ball: BLUE }, { ball: RED }],
    options: [{ ball: RED }, { ball: BLUE }, { ball: GREEN }],
    answer: 1,
    hint: 'Red, blue, red, blue… what comes after red?',
  },
  {
    kind: 'count',
    prompt: 'How many apples can you count?',
    token: { food: 'apple' },
    amount: 4,
    options: [3, 4, 5],
    hint: 'Let’s point at each apple and count slowly.',
  },
  {
    kind: 'odd',
    prompt: 'Which one is different?',
    items: [{ icon: 'star' }, { icon: 'star' }, { icon: 'heart' }, { icon: 'star' }],
    answer: 2,
    hint: 'Look carefully at each shape.',
  },
  {
    kind: 'pattern',
    prompt: 'Finish the pattern!',
    sequence: [{ icon: 'heart' }, { icon: 'star' }, { icon: 'star' }, { icon: 'heart' }, { icon: 'star' }],
    options: [{ icon: 'heart' }, { icon: 'star' }, { icon: 'coin' }],
    answer: 1,
    hint: 'Heart, star, star… then heart, star, and…?',
  },
];
