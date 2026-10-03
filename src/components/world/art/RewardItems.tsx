/** Reward shop items as standalone illustrations (100 × 100 each). */
import type { ComponentType } from 'react';
import { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { RewardId } from '@/types/world';
import { darken, lighten } from '@/utils/color';

import { starPath } from './KidCharacter';
import { Ball, Gloss, GroundShadow, Shade, useArtIds, type ArtIds } from './primitives';

function Backpack({ ids }: { ids: ArtIds }) {
  return (
    <G>
      <Path d="M38 22 C38 10 62 10 62 22" stroke="#C77700" strokeWidth={5} fill="none" />
      <Path d="M24 34 C24 24 32 20 42 20 L58 20 C68 20 76 24 76 34 L78 80 C78 86 72 89 64 89 L36 89 C28 89 22 86 22 80Z" fill={ids.url('main')} />
      <Path d="M32 58 C32 54 36 52 40 52 L60 52 C64 52 68 54 68 58 L68 76 C68 80 64 82 60 82 L40 82 C36 82 32 80 32 76Z" fill={ids.url('pocket')} />
      <Path d="M36 60 L64 60" stroke="#C77700" strokeWidth={2} strokeDasharray="3 3" />
      <Path d={starPath(50, 71, 6)} fill="#FFFFFF" />
      <Rect x={20} y={40} width={6} height={22} rx={3} fill="#C77700" />
      <Gloss cx={34} cy={32} rx={5} ry={9} rotate={10} opacity={0.4} />
    </G>
  );
}

function Cap({ ids }: { ids: ArtIds }) {
  return (
    <G>
      <Path d="M20 62 C20 32 36 20 54 20 C72 20 84 34 84 60 C68 54 36 54 20 62Z" fill={ids.url('main')} />
      <Path d="M54 22 C50 34 48 46 48 56" stroke={darken('#38B0FF', 0.25)} strokeWidth={1.5} fill="none" />
      <Path d="M20 62 C14 64 6 70 8 76 C28 72 52 66 74 62 C56 56 36 56 20 62Z" fill={darken('#38B0FF', 0.2)} />
      <Circle cx={54} cy={21} r={3.5} fill={darken('#38B0FF', 0.2)} />
      <Path d={starPath(68, 40, 8)} fill="#FFFFFF" />
      <Gloss cx={34} cy={36} rx={8} ry={4} opacity={0.45} />
    </G>
  );
}

function Skateboard({ ids }: { ids: ArtIds }) {
  return (
    <G transform="rotate(-18 50 55)">
      <Path d="M8 52 C4 46 10 40 18 40 L82 40 C90 40 96 46 92 52 C90 56 86 58 80 58 L20 58 C14 58 10 56 8 52Z" fill={ids.url('main')} />
      <Path d="M18 45 L82 45" stroke={lighten('#7B5CFF', 0.4)} strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M30 50 L44 50 M56 50 L70 50" stroke="#FFD43B" strokeWidth={3} strokeLinecap="round" />
      <Path d={starPath(50, 50, 5)} fill="#FFD43B" />
      {[24, 76].map((cx) => (
        <G key={cx}>
          <Rect x={cx - 8} y={58} width={16} height={4} rx={2} fill="#9EA4BA" />
          <Circle cx={cx - 6} cy={66} r={6} fill={ids.url('wheel')} />
          <Circle cx={cx + 6} cy={66} r={6} fill={ids.url('wheel')} />
        </G>
      ))}
    </G>
  );
}

function Bike({ ids }: { ids: ArtIds }) {
  const tire = '#2C2A4A';
  return (
    <G>
      {[24, 76].map((cx) => (
        <G key={cx}>
          <Circle cx={cx} cy={66} r={18} stroke={tire} strokeWidth={5} fill="none" />
          <Circle cx={cx} cy={66} r={14} stroke="#D3D6E8" strokeWidth={1.5} fill="none" />
          {[0, 60, 120].map((deg) => (
            <Line
              key={deg}
              x1={cx + 14 * Math.cos((deg * Math.PI) / 180)}
              y1={66 + 14 * Math.sin((deg * Math.PI) / 180)}
              x2={cx - 14 * Math.cos((deg * Math.PI) / 180)}
              y2={66 - 14 * Math.sin((deg * Math.PI) / 180)}
              stroke="#D3D6E8"
              strokeWidth={1.2}
            />
          ))}
        </G>
      ))}
      <Path d="M24 66 L40 40 L66 40 L76 66 M40 40 L50 66 L66 40 M24 66 L50 66" stroke={ids.url('main')} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M32 32 L46 32" stroke={tire} strokeWidth={6} strokeLinecap="round" />
      <Path d="M39 34 L40 40" stroke={tire} strokeWidth={4} />
      <Path d="M66 40 L70 26 M64 24 L78 24" stroke={tire} strokeWidth={4.5} strokeLinecap="round" />
      <Circle cx={50} cy={66} r={4} fill="#9EA4BA" />
    </G>
  );
}

function Sunglasses({ ids }: { ids: ArtIds }) {
  return (
    <G>
      <Path d="M10 44 L4 36 M90 44 L96 36" stroke="#FF4D8A" strokeWidth={4} strokeLinecap="round" />
      <Rect x={8} y={38} width={38} height={28} rx={12} fill={ids.url('lens')} stroke="#FF4D8A" strokeWidth={4} />
      <Rect x={54} y={38} width={38} height={28} rx={12} fill={ids.url('lens')} stroke="#FF4D8A" strokeWidth={4} />
      <Path d="M46 46 Q50 41 54 46" stroke="#FF4D8A" strokeWidth={4} fill="none" />
      <Path d="M15 50 L24 43 M61 50 L70 43" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
    </G>
  );
}

function Headphones({ ids }: { ids: ArtIds }) {
  return (
    <G>
      <Path d="M18 62 C14 24 34 12 50 12 C66 12 86 24 82 62" stroke="#3D3B63" strokeWidth={8} fill="none" strokeLinecap="round" />
      <Path d="M26 34 C32 22 42 18 50 18" stroke="#7D7AA8" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Rect x={8} y={50} width={22} height={34} rx={10} fill={ids.url('main')} />
      <Rect x={70} y={50} width={22} height={34} rx={10} fill={ids.url('main')} />
      <Rect x={26} y={56} width={6} height={22} rx={3} fill="#3D3B63" />
      <Rect x={68} y={56} width={6} height={22} rx={3} fill="#3D3B63" />
      <Gloss cx={15} cy={58} rx={2.5} ry={6} rotate={0} opacity={0.5} />
    </G>
  );
}

function Scarf({ ids }: { ids: ArtIds }) {
  return (
    <G>
      <Path d="M58 52 L70 86 C71 89 69 91 66 91 L56 91 C53 91 52 89 53 86 L50 56Z" fill={darken('#FF4D5E', 0.15)} />
      <Path d="M54 84 L70 84" stroke="#FFFFFF" strokeWidth={3} opacity={0.75} />
      <Path d="M14 40 C30 56 70 56 86 40 L88 54 C70 70 30 70 12 54Z" fill={ids.url('main')} />
      <Path d="M24 50 L22 60 M38 55 L37 65 M62 55 L63 65 M76 50 L78 60" stroke="#FFFFFF" strokeWidth={3} opacity={0.75} />
    </G>
  );
}

function Crown({ ids }: { ids: ArtIds }) {
  return (
    <G>
      <Path d="M14 74 L18 28 L36 48 L50 18 L64 48 L82 28 L86 74Z" fill={ids.url('main')} />
      <Rect x={12} y={66} width={76} height={14} rx={5} fill="#E59A00" />
      <Circle cx={50} cy={73} r={5} fill="#FF4D6D" />
      <Circle cx={30} cy={73} r={3.5} fill="#38B0FF" />
      <Circle cx={70} cy={73} r={3.5} fill="#3CCB7F" />
      {[
        [18, 28],
        [50, 18],
        [82, 28],
      ].map(([cx, cy]) => (
        <Circle key={cx} cx={cx} cy={cy} r={5} fill={ids.url('gem')} />
      ))}
      <Gloss cx={30} cy={50} rx={3} ry={10} rotate={10} opacity={0.45} />
    </G>
  );
}

const ART: Record<RewardId, { art: ComponentType<{ ids: ArtIds }>; color: string }> = {
  backpack: { art: Backpack, color: '#FFB300' },
  cap: { art: Cap, color: '#38B0FF' },
  skateboard: { art: Skateboard, color: '#7B5CFF' },
  bike: { art: Bike, color: '#FF4D5E' },
  sunglasses: { art: Sunglasses, color: '#1E2A4A' },
  headphones: { art: Headphones, color: '#22B8A7' },
  scarf: { art: Scarf, color: '#FF4D5E' },
  crown: { art: Crown, color: '#FFC83D' },
};

export function RewardArt({ id }: { id: RewardId }) {
  const ids = useArtIds(`rw${id}`);
  const { art: Art, color } = ART[id];
  return (
    <G>
      <Defs>
        {id === 'cap' ? (
          <Ball id={ids.id('main')} color={color} light={0.45} />
        ) : (
          <Shade id={ids.id('main')} color={color} light={0.35} dark={0.2} direction="diag" />
        )}
        <Shade id={ids.id('pocket')} color="#FF8A1F" light={0.2} dark={0.15} />
        <Ball id={ids.id('wheel')} color="#FFD43B" />
        <Shade id={ids.id('lens')} color="#2E3F6E" light={0.15} dark={0.3} direction="diag" />
        <Ball id={ids.id('gem')} color="#FFE58A" light={0.6} />
      </Defs>
      <GroundShadow cx={50} cy={93} rx={30} ry={5} opacity={0.22} />
      <Art ids={ids} />
    </G>
  );
}
