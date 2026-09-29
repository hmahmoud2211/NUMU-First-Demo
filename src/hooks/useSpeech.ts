import { useCallback, useEffect, useState } from 'react';

import { useChild } from '@/context/ChildContext';
import { speak, stopSpeaking } from '@/services/speechService';

/** Speech helper that uses the child's age-appropriate speaking rate. */
export function useSpeech() {
  const { ageGroup } = useChild();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const say = useCallback(
    (text: string) => {
      setIsSpeaking(true);
      speak(text, { rate: ageGroup.speechRate, onDone: () => setIsSpeaking(false) });
    },
    [ageGroup.speechRate],
  );

  const stop = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  // Never keep talking after the screen that started speaking goes away.
  useEffect(() => stopSpeaking, []);

  return { say, stop, isSpeaking };
}
