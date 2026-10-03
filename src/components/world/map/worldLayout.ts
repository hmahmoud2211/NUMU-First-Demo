import { BUILDING_ART } from '@/components/world/art/Buildings';
import type { LocationId } from '@/types/world';

/** Where each destination stands on the 600 × 1000 world map. */
export type Spot = {
  /** Centre of the sprite's base, in world units. */
  x: number;
  base: number;
  width: number;
  /** Where the avatar walks to before the camera zooms in. */
  approach: { x: number; y: number };
  /** Horizontal nudge for the floating label so it stays on narrow screens. */
  labelOffset: number;
};

export const SPOTS: Record<LocationId, Spot> = {
  learning: { x: 300, base: 562, width: 186, approach: { x: 222, y: 652 }, labelOffset: 0 },
  feelings: { x: 158, base: 690, width: 180, approach: { x: 194, y: 724 }, labelOffset: 6 },
  playground: { x: 446, base: 664, width: 188, approach: { x: 388, y: 718 }, labelOffset: -4 },
  market: { x: 440, base: 866, width: 188, approach: { x: 346, y: 884 }, labelOffset: -4 },
};

export function spotHeight(id: LocationId): number {
  const { view } = BUILDING_ART[id];
  return (SPOTS[id].width * view.height) / view.width;
}

export const AVATAR = { width: 120, start: { x: 214, y: 846 } } as const;

/** The plaza and lanes the avatar may walk on. */
export const WALKABLE = { minX: 70, maxX: 530, minY: 640, maxY: 905 } as const;

const FOUNTAIN_FOOTPRINT = { x: 300, y: 724, rx: 78, ry: 34 };

export function clampToWalkable(x: number, y: number): { x: number; y: number } {
  const cx = Math.min(WALKABLE.maxX, Math.max(WALKABLE.minX, x));
  let cy = Math.min(WALKABLE.maxY, Math.max(WALKABLE.minY, y));
  const nx = (cx - FOUNTAIN_FOOTPRINT.x) / FOUNTAIN_FOOTPRINT.rx;
  const ny = (cy - FOUNTAIN_FOOTPRINT.y) / FOUNTAIN_FOOTPRINT.ry;
  if (nx * nx + ny * ny < 1) cy = FOUNTAIN_FOOTPRINT.y + FOUNTAIN_FOOTPRINT.ry + 4;
  return { x: cx, y: cy };
}

/** Things further up the map are further away, so they are drawn smaller. */
export function depthScale(y: number): number {
  return Math.min(1.05, Math.max(0.55, 0.55 + (y - 560) * 0.0015));
}

export const PARALLAX = { sky: 0.08, mountains: 0.22, hills: 0.5, town: 1, front: 1.3 } as const;

type Decor =
  | { kind: 'tree'; x: number; base: number; width: number; color?: string; fruit?: string }
  | { kind: 'pine'; x: number; base: number; width: number; color?: string }
  | { kind: 'bush'; x: number; base: number; width: number; color?: string; flowers?: string }
  | { kind: 'lamp'; x: number; base: number; width: number };

export const DECOR: Decor[] = [
  { kind: 'tree', x: 196, base: 548, width: 66, color: '#5CC15A' },
  { kind: 'tree', x: 406, base: 548, width: 66, color: '#4DB848', fruit: '#FF6B6B' },
  { kind: 'pine', x: 570, base: 604, width: 58 },
  { kind: 'tree', x: 34, base: 618, width: 96, color: '#45B04A', fruit: '#FF5C5C' },
  { kind: 'pine', x: 22, base: 772, width: 60, color: '#2F9E5E' },
  { kind: 'tree', x: 568, base: 800, width: 104, color: '#4DB848', fruit: '#FFA53A' },
  { kind: 'tree', x: 62, base: 912, width: 116, color: '#52B947' },
  { kind: 'bush', x: 252, base: 626, width: 58, flowers: '#FF5C8A' },
  { kind: 'bush', x: 348, base: 626, width: 58, flowers: '#FFD43B' },
  { kind: 'bush', x: 70, base: 712, width: 76, flowers: '#FFFFFF' },
  { kind: 'bush', x: 538, base: 704, width: 76, color: '#4AAE44' },
  { kind: 'bush', x: 160, base: 952, width: 92, flowers: '#FF8AB5' },
  { kind: 'bush', x: 548, base: 952, width: 88, flowers: '#FFD43B' },
  { kind: 'lamp', x: 186, base: 704, width: 24 },
  { kind: 'lamp', x: 414, base: 704, width: 24 },
  { kind: 'lamp', x: 262, base: 520, width: 18 },
];

export const FOUNTAIN = { x: 300, base: 744, width: 132 } as const;

/** Chimney top of the House of Feelings, for the smoke puffs. */
export const CHIMNEY = { x: 206, y: 535 } as const;
