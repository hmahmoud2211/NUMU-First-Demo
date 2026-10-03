/** Trees, bushes, flowers, clouds and town props for the world scenes. */
import { Circle, Defs, Ellipse, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { darken, lighten } from '@/utils/color';

import { Glow, GroundShadow, Shade, useArtIds, type ArtIds } from './primitives';

/** One light source for a whole cluster, so canopies read as a single volume. */
function FoliageGradient({ ids, color, cx, cy, r }: { ids: ArtIds; color: string; cx: number; cy: number; r: number }) {
  return (
    <RadialGradient id={ids.id('leaf')} gradientUnits="userSpaceOnUse" cx={cx} cy={cy} r={r} fx={cx - r * 0.25} fy={cy - r * 0.3}>
      <Stop offset="0" stopColor={lighten(color, 0.38)} />
      <Stop offset="0.5" stopColor={color} />
      <Stop offset="1" stopColor={darken(color, 0.38)} />
    </RadialGradient>
  );
}

export const ROUND_TREE_VIEW = { width: 120, height: 160, viewBox: '0 0 120 160' } as const;

const ROUND_CANOPY = [
  [60, 60, 38],
  [33, 82, 26],
  [87, 82, 26],
  [60, 94, 28],
  [44, 46, 24],
  [78, 44, 24],
];

export function RoundTree({ color = '#4DB848', fruit }: { color?: string; fruit?: string }) {
  const ids = useArtIds('rt');
  return (
    <G>
      <Defs>
        <FoliageGradient ids={ids} color={color} cx={58} cy={64} r={66} />
        <Shade id={ids.id('trunk')} color="#9A5B33" light={0.2} dark={0.25} direction="right" />
      </Defs>
      <GroundShadow cx={62} cy={153} rx={40} ry={7} opacity={0.3} />
      <Path d="M52 154 C55 140 56 120 56 104 L65 104 C65 120 66 140 70 154Z" fill={ids.url('trunk')} />
      <Path d="M57 120 L48 110 M64 116 L72 106" stroke="#8A4F2B" strokeWidth={4} strokeLinecap="round" />
      <Ellipse cx={62} cy={112} rx={32} ry={9} fill={darken(color, 0.5)} opacity={0.25} />
      {ROUND_CANOPY.map(([cx, cy, r]) => (
        <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={ids.url('leaf')} />
      ))}
      {[
        [44, 38, 9],
        [70, 34, 8],
        [28, 70, 7],
        [56, 56, 7],
      ].map(([cx, cy, r]) => (
        <Circle key={`h${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={lighten(color, 0.45)} opacity={0.4} />
      ))}
      {fruit
        ? [
            [40, 76],
            [76, 64],
            [64, 92],
            [88, 90],
            [52, 50],
          ].map(([cx, cy]) => (
            <G key={`f${cx}-${cy}`}>
              <Circle cx={cx} cy={cy} r={4.2} fill={fruit} />
              <Circle cx={cx - 1.3} cy={cy - 1.3} r={1.3} fill="#FFFFFF" opacity={0.7} />
            </G>
          ))
        : null}
    </G>
  );
}

export const PINE_VIEW = { width: 80, height: 150, viewBox: '0 0 80 150' } as const;

export function PineTree({ color = '#2E9A5A' }: { color?: string }) {
  const ids = useArtIds('pine');
  const tiers = [
    [40, 8, 22, 54],
    [40, 30, 30, 84],
    [40, 56, 36, 118],
  ];
  return (
    <G>
      <Defs>
        <Shade id={ids.id('leaf')} color={color} light={0.3} dark={0.3} direction="diag" />
      </Defs>
      <GroundShadow cx={42} cy={145} rx={26} ry={5} opacity={0.3} />
      <Rect x={35} y={110} width={10} height={36} rx={3} fill="#8A4F2B" />
      {tiers
        .slice()
        .reverse()
        .map(([cx, top, half, bottom]) => (
          <G key={top}>
            <Path d={`M${cx} ${top} L${cx + half} ${bottom} Q${cx} ${bottom + 8} ${cx - half} ${bottom}Z`} fill={ids.url('leaf')} />
            <Path d={`M${cx} ${top + 4} L${cx - half + 6} ${bottom - 2}`} stroke={lighten(color, 0.35)} strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />
          </G>
        ))}
    </G>
  );
}

export const BUSH_VIEW = { width: 100, height: 60, viewBox: '0 0 100 60' } as const;

export function Bush({ color = '#52B947', flowers }: { color?: string; flowers?: string }) {
  const ids = useArtIds('bush');
  return (
    <G>
      <Defs>
        <FoliageGradient ids={ids} color={color} cx={44} cy={30} r={52} />
      </Defs>
      <GroundShadow cx={50} cy={55} rx={44} ry={5} opacity={0.28} />
      {[
        [24, 38, 17],
        [46, 30, 21],
        [70, 34, 19],
        [86, 42, 12],
        [14, 46, 10],
      ].map(([cx, cy, r]) => (
        <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={ids.url('leaf')} />
      ))}
      <Circle cx={40} cy={20} r={6} fill={lighten(color, 0.45)} opacity={0.4} />
      {flowers
        ? [
            [26, 30],
            [44, 22],
            [62, 28],
            [76, 36],
            [50, 40],
            [32, 44],
          ].map(([cx, cy]) => (
            <G key={`${cx}-${cy}`}>
              <Circle cx={cx} cy={cy} r={3.4} fill={flowers} />
              <Circle cx={cx} cy={cy} r={1.2} fill="#FFE27A" />
            </G>
          ))
        : null}
    </G>
  );
}

export const LAMP_VIEW = { width: 30, height: 110, viewBox: '0 0 30 110' } as const;

export function LampPost() {
  const ids = useArtIds('lamp');
  return (
    <G>
      <Defs>
        <Glow id={ids.id('glow')} color="#FFE7A0" opacity={0.75} />
      </Defs>
      <GroundShadow cx={16} cy={106} rx={10} ry={3} />
      <Circle cx={15} cy={20} r={15} fill={ids.url('glow')} />
      <Rect x={12} y={28} width={6} height={76} rx={3} fill="#2F4858" />
      <Rect x={9} y={98} width={12} height={8} rx={3} fill="#2F4858" />
      <Path d="M7 14 L23 14 L21 28 L9 28Z" fill="#FFF0B8" stroke="#2F4858" strokeWidth={2.5} strokeLinejoin="round" />
      <Path d="M5 14 L15 6 L25 14Z" fill="#2F4858" />
      <Circle cx={15} cy={5} r={2} fill="#2F4858" />
    </G>
  );
}

export const CLOUD_VIEW = { width: 200, height: 90, viewBox: '0 0 200 90' } as const;

export function Cloud() {
  const ids = useArtIds('cloud');
  return (
    <G>
      <Defs>
        <RadialGradient id={ids.id('c')} gradientUnits="userSpaceOnUse" cx={86} cy={30} r={110}>
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="0.6" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#DCD8FF" />
        </RadialGradient>
      </Defs>
      {[
        [50, 58, 28],
        [84, 42, 34],
        [124, 46, 30],
        [152, 60, 22],
        [100, 64, 26],
        [30, 68, 16],
      ].map(([cx, cy, r]) => (
        <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={ids.url('c')} />
      ))}
      <Rect x={22} y={60} width={150} height={24} rx={12} fill={ids.url('c')} />
    </G>
  );
}

/** Static stone body of the plaza fountain; moving water is layered on top separately. */
export const FOUNTAIN_VIEW = { width: 160, height: 150, viewBox: '0 0 160 150' } as const;

export function FountainBase() {
  const ids = useArtIds('ftn');
  const stone = '#E6DEF2';
  return (
    <G>
      <Defs>
        <Shade id={ids.id('stone')} color={stone} light={0.35} dark={0.15} direction="right" />
        <Shade id={ids.id('wall')} color={darken(stone, 0.08)} light={0.15} dark={0.2} direction="right" />
        <RadialGradient id={ids.id('water')} cx="45%" cy="40%" r="70%">
          <Stop offset="0" stopColor="#B5ECFF" />
          <Stop offset="0.6" stopColor="#5CC4F2" />
          <Stop offset="1" stopColor="#2F93D6" />
        </RadialGradient>
      </Defs>
      <GroundShadow cx={82} cy={138} rx={78} ry={11} opacity={0.3} />
      {/* basin */}
      <Path d="M8 116 L8 128 C8 142 152 142 152 128 L152 116Z" fill={ids.url('wall')} />
      <Ellipse cx={80} cy={116} rx={72} ry={22} fill={ids.url('stone')} />
      <Ellipse cx={80} cy={116} rx={62} ry={16} fill={ids.url('water')} />
      <Path d="M30 112 Q44 106 58 110 M96 108 Q112 104 126 110" stroke="#FFFFFF" strokeWidth={2} fill="none" opacity={0.6} strokeLinecap="round" />
      {/* pedestal and bowl */}
      <Path d="M70 118 L72 72 L88 72 L90 118Z" fill={ids.url('stone')} />
      <Path d="M50 70 C54 86 106 86 110 70Z" fill={ids.url('wall')} />
      <Ellipse cx={80} cy={70} rx={30} ry={9} fill={ids.url('stone')} />
      <Ellipse cx={80} cy={69.5} rx={24} ry={6} fill={ids.url('water')} />
      {/* spout */}
      <Path d="M76 68 L77 46 L83 46 L84 68Z" fill={ids.url('stone')} />
      <Circle cx={80} cy={43} r={6} fill="#FFC83D" />
      <Circle cx={78} cy={41} r={2} fill="#FFFFFF" opacity={0.7} />
    </G>
  );
}

/** Falling water arcs, drawn in the fountain's coordinate space. */
export function FountainWater() {
  const water = { stroke: '#D6F4FF', strokeWidth: 3, fill: 'none', strokeLinecap: 'round' as const };
  return (
    <G>
      <Path d="M80 38 C70 22 56 34 54 64" {...water} />
      <Path d="M80 38 C90 22 104 34 106 64" {...water} />
      <Path d="M80 36 L80 26" {...water} strokeWidth={4} />
      <Path d="M51 72 C42 82 38 96 36 112" {...water} opacity={0.85} />
      <Path d="M109 72 C118 82 122 96 124 112" {...water} opacity={0.85} />
      <Path d="M66 77 C62 88 60 100 60 110" {...water} opacity={0.6} strokeWidth={2} />
      <Path d="M94 77 C98 88 100 100 100 110" {...water} opacity={0.6} strokeWidth={2} />
    </G>
  );
}
