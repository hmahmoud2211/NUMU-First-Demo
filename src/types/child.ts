export type AgeGroupId = 'early' | 'middle' | 'teen';

/** Text that differs per age group. */
export type AgeText = Record<AgeGroupId, string>;

export type LearningAreaId =
  | 'emotion-recognition'
  | 'social-interaction'
  | 'communication'
  | 'joint-attention'
  | 'daily-skills';

export type ParentProfile = {
  id: string;
  name: string;
  email: string;
  isDemo: boolean;
  createdAt: string;
};

/**
 * Result band from the pre-world reasoning check-in. This is NOT an IQ score;
 * it only tunes the world's starting difficulty and decides whether to show
 * parents a gentle "consider talking to a specialist" note.
 */
export type ReasoningBand = 'typical' | 'emerging' | 'support';

export type ReasoningCheckResult = {
  completedAt: string;
  correct: number;
  total: number;
  band: ReasoningBand;
};

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  avatarId: string;
  ageGroupId: AgeGroupId;
  learningArea: LearningAreaId | null;
  /** Set once the child finishes the reasoning check-in before entering the world. */
  reasoningCheck?: ReasoningCheckResult;
  createdAt: string;
};
