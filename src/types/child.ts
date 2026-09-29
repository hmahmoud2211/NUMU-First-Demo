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

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  avatarId: string;
  ageGroupId: AgeGroupId;
  learningArea: LearningAreaId | null;
  createdAt: string;
};
