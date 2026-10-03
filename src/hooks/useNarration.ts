import { useCallback } from 'react';

import { useWorld } from '@/context/WorldContext';

import { useSpeech } from './useSpeech';

/** Reads game prompts aloud when the child's "Read aloud" setting is on. */
export function useNarration() {
  const { progress } = useWorld();
  const { say, stop } = useSpeech();
  const enabled = progress.settings.voice;

  const narrate = useCallback(
    (text: string) => {
      if (enabled) say(text);
    },
    [enabled, say],
  );

  return { narrate, stop, enabled };
}
