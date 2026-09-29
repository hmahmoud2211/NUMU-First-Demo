export type BadgeId = 'emotion-explorer' | 'happy-hero' | 'face-detective' | 'story-solver' | 'practice-star';

export type Badge = {
  id: BadgeId;
  title: string;
  emoji: string;
  description: string;
};

export const BADGES: Record<BadgeId, Badge> = {
  'emotion-explorer': {
    id: 'emotion-explorer',
    title: 'Emotion Explorer',
    emoji: '🧭',
    description: 'Finished an emotion learning session.',
  },
  'happy-hero': {
    id: 'happy-hero',
    title: 'Happy Hero',
    emoji: '🌞',
    description: 'Spotted every happy face.',
  },
  'face-detective': {
    id: 'face-detective',
    title: 'Face Detective',
    emoji: '🔍',
    description: 'Read faces with great care.',
  },
  'story-solver': {
    id: 'story-solver',
    title: 'Story Solver',
    emoji: '📚',
    description: 'Understood how people feel in stories.',
  },
  'practice-star': {
    id: 'practice-star',
    title: 'Practice Star',
    emoji: '⭐',
    description: 'Practised the tricky emotions.',
  },
};
