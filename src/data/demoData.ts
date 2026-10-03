import type { ChildProfile, ParentProfile } from '@/types/child';
import type { Confusion, EmotionStats, SessionSummary } from '@/types/learning';

export const DEMO_PARENT: ParentProfile = {
  id: 'demo-parent',
  name: 'Demo Parent',
  email: 'demo@numu.app',
  isDemo: true,
  createdAt: '2026-09-01T09:00:00.000Z',
};

export const DEMO_CHILD: ChildProfile = {
  id: 'demo-child-adam',
  name: 'Adam',
  age: 7,
  avatarId: 'lion',
  ageGroupId: 'early',
  learningArea: 'emotion-recognition',
  reasoningCheck: {
    completedAt: '2026-09-01T09:10:00.000Z',
    correct: 7,
    total: 10,
    band: 'typical',
  },
  createdAt: '2026-09-01T09:05:00.000Z',
};

function demoSession(
  id: string,
  completedAt: string,
  emotionStats: EmotionStats,
  confusions: Confusion[],
  badgeId: string,
): SessionSummary {
  const stats = Object.values(emotionStats);
  const questionCount = stats.reduce((sum, stat) => sum + stat.attempted, 0);
  const correctCount = stats.reduce((sum, stat) => sum + stat.correct, 0);
  return {
    id,
    kind: 'game',
    area: 'emotion-recognition',
    completedAt,
    questionCount,
    correctCount,
    accuracy: questionCount === 0 ? 0 : correctCount / questionCount,
    // Demo sessions: incorrect first attempts usually solved on the second try (+7).
    score: correctCount * 10 + (questionCount - correctCount) * 7,
    maxScore: questionCount * 10,
    emotionStats,
    confusions,
    focusEmotions: ['fear', 'surprise'],
    badgeId,
  };
}

/** Pre-filled history so the parent dashboard shows a trend: 65% → 72% → 81%. */
export const DEMO_HISTORY: SessionSummary[] = [
  demoSession(
    'demo-session-1',
    '2026-09-08T16:30:00.000Z',
    {
      happy: { attempted: 5, correct: 4 },
      sad: { attempted: 4, correct: 3 },
      angry: { attempted: 4, correct: 3 },
      fear: { attempted: 4, correct: 1 },
      surprise: { attempted: 3, correct: 2 },
    },
    [
      { expected: 'fear', selected: 'surprise', count: 2 },
      { expected: 'sad', selected: 'neutral', count: 1 },
      { expected: 'fear', selected: 'sad', count: 1 },
      { expected: 'angry', selected: 'sad', count: 1 },
    ],
    'emotion-explorer',
  ),
  demoSession(
    'demo-session-2',
    '2026-09-15T16:45:00.000Z',
    {
      happy: { attempted: 5, correct: 5 },
      sad: { attempted: 5, correct: 4 },
      angry: { attempted: 5, correct: 4 },
      fear: { attempted: 5, correct: 2 },
      surprise: { attempted: 5, correct: 3 },
    },
    [
      { expected: 'fear', selected: 'surprise', count: 1 },
      { expected: 'surprise', selected: 'fear', count: 1 },
      { expected: 'sad', selected: 'neutral', count: 1 },
    ],
    'happy-hero',
  ),
  demoSession(
    'demo-session-3',
    '2026-09-22T17:00:00.000Z',
    {
      happy: { attempted: 6, correct: 6 },
      sad: { attempted: 6, correct: 5 },
      angry: { attempted: 5, correct: 4 },
      fear: { attempted: 5, correct: 3 },
      surprise: { attempted: 4, correct: 3 },
    },
    [{ expected: 'surprise', selected: 'fear', count: 1 }],
    'face-detective',
  ),
];
