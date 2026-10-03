/**
 * Building blocks for NUMU's soft-3D illustrations: gradient helpers that
 * give flat SVG shapes volume (light from the top-left) and contact shadows.
 * Every gradient id is unique per instance so multiple sprites can share a
 * page on web, where SVG ids are global.
 */
import { useId, useMemo } from 'react';
import { Defs, Ellipse, LinearGradient, RadialGradient, Stop } from 'react-native-svg';

import { darken, lighten } from '@/utils/color';

export function useArtIds(prefix: string) {
  const raw = useId();
  return useMemo(() => {
    const base = `${prefix}${raw.replace(/[^a-zA-Z0-9]/g, '')}`;
    return {
      id: (name: string) => `${base}-${name}`,
      url: (name: string) => `url(#${base}-${name})`,
    };
  }, [prefix, raw]);
}

export type ArtIds = ReturnType<typeof useArtIds>;

type Direction = 'down' | 'right' | 'diag' | 'up';

const DIRECTIONS: Record<Direction, { x1: string; y1: string; x2: string; y2: string }> = {
  down: { x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
  up: { x1: '0%', y1: '100%', x2: '0%', y2: '0%' },
  right: { x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
  diag: { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
};

/** Two-stop linear shading: lighter where the light hits, darker away from it. */
export function Shade({
  id,
  color,
  light = 0.25,
  dark = 0.2,
  direction = 'down',
}: {
  id: string;
  color: string;
  light?: number;
  dark?: number;
  direction?: Direction;
}) {
  return (
    <LinearGradient id={id} {...DIRECTIONS[direction]}>
      <Stop offset="0" stopColor={lighten(color, light)} />
      <Stop offset="1" stopColor={darken(color, dark)} />
    </LinearGradient>
  );
}

/** Spherical shading with an off-centre highlight. */
export function Ball({
  id,
  color,
  light = 0.55,
  dark = 0.3,
  fx = '32%',
  fy = '28%',
}: {
  id: string;
  color: string;
  light?: number;
  dark?: number;
  fx?: string;
  fy?: string;
}) {
  return (
    <RadialGradient id={id} cx="42%" cy="40%" r="66%" fx={fx} fy={fy}>
      <Stop offset="0" stopColor={lighten(color, light)} />
      <Stop offset="0.5" stopColor={color} />
      <Stop offset="1" stopColor={darken(color, dark)} />
    </RadialGradient>
  );
}

/** Soft radial falloff used for contact shadows and glows. */
export function Glow({ id, color = '#1B1040', opacity = 0.35 }: { id: string; color?: string; opacity?: number }) {
  return (
    <RadialGradient id={id} cx="50%" cy="50%" r="50%">
      <Stop offset="0" stopColor={color} stopOpacity={opacity} />
      <Stop offset="0.6" stopColor={color} stopOpacity={opacity * 0.45} />
      <Stop offset="1" stopColor={color} stopOpacity={0} />
    </RadialGradient>
  );
}

/** Blurred contact shadow under a sprite. */
export function GroundShadow({
  cx,
  cy,
  rx,
  ry,
  opacity = 0.3,
  color,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  opacity?: number;
  color?: string;
}) {
  const ids = useArtIds('gs');
  return (
    <>
      <Defs>
        <Glow id={ids.id('s')} opacity={opacity} color={color} />
      </Defs>
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={ids.url('s')} />
    </>
  );
}

/** Glossy specular highlight. */
export function Gloss({
  cx,
  cy,
  rx,
  ry,
  rotate = -25,
  opacity = 0.5,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate?: number;
  opacity?: number;
}) {
  return <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFFFFF" opacity={opacity} transform={`rotate(${rotate} ${cx} ${cy})`} />;
}
