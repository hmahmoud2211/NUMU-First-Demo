/** Market goods: fruits, vegetables and treats (100 × 100 each). */
import type { ComponentType } from 'react';
import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { darken, lighten } from '@/utils/color';

import { Ball, Gloss, GroundShadow, Shade, useArtIds, type ArtIds } from './primitives';

export type FoodId =
  | 'apple'
  | 'banana'
  | 'orange'
  | 'strawberry'
  | 'grapes'
  | 'carrot'
  | 'broccoli'
  | 'corn'
  | 'candy'
  | 'chocolate'
  | 'chips'
  | 'donut'
  | 'lollipop'
  | 'soda'
  | 'cupcake';

const LEAF = '#4CC35A';
const STEM = '#6B3A1E';

function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  return `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`;
}

function Leaf({ d, ids }: { d: string; ids: ArtIds }) {
  return <Path d={d} fill={ids.url('leaf')} />;
}

function Apple({ ids }: { ids: ArtIds }) {
  return (
    <G>
      <Path d="M50 32 C38 24 16 30 18 54 C20 76 36 90 50 84 C64 90 80 76 82 54 C84 30 62 24 50 32Z" fill={ids.url('main')} />
      <Path d="M50 33 Q49 24 54 16" stroke={STEM} strokeWidth={4} strokeLinecap="round" fill="none" />
      <Leaf d="M54 24 Q64 12 77 17 Q69 30 54 24Z" ids={ids} />
      <Gloss cx={33} cy={47} rx={5} ry={10} rotate={20} opacity={0.55} />
    </G>
  );
}

function Banana({ ids }: { ids: ArtIds }) {
  const peel = 'M18 34 C20 64 44 82 78 74 C84 72 86 68 82 66 C52 70 32 56 26 32 C24 28 18 28 18 34Z';
  return (
    <G>
      <G transform="rotate(-14 50 50) translate(4 -6)">
        <Path d={peel} fill={darken('#FFD43B', 0.12)} />
      </G>
      <Path d={peel} fill={ids.url('main')} />
      <Path d="M26 36 C32 56 52 70 81 67" stroke="#E0A800" strokeWidth={2} fill="none" opacity={0.6} />
      <Circle cx={20} cy={32} r={3} fill="#6B4A1E" />
      <Circle cx={83} cy={69} r={2.5} fill="#6B4A1E" />
      <Gloss cx={34} cy={52} rx={3} ry={9} rotate={-40} opacity={0.5} />
    </G>
  );
}

function Orange({ ids }: { ids: ArtIds }) {
  const dimples = [
    [36, 46],
    [60, 40],
    [66, 60],
    [44, 66],
    [56, 72],
    [30, 60],
    [70, 48],
  ];
  return (
    <G>
      <Circle cx={50} cy={55} r={31} fill={ids.url('main')} />
      {dimples.map(([cx, cy]) => (
        <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.1} fill={darken('#FF9F1C', 0.3)} opacity={0.35} />
      ))}
      <Circle cx={50} cy={25.5} r={3} fill="#5A8A2A" />
      <Leaf d="M51 25 Q58 13 69 17 Q62 29 51 25Z" ids={ids} />
      <Gloss cx={37} cy={42} rx={8} ry={5} opacity={0.5} />
    </G>
  );
}

function Strawberry({ ids }: { ids: ArtIds }) {
  const seeds = [
    [36, 48],
    [50, 46],
    [64, 48],
    [42, 59],
    [58, 59],
    [50, 70],
    [33, 60],
    [67, 60],
  ];
  return (
    <G>
      <Path d="M50 88 C30 78 18 56 24 42 C30 30 70 30 76 42 C82 56 70 78 50 88Z" fill={ids.url('main')} />
      {seeds.map(([cx, cy]) => (
        <Ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={1.6} ry={2.4} fill="#FFE27A" />
      ))}
      <Leaf d="M28 38 L39 34 L35 25 L46 30 L50 19 L54 30 L65 25 L61 34 L72 38 Q50 47 28 38Z" ids={ids} />
      <Path d="M50 21 L50 13" stroke={darken(LEAF, 0.2)} strokeWidth={3} strokeLinecap="round" />
      <Gloss cx={34} cy={50} rx={4} ry={8} rotate={15} opacity={0.45} />
    </G>
  );
}

