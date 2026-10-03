/** Chunky glossy icons for the game UI (64 × 64 each). */
import type { ComponentType } from 'react';
import Svg, { Circle, Defs, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { LocationId, SkillId } from '@/types/world';
import { darken, lighten } from '@/utils/color';

import { heartPath, starPath } from './KidCharacter';
import { Ball, Gloss, Shade, useArtIds, type ArtIds } from './primitives';

export type IconName =
  | 'star'
  | 'coin'
  | 'heart'
  | 'target'
  | 'people'
  | 'bulb'
  | 'book'
  | 'house'
  | 'cart'
  | 'ball'
  | 'trophy'
  | 'gift'
  | 'scroll'
  | 'flag';

type IconArtProps = { ids: ArtIds; color: string };

function Star({ ids, color }: IconArtProps) {
  return (
    <G>
      <Path d={starPath(32, 34, 29, 14)} fill={darken(color, 0.3)} />
      <Path d={starPath(32, 32, 29, 14)} fill={ids.url('main')} stroke={darken(color, 0.18)} strokeWidth={1.5} strokeLinejoin="round" />
      <Path d={starPath(30.5, 30, 15, 7)} fill={lighten(color, 0.45)} opacity={0.65} />
      <Gloss cx={23} cy={20} rx={5} ry={2.6} opacity={0.6} rotate={-30} />
    </G>
  );
}

function Coin({ ids, color }: IconArtProps) {
  return (
    <G>
      <Circle cx={32} cy={35} r={27} fill={darken(color, 0.3)} />
      <Circle cx={32} cy={32} r={27} fill={ids.url('main')} />
      <Circle cx={32} cy={32} r={19.5} fill={lighten(color, 0.15)} stroke={darken(color, 0.2)} strokeWidth={2.5} />
      <Path d={starPath(32, 33, 11, 5.2)} fill={darken(color, 0.18)} />
      <Gloss cx={21} cy={17} rx={8} ry={4} opacity={0.55} />
    </G>
  );
}

function Heart({ ids, color }: IconArtProps) {
  return (
    <G>
      <Path d={heartPath(32, 33, 30)} fill={ids.url('main')} transform="translate(0 2)" />
      <Gloss cx={21} cy={22} rx={6} ry={3.5} opacity={0.6} rotate={-35} />
    </G>
  );
}

function Target({ ids, color }: IconArtProps) {
  return (
    <G>
      <Circle cx={32} cy={33} r={27} fill={ids.url('main')} />
      <Circle cx={32} cy={33} r={19} fill="#FFFFFF" />
      <Circle cx={32} cy={33} r={12} fill={color} />
      <Circle cx={32} cy={33} r={5} fill="#FFFFFF" />
      <Path d="M33 32 L54 11" stroke="#FFB800" strokeWidth={4} strokeLinecap="round" />
      <Path d="M49 8 L57 7 L56 15Z" fill="#FF5C7A" />
      <Gloss cx={20} cy={18} rx={6} ry={3} opacity={0.45} />
    </G>
  );
}

function People({ ids, color }: IconArtProps) {
  const back = lighten(color, 0.35);
  return (
    <G>
      <Circle cx={43} cy={21} r={9} fill={back} />
      <Path d="M28 52 C28 38 34 32 43 32 C52 32 58 38 58 52Z" fill={back} />
      <Circle cx={24} cy={24} r={11} fill={ids.url('main')} />
      <Path d="M6 58 C6 42 13 36 24 36 C35 36 42 42 42 58Z" fill={ids.url('main')} />
      <Gloss cx={19} cy={19} rx={4} ry={2.5} opacity={0.55} />
    </G>
  );
}

function Bulb({ ids, color }: IconArtProps) {
  return (
    <G>
      <Path d="M32 5 L32 1 M10 14 L7 11 M54 14 L57 11 M4 30 L0 30 M60 30 L64 30" stroke={color} strokeWidth={3} strokeLinecap="round" />
      <Path d="M32 8 C44 8 52 17 52 28 C52 36 46 40 43 46 L21 46 C18 40 12 36 12 28 C12 17 20 8 32 8Z" fill={ids.url('main')} />
      <Rect x={21} y={46} width={22} height={11} rx={3} fill="#9EA4BA" />
      <Path d="M22 50 L42 50 M22 54 L42 54" stroke="#7B8199" strokeWidth={1.5} />
      <Rect x={26} y={57} width={12} height={5} rx={2.5} fill="#7B8199" />
      <Path d="M27 40 L27 30 L32 34 L37 30 L37 40" stroke={darken(color, 0.25)} strokeWidth={2} fill="none" strokeLinejoin="round" />
      <Gloss cx={23} cy={20} rx={5} ry={3} opacity={0.6} />
    </G>
  );
}

function Book({ ids, color }: IconArtProps) {
  return (
    <G>
      <Path d="M4 18 Q32 8 60 18 L60 54 Q32 46 4 54Z" fill={ids.url('main')} />
      <Path d="M8 17 Q20 12 31 16 L31 50 Q20 45 8 50Z" fill="#FFFFFF" />
      <Path d="M56 17 Q44 12 33 16 L33 50 Q44 45 56 50Z" fill="#F1F4FF" />
      <Path d="M13 24 L26 22 M13 30 L26 28 M13 36 L26 34 M38 22 L51 24 M38 28 L51 30 M38 34 L51 36" stroke={lighten(color, 0.3)} strokeWidth={2} strokeLinecap="round" />
    </G>
  );
}

function House({ ids, color }: IconArtProps) {
  return (
    <G>
      <Rect x={13} y={28} width={38} height={30} rx={4} fill="#FFF1DE" />
      <Path d="M6 32 L32 8 L58 32 Q32 26 6 32Z" fill={ids.url('main')} />
      <Path d={heartPath(32, 44, 16)} fill={color} />
    </G>
  );
}

function Cart({ ids, color }: IconArtProps) {
  return (
    <G>
      <Path d="M4 12 L13 12 L19 42 L50 42" stroke="#5A5F7D" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15 18 L58 18 L52 38 L19 38Z" fill={ids.url('main')} />
      <Path d="M26 18 L28 38 M37 18 L37 38 M48 18 L46 38" stroke={darken(color, 0.25)} strokeWidth={2} />
      <Circle cx={23} cy={51} r={5} fill="#5A5F7D" />
      <Circle cx={46} cy={51} r={5} fill="#5A5F7D" />
      <Circle cx={30} cy={13} r={6} fill="#FF3B4E" />
      <Circle cx={42} cy={14} r={5.5} fill="#7BD34A" />
    </G>
  );
}

function BeachBall({ ids }: IconArtProps) {
  return (
    <G>
      <Circle cx={32} cy={32} r={27} fill="#FFFFFF" />
      <Path d="M32 5 C20 14 18 50 32 59 C14 56 5 44 5 32 C5 18 16 7 32 5Z" fill="#FF5C7A" />
      <Path d="M32 5 C44 14 46 50 32 59 C50 56 59 44 59 32 C59 18 48 7 32 5Z" fill="#38B0FF" />
      <Path d="M32 5 C38 18 38 46 32 59 C26 46 26 18 32 5Z" fill="#FFD43B" />
      <Circle cx={32} cy={32} r={27} fill={ids.url('shine')} />
      <Gloss cx={20} cy={17} rx={7} ry={4} opacity={0.6} />
    </G>
  );
}

function Trophy({ ids, color }: IconArtProps) {
  return (
    <G>
      <Path d="M16 12 C4 12 4 30 18 32 M48 12 C60 12 60 30 46 32" stroke={darken(color, 0.15)} strokeWidth={4} fill="none" />
      <Path d="M14 8 L50 8 L48 26 C46 36 40 40 32 40 C24 40 18 36 16 26Z" fill={ids.url('main')} />
      <Rect x={28} y={40} width={8} height={9} fill={darken(color, 0.15)} />
      <Rect x={18} y={48} width={28} height={10} rx={3} fill="#7A4A2A" />
      <Path d={starPath(32, 22, 7)} fill={lighten(color, 0.5)} />
      <Gloss cx={21} cy={16} rx={3} ry={7} rotate={0} opacity={0.5} />
    </G>
  );
}

function Gift({ ids, color }: IconArtProps) {
  return (
    <G>
      <Rect x={8} y={26} width={48} height={32} rx={5} fill={ids.url('main')} />
      <Rect x={5} y={20} width={54} height={11} rx={4} fill={lighten(color, 0.12)} />
      <Rect x={28} y={20} width={8} height={38} fill="#FFD43B" />
      <Path d="M32 20 C20 6 10 14 18 20 Z M32 20 C44 6 54 14 46 20 Z" fill="#FFD43B" stroke="#E0A800" strokeWidth={1.5} />
      <Gloss cx={16} cy={34} rx={3} ry={6} rotate={0} opacity={0.4} />
    </G>
  );
}

function Scroll({ ids, color }: IconArtProps) {
  return (
    <G>
      <Rect x={12} y={10} width={40} height={44} rx={4} fill={ids.url('main')} />
      <Rect x={8} y={6} width={48} height={9} rx={4.5} fill={darken(color, 0.15)} />
      <Rect x={8} y={50} width={48} height={9} rx={4.5} fill={darken(color, 0.15)} />
      <Path d="M19 23 L45 23 M19 31 L45 31 M19 39 L36 39" stroke={darken(color, 0.4)} strokeWidth={2.5} strokeLinecap="round" />
      <Circle cx={45} cy={41} r={6} fill="#FF5C7A" />
    </G>
  );
}

function Flag({ ids, color }: IconArtProps) {
  return (
    <G>
      <Rect x={12} y={6} width={5} height={54} rx={2.5} fill="#7A4A2A" />
      <Path d="M17 9 C30 3 38 15 54 9 L54 35 C38 41 30 29 17 35Z" fill={ids.url('main')} />
      <Circle cx={14.5} cy={6} r={4} fill="#FFD43B" />
    </G>
  );
}

const ICONS: Record<IconName, { art: ComponentType<IconArtProps>; color: string }> = {
  star: { art: Star, color: '#FFC83D' },
  coin: { art: Coin, color: '#FFB800' },
  heart: { art: Heart, color: '#FF5C7A' },
  target: { art: Target, color: '#4C7DFF' },
  people: { art: People, color: '#9B5CFF' },
  bulb: { art: Bulb, color: '#FFC83D' },
  book: { art: Book, color: '#1EC8B0' },
  house: { art: House, color: '#FF5C8A' },
  cart: { art: Cart, color: '#FF9F1C' },
  ball: { art: BeachBall, color: '#38B0FF' },
  trophy: { art: Trophy, color: '#FFC83D' },
  gift: { art: Gift, color: '#FF5C8A' },
  scroll: { art: Scroll, color: '#FFE3A6' },
  flag: { art: Flag, color: '#22B8A7' },
};

export const SKILL_ICONS: Record<SkillId, IconName> = {
  emotions: 'heart',
  attention: 'target',
  social: 'people',
  problemSolving: 'bulb',
  learning: 'book',
};

export const LOCATION_ICONS: Record<LocationId, IconName> = {
  feelings: 'house',
  learning: 'book',
  market: 'cart',
  playground: 'ball',
};

/** Standalone icon. `color` overrides the default tint. */
export function GameIcon({ name, size = 28, color }: { name: IconName; size?: number; color?: string }) {
  const ids = useArtIds(`ic${name}`);
  const { art: Art, color: fallback } = ICONS[name];
  const tint = color ?? fallback;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        {name === 'star' || name === 'trophy' || name === 'scroll' || name === 'flag' || name === 'gift' ? (
          <Shade id={ids.id('main')} color={tint} light={0.4} dark={0.18} direction="diag" />
        ) : (
          <Ball id={ids.id('main')} color={tint} light={0.5} dark={0.3} />
        )}
        <RadialGradient id={ids.id('shine')} cx="40%" cy="35%" r="65%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.35} />
          <Stop offset="0.55" stopColor="#FFFFFF" stopOpacity={0} />
          <Stop offset="1" stopColor="#22104A" stopOpacity={0.35} />
        </RadialGradient>
      </Defs>
      <Art ids={ids} color={tint} />
    </Svg>
  );
}

