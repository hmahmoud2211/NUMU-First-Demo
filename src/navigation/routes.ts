import type { Emotion } from '@/types/emotion';
import type { LevelId } from '@/types/learning';

/** Every navigable path in NUMU. Screens never hardcode paths. */
export const routes = {
  splash: '/',
  onboarding: '/onboarding',
  auth: '/auth',
  childProfile: '/setup/child-profile',
  ageGroup: '/setup/age-group',
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
} as const;
