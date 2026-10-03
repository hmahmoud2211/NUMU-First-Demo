import { router } from 'expo-router';

import { stopSpeaking } from '@/services/speechService';

import { routes } from './routes';

/** Leaves child mode and returns to Parent Home (the root of the stack). */
export function exitChildMode(): void {
  stopSpeaking();
  router.dismissTo(routes.parentHome);
}

/**
 * Drops the child straight into NUMU World. Parent Home becomes the root of
 * the stack so the world's "Parent area" can always return to it.
 */
export function enterWorld(): void {
  if (router.canDismiss()) router.dismissAll();
  router.replace(routes.parentHome);
  router.push(routes.world);
}

/** Leaves child mode and opens the parent progress dashboard. */
export function openParentDashboard(): void {
  exitChildMode();
  router.push(routes.dashboard);
}

/** Goes back within child mode, falling back to the level map. */
export function backInChildMode(): void {
  stopSpeaking();
  if (router.canGoBack()) router.back();
  else router.replace(routes.levels);
}
