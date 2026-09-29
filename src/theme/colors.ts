import type { Emotion } from '@/types/emotion';

/**
 * NUMU colour tokens. Components must reference these tokens instead of raw hex values.
 */
export const colors = {
  // Brand
  primary: '#5B6CFF',
  primaryDark: '#3F4BD1',
  primarySoft: '#E9EBFF',
  secondary: '#2BB5A6',
  secondarySoft: '#DDF4F1',
  accent: '#FFB547',
  accentSoft: '#FFF1DA',

  // Surfaces
  background: '#F6F7FB',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F2F8',
  border: '#E3E6F0',
  overlay: 'rgba(31, 36, 64, 0.35)',

  // Child mode surfaces
  childBackground: '#FFF8EE',
  childSurface: '#FFFFFF',
  teenBackground: '#F2F4FA',

  // Text
  textPrimary: '#1F2440',
  textSecondary: '#5E6582',
  textMuted: '#9097B1',
  textOnPrimary: '#FFFFFF',

  // Feedback (calm, never alarming)
  success: '#3BA873',
  successSoft: '#E2F4EA',
  warning: '#E89A2E',
  warningSoft: '#FDF1DE',
  attention: '#E07A5F',
  attentionSoft: '#FBE9E4',
  tried: '#C9CEDD',

  // Face illustration
  faceStroke: '#3A3350',
  faceEyeWhite: '#FFFFFF',
  faceBlush: '#F4A7A7',
  faceMouthInside: '#7A3B4B',

  // Avatar
  avatarBody: '#6FD3C4',
  avatarBodyShade: '#4FBCAC',
  avatarLeaf: '#7CC46B',
  avatarLeafDark: '#5DA94D',
  avatarCheek: '#FF9FA4',

  star: '#FFC43D',
  starEmpty: '#E4E6EF',
} as const;

export const emotionColors: Record<Emotion, { main: string; soft: string }> = {
  happy: { main: '#F5B82E', soft: '#FFF4D6' },
  sad: { main: '#5E9BE0', soft: '#E3EFFC' },
  angry: { main: '#E8715F', soft: '#FCE6E2' },
  fear: { main: '#9277CF', soft: '#EEE8FA' },
  surprise: { main: '#F28C4B', soft: '#FDEBDF' },
  disgust: { main: '#6BB36B', soft: '#E4F4E4' },
  neutral: { main: '#8E96AA', soft: '#ECEEF3' },
};

/** Skin tones and hair colours used to vary illustrated example faces. */
export const illustrationPalette = {
  skinTones: ['#F9D7B5', '#E8B48A', '#C98E62', '#8D5A3B', '#F3C9A4', '#B7794F'],
  hairColors: ['#3B2A20', '#1F1A17', '#7A4A2A', '#C98B3C', '#5A3A28', '#2E2A3A'],
} as const;

export type ColorToken = keyof typeof colors;
