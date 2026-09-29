/**
 * Builds lessons and game questions from the centralized data sets.
 * A real backend could later return the same `LearningQuestion` objects.
 */
import { getEmotionPool, pickAgeText, type AgeGroupConfig } from '@/config/ageGroups';
import { LESSON, type LevelConfig } from '@/config/gameConfig';
import { EMOTION_LESSONS } from '@/data/emotionLessons';
import { getImagesForEmotion } from '@/data/emotions';
import { getStories } from '@/data/emotionStories';
import { QUESTION_PROMPTS, fillTemplate } from '@/data/gameQuestions';
import type { Emotion, EmotionImage } from '@/types/emotion';
import type {
  FaceBuilderQuestion,
  FaceQuestion,
  LearningQuestion,
  LessonStep,
  MatchingQuestion,
  QuestionType,
  StoryQuestion,
} from '@/types/learning';
import { buildAnswerOptions, getEmotionLabel, normaliseOptions } from '@/utils/emotionHelpers';
import { createRandom, pick, shuffle, type Random } from '@/utils/random';

type GeneratorContext = {
  group: AgeGroupConfig;
  random: Random;
  /** Tracks used images/stories so a session avoids repeats where possible. */
  used: Set<string>;
};

export function createGeneratorContext(group: AgeGroupConfig, seed: string): GeneratorContext {
  return { group, random: createRandom(seed), used: new Set() };
}

function pickUnused<T extends { id: string }>(items: T[], ctx: GeneratorContext): T | undefined {
  const fresh = items.filter((item) => !ctx.used.has(item.id));
  const chosen = pick(fresh.length > 0 ? fresh : items, ctx.random);
  if (chosen) ctx.used.add(chosen.id);
  return chosen;
}

function pickImage(emotion: Emotion, ctx: GeneratorContext): EmotionImage | undefined {
  return pickUnused(getImagesForEmotion(emotion), ctx);
}

export function buildFaceQuestion(
  id: string,
  target: Emotion,
  ctx: GeneratorContext,
  options?: Emotion[],
): FaceQuestion | null {
  const image = pickImage(target, ctx);
  if (!image) return null;
  const { group } = ctx;
  const label = getEmotionLabel(target, group.id).toLowerCase();
  return {
    id,
    type: 'face',
    targetEmotion: target,
    image,
    prompt: pickAgeText(QUESTION_PROMPTS.face, group.id),
    options: options ?? buildAnswerOptions(target, group, ctx.random),
    explanation: `${fillTemplate(pickAgeText(QUESTION_PROMPTS.faceExplanation, group.id), { emotion: label })} ${pickAgeText(
      EMOTION_LESSONS[target].examples[0],
      group.id,
    )}`,
    difficulty: image.difficulty,
  };
}

export function buildStoryQuestion(
  id: string,
  target: Emotion,
  type: 'story' | 'situation',
  ctx: GeneratorContext,
): StoryQuestion | null {
  const { group } = ctx;
  const story = pickUnused(getStories(type === 'story' ? 'lesson' : 'situation', target, group.storyComplexity), ctx);
  if (!story) return null;
  const difficulty = group.storyComplexity === 'simple' ? 1 : group.storyComplexity === 'medium' ? 2 : 3;
  return {
    id,
    type,
    targetEmotion: target,
    story: story.text,
    character: story.character,
    prompt: fillTemplate(pickAgeText(QUESTION_PROMPTS[type], group.id), { name: story.character }),
    hint: pickAgeText(EMOTION_LESSONS[target].situationHint, group.id),
    options: normaliseOptions(target, story.options, group, ctx.random),
    explanation: story.explanation,
    difficulty,
  };
}

export function buildMatchingQuestion(id: string, emotions: Emotion[], ctx: GeneratorContext): MatchingQuestion | null {
  const pairs = emotions.flatMap((emotion, index) => {
    const image = pickImage(emotion, ctx);
    return image ? [{ id: `${id}-pair${index}`, emotion, image }] : [];
  });
  if (pairs.length < 2) return null;
  return {
    id,
    type: 'matching',
    targetEmotion: pairs[0].emotion,
    pairs: shuffle(pairs, ctx.random),
    labels: shuffle(
      pairs.map((pair) => pair.emotion),
      ctx.random,
    ),
    prompt: pickAgeText(QUESTION_PROMPTS.matching, ctx.group.id),
    explanation: 'Each face has clues in the eyes, eyebrows and mouth.',
    difficulty: 2,
  };
}

