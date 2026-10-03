import type { Emotion } from '@/types/emotion';
import type { LevelId } from '@/types/learning';
import type { LocationId } from '@/types/world';

const WORLD_SEGMENTS: Record<LocationId, string> = {
  feelings: 'feelings',
  learning: 'learning-center',
  market: 'market',
  playground: 'playground',
};

/** Every navigable path in NUMU. Screens never hardcode paths. */
export const routes = {
  splash: '/',
  onboarding: '/onboarding',
  auth: '/auth',
  childProfile: '/setup/child-profile',
  ageGroup: '/setup/age-group',
  reasoningCheck: '/setup/reasoning-check',
  learningArea: '/setup/learning-area',
  parentHome: '/parent/home',
  dashboard: '/parent/dashboard',
  learningIntro: '/learning/intro',
  lesson: '/learning/lesson',
  levels: '/child/levels',
  level: (id: LevelId) => `/child/level/${id}` as const,
  coach: (expected: Emotion, selected: Emotion) => `/child/coach?expected=${expected}&selected=${selected}` as const,
  practice: (focus: Emotion[], mode: 'personalized' | 'pair') =>
    `/child/practice?focus=${focus.join(',')}&mode=${mode}` as const,
  results: '/results',
  world: '/world',
  worldLocation: (id: LocationId) => `/world/${WORLD_SEGMENTS[id]}` as const,
} as const;
