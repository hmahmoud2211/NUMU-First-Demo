import type { LearningAreaId } from '@/types/child';

export type LearningArea = {
  id: LearningAreaId;
  title: string;
  description: string;
  emoji: string;
  available: boolean;
};

export const LEARNING_AREAS: LearningArea[] = [
  {
    id: 'emotion-recognition',
    title: 'Emotion Recognition',
    description: 'Recognize and understand feelings in faces and situations.',
    emoji: '😊',
    available: true,
  },
  {
    id: 'social-interaction',
    title: 'Social Interaction',
    description: 'Practice taking turns, greetings and sharing.',
    emoji: '🤝',
    available: false,
  },
  {
    id: 'communication',
    title: 'Communication',
    description: 'Build words, requests and conversation skills.',
    emoji: '💬',
    available: false,
  },
  {
    id: 'joint-attention',
    title: 'Joint Attention',
    description: 'Look and share focus together.',
    emoji: '👀',
    available: false,
  },
  {
    id: 'daily-skills',
    title: 'Daily Skills',
    description: 'Routines like dressing, washing and eating.',
    emoji: '🪥',
    available: false,
  },
];

export function getLearningArea(id: LearningAreaId | null | undefined): LearningArea | undefined {
  return LEARNING_AREAS.find((area) => area.id === id);
}
