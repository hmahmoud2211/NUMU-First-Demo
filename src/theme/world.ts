import type { TextStyle, ViewStyle } from 'react-native';

/** Rounded display font loaded in the root layout (Fredoka). */
export const gameFonts = {
  medium: 'Fredoka_500Medium',
  semibold: 'Fredoka_600SemiBold',
  bold: 'Fredoka_700Bold',
} as const;

/** Colour tokens for the game world UI (HUD, cards, buttons). */
export const gameColors = {
  ink: '#2B2350',
  inkSoft: '#6A6390',
  inkFaint: '#A49EC2',
  card: '#FFFFFF',
  cardTint: '#F5F2FF',
  cardEdge: '#D9D1FA',
  shadow: '#2B1D6B',
  track: '#ECE8FB',
  overlay: 'rgba(28, 20, 70, 0.5)',
  white: '#FFFFFF',
  locked: '#BDB8D3',
  lockedEdge: '#9C97B5',

  primary: '#5B6CFF',
  primaryEdge: '#3A47C9',
  green: '#3CCB7F',
  greenEdge: '#22A35F',
  orange: '#FF9F1C',
  orangeEdge: '#D97A00',
  pink: '#FF5C8A',
  pinkEdge: '#D63A68',
  sky: '#38B0FF',
  skyEdge: '#1E86D6',
  gold: '#FFC83D',
  goldEdge: '#E39B00',
  purple: '#9B5CFF',
  purpleEdge: '#7438D6',

  /** Backdrop around the game on wide screens. */
  stageBackdrop: '#8FD0FF',
} as const;

export const gameType = {
  hero: { fontFamily: gameFonts.bold, fontSize: 32, color: gameColors.ink },
  title: { fontFamily: gameFonts.bold, fontSize: 22, color: gameColors.ink },
  heading: { fontFamily: gameFonts.bold, fontSize: 18, color: gameColors.ink },
  body: { fontFamily: gameFonts.semibold, fontSize: 17, lineHeight: 23, color: gameColors.ink },
  label: { fontFamily: gameFonts.semibold, fontSize: 14, color: gameColors.inkSoft },
  small: { fontFamily: gameFonts.medium, fontSize: 12, color: gameColors.inkSoft },
  number: { fontFamily: gameFonts.bold, fontSize: 16, color: gameColors.ink },
  button: { fontFamily: gameFonts.bold, fontSize: 18, color: gameColors.white },
} satisfies Record<string, TextStyle>;

export const gameShadow = {
  soft: { boxShadow: '0px 6px 14px rgba(43, 29, 107, 0.18)' },
  lifted: { boxShadow: '0px 12px 24px rgba(43, 29, 107, 0.25)' },
} satisfies Record<string, ViewStyle>;
