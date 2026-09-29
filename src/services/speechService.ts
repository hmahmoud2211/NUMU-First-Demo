/**
 * Text-to-speech for the avatar and audio buttons (expo-speech).
 * Could later be replaced by recorded voice lines or a cloud TTS service.
 */
import * as Speech from 'expo-speech';

// Emoji and decorative symbols are not spoken.
const NON_SPEECH = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}“”]/gu;

type SpeakOptions = {
  rate?: number;
  onDone?: () => void;
};

export function speak(text: string, { rate = 0.95, onDone }: SpeakOptions = {}): void {
  const clean = text.replace(NON_SPEECH, '').replace(/\s+/g, ' ').trim();
  if (!clean) return;
  try {
    Speech.stop();
    Speech.speak(clean, {
      language: 'en-US',
      rate,
      pitch: 1.05,
      onDone,
      onStopped: onDone,
      onError: onDone,
    });
  } catch (error) {
    console.warn('[speech] Unable to speak', error);
    onDone?.();
  }
}

export function stopSpeaking(): void {
  try {
    Speech.stop();
  } catch {
    // Speech may be unavailable on some platforms; nothing to stop.
  }
}