export function buildFaceBuilderQuestion(id: string, target: Emotion, ctx: GeneratorContext): FaceBuilderQuestion {
  const { group } = ctx;
  const label = getEmotionLabel(target, group.id).toUpperCase();
  return {
    id,
    type: 'face-builder',
    targetEmotion: target,
    prompt: fillTemplate(pickAgeText(QUESTION_PROMPTS.faceBuilder, group.id), { emotion: label }),
    explanation: pickAgeText(EMOTION_LESSONS[target].intro, group.id),
    difficulty: 2,
  };
}

/** Face-builder only offers emotions whose face parts are available to the age group. */
function canBuild(emotion: Emotion, group: AgeGroupConfig): boolean {
  return emotion !== 'disgust' || group.faceBuilderOptions.mouth.includes('scrunch');
}

export function buildQuestion(
  id: string,
  type: QuestionType,
  target: Emotion,
  ctx: GeneratorContext,
): LearningQuestion | null {
  switch (type) {
    case 'face':
      return buildFaceQuestion(id, target, ctx);
    case 'story':
    case 'situation':
      return buildStoryQuestion(id, target, type, ctx);
    case 'face-builder':
      return buildFaceBuilderQuestion(id, canBuild(target, ctx.group) ? target : 'happy', ctx);
    case 'matching': {
      const others = shuffle(
        getEmotionPool(ctx.group).filter((emotion) => emotion !== target),
        ctx.random,
      );
      return buildMatchingQuestion(id, [target, ...others].slice(0, ctx.group.matchingPairCount), ctx);
    }
  }
}

/**
 * Chooses which emotions a level asks about. Every core emotion appears
 * first; extra slots go to focus (weak) emotions — this is where past
 * mistakes change future activities.
 */
function chooseTargets(level: LevelConfig, ctx: GeneratorContext, focus: Emotion[]): Emotion[] {
  const { group, random } = ctx;
  const base = level.id === 5 ? getEmotionPool(group) : group.coreEmotions;
  const focusInPool = focus.filter((emotion) => getEmotionPool(group).includes(emotion));
  const ordered = shuffle(base, random);
  const count = level.questionCount;
  const focusSlots =
    focusInPool.length === 0 ? 0 : Math.min(focusInPool.length, Math.max(1, count - ordered.length));
  const targets = [
    ...Array.from({ length: count - focusSlots }, (_, index) => ordered[index % ordered.length]),
    ...focusInPool.slice(0, focusSlots),
  ];
  return shuffle(targets, random);
}

export function buildLevelQuestions(
  level: LevelConfig,
  group: AgeGroupConfig,
  seed: string,
  focus: Emotion[],
): LearningQuestion[] {
  const ctx = createGeneratorContext(group, seed);
  if (level.questionTypes.includes('matching') && level.questionTypes.length === 1) {
    const matching = buildQuestion(`L${level.id}-match`, 'matching', focus[0] ?? group.coreEmotions[0], ctx);
    return matching ? [matching] : [];
  }
  const targets = chooseTargets(level, ctx, focus);
  return targets.flatMap((target, index) => {
    const type = level.questionTypes[index % level.questionTypes.length];
    const question = buildQuestion(`L${level.id}-q${index + 1}`, type, target, ctx);
    return question ? [question] : [];
  });
}

/** Teaching sequence: examples for each core emotion, each followed by a short story. */
export function buildLessonSteps(group: AgeGroupConfig, seed: string): LessonStep[] {
  const ctx = createGeneratorContext(group, seed);
  const emotions = group.coreEmotions.slice(0, 4);
  const perEmotion = Math.floor(LESSON.totalExamples / emotions.length);
  const remainder = LESSON.totalExamples % emotions.length;

  return emotions.flatMap((emotion, emotionIndex) => {
    const lesson = EMOTION_LESSONS[emotion];
    const count = perEmotion + (emotionIndex < remainder ? 1 : 0);
    const images = getImagesForEmotion(emotion).slice(0, count);
    const examples: LessonStep[] = images.map((image, index) => ({
      kind: 'example',
      id: `lesson-${emotion}-${index}`,
      emotion,
      image,
      text: pickAgeText(lesson.examples[index % lesson.examples.length], group.id),
      index,
      total: images.length,
    }));
    const story = buildStoryQuestion(`lesson-story-${emotion}`, emotion, 'story', ctx);
    return story ? [...examples, { kind: 'story', id: story.id, emotion, question: story }] : examples;
  });
}
