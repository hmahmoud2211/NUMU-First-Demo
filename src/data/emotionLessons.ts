import type { AgeText } from '@/types/child';
import type { Emotion, FacePartCategory } from '@/types/emotion';

export type EmotionLesson = {
  emotion: Emotion;
  /** One-line introduction shown on the intro screen. */
  intro: AgeText;
  /** Explanations shown with teaching examples, cycled across examples. */
  examples: AgeText[];
  /** Short visual clue shown after a mistake. Never names the emotion. */
  faceHint: AgeText;
  /** Clue for situation/story questions. Never names the emotion. */
  situationHint: AgeText;
  /** Concise per-part cues used in side-by-side coaching. */
  faceCues: Record<FacePartCategory, string>;
  /** The facial area highlighted when giving a hint. */
  hintPart: FacePartCategory;
};

export const EMOTION_LESSONS: Record<Emotion, EmotionLesson> = {
  happy: {
    emotion: 'happy',
    hintPart: 'mouth',
    intro: {
      early: 'When someone is happy, they may smile.',
      middle: 'When someone is happy, they often smile and their face looks relaxed.',
      teen: 'Happiness usually shows as a genuine smile — the cheeks lift and the eyes may crinkle.',
    },
    examples: [
      {
        early: 'Look at the smile. The mouth goes up.',
        middle: 'Look at the smile. The mouth goes up and the face looks relaxed.',
        teen: 'The corners of the mouth pull up and the cheeks rise. That is a strong happiness cue.',
      },
      {
        early: 'Happy eyes look soft.',
        middle: 'Happy eyes often look soft and a little squeezed from smiling.',
        teen: 'In a real smile the eyes narrow slightly — small lines can appear at the corners.',
      },
      {
        early: 'A happy face feels nice.',
        middle: 'People often feel happy when something good happens.',
        teen: 'Context matters: praise, good news or time with friends often lead to happiness.',
      },
    ],
    faceHint: {
      early: 'Look at the mouth. It goes up.',
      middle: 'Look at the mouth. It is curved upward.',
      teen: 'Check the mouth corners and cheeks — are they lifted?',
    },
    situationHint: {
      early: 'Is this something nice?',
      middle: 'Did something good happen?',
      teen: 'Think about whether this is good news for them.',
    },
    faceCues: {
      eyes: 'Eyes look soft and relaxed.',
      brows: 'Eyebrows are resting or slightly raised.',
      mouth: 'The mouth curves up into a smile.',
    },
  },
  sad: {
    emotion: 'sad',
    hintPart: 'mouth',
    intro: {
      early: 'When someone is sad, their mouth may go down.',
      middle: 'When someone is sad, the mouth may turn down and the eyes may look low.',
      teen: 'Sadness often shows as lowered mouth corners and eyebrows that tilt up in the middle.',
    },
    examples: [
      {
        early: 'Look at the mouth. It goes down.',
        middle: 'Look at the mouth. The corners go down.',
        teen: 'The mouth corners are pulled down — a key sign of sadness.',
      },
      {
        early: 'The eyebrows go up in the middle.',
        middle: 'The eyebrows tilt up in the middle, which can make the face look worried and sad.',
        teen: 'Inner eyebrows lifting upward is a subtle but reliable sadness cue.',
      },
      {
        early: 'Sad faces look tired.',
        middle: 'People can feel sad when they lose something or miss someone.',
        teen: 'Sadness often follows loss or disappointment, and it can look quieter than other emotions.',
      },
    ],
    faceHint: {
      early: 'Look at the mouth. It goes down.',
      middle: 'Look at the mouth. The corners point down.',
      teen: 'Look at the mouth corners and the inner eyebrows.',
    },
    situationHint: {
      early: 'Did they lose something?',
      middle: 'Did they lose something or miss out on something?',
      teen: 'Think about disappointment or loss in this situation.',
    },
    faceCues: {
      eyes: 'Eyes may look down or tired.',
      brows: 'Eyebrows tilt up in the middle.',
      mouth: 'The mouth corners turn down.',
    },
  },
  angry: {
    emotion: 'angry',
    hintPart: 'brows',
    intro: {
      early: 'When someone is angry, their eyebrows go down.',
      middle: 'When someone is angry, their eyebrows pull down and together.',
      teen: 'Anger often shows as lowered, pulled-together eyebrows and a tight mouth.',
    },
    examples: [
      {
        early: 'Look at the eyebrows. They go down.',
        middle: 'Look at the eyebrows. They move down and closer together.',
        teen: 'The eyebrows pull down and inward, creating a frown line between them.',
      },
      {
        early: 'Angry eyes look small.',
        middle: 'Angry eyes may narrow or stare hard.',
        teen: 'The eyes may narrow or look intense — a hard stare.',
      },
      {
        early: 'The mouth is tight.',
        middle: 'The mouth may be pressed tight or turned down.',
        teen: 'Lips may press together tightly, which signals tension.',
      },
    ],
    faceHint: {
      early: 'Look at the eyebrows. They go down.',
      middle: 'Look at the eyebrows. They move down and together.',
      teen: 'Check the eyebrows — are they pulled down and inward?',
    },
    situationHint: {
      early: 'Was something not fair?',
      middle: 'Did something unfair happen to them?',
      teen: 'Think about whether they were treated unfairly or blocked from something.',
    },
    faceCues: {
      eyes: 'Eyes may narrow or stare.',
      brows: 'Eyebrows pull down and together.',
      mouth: 'The mouth is tight or turned down.',
    },
  },
  fear: {
    emotion: 'fear',
    hintPart: 'eyes',
    intro: {
      early: 'When someone is scared, their eyes open wide.',
      middle: 'When someone is scared, their eyes open wide and their mouth may open.',
      teen: 'Fear shows as wide eyes, raised and tense eyebrows, and a mouth stretched open.',
    },
    examples: [
      {
        early: 'Look at the eyes. They are very big.',
        middle: 'Look at the eyes. They open very wide.',
        teen: 'Wide-open eyes showing a lot of white are a strong fear cue.',
      },
      {
        early: 'The eyebrows go up and together.',
        middle: 'The eyebrows go up and move together, which looks worried.',
        teen: 'The eyebrows rise and pull together — more tense than in surprise.',
      },
      {
        early: 'The mouth opens.',
        middle: 'The mouth may open and stretch sideways.',
        teen: 'The mouth often stretches open horizontally, unlike the round “O” of surprise.',
      },
    ],
    faceHint: {
      early: 'Look at the eyes. They are very big.',
      middle: 'Look at the eyes and eyebrows. Do they look worried?',
      teen: 'Look at the eyebrows — raised and tense, or just raised?',
    },
    situationHint: {
      early: 'Do they feel safe?',
      middle: 'Would this make someone feel unsafe or worried?',
      teen: 'Think about whether they feel in danger or unsure what will happen.',
    },
    faceCues: {
      eyes: 'Eyes may be wide open.',
      brows: 'Eyebrows rise and move together.',
      mouth: 'The mouth may open and stretch.',
    },
  },
  surprise: {
    emotion: 'surprise',
    hintPart: 'mouth',
    intro: {
      early: 'When someone is surprised, their mouth makes an “O”.',
      middle: 'When someone is surprised, their eyebrows go up and their mouth may open in an “O”.',
      teen: 'Surprise is brief: raised eyebrows, wide eyes and a dropped, rounded jaw.',
    },
    examples: [
      {
        early: 'Look at the mouth. It is round like an “O”.',
        middle: 'Look at the mouth. It is round like the letter “O”.',
        teen: 'The jaw drops and the mouth forms a rounded shape.',
      },
      {
        early: 'The eyebrows go way up.',
        middle: 'The eyebrows go up high and look curved.',
        teen: 'The eyebrows lift high and stay curved — relaxed, not tense.',
      },
      {
        early: 'Surprise happens fast!',
        middle: 'Surprise happens when something unexpected happens. It can be good or bad.',
        teen: 'Surprise is short-lived and can quickly turn into happiness or fear.',
      },
    ],
    faceHint: {
      early: 'Look at the mouth. Is it round?',
      middle: 'Look at the mouth shape and how high the eyebrows are.',
      teen: 'Is the mouth rounded, and are the eyebrows raised but relaxed?',
    },
    situationHint: {
      early: 'Did they expect it?',
      middle: 'Was this something they did not expect?',
      teen: 'Think about whether this was unexpected.',
    },
    faceCues: {
      eyes: 'Eyes may also be wide.',
      brows: 'Eyebrows are raised high and curved.',
      mouth: 'The mouth forms a round “O”.',
    },
  },
  disgust: {
    emotion: 'disgust',
    hintPart: 'mouth',
    intro: {
      early: 'When something is yucky, the nose scrunches up.',
      middle: 'When someone feels disgust, the nose wrinkles and the upper lip lifts.',
      teen: 'Disgust shows as a wrinkled nose and a raised upper lip — a reaction to something unpleasant.',
    },
    examples: [
      {
        early: 'Look at the mouth. It scrunches.',
        middle: 'Look at the mouth. The top lip pulls up.',
        teen: 'The upper lip rises and the mouth may twist to one side.',
      },
      {
        early: 'The eyes get small.',
        middle: 'The eyes narrow as the nose wrinkles.',
        teen: 'The eyes narrow as the cheeks push up with the wrinkled nose.',
      },
      {
        early: 'Yucky smells make this face.',
        middle: 'People can feel disgust about bad smells or tastes.',
        teen: 'Disgust can be about tastes and smells, but also about behaviour someone finds wrong.',
      },
    ],
    faceHint: {
      early: 'Look at the mouth. It is scrunched.',
      middle: 'Look at the nose and the top lip.',
      teen: 'Check the nose and upper lip — are they wrinkled and lifted?',
    },
    situationHint: {
      early: 'Is it yucky?',
      middle: 'Is there something that tastes or smells bad?',
      teen: 'Think about whether something feels unpleasant or unacceptable to them.',
    },
    faceCues: {
      eyes: 'Eyes narrow.',
      brows: 'Eyebrows pull down.',
      mouth: 'The mouth scrunches and the top lip lifts.',
    },
  },
  neutral: {
    emotion: 'neutral',
    hintPart: 'mouth',
    intro: {
      early: 'A calm face is still and relaxed.',
      middle: 'A neutral face is calm. The mouth is straight and the eyebrows rest.',
      teen: 'A neutral face shows little movement — it does not always mean the person feels nothing.',
    },
    examples: [
      {
        early: 'Look at the mouth. It is flat.',
        middle: 'Look at the mouth. It is straight, not up or down.',
        teen: 'The mouth is relaxed and straight — no strong pull up or down.',
      },
      {
        early: 'The eyebrows rest.',
        middle: 'The eyebrows are resting in their usual place.',
        teen: 'The eyebrows rest naturally with no tension.',
      },
      {
        early: 'Calm faces are quiet.',
        middle: 'People often have a neutral face when they are listening or thinking.',
        teen: 'A neutral face is common while concentrating; context helps you understand how they feel.',
      },
    ],
    faceHint: {
      early: 'Look at the mouth. Is it flat?',
      middle: 'Look at the mouth. Is it going up, down, or straight?',
      teen: 'Is there any strong movement in the face at all?',
    },
    situationHint: {
      early: 'Is it just a normal day?',
      middle: 'Is anything special happening, or is it an ordinary moment?',
      teen: 'Is this an ordinary moment without a strong reason to feel something?',
    },
    faceCues: {
      eyes: 'Eyes look relaxed.',
      brows: 'Eyebrows rest.',
      mouth: 'The mouth is straight.',
    },
  },
};

export const INTRO_MESSAGE: AgeText = {
  early: 'Faces can tell us how someone may be feeling.',
  middle: 'Faces can tell us how someone may be feeling. Let’s learn the clues!',
  teen: 'Faces give clues about how someone may be feeling. Let’s look at the details together.',
};
