/** Places the child can visit on the world map. */
export type LocationId = 'feelings' | 'learning' | 'market' | 'playground';

export type SkillId = 'emotions' | 'attention' | 'social' | 'problemSolving' | 'learning';

export type QuestId = 'feel' | 'healthy-food' | 'help-friend' | 'puzzle';

/** Feelings offered in the House of Feelings check-in. */
export type FeelingId = 'happy' | 'sad' | 'angry' | 'worried' | 'calm';

export type RewardSlot = 'back' | 'head' | 'face' | 'neck' | 'ride';

export type RewardId = 'backpack' | 'cap' | 'skateboard' | 'bike' | 'sunglasses' | 'headphones' | 'scarf' | 'crown';

export type Currency = 'stars' | 'coins';

export type Equipment = Partial<Record<RewardSlot, RewardId>>;

export type SkillPoints = Record<SkillId, number>;

export type ActivityRecord = {
  location: LocationId;
  stars: number;
  at: string;
};

export type FeelingCheckIn = {
  feeling: FeelingId;
  at: string;
};

export type WorldProgress = {
  /** Stars the child can spend in the reward shop. */
  stars: number;
  /** Every star ever earned. Drives the player level, so spending never lowers it. */
  totalStars: number;
  coins: number;
  skills: SkillPoints;
  /** Daily quests reset when `day` is no longer today. */
  quests: { day: string; done: QuestId[] };
  owned: RewardId[];
  equipped: Equipment;
  visits: Partial<Record<LocationId, number>>;
  /** Most recent first, capped. */
  history: ActivityRecord[];
  /** Feelings check-ins, most recent first, capped. Shared with parents later. */
  feelings: FeelingCheckIn[];
  questDaysCompleted: number;
  settings: { voice: boolean };
};

/** What a finished mini-game hands to the world. */
export type ActivityReward = {
  location: LocationId;
  stars: number;
  coins: number;
  skills: Partial<SkillPoints>;
};

/** Everything the celebration screen needs to show what changed. */
export type RewardSummary = ActivityReward & {
  /** Quest completed by this activity, if it was not already done today. */
  quest: QuestId | null;
  questBonusStars: number;
  allQuestsDone: boolean;
  levelBefore: number;
  levelAfter: number;
  skillsBefore: SkillPoints;
  skillsAfter: SkillPoints;
};
