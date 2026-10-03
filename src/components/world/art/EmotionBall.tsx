/** Glossy 3D emotion faces for the House of Feelings (100 × 100). */
import { Circle, Defs, Ellipse, G, Path } from 'react-native-svg';

import type { FeelingId } from '@/types/world';
import { darken } from '@/utils/color';

import { Ball, Gloss, GroundShadow, useArtIds } from './primitives';

export const FEELING_COLORS: Record<FeelingId, string> = {
  happy: '#FFC83D',
  sad: '#5DADEC',
  angry: '#FF6150',
  worried: '#A57BF5',
  calm: '#3FCF8E',
};

const INK = '#3A2412';
const MOUTH = '#8E2C3B';

function Features({ feeling }: { feeling: FeelingId }) {
  const line = { stroke: INK, strokeWidth: 3.6, strokeLinecap: 'round' as const, fill: 'none' };
  const eyes = (y: number, rx = 5, ry = 7) => (
    <G>
      <Ellipse cx={37} cy={y} rx={rx} ry={ry} fill={INK} />
      <Ellipse cx={63} cy={y} rx={rx} ry={ry} fill={INK} />
      <Circle cx={35.5} cy={y - 2.6} r={1.9} fill="#FFFFFF" />
      <Circle cx={61.5} cy={y - 2.6} r={1.9} fill="#FFFFFF" />
    </G>
  );
  const cheeks = (
    <G opacity={0.4}>
      <Ellipse cx={26} cy={60} rx={7} ry={4.5} fill="#FF6B81" />
      <Ellipse cx={74} cy={60} rx={7} ry={4.5} fill="#FF6B81" />
    </G>
  );
  switch (feeling) {
    case 'happy':
      return (
        <G>
          {cheeks}
          {eyes(44)}
          <Path d="M29 57 Q50 84 71 57 Q50 64 29 57Z" fill={MOUTH} />
          <Path d="M40 70 Q50 77 60 70 Q50 66 40 70Z" fill="#FF7A8A" />
        </G>
      );
    case 'sad':
      return (
        <G>
          {eyes(48, 4.6, 6.4)}
          <Path d="M27 37 Q36 36 44 30 M73 37 Q64 36 56 30" {...line} />
          <Path d="M37 72 Q50 61 63 72" {...line} stroke={MOUTH} />
          <Path d="M30 56 C26 63 26 68 30 69 C34 68 34 63 30 56Z" fill="#BFE6FF" />
        </G>
      );
    case 'angry':
      return (
        <G>
          {eyes(48, 4.8, 5.2)}
          <Path d="M27 33 L45 41 M73 33 L55 41" {...line} strokeWidth={4.4} />
          <Path d="M35 70 Q50 60 65 70 L65 72 Q50 66 35 72Z" fill={MOUTH} stroke={MOUTH} strokeWidth={2} strokeLinejoin="round" />
        </G>
      );
    case 'worried':
      return (
        <G>
          {eyes(47, 5.2, 7.4)}
          <Path d="M29 36 Q37 33 44 27 M71 36 Q63 33 56 27" {...line} />
          <Path d="M34 69 Q39 64 44 69 Q50 74 56 69 Q61 64 66 69" {...line} stroke={MOUTH} />
          <Path d="M80 22 C76 29 76 33 80 34 C84 33 84 29 80 22Z" fill="#DDF3FF" />
        </G>
      );
    case 'calm':
      return (
        <G>
          {cheeks}
          <Path d="M30 46 Q37 52 44 46 M56 46 Q63 52 70 46" {...line} />
          <Path d="M39 63 Q50 71 61 63" {...line} stroke={MOUTH} />
        </G>
      );
  }
}

export function EmotionBall({ feeling, shadow = true }: { feeling: FeelingId; shadow?: boolean }) {
  const ids = useArtIds('emo');
  const color = FEELING_COLORS[feeling];
  return (
    <G>
      <Defs>
        <Ball id={ids.id('ball')} color={color} light={0.6} dark={0.32} />
      </Defs>
      {shadow ? <GroundShadow cx={50} cy={94} rx={30} ry={5} opacity={0.28} /> : null}
      <Circle cx={50} cy={50} r={42} fill={ids.url('ball')} stroke={darken(color, 0.18)} strokeWidth={1.2} />
      <Features feeling={feeling} />
      <Gloss cx={32} cy={24} rx={13} ry={7} opacity={0.55} />
    </G>
  );
}