function Grapes({ ids }: { ids: ArtIds }) {
  const grapes = [
    [33, 40],
    [50, 37],
    [67, 40],
    [25, 55],
    [42, 54],
    [59, 54],
    [75, 55],
    [34, 69],
    [51, 69],
    [67, 69],
    [43, 82],
    [59, 82],
  ];
  return (
    <G>
      <Path d="M50 30 Q52 20 58 14" stroke={STEM} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <Leaf d="M55 20 Q68 9 80 18 Q68 29 55 20Z" ids={ids} />
      {grapes.map(([cx, cy]) => (
        <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={9.5} fill={ids.url('main')} />
      ))}
    </G>
  );
}

function Carrot({ ids }: { ids: ArtIds }) {
  return (
    <G>
      <Leaf d="M64 32 Q58 14 64 6 Q71 19 67 32Z" ids={ids} />
      <Leaf d="M66 33 Q75 15 86 15 Q80 27 69 35Z" ids={ids} />
      <Leaf d="M62 32 Q47 19 50 10 Q60 19 65 30Z" ids={ids} />
      <Path d="M62 30 C72 34 74 44 68 50 L32 88 C28 92 22 88 25 83 L52 36 C55 31 58 28 62 30Z" fill={ids.url('main')} />
      <Path d="M51 47 L58 51 M44 59 L51 63 M37 71 L43 74" stroke={darken('#FF8A1F', 0.2)} strokeWidth={2} strokeLinecap="round" />
      <Gloss cx={52} cy={44} rx={3} ry={10} rotate={35} opacity={0.4} />
    </G>
  );
}

function Broccoli({ ids }: { ids: ArtIds }) {
  const florets = [
    [34, 48, 15],
    [66, 48, 15],
    [50, 37, 17],
    [42, 58, 12],
    [58, 58, 12],
    [50, 50, 13],
  ];
  return (
    <G>
      <Path d="M44 58 L39 88 Q50 93 61 88 L56 58Z" fill={ids.url('stem')} />
      {florets.map(([cx, cy, r]) => (
        <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={ids.url('main')} />
      ))}
      {[
        [44, 32],
        [30, 44],
        [56, 30],
        [62, 44],
      ].map(([cx, cy]) => (
        <Circle key={`b${cx}-${cy}`} cx={cx} cy={cy} r={2.4} fill={lighten('#3E9E3E', 0.45)} opacity={0.7} />
      ))}
    </G>
  );
}

function Corn({ ids }: { ids: ArtIds }) {
  const rows = [26, 33, 40, 47, 54, 61, 68, 75];
  return (
    <G>
      <Leaf d="M50 92 C28 82 24 52 34 30 C40 52 44 72 50 92Z" ids={ids} />
      <Leaf d="M50 92 C72 82 76 52 66 30 C60 52 56 72 50 92Z" ids={ids} />
      <Ellipse cx={50} cy={50} rx={15} ry={32} fill={ids.url('main')} />
      {rows.map((y, row) =>
        [-8, 0, 8].map((dx) => (
          <Circle
            key={`${y}-${dx}`}
            cx={50 + dx * (row === 0 || row === rows.length - 1 ? 0.6 : 1)}
            cy={y}
            r={3}
            fill={lighten('#FFD43B', 0.35)}
            opacity={0.85}
          />
        )),
      )}
      <Path d="M50 92 C40 84 30 70 32 56 C38 70 44 80 50 92Z M50 92 C62 82 72 68 68 54 C62 70 56 80 50 92Z" fill={darken(LEAF, 0.1)} />
    </G>
  );
}

function Candy({ ids }: { ids: ArtIds }) {
  return (
    <G>
      <Path d="M12 36 L33 46 L33 60 L12 70 Q19 53 12 36Z M88 36 L67 46 L67 60 L88 70 Q81 53 88 36Z" fill={lighten('#FF4D9A', 0.25)} />
      <Path d="M14 40 L30 48 M14 66 L30 58 M86 40 L70 48 M86 66 L70 58" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.6} />
      <Circle cx={50} cy={53} r={20} fill={ids.url('main')} />
      <Path d="M50 53 m-10 0 a10 10 0 1 1 10 10 a6 6 0 0 1 -6 -6" stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.75} strokeLinecap="round" />
    </G>
  );
}

