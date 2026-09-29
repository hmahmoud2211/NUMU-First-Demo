/**
 * Age-adapted wording for generated game questions. The question generator
 * combines these templates with emotion images and stories.
 */
import type { AgeText } from '@/types/child';

export const QUESTION_PROMPTS = {
  face: {
    early: 'How does this face feel?',
    middle: 'How is this person feeling?',
    teen: 'Which emotion is this person most likely showing?',
  },
  story: {
    early: 'How does {name} feel?',
    middle: 'How does {name} feel?',
    teen: 'How is {name} most likely feeling?',
  },
  situation: {
    early: 'How does {name} feel?',
    middle: 'How might {name} feel?',
    teen: 'What is {name} most likely feeling?',
  },
  matching: {
    early: 'Match each face to its feeling!',
    middle: 'Tap a face, then tap the feeling that matches.',
    teen: 'Match each expression with the emotion it shows.',
  },
  faceBuilder: {
    early: 'Can you make a {emotion} face?',
    middle: 'Can you build a {emotion} face?',
    teen: 'Build a face that shows {emotion}.',
  },
  faceExplanation: {
    early: 'This face looks {emotion}.',
    middle: 'This face looks {emotion}.',
    teen: 'This expression shows {emotion}.',
  },
} satisfies Record<string, AgeText>;

export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}
