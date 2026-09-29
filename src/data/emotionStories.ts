import type { StoryComplexity } from '@/config/ageGroups';
import type { Emotion } from '@/types/emotion';

export type EmotionStory = {
  id: string;
  /** 'lesson' stories follow teaching; 'situation' items power the game levels. */
  kind: 'lesson' | 'situation';
  emotion: Emotion;
  complexity: StoryComplexity;
  character: string;
  text: string;
  explanation: string;
  /** Optional hand-picked answer choices (the target is always included). */
  options?: Emotion[];
};

export const EMOTION_STORIES: EmotionStory[] = [
  // ───────────── Lesson stories ─────────────
  // HAPPY
  { id: 'ls_happy_s', kind: 'lesson', emotion: 'happy', complexity: 'simple', character: 'Adam',
    text: 'Adam made a drawing. His teacher said, “Great job!”',
    explanation: 'Adam got nice words. He feels happy.' },
  { id: 'ls_happy_m', kind: 'lesson', emotion: 'happy', complexity: 'medium', character: 'Adam',
    text: 'Adam worked very hard on his drawing. His teacher looked at it and said, “Great job!” Adam smiled and wanted to show the picture to his mother.',
    explanation: 'Adam received praise for something he worked hard on, so he feels happy.' },
  { id: 'ls_happy_a', kind: 'lesson', emotion: 'happy', complexity: 'advanced', character: 'Lina',
    text: 'Lina spent weeks preparing for the school science fair. When the results were announced, her project got an honourable mention, and two classmates asked her to explain how she built it.',
    explanation: 'Lina’s effort was recognised and her classmates showed interest — that usually brings happiness and pride.' },
  // SAD
  { id: 'ls_sad_s', kind: 'lesson', emotion: 'sad', complexity: 'simple', character: 'Mia',
    text: 'Mia’s balloon flew away. She cannot get it back.',
    explanation: 'Mia lost her balloon. She feels sad.' },
  { id: 'ls_sad_m', kind: 'lesson', emotion: 'sad', complexity: 'medium', character: 'Omar',
    text: 'Omar’s best friend moved to another city. At break time, Omar sat on the bench where they used to play together.',
    explanation: 'Omar misses his friend. Missing someone often makes us feel sad.' },
  { id: 'ls_sad_a', kind: 'lesson', emotion: 'sad', complexity: 'advanced', character: 'Yousef',
    text: 'Yousef practised for weeks to join the football team, but his name was not on the final list. He walked home quietly and did not feel like talking.',
    explanation: 'Yousef hoped for something important and it did not happen. Disappointment like this often feels like sadness.' },
  // ANGRY
  { id: 'ls_angry_s', kind: 'lesson', emotion: 'angry', complexity: 'simple', character: 'Sam',
    text: 'A boy knocked down Sam’s tower on purpose.',
    explanation: 'That was not fair to Sam. He feels angry.' },
  { id: 'ls_angry_m', kind: 'lesson', emotion: 'angry', complexity: 'medium', character: 'Noor',
    text: 'Noor was waiting in line for the swing. Another child pushed in front of her and took her turn.',
    explanation: 'Someone took Noor’s turn unfairly. Unfair things can make us feel angry.' },
  { id: 'ls_angry_a', kind: 'lesson', emotion: 'angry', complexity: 'advanced', character: 'Karim',
    text: 'Karim did most of the work on a group project, but during the presentation a teammate said it was mostly their idea.',
    explanation: 'Karim’s work was taken credit for. Being treated unfairly often leads to anger.' },
  // FEAR
  { id: 'ls_fear_s', kind: 'lesson', emotion: 'fear', complexity: 'simple', character: 'Leo',
    text: 'Leo hears a loud BOOM in the dark.',
    explanation: 'Leo does not feel safe. He feels scared.' },
  { id: 'ls_fear_m', kind: 'lesson', emotion: 'fear', complexity: 'medium', character: 'Sarah',
    text: 'Sarah was shopping with her mother in a busy shop. She turned around and could not see her mother anywhere.',
    explanation: 'Sarah does not know where her mother is, so she feels afraid.' },
  { id: 'ls_fear_a', kind: 'lesson', emotion: 'fear', complexity: 'advanced', character: 'Maya',
    text: 'Maya is walking home after dark. She hears footsteps behind her that speed up when she speeds up.',
    explanation: 'Maya feels she might be in danger. That uncertain, unsafe feeling is fear.' },
  // SURPRISE
  { id: 'ls_surprise_s', kind: 'lesson', emotion: 'surprise', complexity: 'simple', character: 'Zara',
    text: 'Zara opens the door. Everyone shouts, “Happy birthday!”',
    explanation: 'Zara did not expect it. She feels surprised.' },
  { id: 'ls_surprise_m', kind: 'lesson', emotion: 'surprise', complexity: 'medium', character: 'Ali',
    text: 'Ali opened his lunchbox and found a tiny note from his dad and a cookie he did not know was there.',
    explanation: 'Ali found something he did not expect. That is surprise.' },
  { id: 'ls_surprise_a', kind: 'lesson', emotion: 'surprise', complexity: 'advanced', character: 'Huda',
    text: 'Huda’s quiet classmate, who rarely speaks, suddenly stood up and gave a confident speech that made everyone cheer.',
    explanation: 'Huda did not expect this at all. Surprise happens when something unexpected happens.' },
  // DISGUST
  { id: 'ls_disgust_s', kind: 'lesson', emotion: 'disgust', complexity: 'simple', character: 'Ben',
    text: 'Ben smells old milk. Yuck!',
    explanation: 'The smell is yucky. Ben feels disgust.' },
  { id: 'ls_disgust_m', kind: 'lesson', emotion: 'disgust', complexity: 'medium', character: 'Rana',
    text: 'Rana found a hair in her soup at a restaurant and pushed the bowl away.',
    explanation: 'Something unpleasant was in her food, so Rana feels disgust.' },
  { id: 'ls_disgust_a', kind: 'lesson', emotion: 'disgust', complexity: 'advanced', character: 'Tariq',
    text: 'Tariq watched a student throw rubbish on the floor right next to the bin and laugh about it.',
    explanation: 'Disgust can also be a reaction to behaviour we find unacceptable.' },
  // NEUTRAL
  { id: 'ls_neutral_s', kind: 'lesson', emotion: 'neutral', complexity: 'simple', character: 'Eva',
    text: 'Eva sits and waits for the bus.',
    explanation: 'Nothing special is happening. Eva feels calm.' },
  { id: 'ls_neutral_m', kind: 'lesson', emotion: 'neutral', complexity: 'medium', character: 'Adam',
    text: 'Adam is reading the instructions for his homework at the kitchen table.',
    explanation: 'Adam is concentrating on an ordinary task. His face is likely neutral.' },
  { id: 'ls_neutral_a', kind: 'lesson', emotion: 'neutral', complexity: 'advanced', character: 'Jana',
    text: 'Jana is listening to the teacher explain tomorrow’s timetable, which is the same as usual.',
    explanation: 'An ordinary moment often comes with a neutral face — it does not mean Jana feels nothing.' },

  // ───────────── Situations (Level 2, mixed level and practice) ─────────────
  // simple
  { id: 'st_s_happy_1', kind: 'situation', emotion: 'happy', complexity: 'simple', character: 'Mia',
    text: 'Mia gets a new puppy.', explanation: 'A new puppy is a nice surprise gift. Mia feels happy.' },
  { id: 'st_s_happy_2', kind: 'situation', emotion: 'happy', complexity: 'simple', character: 'Adam',
    text: 'Adam plays in the park with his dad.', explanation: 'Playing with Dad is fun. Adam feels happy.' },
  { id: 'st_s_sad_1', kind: 'situation', emotion: 'sad', complexity: 'simple', character: 'Leo',
    text: 'Leo’s ice cream falls on the ground.', explanation: 'Leo lost his ice cream. He feels sad.' },
  { id: 'st_s_sad_2', kind: 'situation', emotion: 'sad', complexity: 'simple', character: 'Zara',
    text: 'Zara’s friend cannot come to play today.', explanation: 'Zara misses playing with her friend. She feels sad.' },
  { id: 'st_s_angry_1', kind: 'situation', emotion: 'angry', complexity: 'simple', character: 'Sam',
    text: 'Someone grabs Sam’s toy.', explanation: 'That was not fair. Sam feels angry.' },
  { id: 'st_s_angry_2', kind: 'situation', emotion: 'angry', complexity: 'simple', character: 'Noor',
    text: 'Noor’s brother tears her picture.', explanation: 'Her picture was ruined. Noor feels angry.' },
  { id: 'st_s_fear_1', kind: 'situation', emotion: 'fear', complexity: 'simple', character: 'Sarah',
    text: 'Sarah cannot find her mother in the shop.', explanation: 'Sarah does not feel safe. She feels scared.',
    options: ['fear', 'happy', 'surprise'] },
  { id: 'st_s_fear_2', kind: 'situation', emotion: 'fear', complexity: 'simple', character: 'Ali',
    text: 'A big dog barks loudly at Ali.', explanation: 'The big dog feels dangerous. Ali feels scared.' },
  { id: 'st_s_surprise_1', kind: 'situation', emotion: 'surprise', complexity: 'simple', character: 'Eva',
    text: 'A clown pops out of a box!', explanation: 'Eva did not expect that. She feels surprised.' },
  { id: 'st_s_neutral_1', kind: 'situation', emotion: 'neutral', complexity: 'simple', character: 'Ben',
    text: 'Ben brushes his teeth like every day.', explanation: 'It is a normal day. Ben feels calm.' },

  // medium
  { id: 'st_m_happy_1', kind: 'situation', emotion: 'happy', complexity: 'medium', character: 'Omar',
    text: 'Omar’s team won the class quiz, and everyone got a sticker.', explanation: 'Winning together feels good, so Omar is happy.' },
  { id: 'st_m_happy_2', kind: 'situation', emotion: 'happy', complexity: 'medium', character: 'Rana',
    text: 'Rana’s grandmother came to visit and brought her favourite cake.', explanation: 'Seeing someone she loves makes Rana happy.' },
  { id: 'st_m_sad_1', kind: 'situation', emotion: 'sad', complexity: 'medium', character: 'Adam',
    text: 'Adam’s goldfish died, and he found its bowl empty in the morning.', explanation: 'Losing a pet is a loss, so Adam feels sad.' },
  { id: 'st_m_sad_2', kind: 'situation', emotion: 'sad', complexity: 'medium', character: 'Lina',
    text: 'Lina was not invited to a classmate’s party that everyone else is going to.', explanation: 'Feeling left out often makes us feel sad.' },
  { id: 'st_m_angry_1', kind: 'situation', emotion: 'angry', complexity: 'medium', character: 'Karim',
    text: 'Karim’s sister read his diary without asking.', explanation: 'His privacy was not respected. That can make Karim angry.' },
  { id: 'st_m_angry_2', kind: 'situation', emotion: 'angry', complexity: 'medium', character: 'Huda',
    text: 'Huda was blamed for breaking a vase that her cousin broke.', explanation: 'Being blamed unfairly can make us angry.' },
  { id: 'st_m_fear_1', kind: 'situation', emotion: 'fear', complexity: 'medium', character: 'Sarah',
    text: 'Sarah cannot find her mother in a crowded shop.', explanation: 'Being lost in a crowd feels unsafe, so Sarah feels afraid.',
    options: ['happy', 'fear', 'surprise', 'neutral'] },
  { id: 'st_m_fear_2', kind: 'situation', emotion: 'fear', complexity: 'medium', character: 'Yousef',
    text: 'During a storm the lights go out and Yousef hears thunder right above the house.', explanation: 'The storm and darkness feel dangerous. Yousef feels afraid.' },
  { id: 'st_m_surprise_1', kind: 'situation', emotion: 'surprise', complexity: 'medium', character: 'Maya',
    text: 'Maya’s teacher suddenly announced a trip to the zoo tomorrow.', explanation: 'Maya did not expect the news. She feels surprised.' },
  { id: 'st_m_surprise_2', kind: 'situation', emotion: 'surprise', complexity: 'medium', character: 'Tariq',
    text: 'Tariq opened a box, and a toy spring jumped out at him.', explanation: 'Something unexpected happened quickly. Tariq feels surprised.' },
  { id: 'st_m_disgust_1', kind: 'situation', emotion: 'disgust', complexity: 'medium', character: 'Ben',
    text: 'Ben stepped in something sticky and smelly on the way to school.', explanation: 'Something unpleasant and smelly causes disgust.' },
  { id: 'st_m_neutral_1', kind: 'situation', emotion: 'neutral', complexity: 'medium', character: 'Jana',
    text: 'Jana is waiting in line at the supermarket with her dad.', explanation: 'Nothing special is happening. Jana probably feels neutral.' },

  // advanced
  { id: 'st_a_happy_1', kind: 'situation', emotion: 'happy', complexity: 'advanced', character: 'Lina',
    text: 'Lina has been nervous about a new school, but on the first day a group invites her to sit with them at lunch.',
    explanation: 'She may still feel a little nervous, but being welcomed mostly brings happiness and relief.' },
  { id: 'st_a_happy_2', kind: 'situation', emotion: 'happy', complexity: 'advanced', character: 'Omar',
    text: 'Omar gets a message from his older brother saying he is proud of how Omar handled a difficult week.',
    explanation: 'Recognition from someone he respects is likely to make Omar happy.' },
  { id: 'st_a_sad_1', kind: 'situation', emotion: 'sad', complexity: 'advanced', character: 'Maya',
    text: 'Maya’s closest friend has started spending every break with a new group and hasn’t replied to her messages.',
    explanation: 'Feeling distance from a close friend usually brings sadness, possibly mixed with confusion.' },
  { id: 'st_a_sad_2', kind: 'situation', emotion: 'sad', complexity: 'advanced', character: 'Karim',
    text: 'Karim finds out his family is moving away at the end of the year, leaving his friends behind.',
    explanation: 'Losing daily contact with friends is a loss — sadness is a very likely feeling.' },
  { id: 'st_a_angry_1', kind: 'situation', emotion: 'angry', complexity: 'advanced', character: 'Huda',
    text: 'Huda sees a screenshot of her private message being shared in a group chat without her permission.',
    explanation: 'Having her trust broken publicly is likely to make Huda angry (and maybe embarrassed).' },
  { id: 'st_a_angry_2', kind: 'situation', emotion: 'angry', complexity: 'advanced', character: 'Yousef',
    text: 'Yousef’s teammate keeps ignoring the plan they agreed on and then blames Yousef when it goes wrong.',
    explanation: 'Unfair blame after doing his part often leads to anger.' },
  { id: 'st_a_fear_1', kind: 'situation', emotion: 'fear', complexity: 'advanced', character: 'Tariq',
    text: 'Tariq is about to speak in front of the whole school. His hands are shaking and his mind goes blank.',
    explanation: 'Shaking hands and a blank mind are signs of fear or nervousness about what might happen.' },
  { id: 'st_a_fear_2', kind: 'situation', emotion: 'fear', complexity: 'advanced', character: 'Jana',
    text: 'Jana is home alone and hears the back door handle turning slowly.',
    explanation: 'She cannot tell who is there and it may be unsafe — this is fear, not just surprise.',
    options: ['surprise', 'fear', 'angry', 'neutral'] },
  { id: 'st_a_surprise_1', kind: 'situation', emotion: 'surprise', complexity: 'advanced', character: 'Rana',
    text: 'Rana checks her exam results expecting an average grade and discovers she got the top mark in the class.',
    explanation: 'The result was unexpected, so surprise comes first — probably followed quickly by happiness.' },
  { id: 'st_a_surprise_2', kind: 'situation', emotion: 'surprise', complexity: 'advanced', character: 'Ali',
    text: 'Ali’s strict coach, who never jokes, suddenly bursts out laughing at practice.',
    explanation: 'Behaviour that goes against what Ali expects causes surprise.' },
  { id: 'st_a_disgust_1', kind: 'situation', emotion: 'disgust', complexity: 'advanced', character: 'Eva',
    text: 'Eva watches someone cheat in a game and then brag loudly about winning.',
    explanation: 'Disgust can be a reaction to behaviour that feels wrong — possibly mixed with anger.' },
  { id: 'st_a_neutral_1', kind: 'situation', emotion: 'neutral', complexity: 'advanced', character: 'Ben',
    text: 'Ben is copying notes from the board in a normal lesson, the same as every Tuesday.',
    explanation: 'An ordinary routine usually comes with a neutral expression.' },
];

const COMPLEXITY_FALLBACK: Record<StoryComplexity, StoryComplexity[]> = {
  simple: ['simple', 'medium', 'advanced'],
  medium: ['medium', 'simple', 'advanced'],
  advanced: ['advanced', 'medium', 'simple'],
};

/**
 * Stories for an emotion at the requested complexity, falling back to the
 * nearest complexity so the app never shows an empty activity.
 */
export function getStories(kind: EmotionStory['kind'], emotion: Emotion, complexity: StoryComplexity): EmotionStory[] {
  for (const level of COMPLEXITY_FALLBACK[complexity]) {
    const matches = EMOTION_STORIES.filter((s) => s.kind === kind && s.emotion === emotion && s.complexity === level);
    if (matches.length > 0) return matches;
  }
  return [];
}
