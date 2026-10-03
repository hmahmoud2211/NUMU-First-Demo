import type { Currency, LocationId, QuestId, RewardId, RewardSlot, SkillId, WorldProgress } from '@/types/world';

export type LocationConfig = {
  id: LocationId;
  name: string;
  /** Main colour of the building label and scene accents. */
  color: string;
  skills: SkillId[];
  quest: QuestId;
};

export const LOCATIONS: Record<LocationId, LocationConfig> = {
  feelings: { id: 'feelings', name: 'House of Feelings', color: '#FF5C8A', skills: ['emotions'], quest: 'feel' },
  learning: { id: 'learning', name: 'Learning Center', color: '#4C7DFF', skills: ['learning', 'attention'], quest: 'puzzle' },
  market: { id: 'market', name: 'Market', color: '#FF9F1C', skills: ['problemSolving', 'attention'], quest: 'healthy-food' },
  playground: { id: 'playground', name: 'Playground', color: '#22B8A7', skills: ['social'], quest: 'help-friend' },
};

export const LOCATION_ORDER: LocationId[] = ['feelings', 'learning', 'playground', 'market'];

export type SkillConfig = {
  id: SkillId;
  label: string;
  color: string;
};

export const SKILLS: SkillConfig[] = [
  { id: 'emotions', label: 'Emotions', color: '#FF5C7A' },
  { id: 'attention', label: 'Attention', color: '#4C7DFF' },
  { id: 'social', label: 'Social Skills', color: '#9B5CFF' },
  { id: 'problemSolving', label: 'Problem Solving', color: '#FF9F1C' },
  { id: 'learning', label: 'Learning', color: '#1EC8B0' },
];

export type QuestConfig = {
  id: QuestId;
  title: string;
  location: LocationId;
  /** Bonus stars the first time the quest is completed each day. */
  stars: number;
};

export const QUESTS: QuestConfig[] = [
  { id: 'feel', title: 'Tell how you feel', location: 'feelings', stars: 5 },
  { id: 'healthy-food', title: 'Find 3 healthy foods', location: 'market', stars: 5 },
  { id: 'help-friend', title: 'Help a friend in the playground', location: 'playground', stars: 5 },
  { id: 'puzzle', title: 'Solve a puzzle at the Learning Center', location: 'learning', stars: 5 },
];

export type RewardConfig = {
  id: RewardId;
  name: string;
  slot: RewardSlot;
  price: number;
  currency: Currency;
};

/**
 * Cosmetic rewards only. Prices are fixed and visible up front: no timers,
 * no random drops and nothing that can be bought with real money.
 */
export const REWARDS: RewardConfig[] = [
  { id: 'backpack', name: 'Backpack', slot: 'back', price: 10, currency: 'stars' },
  { id: 'cap', name: 'Cap', slot: 'head', price: 20, currency: 'stars' },
  { id: 'skateboard', name: 'Skateboard', slot: 'ride', price: 30, currency: 'stars' },
  { id: 'bike', name: 'Bike', slot: 'ride', price: 50, currency: 'stars' },
  { id: 'sunglasses', name: 'Sunglasses', slot: 'face', price: 30, currency: 'coins' },
  { id: 'headphones', name: 'Headphones', slot: 'head', price: 40, currency: 'coins' },
  { id: 'scarf', name: 'Scarf', slot: 'neck', price: 50, currency: 'coins' },
  { id: 'crown', name: 'Crown', slot: 'head', price: 80, currency: 'coins' },
];

export function getReward(id: RewardId): RewardConfig {
  return REWARDS.find((reward) => reward.id === id) ?? REWARDS[0];
}

export const PROGRESSION = {
  starsPerLevel: 20,
  skillPointsPerStage: 6,
  skillStages: 5,
  /** Coins for finishing any mini-game. */
  activityCoins: 10,
  historyLimit: 20,
} as const;

export type AchievementIcon = 'star' | 'heart' | 'book' | 'cart' | 'ball' | 'trophy' | 'flag';

export type AchievementConfig = {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  color: string;
  isUnlocked: (progress: WorldProgress) => boolean;
};

export const ACHIEVEMENTS: AchievementConfig[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Finish your first adventure',
    icon: 'flag',
    color: '#22B8A7',
    isUnlocked: (p) => p.history.length > 0,
  },
  {
    id: 'feelings-friend',
    title: 'Feelings Friend',
    description: 'Visit the House of Feelings',
    icon: 'heart',
    color: '#FF5C8A',
    isUnlocked: (p) => (p.visits.feelings ?? 0) > 0,
  },
  {
    id: 'bright-mind',
    title: 'Bright Mind',
    description: 'Solve puzzles at the Learning Center',
    icon: 'book',
    color: '#4C7DFF',
    isUnlocked: (p) => (p.visits.learning ?? 0) > 0,
  },
  {
    id: 'healthy-helper',
    title: 'Healthy Helper',
    description: 'Help at the Market',
    icon: 'cart',
    color: '#FF9F1C',
    isUnlocked: (p) => (p.visits.market ?? 0) > 0,
  },
  {
    id: 'super-friend',
    title: 'Super Friend',
    description: 'Play kindly at the Playground',
    icon: 'ball',
    color: '#9B5CFF',
    isUnlocked: (p) => (p.visits.playground ?? 0) > 0,
  },
  {
    id: 'star-collector',
    title: 'Star Collector',
    description: 'Earn 50 stars',
    icon: 'star',
    color: '#FFB800',
    isUnlocked: (p) => p.totalStars >= 50,
  },
  {
    id: 'quest-hero',
    title: 'Quest Hero',
    description: 'Finish all of a day’s quests',
    icon: 'trophy',
    color: '#FF7A45',
    isUnlocked: (p) => p.questDaysCompleted > 0,
  },
];
