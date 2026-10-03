/**
 * Pure progression rules for the NUMU world: levels, skills, daily quests and
 * the reward shop. Contexts call these; nothing here touches storage or React.
 */
import { LOCATIONS, PROGRESSION, QUESTS, getReward } from '@/config/worldConfig';
import type {
  ActivityReward,
  FeelingId,
  QuestId,
  RewardId,
  RewardSummary,
  SkillId,
  SkillPoints,
  WorldProgress,
} from '@/types/world';

const MAX_SKILL_POINTS = PROGRESSION.skillPointsPerStage * PROGRESSION.skillStages;

/** Local calendar day, e.g. "2026-10-03". */
export function todayKey(date: Date = new Date()): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function levelFor(totalStars: number): number {
  return 1 + Math.floor(Math.max(0, totalStars) / PROGRESSION.starsPerLevel);
}

export function levelProgress(totalStars: number): { into: number; needed: number; ratio: number } {
  const needed = PROGRESSION.starsPerLevel;
  const into = Math.max(0, totalStars) % needed;
  return { into, needed, ratio: into / needed };
}

/** Whole stages reached for a skill, 0–5. */
export function skillStage(points: number): number {
  return Math.min(PROGRESSION.skillStages, Math.floor(points / PROGRESSION.skillPointsPerStage));
}

export function skillRatio(points: number): number {
  return Math.min(1, Math.max(0, points / MAX_SKILL_POINTS));
}

const EMPTY_SKILLS: SkillPoints = { emotions: 0, attention: 0, social: 0, problemSolving: 0, learning: 0 };

export function createInitialWorldProgress(voice: boolean): WorldProgress {
  return {
    stars: 0,
    totalStars: 0,
    coins: 0,
    skills: { ...EMPTY_SKILLS },
    quests: { day: todayKey(), done: [] },
    owned: [],
    equipped: {},
    visits: {},
    history: [],
    feelings: [],
    questDaysCompleted: 0,
    settings: { voice },
  };
}

/** A lived-in starting point for the demo child, so every screen has something to show. */
export function createDemoWorldProgress(voice: boolean): WorldProgress {
  const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
  return {
    ...createInitialWorldProgress(voice),
    stars: 12,
    totalStars: 32,
    coins: 50,
    skills: { emotions: 19, attention: 13, social: 18, problemSolving: 25, learning: 18 },
    owned: ['backpack'],
    equipped: { back: 'backpack' },
    visits: { feelings: 3, market: 2, playground: 2, learning: 2 },
    history: [
      { location: 'market', stars: 4, at: daysAgo(1) },
      { location: 'feelings', stars: 3, at: daysAgo(1) },
      { location: 'playground', stars: 3, at: daysAgo(2) },
      { location: 'learning', stars: 4, at: daysAgo(3) },
    ],
    questDaysCompleted: 1,
  };
}

/** Fills in fields added after a save was written, and resets stale daily quests. */
export function normalizeWorldProgress(stored: Partial<WorldProgress>, fallback: WorldProgress): WorldProgress {
  const merged: WorldProgress = {
    ...fallback,
    ...stored,
    skills: { ...EMPTY_SKILLS, ...stored.skills },
    settings: { ...fallback.settings, ...stored.settings },
    quests: stored.quests ?? fallback.quests,
  };
  return withTodayQuests(merged);
}

export function withTodayQuests(progress: WorldProgress, today: string = todayKey()): WorldProgress {
  if (progress.quests.day === today) return progress;
  return { ...progress, quests: { day: today, done: [] } };
}

export function questsDoneToday(progress: WorldProgress, today: string = todayKey()): QuestId[] {
  return progress.quests.day === today ? progress.quests.done : [];
}

function addSkills(base: SkillPoints, gains: Partial<SkillPoints>): SkillPoints {
  const next = { ...base };
  (Object.keys(gains) as SkillId[]).forEach((id) => {
    next[id] = Math.min(MAX_SKILL_POINTS, next[id] + (gains[id] ?? 0));
  });
  return next;
}

/**
 * Applies a finished mini-game: stars, coins, skill points, visit counts and
 * the location's daily quest (with its bonus the first time each day).
 */
export function applyActivity(
  current: WorldProgress,
  reward: ActivityReward,
  now: Date = new Date(),
): { next: WorldProgress; summary: RewardSummary } {
  const progress = withTodayQuests(current, todayKey(now));
  const questId = LOCATIONS[reward.location].quest;
  const questConfig = QUESTS.find((quest) => quest.id === questId);
  const questIsNew = !progress.quests.done.includes(questId);
  const questBonusStars = questIsNew ? (questConfig?.stars ?? 0) : 0;
  const done = questIsNew ? [...progress.quests.done, questId] : progress.quests.done;
  const allQuestsDone = QUESTS.every((quest) => done.includes(quest.id));
  const justFinishedAll = questIsNew && allQuestsDone;

  const earnedStars = reward.stars + questBonusStars;
  const skillsAfter = addSkills(progress.skills, reward.skills);
  const next: WorldProgress = {
    ...progress,
    stars: progress.stars + earnedStars,
    totalStars: progress.totalStars + earnedStars,
    coins: progress.coins + reward.coins,
    skills: skillsAfter,
    quests: { day: progress.quests.day, done },
    visits: { ...progress.visits, [reward.location]: (progress.visits[reward.location] ?? 0) + 1 },
    history: [{ location: reward.location, stars: earnedStars, at: now.toISOString() }, ...progress.history].slice(
      0,
      PROGRESSION.historyLimit,
    ),
    questDaysCompleted: progress.questDaysCompleted + (justFinishedAll ? 1 : 0),
  };

  return {
    next,
    summary: {
      ...reward,
      quest: questIsNew ? questId : null,
      questBonusStars,
      allQuestsDone,
      levelBefore: levelFor(progress.totalStars),
      levelAfter: levelFor(next.totalStars),
      skillsBefore: progress.skills,
      skillsAfter,
    },
  };
}

export function recordFeelingCheckIn(progress: WorldProgress, feeling: FeelingId, now: Date = new Date()): WorldProgress {
  return {
    ...progress,
    feelings: [{ feeling, at: now.toISOString() }, ...progress.feelings].slice(0, PROGRESSION.historyLimit),
  };
}

export function canAfford(progress: WorldProgress, id: RewardId): boolean {
  const reward = getReward(id);
  return (reward.currency === 'stars' ? progress.stars : progress.coins) >= reward.price;
}

/** Buys and immediately wears an item. Returns null when it is owned or unaffordable. */
export function unlockReward(progress: WorldProgress, id: RewardId): WorldProgress | null {
  if (progress.owned.includes(id) || !canAfford(progress, id)) return null;
  const reward = getReward(id);
  return {
    ...progress,
    stars: reward.currency === 'stars' ? progress.stars - reward.price : progress.stars,
    coins: reward.currency === 'coins' ? progress.coins - reward.price : progress.coins,
    owned: [...progress.owned, id],
    equipped: { ...progress.equipped, [reward.slot]: id },
  };
}

/** Wears an owned item, or takes it off when it is already worn. */
export function toggleEquipped(progress: WorldProgress, id: RewardId): WorldProgress {
  if (!progress.owned.includes(id)) return progress;
  const { slot } = getReward(id);
  const equipped = { ...progress.equipped };
  if (equipped[slot] === id) delete equipped[slot];
  else equipped[slot] = id;
  return { ...progress, equipped };
}
