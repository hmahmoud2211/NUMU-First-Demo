/**
 * Content and scoring for the reasoning check-in shown before NUMU World.
 *
 * The items are ORIGINAL puzzles written in the style of two well-known
 * non-verbal formats:
 *  - Raven-style matrices: find the missing tile of a 2×2 / 3×3 grid.
 *  - Leiter-style tasks: sequences, odd-one-out and matching, with no words needed.
 *
 * They are not the copyrighted Raven's Progressive Matrices or Leiter-3, and
 * the result is NOT an IQ score. It only tunes the world's starting difficulty
 * and, for very low results, shows parents a gentle note.
 */
import type { AgeGroupId, ReasoningBand } from '@/types/child';

export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star';

export const SHAPE_COLORS = {
  red: '#FF5C7A',
  blue: '#38B0FF',
  green: '#3CCB7F',
  yellow: '#FFC83D',
} as const;

export type ShapeColor = keyof typeof SHAPE_COLORS;

/** One tile: `count` copies of a shape. */
export type Tile = {
  shape: ShapeKind;
  color: ShapeColor;
  count?: number;
  small?: boolean;
};

export type ReasoningItem =
  | {
      id: string;
      kind: 'matrix';
      style: 'raven';
      prompt: string;
      /** Row-major grid with exactly one `null` (the missing tile). */
      grid: (Tile | null)[];
      columns: 2 | 3;
      options: Tile[];
      answer: number;
    }
  | {
      id: string;
      kind: 'sequence';
      style: 'leiter';
      prompt: string;
      sequence: Tile[];
      options: Tile[];
      answer: number;
    }
  | {
      id: string;
      kind: 'odd';
      style: 'leiter';
      prompt: string;
      /** The items are also the choices. */
      options: Tile[];
      answer: number;
    };

const t = (shape: ShapeKind, color: ShapeColor, count = 1, small = false): Tile => ({ shape, color, count, small });

/** Ordered from easiest to hardest. */
export const REASONING_ITEMS: ReasoningItem[] = [
  {
    id: 'match-rows',
    kind: 'matrix',
    style: 'raven',
    prompt: 'Which piece fills the empty box?',
    columns: 2,
    grid: [t('circle', 'red'), t('circle', 'red'), t('square', 'blue'), null],
    options: [t('square', 'blue'), t('circle', 'red'), t('triangle', 'blue')],
    answer: 0,
  },
  {
    id: 'alternate',
    kind: 'sequence',
    style: 'leiter',
    prompt: 'What comes next?',
    sequence: [t('circle', 'green'), t('square', 'green'), t('circle', 'green'), t('square', 'green')],
    options: [t('square', 'green'), t('circle', 'green'), t('triangle', 'green')],
    answer: 1,
  },
  {
    id: 'odd-shape',
    kind: 'odd',
    style: 'leiter',
    prompt: 'Which one is different?',
    options: [t('triangle', 'yellow'), t('circle', 'yellow'), t('triangle', 'yellow'), t('triangle', 'yellow')],
    answer: 1,
  },
  {
    id: 'colour-shape',
    kind: 'matrix',
    style: 'raven',
    prompt: 'Which piece fills the empty box?',
    columns: 2,
    grid: [t('circle', 'red'), t('circle', 'blue'), t('square', 'red'), null],
    options: [t('square', 'red'), t('circle', 'blue'), t('square', 'blue')],
    answer: 2,
  },
  {
    id: 'grow-count',
    kind: 'sequence',
    style: 'leiter',
    prompt: 'What comes next?',
    sequence: [t('star', 'yellow', 1, true), t('star', 'yellow', 2, true), t('star', 'yellow', 3, true)],
    options: [t('star', 'yellow', 3, true), t('star', 'yellow', 5, true), t('star', 'yellow', 4, true)],
    answer: 2,
  },
  {
    id: 'odd-size',
    kind: 'odd',
    style: 'leiter',
    prompt: 'Which one is different?',
    options: [t('square', 'red'), t('square', 'red'), t('square', 'red'), t('square', 'red', 1, true)],
    answer: 3,
  },
  {
    id: 'rows-count',
    kind: 'matrix',
    style: 'raven',
    prompt: 'Which piece fills the empty box?',
    columns: 3,
    grid: [
      t('circle', 'blue', 1, true),
      t('circle', 'blue', 2, true),
      t('circle', 'blue', 3, true),
      t('square', 'green', 1, true),
      t('square', 'green', 2, true),
      t('square', 'green', 3, true),
      t('triangle', 'red', 1, true),
      t('triangle', 'red', 2, true),
      null,
    ],
    options: [t('triangle', 'red', 2, true), t('square', 'red', 3, true), t('triangle', 'red', 3, true)],
    answer: 2,
  },
  {
    id: 'grow-alternate',
    kind: 'sequence',
    style: 'leiter',
    prompt: 'What comes next?',
    sequence: [t('circle', 'red', 1, true), t('circle', 'blue', 2, true), t('circle', 'red', 3, true)],
    options: [t('circle', 'red', 4, true), t('circle', 'blue', 4, true), t('circle', 'blue', 3, true)],
    answer: 1,
  },
  {
    id: 'odd-count',
    kind: 'odd',
    style: 'leiter',
    prompt: 'Which one is different?',
    options: [t('star', 'blue', 2, true), t('star', 'blue', 3, true), t('star', 'blue', 2, true), t('star', 'blue', 2, true)],
    answer: 1,
  },
  {
    id: 'latin-square',
    kind: 'matrix',
    style: 'raven',
    prompt: 'Look at every row and column. Which piece is missing?',
    columns: 3,
    grid: [
      t('circle', 'red'),
      t('square', 'blue'),
      t('triangle', 'green'),
      t('square', 'red'),
      t('triangle', 'blue'),
      t('circle', 'green'),
      t('triangle', 'red'),
      t('circle', 'blue'),
      null,
    ],
    options: [t('triangle', 'green'), t('square', 'green'), t('square', 'blue'), t('circle', 'green')],
    answer: 1,
  },
];

/**
 * Age-adjusted thresholds (number correct out of 10). Younger children are
 * expected to find the later items hard, so their bar is lower.
 */
const THRESHOLDS: Record<AgeGroupId, { typical: number; support: number }> = {
  early: { typical: 4, support: 1 },
  middle: { typical: 6, support: 3 },
  teen: { typical: 7, support: 4 },
};

export function bandFor(correct: number, ageGroupId: AgeGroupId): ReasoningBand {
  const limits = THRESHOLDS[ageGroupId];
  if (correct >= limits.typical) return 'typical';
  if (correct <= limits.support) return 'support';
  return 'emerging';
}

/** How the world adapts to the band. */
export const BAND_SETTINGS: Record<ReasoningBand, { label: string; feelingOptions: number }> = {
  support: { label: 'Gentle', feelingOptions: 2 },
  emerging: { label: 'Standard', feelingOptions: 3 },
  typical: { label: 'Challenge', feelingOptions: 4 },
};