function Chocolate({ ids }: { ids: ArtIds }) {
  return (
    <G>
      <Rect x={22} y={16} width={56} height={70} rx={6} fill={ids.url('main')} />
      {[22, 39].map((y) =>
        [27, 51].map((x) => (
          <Rect key={`${x}-${y}`} x={x} y={y} width={22} height={14} rx={3} fill={lighten('#7A3E1D', 0.12)} stroke={darken('#7A3E1D', 0.2)} strokeWidth={1} />
        )),
      )}
      <Path d="M18 52 L82 52 L82 88 Q50 93 18 88Z" fill={ids.url('wrap')} />
      <Path d="M18 52 L24 48 L30 52 L36 48 L42 52 L48 48 L54 52 L60 48 L66 52 L72 48 L78 52 L82 50" stroke="#E6E6F0" strokeWidth={3} fill="none" strokeLinejoin="round" />
      <Rect x={18} y={64} width={64} height={8} fill="#FFC83D" />
    </G>
  );
}

function Chips({ ids }: { ids: ArtIds }) {
  return (
    <G>
      <Path d="M24 18 L76 18 L80 28 C84 48 84 70 80 82 L76 90 L24 90 L20 82 C16 70 16 48 20 28Z" fill={ids.url('main')} />
      <Path d="M24 18 L76 18 L77 25 L23 25Z M24 90 L76 90 L77 83 L23 83Z" fill={darken('#FF4D3B', 0.15)} />
      <Path d="M26 18 L26 25 M32 18 L32 25 M38 18 L38 25 M44 18 L44 25 M50 18 L50 25 M56 18 L56 25 M62 18 L62 25 M68 18 L68 25 M74 18 L74 25" stroke={darken('#FF4D3B', 0.3)} strokeWidth={1} />
      <Ellipse cx={50} cy={54} rx={21} ry={17} fill="#FFD43B" />
      <Ellipse cx={50} cy={56} rx={11} ry={7.5} fill="#F2A93B" transform="rotate(-15 50 56)" />
      <Ellipse cx={47} cy={54} rx={4} ry={2} fill="#FFE08A" transform="rotate(-15 47 54)" />
      <Rect x={26} y={30} width={5} height={46} rx={2.5} fill="#FFFFFF" opacity={0.3} />
    </G>
  );
}

function Donut({ ids }: { ids: ArtIds }) {
  const sprinkles = [
    ['#38B0FF', 34, 44, 30],
    ['#FFD43B', 62, 42, -30],
    ['#3CCB7F', 70, 56, 70],
    ['#FFFFFF', 30, 58, -60],
    ['#9B5CFF', 48, 36, 10],
    ['#38B0FF', 58, 66, -20],
    ['#FFD43B', 40, 68, 50],
  ] as const;
  return (
    <G>
      <Path d={`${ellipsePath(50, 56, 34, 29)} ${ellipsePath(50, 54, 10, 8)}`} fillRule="evenodd" fill={ids.url('dough')} />
      <Path d={`${ellipsePath(50, 51, 30, 24)} ${ellipsePath(50, 53, 13, 10)}`} fillRule="evenodd" fill={ids.url('main')} />
      {sprinkles.map(([color, x, y, rot]) => (
        <Rect key={`${x}-${y}`} x={x - 3.5} y={y - 1.2} width={7} height={2.4} rx={1.2} fill={color} transform={`rotate(${rot} ${x} ${y})`} />
      ))}
      <Gloss cx={34} cy={38} rx={7} ry={3.5} opacity={0.45} />
    </G>
  );
}

function Lollipop({ ids }: { ids: ArtIds }) {
  return (
    <G>
      <Rect x={47} y={50} width={6} height={42} rx={3} fill="#F4EFE6" />
      <Circle cx={50} cy={38} r={27} fill={ids.url('main')} />
      <Path d="M50 20 a18 18 0 0 1 0 36 a12 12 0 0 1 0 -24 a6 6 0 0 1 0 12" stroke="#FFFFFF" strokeWidth={4} opacity={0.8} fill="none" strokeLinecap="round" />
      <Gloss cx={36} cy={24} rx={7} ry={4} opacity={0.5} />
    </G>
  );
}

function Soda({ ids }: { ids: ArtIds }) {
  return (
    <G>
      <Rect x={28} y={18} width={44} height={72} rx={8} fill={ids.url('main')} />
      <Ellipse cx={50} cy={88} rx={21} ry={4.5} fill="#B8BDD0" />
      <Ellipse cx={50} cy={20} rx={22} ry={6} fill="#D8DCE8" />
      <Ellipse cx={50} cy={19.5} rx={16} ry={3.6} fill="#C0C5D6" />
      <Rect x={44} y={16} width={12} height={4} rx={2} fill="#9EA4BA" />
      <Path d="M28 50 C40 40 60 60 72 46 L72 60 C60 74 40 54 28 64Z" fill="#FFFFFF" />
      <Rect x={33} y={26} width={5} height={56} rx={2.5} fill="#FFFFFF" opacity={0.35} />
    </G>
  );
}

function Cupcake({ ids }: { ids: ArtIds }) {
  return (
    <G>
      <Path d="M26 56 L74 56 L68 90 L32 90Z" fill={ids.url('wrap')} />
      <Path d="M34 58 L37 89 M42 58 L44 89 M50 58 L50 89 M58 58 L56 89 M66 58 L63 89" stroke={darken('#4FB7FF', 0.2)} strokeWidth={1.6} />
      <Path d="M24 58 C18 50 26 40 34 42 C34 30 48 26 52 34 C58 24 74 30 70 42 C80 42 82 54 76 58Z" fill={ids.url('main')} />
      <Path d="M50 22 Q52 14 58 12" stroke={STEM} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Circle cx={50} cy={27} r={7} fill={ids.url('cherry')} />
      {[
        ['#FFD43B', 36, 48],
        ['#38B0FF', 62, 46],
        ['#3CCB7F', 48, 52],
      ].map(([color, x, y]) => (
        <Circle key={`${x}-${y}`} cx={Number(x)} cy={Number(y)} r={2} fill={String(color)} />
      ))}
    </G>
  );
}

const MAIN_COLORS: Record<FoodId, string> = {
  apple: '#F2363F',
  banana: '#FFD43B',
  orange: '#FF9F1C',
  strawberry: '#FF3B5C',
  grapes: '#8E44D9',
  carrot: '#FF8A1F',
  broccoli: '#3E9E3E',
  corn: '#FFC83D',
  candy: '#FF4D9A',
  chocolate: '#7A3E1D',
  chips: '#FF4D3B',
  donut: '#FF7AB8',
  lollipop: '#FF4D9A',
  soda: '#E8283C',
  cupcake: '#FFB3D1',
};

const ROUND: FoodId[] = ['apple', 'orange', 'strawberry', 'grapes', 'broccoli', 'candy', 'lollipop'];

const ART: Record<FoodId, ComponentType<{ ids: ArtIds }>> = {
  apple: Apple,
  banana: Banana,
  orange: Orange,
  strawberry: Strawberry,
  grapes: Grapes,
  carrot: Carrot,
  broccoli: Broccoli,
  corn: Corn,
  candy: Candy,
  chocolate: Chocolate,
  chips: Chips,
  donut: Donut,
  lollipop: Lollipop,
  soda: Soda,
  cupcake: Cupcake,
};

export function FoodArt({ id, shadow = true }: { id: FoodId; shadow?: boolean }) {
  const ids = useArtIds(`food${id}`);
  const color = MAIN_COLORS[id];
  const Art = ART[id];
  return (
    <G>
      <Defs>
        {ROUND.includes(id) ? (
          <Ball id={ids.id('main')} color={color} light={0.5} dark={0.32} />
        ) : (
          <Shade id={ids.id('main')} color={color} light={0.3} dark={0.25} direction={id === 'soda' ? 'right' : 'diag'} />
        )}
        <Shade id={ids.id('leaf')} color={LEAF} light={0.25} dark={0.25} direction="diag" />
        <Shade id={ids.id('stem')} color="#9BE07A" light={0.2} dark={0.15} />
        <Shade id={ids.id('wrap')} color={id === 'cupcake' ? '#4FB7FF' : '#D92E45'} light={0.2} dark={0.2} direction="right" />
        <Shade id={ids.id('dough')} color="#E8A65A" light={0.2} dark={0.25} />
        <Ball id={ids.id('cherry')} color="#E8283C" />
      </Defs>
      {shadow ? <GroundShadow cx={50} cy={92} rx={30} ry={5} opacity={0.25} /> : null}
      <Art ids={ids} />
    </G>
  );
}
